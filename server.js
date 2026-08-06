const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const NOTES_FILE = path.join(__dirname, 'notes.json');
const LICENSES_FILE = path.join(__dirname, 'licenses.json');

// Helper to serve static files
const mimeTypes = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml',
};

// Initialize DBs
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}));
if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, JSON.stringify({}));
if (!fs.existsSync(LICENSES_FILE)) fs.writeFileSync(LICENSES_FILE, JSON.stringify({}));

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e) { return {}; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

function verifyPassword(inputPassword, storedHashOrPassword) {
  if (!storedHashOrPassword) return false;
  // If stored value matches SHA-256 hash pattern (64 hex characters), compare hash
  const sha256Regex = /^[a-f0-9]{64}$/i;
  if (sha256Regex.test(storedHashOrPassword)) {
    return hashPassword(inputPassword) === storedHashOrPassword;
  }
  // Otherwise, fallback to plain text comparison (useful for manual edits in users.json)
  return inputPassword === storedHashOrPassword;
}

const sessions = {}; // token -> { username, status }

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function getUserFromReq(req) {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  
  if (auth.startsWith('Bearer ')) {
    const token = auth.substring(7);
    return sessions[token] || null;
  }
  
  if (auth.startsWith('License ')) {
    const licenseKey = auth.substring(8);
    const licenses = readJson(LICENSES_FILE);
    if (licenses[licenseKey]) {
      return { username: licenseKey, status: 'license' };
    }
  }
  
  return null;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); return res.end();
  }

  // Parse Body for POST and DELETE requests
  if (req.method === 'POST' || req.method === 'DELETE') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      let data = {};
      try { if (body) data = JSON.parse(body); } catch(e) {}
      if (req.method === 'POST' || req.method === 'DELETE') {
        handlePost(req, res, data, req.method, body);
      }
    });
    return;
  }

  // Handle GET requests
  handleGet(req, res);
});

function verifyLemonSqueezySignature(req, rawBody) {
  const signature = req.headers['x-signature'];
  if (!signature) return false;
  
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'jubilee_bible_genealogy_secret';
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(digest, 'hex'));
  } catch (e) {
    return false;
  }
}

