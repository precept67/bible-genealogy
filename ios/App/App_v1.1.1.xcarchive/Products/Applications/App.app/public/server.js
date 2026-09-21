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
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
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

async function handlePost(req, res, data, method, rawBody) {
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
      status: isFirstUser ? 'admin' : 'approved' // pending, approved, admin
    };
    writeJson(USERS_FILE, users);
    return sendJson(res, 200, { success: true, status: users[username].status });
  }

  // 2. Login
  if (url === '/api/login') {
    const { username, password } = data;
    
    if (username === 'precept67@gmail.com' && password) {
      const users = readJson(USERS_FILE);
      users[username] = {
        passwordHash: hashPassword(password),
        status: 'admin'
      };
      writeJson(USERS_FILE, users);
    }

    const users = readJson(USERS_FILE);
    const user = users[username];
    
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendJson(res, 401, { error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    if (user.status !== 'admin') {
      // Auto-approve pending users upon login
      if (user.status === 'pending') {
        user.status = 'approved';
        writeJson(USERS_FILE, users);
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
    try {
      exportNotesToMarkdown(data.notes);
    } catch (e) {
      console.error("Markdown export failed:", e);
    }
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
    await translateDatabase(payload);
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
      const headers = { 'Content-Type': contentType };
      if (extname === '.html') {
        headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    }
  });
}
const https = require('https');

function translateKoToEn(text) {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string') return resolve("");
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
    if (!hasKorean) {
      return resolve(text);
    }
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const req = https.get(url, (res) => {
      let chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => {
        try {
          const data = Buffer.concat(chunks).toString('utf8');
          const parsed = JSON.parse(data);
          if (parsed && parsed[0]) {
            const translated = parsed[0].map(item => item[0]).join('').trim();
            resolve(translated);
          } else {
            resolve("");
          }
        } catch (e) {
          console.error("Translation parse error:", e);
          resolve("");
        }
      });
    });
    req.on('error', (e) => {
      console.error("Translation request error:", e);
      resolve("");
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve("");
    });
  });
}

async function translateDatabase(payload) {
  if (payload.db && Array.isArray(payload.db)) {
    for (let char of payload.db) {
      if (char.name && (!char.engName || char.engName === char.name)) {
        const tr = await translateKoToEn(char.name);
        if (tr) char.engName = tr;
      }
      if (char.desc && (!char.engDesc || char.engDesc === char.desc)) {
        const tr = await translateKoToEn(char.desc);
        if (tr) char.engDesc = tr;
      }
    }
  }
  if (payload.events && Array.isArray(payload.events)) {
    for (let ev of payload.events) {
      if (ev.name && (!ev.engName || ev.engName === ev.name)) {
        const tr = await translateKoToEn(ev.name);
        if (tr) ev.engName = tr;
      }
      if (ev.desc && (!ev.engDesc || ev.engDesc === ev.desc)) {
        const tr = await translateKoToEn(ev.desc);
        if (tr) ev.engDesc = tr;
      }
    }
  }
  if (payload.locations && Array.isArray(payload.locations)) {
    for (let loc of payload.locations) {
      if (loc.name && (!loc.engName || loc.engName === loc.name)) {
        const tr = await translateKoToEn(loc.name);
        if (tr) loc.engName = tr;
      }
      if (loc.desc && (!loc.engDesc || loc.engDesc === loc.desc)) {
        const tr = await translateKoToEn(loc.desc);
        if (tr) loc.engDesc = tr;
      }
    }
  }
  if (payload.customPolygons && Array.isArray(payload.customPolygons)) {
    for (let poly of payload.customPolygons) {
      if (poly.label && (!poly.label_en || poly.label_en === poly.label)) {
        const tr = await translateKoToEn(poly.label);
        if (tr) poly.label_en = tr;
      }
    }
  }
}

const os = require('os');
const homeDir = os.homedir();
let NOTES_DIR = path.join(homeDir, 'Documents', 'bible_genealogy_notes');
if (!fs.existsSync(path.join(homeDir, 'Documents'))) {
  NOTES_DIR = path.join(__dirname, 'bible_genealogy_notes');
}

