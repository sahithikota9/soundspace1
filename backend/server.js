// backend/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIF_FILE = path.join(DATA_DIR, 'notifications.json');
const PUBLIC_LIB_FILE = path.join(DATA_DIR, 'public_library.json');

function readJSON(file){
  if (!fs.existsSync(file)) return null;
  const s = fs.readFileSync(file,'utf8');
  if (!s) return null;
  return JSON.parse(s);
}
function writeJSON(file, obj){
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}
function ensureDir(p){
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function ensureUserFiles(username){
  const subs = ['practice','notes','errors','private_libraries'];
  subs.forEach(sub=>{
    const dir = path.join(DATA_DIR, sub);
    ensureDir(dir);
    const file = path.join(dir, `${username}.json`);
    if (!fs.existsSync(file)) writeJSON(file, []);
  });
}
function ensureBaseFiles(){
  ensureDir(DATA_DIR);
  if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, []);
  if (!fs.existsSync(NOTIF_FILE)) writeJSON(NOTIF_FILE, []);
  if (!fs.existsSync(PUBLIC_LIB_FILE)) writeJSON(PUBLIC_LIB_FILE, []);
}
ensureBaseFiles();

// In-memory sessions: token -> { username, role, name }
const sessions = {};

// ---- AUTH ----
app.post('/api/login', (req,res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  const users = readJSON(USERS_FILE) || [];
  const u = users.find(x => String(x.username) === String(username) && String(x.password) === String(password));
  if (!u) return res.status(401).json({ error: 'invalid' });
  const token = nanoid(24);
  sessions[token] = { username: String(u.username), role: u.role, name: u.name || '' };
  // ensure per-user files exist
  ensureUserFiles(String(u.username));
  res.json({ token, username: u.username, role: u.role, name: u.name });
});

function authMiddleware(req, res, next){
  const h = req.headers['authorization'];
  if (!h) return res.status(401).json({ error: 'no auth' });
  const parts = h.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'bad auth' });
  const token = parts[1];
  const sess = sessions[token];
  if (!sess) return res.status(401).json({ error: 'invalid token' });
  req.session = sess;
  next();
}

// get profile
app.get('/api/me', authMiddleware, (req,res) => {
  res.json({ username: req.session.username, role: req.session.role, name: req.session.name });
});

// change name
app.post('/api/me/name', authMiddleware, (req,res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'missing name' });
  const users = readJSON(USERS_FILE) || [];
  const u = users.find(x => String(x.username) === String(req.session.username));
  if (!u) return res.status(500).json({ error: 'user not found' });
  u.name = name;
  writeJSON(USERS_FILE, users);
  req.session.name = name;
  res.json({ ok: true, name });
});

// change password
app.post('/api/me/password', authMiddleware, (req,res) => {
  const { current, next } = req.body || {};
  if (!current || !next) return res.status(400).json({ error: 'missing' });
  if (!/^\d{5}$/.test(String(next))) return res.status(400).json({ error: 'password must be 5 digits' });
  const users = readJSON(USERS_FILE) || [];
  const u = users.find(x => String(x.username) === String(req.session.username));
  if (!u) return res.status(500).json({ error: 'user not found' });
  if (String(u.password) !== String(current)) return res.status(403).json({ error: 'wrong current' });
  u.password = String(next);
  writeJSON(USERS_FILE, users);
  res.json({ ok: true });
});

// ---- PRACTICE ----
function userFile(sub, username){
  ensureDir(path.join(DATA_DIR, sub));
  return path.join(DATA_DIR, sub, `${username}.json`);
}

app.get('/api/practice/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const file = userFile('practice', t);
  res.json(readJSON(file) || []);
});
app.post('/api/practice/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const { date, hours } = req.body || {};
  if (!date || hours === undefined) return res.status(400).json({ error: 'missing' });
  const file = userFile('practice', t);
  const arr = readJSON(file) || [];
  const idx = arr.findIndex(x => x.date === date);
  if (idx >= 0) arr[idx].hours = hours;
  else arr.push({ date, hours });
  writeJSON(file, arr);
  res.json({ ok: true });
});
app.delete('/api/practice/:username/:date', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const date = req.params.date;
  const file = userFile('practice', t);
  const arr = readJSON(file) || [];
  writeJSON(file, arr.filter(x => x.date !== date));
  res.json({ ok: true });
});

// ---- NOTES / ERRORS ----
app.get('/api/notes/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  res.json(readJSON(userFile('notes', t)) || []);
});
app.post('/api/notes/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const { date, text } = req.body || {};
  if (!date) return res.status(400).json({ error: 'missing' });
  const file = userFile('notes', t);
  const arr = readJSON(file) || [];
  const idx = arr.findIndex(x => x.date === date);
  if (idx >= 0) arr[idx].text = text;
  else arr.push({ date, text });
  writeJSON(file, arr);
  res.json({ ok: true });
});
app.delete('/api/notes/:username/:date', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const file = userFile('notes', t);
  const arr = readJSON(file) || [];
  writeJSON(file, arr.filter(x => x.date !== req.params.date));
  res.json({ ok: true });
});