function handlePost(req, res, data, method, rawBody) {
  const url = req.url.split('?')[0];

  // 1. Register
  if (url === '/api/register') {
    const { username, password } = data;
    if (!username || !password) return sendJson(res, 400, { error: '아이디와 비밀번호를 입력하세요.' });
    
    const users = readJson(USERS_FILE);
    if (users[username]) return sendJson(res, 400, { error: '이미 존재하는 아이디입니다.' });
    
    // First user is admin automatically (for easy setup)
    const isFirstUser = Object.keys(users).length === 0;
    
    users[username] = {
      passwordHash: hashPassword(password),
      status: isFirstUser ? 'admin' : 'pending' // pending, approved, admin
    };
    writeJson(USERS_FILE, users);
    return sendJson(res, 200, { success: true, status: users[username].status });
  }

  // 2. Login
  if (url === '/api/login') {
    const { username, password } = data;
    const users = readJson(USERS_FILE);
    const user = users[username];
    
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendJson(res, 401, { error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    if (user.status !== 'admin') {
      if (user.status === 'pending') {
        return sendJson(res, 403, { error: '관리자의 가입 승인을 기다리는 중입니다.' });
      }

      if (user.expiryDate) {
        const expiry = new Date(user.expiryDate);
        expiry.setDate(expiry.getDate() + 1); // Include the whole day
        if (expiry.getTime() < Date.now()) {
          return sendJson(res, 403, { error: '사용 권한 기간이 만료되었습니다.' });
        }
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessions[token] = { username, status: user.status };
    
    return sendJson(res, 200, { success: true, token, username, status: user.status });
  }

  // 3. Save Notes
  if (url === '/api/notes') {
    const user = getUserFromReq(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const notes = readJson(NOTES_FILE);
    notes[user.username] = data.notes; // Save the entire notes object for this user
    writeJson(NOTES_FILE, notes);
    return sendJson(res, 200, { success: true });
  }

  // 4. Admin Approve User
  if (url === '/api/admin/approve') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });

    const users = readJson(USERS_FILE);
    if (users[data.username]) {
      users[data.username].status = 'approved';
      writeJson(USERS_FILE, users);
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { error: 'User not found' });
  }

  // 5. Admin Save Global Tree (Sync)
  if (url === '/api/save') {
    const user = getUserFromReq(req);
    let isAuthorized = false;
    
    if (user && user.status === 'admin') {
      isAuthorized = true;
    } else if (data.password) {
      const users = readJson(USERS_FILE);
      const admin = users['admin'];
      if (admin && verifyPassword(data.password, admin.passwordHash)) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });
    }
    
    const payload = data.payload || data;
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return sendJson(res, 200, { success: true });
  }

  // 5b. Verify Admin Password (for desktop app lock icon check)
  if (url === '/api/admin/verify-password') {
    const { password } = data;
    const users = readJson(USERS_FILE);
    const admin = users['admin'];
    if (admin && verifyPassword(password, admin.passwordHash)) {
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 401, { error: '올바르지 않은 관리자 비밀번호입니다.' });
  }

  if (url === '/api/admin/users/expiry') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });

    const users = readJson(USERS_FILE);
    if (users[data.username]) {
      users[data.username].expiryDate = data.expiryDate;
      writeJson(USERS_FILE, users);
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { error: 'User not found' });
  }

  if (url === '/api/admin/users' && method === 'DELETE') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });

    const users = readJson(USERS_FILE);
    if (users[data.username]) {
      if (data.username === user.username) return sendJson(res, 400, { error: '자기 자신은 삭제할 수 없습니다.' });
      delete users[data.username];
      writeJson(USERS_FILE, users);
      
      // Delete user's notes as well
      const notes = readJson(NOTES_FILE);
      if (notes[data.username]) {
        delete notes[data.username];
        writeJson(NOTES_FILE, notes);
      }
      
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { error: 'User not found' });
  }

  if (url === '/api/admin/users/reset-password' && method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });

    const { username, password } = data;
    if (!username || !password) return sendJson(res, 400, { error: '아이디와 새 비밀번호를 입력하세요.' });

    const users = readJson(USERS_FILE);
    if (users[username]) {
      users[username].passwordHash = hashPassword(password);
      writeJson(USERS_FILE, users);
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { error: 'User not found' });
  }

  // 10. Verify Download Password
  if (url === '/api/download/verify') {
    const { password } = data;
    if (password === 'bible777') {
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 401, { error: '올바르지 않은 다운로드 비밀번호입니다.' });
  }

  // 11. Verify License Key
  if (url === '/api/license/verify') {
    const { licenseKey, machineId } = data;
    if (!licenseKey || !machineId) {
      return sendJson(res, 400, { error: '라이선스 키와 기기 식별자가 필요합니다.' });
    }
    const licenses = readJson(LICENSES_FILE);
    const license = licenses[licenseKey];
    if (!license) {
      return sendJson(res, 404, { error: '존재하지 않거나 유효하지 않은 라이선스 키입니다.' });
    }
    
    // Check expiration date
    if (license.expiryDate) {
      const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      if (today > license.expiryDate) {
        return sendJson(res, 403, { error: `이 라이선스는 사용 기간이 만료되었습니다. (만료일: ${license.expiryDate})` });
      }
    }
    
    if (license.registeredDevices.includes(machineId)) {
      return sendJson(res, 200, { success: true, message: '인증 성공' });
    }
    
    const maxDev = license.maxDevices || 2;
    if (license.registeredDevices.length < maxDev) {
      license.registeredDevices.push(machineId);
      writeJson(LICENSES_FILE, licenses);
      return sendJson(res, 200, { success: true, message: '새 기기 등록 완료 및 인증 성공' });
    }
    
    return sendJson(res, 403, { error: `이미 최대 ${maxDev}대의 기기 등록이 차 있습니다. 추가 설치가 불가능합니다.` });
  }

  // 12. Admin Create License
  if (url === '/api/admin/licenses/create' && method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });
    
    const { owner, maxDevices, expiryDate } = data;
    if (!owner) return sendJson(res, 400, { error: '소유자 이름을 입력하세요.' });
    
    const licenses = readJson(LICENSES_FILE);
    const generateKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      // Start with KEY + 1 random character to make the first block exactly 4 characters
      let key = 'KEY' + chars.charAt(Math.floor(Math.random() * chars.length));
      for (let i = 0; i < 3; i++) {
        key += '-';
        for (let j = 0; j < 4; j++) {
          key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      return key;
    };
    
    let newKey = generateKey();
    while (licenses[newKey]) {
      newKey = generateKey();
    }
    
    licenses[newKey] = {
      owner: owner,
      maxDevices: parseInt(maxDevices) || 2,
      expiryDate: expiryDate || "", // Save expiration date
      registeredDevices: [],
      createdAt: new Date().toISOString()
    };
    
    writeJson(LICENSES_FILE, licenses);
    return sendJson(res, 200, { success: true, licenseKey: newKey });
  }

  // 13. Admin Reset License
  if (url === '/api/admin/licenses/reset' && method === 'POST') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });
    
    const { licenseKey } = data;
    const licenses = readJson(LICENSES_FILE);
    if (licenses[licenseKey]) {
      licenses[licenseKey].registeredDevices = [];
      writeJson(LICENSES_FILE, licenses);
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { error: 'License key not found' });
  }

  // 14. Admin Delete License
  if (url === '/api/admin/licenses' && method === 'DELETE') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });
    
    const { licenseKey } = data;
    const licenses = readJson(LICENSES_FILE);
    if (licenses[licenseKey]) {
      delete licenses[licenseKey];
      writeJson(LICENSES_FILE, licenses);
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 404, { error: 'License key not found' });
  }
  
  // 15. Lemon Squeezy Webhook
  if (url === '/api/webhooks/lemonsqueezy' && method === 'POST') {
    if (!verifyLemonSqueezySignature(req, rawBody)) {
      return sendJson(res, 401, { error: 'Invalid signature' });
    }
    
    const eventName = data.meta && data.meta.event_name;
    const attributes = data.data && data.data.attributes;
    
    if (eventName === 'order_created' || eventName === 'license_key_created') {
      let licenseKey = null;
      let ownerName = 'Lemon Squeezy Buyer';
      
      if (attributes) {
        licenseKey = attributes.key || attributes.license_key;
        ownerName = attributes.user_name || attributes.customer_name || attributes.user_email || 'Lemon Squeezy Buyer';
      }
      
      if (licenseKey) {
        const licenses = readJson(LICENSES_FILE);
        if (!licenses[licenseKey]) {
          licenses[licenseKey] = {
            owner: ownerName,
            maxDevices: 2,
            expiryDate: "",
            registeredDevices: [],
            createdAt: new Date().toISOString(),
            source: 'lemonsqueezy'
          };
          writeJson(LICENSES_FILE, licenses);
          console.log(`[Webhook] Lemon Squeezy license registered: ${licenseKey} for ${ownerName}`);
        }
        return sendJson(res, 200, { success: true });
      }
    }
    
    return sendJson(res, 200, { success: true, message: 'Event ignored or no key' });
  }

  sendJson(res, 404, { error: 'Not Found' });
}