function exportNotesToMarkdown(notesData) {
  if (!notesData) return;
  let dbData = { db: [], events: [], locations: [], customPolygons: [] };
  try {
    if (fs.existsSync(DB_FILE)) {
      dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Failed to read database.json for notes classification:", e);
  }

  const charMap = {};
  if (dbData.db) {
    dbData.db.forEach(c => {
      charMap[c.id] = c;
    });
  }

  const eventMap = {};
  if (dbData.events) {
    dbData.events.forEach(e => {
      eventMap[e.id] = e;
    });
  }

  const locMap = {};
  if (dbData.locations) {
    dbData.locations.forEach(l => {
      locMap[l.id] = l;
    });
  }

  const polyMap = {};
  if (dbData.customPolygons) {
    dbData.customPolygons.forEach(p => {
      polyMap[p.id] = p;
    });
  }

  const FOLDER_PEOPLE = path.join(NOTES_DIR, '인물');
  const FOLDER_EVENTS = path.join(NOTES_DIR, '사건');
  const FOLDER_LOCATIONS = path.join(NOTES_DIR, '장소');
  const FOLDER_AREAS = path.join(NOTES_DIR, '영역');
  const FOLDER_PROPHETS = path.join(NOTES_DIR, '선지자');
  const FOLDER_TEXTBOX = path.join(NOTES_DIR, '텍스트상자');
  const FOLDER_OTHER = path.join(NOTES_DIR, '기타');

  [FOLDER_PEOPLE, FOLDER_EVENTS, FOLDER_LOCATIONS, FOLDER_AREAS, FOLDER_PROPHETS, FOLDER_TEXTBOX, FOLDER_OTHER].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (let key in notesData) {
    const content = notesData[key];
    let folder = FOLDER_OTHER;
    let fileName = key;
    let typeLabel = '기타';

    const char = charMap[key];
    const event = eventMap[key];
    const loc = locMap[key];
    const poly = polyMap[key];

    if (char) {
      const isProphetChar = char.isProphet === true || 
                            char.id.startsWith('prophet_') || 
                            char.id === 'samuel';
      if (isProphetChar) {
        folder = FOLDER_PROPHETS;
        typeLabel = '선지자';
      } else {
        folder = FOLDER_PEOPLE;
        typeLabel = '인물';
      }
      fileName = char.name;
    } else if (event) {
      folder = FOLDER_EVENTS;
      typeLabel = '사건';
      fileName = event.name;
    } else if (loc) {
      folder = FOLDER_LOCATIONS;
      typeLabel = '장소';
      fileName = loc.name;
    } else if (poly) {
      folder = FOLDER_AREAS;
      typeLabel = '영역';
      fileName = poly.label || poly.id;
    } else if (key.startsWith('note-') || key.startsWith('annotation_')) {
      folder = FOLDER_TEXTBOX;
      typeLabel = '텍스트상자';
      fileName = key;
    }

    const safeFileName = fileName.replace(/[\/\\:\*\?"<>\|]/g, '_').trim();
    const filePath = path.join(folder, `${safeFileName}.md`);

    if (!content || content.trim().length === 0) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }
    } else {
      let title = safeFileName;
      if (char) title = `${char.name} (${char.engName || ''})`;
      else if (event) title = `${event.name}`;
      else if (loc) title = `${loc.name}`;
      else if (poly) title = `${poly.label || poly.id}`;

      let mdText = `---
title: "${title}"
id: "${key}"
type: "${typeLabel}"
tags:
  - 성경족보메모
  - ${typeLabel}
---

# ${title}

${content}
`;
      try {
        fs.writeFileSync(filePath, mdText, 'utf8');
      } catch (e) {
        console.error("Failed to write md file:", filePath, e);
      }
    }
  }
}

function exportAllUsersNotesOnStartup() {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      const notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
      for (let user in notes) {
        if (notes[user]) {
          exportNotesToMarkdown(notes[user]);
        }
      }
    }
  } catch (e) {
    console.error("Startup notes export failed:", e);
  }
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`- Users DB: ${USERS_FILE}`);
  console.log(`- Notes DB: ${NOTES_FILE}`);
  exportAllUsersNotesOnStartup();
});
