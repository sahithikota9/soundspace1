const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend')); // serve your frontend files

// Paths for JSON storage
const DATA_DIR = path.join(__dirname, 'backend', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIFS_FILE = path.join(DATA_DIR, 'notifications.json');
const PRACTICE_DIR = path.join(DATA_DIR, 'practice');
const ERRORS_DIR = path.join(DATA_DIR, 'errors');
const NOTES_DIR = path.join(DATA_DIR, 'notes');
const PRIVATE_LIB_DIR = path.join(DATA_DIR, 'private_libraries');
const PUBLIC_LIB_DIR = path.join(DATA_DIR, 'public_library');

// --- UTILITY FUNCTIONS ---
function readJSON(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Make sure directories exist
[DATA_DIR, PRACTICE_DIR, ERRORS_DIR, NOTES_DIR, PRIVATE_LIB_DIR, PUBLIC_LIB_DIR].forEach(ensureDir);
if (!fs.existsSync(NOTIFS_FILE)) writeJSON(NOTIFS_FILE, []);

// --- LOGIN ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  if (users[username] && users[username].password === password) {
    res.json({
      username,
      role: users[username].role,
      name: users[username].name,
      token: 'demo-token'
    });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// --- PRACTICE ---
app.get('/api/practice/:username', (req, res) => {
  const file = path.join(PRACTICE_DIR, `${req.params.username}.json`);
  res.json(readJSON(file));
});

app.post('/api/practice/:username', (req, res) => {
  const file = path.join(PRACTICE_DIR, `${req.params.username}.json`);
  const data = readJSON(file);
  data[req.body.day] = req.body.hours;
  writeJSON(file, data);
  res.json({ success: true });
});

// --- ERRORS ---
app.get('/api/errors/:username', (req,res)=>{
  const file = path.join(ERRORS_DIR, `${req.params.username}.json`);
  const data = readJSON(file);
  res.json(data.array || []);
});

app.post('/api/errors/:username', (req,res)=>{
  const file = path.join(ERRORS_DIR, `${req.params.username}.json`);
  const data = readJSON(file);
  data.array = data.array || [];
  data.array.push(req.body.text);
  writeJSON(file, data);
  res.json({ success: true });
});

app.delete('/api/errors/:username', (req,res)=>{
  const file = path.join(ERRORS_DIR, `${req.params.username}.json`);
  const data = readJSON(file);
  data.array = (data.array || []).filter(t => t !== req.body.text);
  writeJSON(file, data);
  res.json({ success: true });
});

// --- NOTES ---
app.get('/api/notes/:username', (req,res)=>{
  const file = path.join(NOTES_DIR, `${req.params.username}.json`);
  const data = readJSON(file);
  res.json(data.array || []);
});

app.post('/api/notes/:username', (req,res)=>{
  const file = path.join(NOTES_DIR, `${req.params.username}.json`);
  const data = readJSON(file);
  data.array = data.array || [];
  data.array.push(req.body.text);
  writeJSON(file, data);
  res.json({ success: true });
});

app.delete('/api/notes/:username', (req,res)=>{
  const file = path.join(NOTES_DIR, `${req.params.username}.json`);
  const data = readJSON(file);
  data.array = (data.array || []).filter(t => t !== req.body.text);
  writeJSON(file, data);
  res.json({ success: true });
});

// --- LIBRARY ---
app.get('/api/library/public', (req,res)=>{
  const files = fs.readdirSync(PUBLIC_LIB_DIR);
  res.json(files);
});

app.get('/api/library/private/:username', (req,res)=>{
  const dir = path.join(PRIVATE_LIB_DIR, req.params.username);
  ensureDir(dir);
  const files = fs.readdirSync(dir);
  res.json(files);
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req,res)=>{
  const notifs = readJSON(NOTIFS_FILE);
  res.json(notifs);
});

app.post('/api/notifications', (req,res)=>{
  const notifs = readJSON(NOTIFS_FILE);
  notifs.push(req.body.text);
  writeJSON(NOTIFS_FILE, notifs);
  res.json({ success:true });
});

// --- CHANGE PASSWORD ---
app.post('/api/change-password/:username', (req,res)=>{
  const users = readJSON(USERS_FILE);
  if(users[req.params.username]){
    users[req.params.username].password = req.body.password;
    writeJSON(USERS_FILE, users);
    res.json({ success:true });
  } else res.status(404).json({error:'User not found'});
});

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));