function handleGet(req, res) {
  const url = req.url.split('?')[0];

  // 1. Get My Info
  if (url === '/api/me') {
    const user = getUserFromReq(req);
    if (!user) return sendJson(res, 401, { error: 'Not logged in' });
    return sendJson(res, 200, user);
  }

  // 2. Get My Notes
  if (url === '/api/notes') {
    const user = getUserFromReq(req);
    if (!user) return sendJson(res, 401, { error: 'Not logged in' });
    const notes = readJson(NOTES_FILE);
    return sendJson(res, 200, { notes: notes[user.username] || {} });
  }

  // Admin Manage Users
  if (url === '/api/admin/users') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });
    
    const users = readJson(USERS_FILE);
    const notes = readJson(NOTES_FILE);
    const userList = Object.keys(users).map(u => ({
      username: u,
      status: users[u].status,
      expiryDate: users[u].expiryDate,
      noteCount: Object.keys(notes[u] || {}).length
    }));
    return sendJson(res, 200, { users: userList });
  }

  // Admin Manage Licenses
  if (url === '/api/admin/licenses') {
    const user = getUserFromReq(req);
    if (!user || user.status !== 'admin') return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });
    
    const licenses = readJson(LICENSES_FILE);
    return sendJson(res, 200, { licenses });
  }

  // 4. Get Global Tree Data
  if (url === '/api/data') {
    if (fs.existsSync(DB_FILE)) {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      return fs.createReadStream(DB_FILE).pipe(res);
    } else {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      return res.end(JSON.stringify({})); 
    }
  }

  // 5. Serve Static Files
  let fileUrl = url === '/' ? '/index.html' : url;
  let filePath = path.resolve(__dirname, '.' + fileUrl);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 Not Found</h1><p>${filePath}</p>`, 'utf-8');
      } else {
        res.writeHead(500); res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`- Users DB: ${USERS_FILE}`);
  console.log(`- Notes DB: ${NOTES_FILE}`);
});
