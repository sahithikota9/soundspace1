// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const PUBLIC_LIBRARY_DIR = path.join(DATA_DIR, 'public_library');
const PRIVATE_LIBRARIES_DIR = path.join(DATA_DIR, 'private_libraries');
const PRACTICE_DIR = path.join(DATA_DIR, 'practice');
const ERRORS_DIR = path.join(DATA_DIR, 'errors');
const NOTES_DIR = path.join(DATA_DIR, 'notes');

// Helper to read JSON safely
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Helper to write JSON
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// =================== LOGIN ===================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  let users = readJSON(USERS_FILE);

  if (!users[username] || users[username].password !== password) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const user = users[username];
  const token = Math.random().toString(36).substring(2, 15); // dummy token
  res.json({ token, username: user.username, role: user.role, name: user.name });
});

// =================== NOTIFICATIONS ===================
app.get('/api/notifications', (req, res) => {
  const notifications = readJSON(NOTIFICATIONS_FILE);
  res.json(notifications);
});

app.post('/api/notifications', (req, res) => {
  const { username, message } = req.body;
  let notifications = readJSON(NOTIFICATIONS_FILE);
  const timestamp = Date.now();
  notifications[timestamp] = { username, message };
  writeJSON(NOTIFICATIONS_FILE, notifications);
  res.json({ success: true });
});

// =================== PRACTICE / ERRORS / NOTES ===================
app.get('/api/:type/:username', (req, res) => {
  const { type, username } = req.params;
  const dirMap = { practice: PRACTICE_DIR, errors: ERRORS_DIR, notes: NOTES_DIR };
  if (!dirMap[type]) return res.status(400).json({ error: 'Invalid type' });

  const filePath = path.join(dirMap[type], `${username}.json`);
  const data = readJSON(filePath);
  res.json(data);
});

app.post('/api/:type/:username', (req, res) => {
  const { type, username } = req.params;
  const { day, value } = req.body;
  const dirMap = { practice: PRACTICE_DIR, errors: ERRORS_DIR, notes: NOTES_DIR };
  if (!dirMap[type]) return res.status(400).json({ error: 'Invalid type' });

  const filePath = path.join(dirMap[type], `${username}.json`);
  const data = readJSON(filePath);
  data[day] = value;
  writeJSON(filePath, data);
  res.json({ success: true });
});

// =================== PRIVATE LIBRARY ===================
const privateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const username = req.params.username;
    const userDir = path.join(PRIVATE_LIBRARIES_DIR, username);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});
const privateUpload = multer({ storage: privateStorage });

app.get('/api/private/:username', (req, res) => {
  const username = req.params.username;
  const userDir = path.join(PRIVATE_LIBRARIES_DIR, username);
  if (!fs.existsSync(userDir)) return res.json([]);
  const files = fs.readdirSync(userDir);
  res.json(files);
});

app.post('/api/private/:username', privateUpload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file.originalname });
});

// =================== PUBLIC LIBRARY ===================
const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(PUBLIC_LIBRARY_DIR)) fs.mkdirSync(PUBLIC_LIBRARY_DIR, { recursive: true });
    cb(null, PUBLIC_LIBRARY_DIR);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});
const publicUpload = multer({ storage: publicStorage });

app.get('/api/public', (req, res) => {
  if (!fs.existsSync(PUBLIC_LIBRARY_DIR)) return res.json([]);
  const files = fs.readdirSync(PUBLIC_LIBRARY_DIR);
  res.json(files);
});

app.post('/api/public', publicUpload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file.originalname });
});

// =================== START SERVER ===================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));