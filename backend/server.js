const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8787;

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const PRACTICE_DIR = path.join(DATA_DIR, 'practice');
const ERRORS_DIR = path.join(DATA_DIR, 'errors');
const NOTES_DIR = path.join(DATA_DIR, 'notes');
const PRIVATE_LIB_DIR = path.join(DATA_DIR, 'private_libraries');
const PUBLIC_LIB_DIR = path.join(DATA_DIR, 'public_library');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(USERS_FILE);

    if (!users[username] || users[username].password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
        username: users[username].username,
        role: users[username].role,
        name: users[username].name,
        token: 'demo-token'
    });
});

// Get notifications
app.get('/api/notifications', (req, res) => {
    const notifications = readJSON(NOTIFICATIONS_FILE) || [];
    res.json(notifications);
});

// Save notification (teacher only)
app.post('/api/notifications', (req, res) => {
    const { username, role, message } = req.body;
    if (role !== 'teacher') return res.status(403).json({ error: 'Unauthorized' });

    let notifications = readJSON(NOTIFICATIONS_FILE) || [];
    notifications.push({ from: username, message, date: new Date().toISOString() });
    writeJSON(NOTIFICATIONS_FILE, notifications);
    res.json({ success: true });
});

// Serve static files for libraries
app.use('/public_library', express.static(PUBLIC_LIB_DIR));
app.use('/private_library/:username', express.static(path.join(PRIVATE_LIB_DIR)));

// Save practice/errors/notes
app.post('/api/save/:type/:username', (req, res) => {
    const { type, username } = req.params;
    const { data } = req.body;
    let dir;
    if (type === 'practice') dir = PRACTICE_DIR;
    else if (type === 'errors') dir = ERRORS_DIR;
    else if (type === 'notes') dir = NOTES_DIR;
    else return res.status(400).json({ error: 'Invalid type' });

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const filePath = path.join(dir, `${username}.json`);
    writeJSON(filePath, data);
    res.json({ success: true });
});

// Load practice/errors/notes
app.get('/api/load/:type/:username', (req, res) => {
    const { type, username } = req.params;
    let dir;
    if (type === 'practice') dir = PRACTICE_DIR;
    else if (type === 'errors') dir = ERRORS_DIR;
    else if (type === 'notes') dir = NOTES_DIR;
    else return res.status(400).json({ error: 'Invalid type' });

    const filePath = path.join(dir, `${username}.json`);
    const data = readJSON(filePath);
    res.json(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));