app.get('/api/errors/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  res.json(readJSON(userFile('errors', t)) || []);
});
app.post('/api/errors/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const { date, text } = req.body || {};
  if (!date) return res.status(400).json({ error: 'missing' });
  const file = userFile('errors', t);
  const arr = readJSON(file) || [];
  const idx = arr.findIndex(x => x.date === date);
  if (idx >= 0) arr[idx].text = text;
  else arr.push({ date, text });
  writeJSON(file, arr);
  res.json({ ok: true });
});
app.delete('/api/errors/:username/:date', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const file = userFile('errors', t);
  const arr = readJSON(file) || [];
  writeJSON(file, arr.filter(x => x.date !== req.params.date));
  res.json({ ok: true });
});

// ---- NOTIFICATIONS ----
app.get('/api/notifications', authMiddleware, (req,res) => {
  res.json(readJSON(NOTIF_FILE) || []);
});
app.post('/api/notifications', authMiddleware, (req,res) => {
  if (req.session.role !== 'teacher') return res.status(403).json({ error: 'forbidden' });
  const { title, message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'missing' });
  const arr = readJSON(NOTIF_FILE) || [];
  const id = Date.now();
  arr.unshift({ id, title, message, posted_by: req.session.username, date_posted: new Date().toISOString() });
  writeJSON(NOTIF_FILE, arr);
  res.json({ ok: true });
});
app.put('/api/notifications/:id', authMiddleware, (req,res) => {
  if (req.session.role !== 'teacher') return res.status(403).json({ error: 'forbidden' });
  const id = Number(req.params.id);
  const arr = readJSON(NOTIF_FILE) || [];
  const idx = arr.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  if (String(arr[idx].posted_by) !== String(req.session.username)) return res.status(403).json({ error: 'forbidden' });
  arr[idx].message = req.body.message || arr[idx].message;
  arr[idx].title = req.body.title || arr[idx].title;
  writeJSON(NOTIF_FILE, arr);
  res.json({ ok: true });
});
app.delete('/api/notifications/:id', authMiddleware, (req,res) => {
  if (req.session.role !== 'teacher') return res.status(403).json({ error: 'forbidden' });
  const id = Number(req.params.id);
  const arr = readJSON(NOTIF_FILE) || [];
  const idx = arr.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  if (String(arr[idx].posted_by) !== String(req.session.username)) return res.status(403).json({ error: 'forbidden' });
  arr.splice(idx,1);
  writeJSON(NOTIF_FILE, arr);
  res.json({ ok: true });
});

// ---- PUBLIC LIBRARY ----
app.get('/api/library/public', authMiddleware, (req,res) => {
  res.json(readJSON(PUBLIC_LIB_FILE) || []);
});
app.post('/api/library/public', authMiddleware, (req,res) => {
  if (req.session.role !== 'teacher') return res.status(403).json({ error: 'forbidden' });
  const { name, url, type } = req.body || {};
  if (!name || !url) return res.status(400).json({ error: 'missing' });
  const arr = readJSON(PUBLIC_LIB_FILE) || [];
  const id = Date.now();
  arr.unshift({ id, name, url, type, uploader: req.session.username, createdAt: new Date().toISOString() });
  writeJSON(PUBLIC_LIB_FILE, arr);
  res.json({ ok: true });
});
app.delete('/api/library/public/:id', authMiddleware, (req,res) => {
  if (req.session.role !== 'teacher') return res.status(403).json({ error: 'forbidden' });
  const arr = readJSON(PUBLIC_LIB_FILE) || [];
  const id = Number(req.params.id);
  const idx = arr.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  if (String(arr[idx].uploader) !== String(req.session.username)) return res.status(403).json({ error: 'forbidden' });
  arr.splice(idx,1);
  writeJSON(PUBLIC_LIB_FILE, arr);
  res.json({ ok: true });
});

// ---- PRIVATE LIBRARY ----
app.get('/api/library/private/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const file = userFile('private_libraries', t);
  res.json(readJSON(file) || []);
});
app.post('/api/library/private/:username', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const { name, url, type } = req.body || {};
  if (!name || !url) return res.status(400).json({ error: 'missing' });
  const file = userFile('private_libraries', t);
  const arr = readJSON(file) || [];
  const id = Date.now();
  arr.unshift({ id, name, url, type, uploader: t, createdAt: new Date().toISOString() });
  writeJSON(file, arr);
  res.json({ ok: true });
});
app.delete('/api/library/private/:username/:id', authMiddleware, (req,res) => {
  const t = String(req.params.username);
  if (req.session.username !== t) return res.status(403).json({ error: 'forbidden' });
  const file = userFile('private_libraries', t);
  const arr = readJSON(file) || [];
  const id = Number(req.params.id);
  writeJSON(file, arr.filter(x => x.id !== id));
  res.json({ ok: true });
});

// no endpoint to list all users (privacy)

const PORT = process.env.PORT || 8787;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));