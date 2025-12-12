const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(bodyParser.json());

// ----------------------------------
// AUTH MIDDLEWARE
// ----------------------------------
const auth = (req, res, next) => {
  const { username, token } = req.headers;
  if (!username || !token) return res.status(401).json({ error: "Unauthorized" });

  const users = JSON.parse(fs.readFileSync('./data/users.json'));
  if (!users[username] || users[username].token !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.username = username;
  req.role = users[username].role;
  req.name = users[username].name;
  next();
};

// ----------------------------------
// MULTER SETUP
// ----------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir;
    if (req.baseUrl.includes('private')) {
      dir = `./data/private_libraries/${req.username}`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } else if (req.baseUrl.includes('notifications')) {
      dir = './data/notifications';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } else if (req.baseUrl.includes('public_library')) {
      dir = './data/public_library';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage });

// ----------------------------------
// LOGIN
// ----------------------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync('./data/users.json'));

  if (!users[username] || users[username].password !== password) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // simple token
  const token = Date.now().toString();
  users[username].token = token;
  fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));

  res.json({
    token,
    username,
    role: users[username].role,
    name: users[username].name
  });
});

// ----------------------------------
// PRACTICE
// ----------------------------------
app.post('/api/practice', auth, (req, res) => {
  const dataPath = `./data/practice/${req.username}.json`;
  fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});
app.get('/api/practice', auth, (req, res) => {
  const dataPath = `./data/practice/${req.username}.json`;
  const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {};
  res.json(data);
});

// ----------------------------------
// NOTES
// ----------------------------------
app.post('/api/notes', auth, (req, res) => {
  const dataPath = `./data/notes/${req.username}.json`;
  fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});
app.get('/api/notes', auth, (req, res) => {
  const dataPath = `./data/notes/${req.username}.json`;
  const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {};
  res.json(data);
});

// ----------------------------------
// ERRORS
// ----------------------------------
app.post('/api/errors', auth, (req, res) => {
  const dataPath = `./data/errors/${req.username}.json`;
  fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});
app.get('/api/errors', auth, (req, res) => {
  const dataPath = `./data/errors/${req.username}.json`;
  const data = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {};
  res.json(data);
});

// ----------------------------------
// PRIVATE LIBRARY
// ----------------------------------
app.post('/api/private_library', auth, upload.single('file'), (req, res) => {
  res.json({ ok: true, file: req.file.filename });
});
app.get('/api/private_library', auth, (req, res) => {
  const dir = `./data/private_libraries/${req.username}`;
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  res.json(files);
});

// ----------------------------------
// PUBLIC LIBRARY
// ----------------------------------
app.get('/api/public_library', auth, (req, res) => {
  const dir = './data/public_library';
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  res.json(files);
});
app.post('/api/public_library', auth, upload.single('file'), (req, res) => {
  if (req.role !== 'teacher') return res.status(403).json({ error: "Forbidden" });
  res.json({ ok: true, file: req.file.filename });
});

// ----------------------------------
// NOTIFICATIONS
// ----------------------------------
if (!fs.existsSync('./data/notifications.json')) fs.writeFileSync('./data/notifications.json', '[]');
let notifications = JSON.parse(fs.readFileSync('./data/notifications.json'));

app.post('/api/notifications', auth, upload.single('file'), (req, res) => {
  if (req.role !== 'teacher') return res.status(403).json({ error: "Forbidden" });

  const message = req.body.message || '';
  const now = Date.now();
  let notif = { id: now.toString(), message, timestamp: now, file: null };

  if (req.file) notif.file = `/data/notifications/${req.file.filename}`;

  notifications.unshift(notif);
  fs.writeFileSync('./data/notifications.json', JSON.stringify(notifications, null, 2));
  res.json({ ok: true });
});

app.get('/api/notifications', auth, (req, res) => {
  res.json(notifications);
});

// ----------------------------------
// SERVE UPLOADED FILES
// ----------------------------------
app.use('/data', express.static(path.join(__dirname, 'data')));

// ----------------------------------
// START SERVER
// ----------------------------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});