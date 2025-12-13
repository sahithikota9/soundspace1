const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PUBLIC_LIBRARY = path.join(DATA_DIR, 'public_library');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

function readJSON(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// LOGIN
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  if (!users[username] || users[username].password !== password)
    return res.status(400).json({ error: 'Invalid username or password' });

  const token = crypto.randomBytes(16).toString('hex');
  res.json({ token, username, role: users[username].role, name: users[username].name });
});

// PRACTICE / ERRORS / NOTES
['practice', 'errors', 'notes'].forEach(tab => {
  const dir = path.join(DATA_DIR, tab);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  app.get(`/api/${tab}/:username`, (req, res) => {
    const filePath = path.join(dir, `${req.params.username}.json`);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}', 'utf-8');
    res.json(readJSON(filePath));
  });

  app.post(`/api/${tab}/:username`, (req, res) => {
    const filePath = path.join(dir, `${req.params.username}.json`);
    writeJSON(filePath, req.body);
    res.json({ success: true });
  });
});

// PRIVATE LIBRARY
app.get('/api/private/:username', (req, res) => {
  const dir = path.join(DATA_DIR, 'private_libraries', req.params.username);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const files = fs.readdirSync(dir);
  res.json({ files });
});

app.post('/api/private/:username', (req, res) => {
  // implement file upload if needed
  res.json({ success: true });
});

// PUBLIC LIBRARY
if (!fs.existsSync(PUBLIC_LIBRARY)) fs.mkdirSync(PUBLIC_LIBRARY, { recursive: true });

app.get('/api/public', (req, res) => {
  const files = fs.readdirSync(PUBLIC_LIBRARY);
  res.json({ files });
});

app.post('/api/public', (req, res) => {
  // only teachers can upload files
  res.json({ success: true });
});

// NOTIFICATIONS
if (!fs.existsSync(NOTIFICATIONS_FILE)) writeJSON(NOTIFICATIONS_FILE, {});

app.get('/api/notifications', (req, res) => res.json(readJSON(NOTIFICATIONS_FILE)));
app.post('/api/notifications', (req, res) => {
  writeJSON(NOTIFICATIONS_FILE, req.body);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));