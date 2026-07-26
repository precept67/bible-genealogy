const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const NOTES_FILE = path.join(__dirname, 'notes.json');

// Helper to serve static files
const mimeTypes = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml',
};

// Initialize DBs
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}));
if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, JSON.stringify({}));

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e) { return {}; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

const sessions = {}; // token -> { username, status }

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function getUserFromReq(req) {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  return sessions[token] || null;
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
        handlePost(req, res, data, req.method);
      }
    });
    return;
  }

  // Handle GET requests
  handleGet(req, res);
});

function handlePost(req, res, data, method) {
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
    
    if (!user || user.passwordHash !== hashPassword(password)) {
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
    if (!user || user.status !== 'admin') {
      // Legacy fallback for old admin prompt if they didn't login properly yet
      if (data.password === 'admin') {
         // allow
      } else {
        return sendJson(res, 403, { error: '관리자 권한이 필요합니다.' });
      }
    }
    
    const payload = data.payload || data;
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return sendJson(res, 200, { success: true });
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
  let filePath = '.' + url;
  if (filePath === './') filePath = './index.html';
  
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
