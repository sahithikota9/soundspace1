const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIFS_FILE = path.join(DATA_DIR, 'notifications.json');
const PUBLIC_LIB = path.join(DATA_DIR, 'public_library');

// Ensure folders exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_LIB)) fs.mkdirSync(PUBLIC_LIB, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}));
if (!fs.existsSync(NOTIFS_FILE)) fs.writeFileSync(NOTIFS_FILE, JSON.stringify({}));

// Helper functions
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file)); }
  catch { return {}; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ----------------- Login -----------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  if(users[username] && users[username].password === password){
    res.json({
      username,
      role: users[username].role,
      name: users[username].name,
      token: uuidv4()
    });
  } else {
    res.status(400).json({error:'Invalid username or password'});
  }
});

// ----------------- Practice -----------------
app.get('/api/practice/:username', (req,res)=>{
  const file = path.join(DATA_DIR,'practice',`${req.params.username}.json`);
  if(!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  res.json(readJSON(file));
});

app.post('/api/practice/:username', (req,res)=>{
  const file = path.join(DATA_DIR,'practice',`${req.params.username}.json`);
  if(!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), {recursive:true});
  const data = readJSON(file);
  data[req.body.day] = req.body.hours;
  writeJSON(file, data);
  res.json({message:'Saved'});
});

// ----------------- Errors -----------------
app.get('/api/errors/:username', (req,res)=>{
  const file = path.join(DATA_DIR,'errors',`${req.params.username}.json`);
  if(!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  res.json(readJSON(file));
});

app.post('/api/errors/:username', (req,res)=>{
  const file = path.join(DATA_DIR,'errors',`${req.params.username}.json`);
  if(!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), {recursive:true});
  const data = readJSON(file);
  data[req.body.day] = req.body.text;
  writeJSON(file, data);
  res.json({message:'Saved'});
});

// ----------------- Notes -----------------
app.get('/api/notes/:username', (req,res)=>{
  const file = path.join(DATA_DIR,'notes',`${req.params.username}.json`);
  if(!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  res.json(readJSON(file));
});

app.post('/api/notes/:username', (req,res)=>{
  const file = path.join(DATA_DIR,'notes',`${req.params.username}.json`);
  if(!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), {recursive:true});
  const data = readJSON(file);
  data[req.body.day] = req.body.text;
  writeJSON(file, data);
  res.json({message:'Saved'});
});

// ----------------- Notifications -----------------
app.get('/api/notifications', (req,res)=>{
  res.json(readJSON(NOTIFS_FILE));
});

app.post('/api/notifications', (req,res)=>{
  const notifs = readJSON(NOTIFS_FILE);
  const id = uuidv4();
  notifs[id] = {...req.body, date: new Date().toISOString()};
  writeJSON(NOTIFS_FILE, notifs);
  res.json({message:'Notification posted'});
});

// ----------------- Libraries -----------------
app.get('/api/public_library', (req,res)=>{
  const files = fs.readdirSync(PUBLIC_LIB).map(f=>({name:f}));
  res.json(files);
});

app.get('/api/private_library/:username', (req,res)=>{
  const dir = path.join(DATA_DIR,'private_libraries', req.params.username);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
  const files = fs.readdirSync(dir).map(f=>({name:f}));
  res.json(files);
});

// ----------------- Change Password -----------------
app.post('/api/change_password/:username', (req,res)=>{
  const users = readJSON(USERS_FILE);
  if(users[req.params.username]){
    users[req.params.username].password = req.body.password;
    writeJSON(USERS_FILE, users);
    res.json({message:'Password changed'});
  } else {
    res.status(400).json({error:'User not found'});
  }
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));