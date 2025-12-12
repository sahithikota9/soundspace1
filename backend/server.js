const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

// Paths
const DATA_PATH = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_PATH, 'users.json');
const NOTIF_FILE = path.join(DATA_PATH, 'notifications.json');
const PRACTICE_PATH = path.join(DATA_PATH, 'practice');
const ERRORS_PATH = path.join(DATA_PATH, 'errors');
const NOTES_PATH = path.join(DATA_PATH, 'notes');
const PRIVATE_LIB_PATH = path.join(DATA_PATH, 'private_libraries');
const PUBLIC_LIB_PATH = path.join(__dirname, 'public_library');

// Utility to read JSON
function readJSON(file){
    if(!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file));
}

// Utility to write JSON
function writeJSON(file,data){
    fs.writeFileSync(file, JSON.stringify(data,null,2));
}

// Ensure folder exists
function ensureFolder(folder){
    if(!fs.existsSync(folder)) fs.mkdirSync(folder,{recursive:true});
}
ensureFolder(PRACTICE_PATH);
ensureFolder(ERRORS_PATH);
ensureFolder(NOTES_PATH);
ensureFolder(PRIVATE_LIB_PATH);
ensureFolder(PUBLIC_LIB_PATH);

// --- Authentication middleware ---
function authMiddleware(req,res,next){
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({error:'Missing token'});
    const users = readJSON(USERS_FILE);
    const user = Object.values(users).find(u=>u.token===token);
    if(!user) return res.status(401).json({error:'Invalid token'});
    req.user = user;
    next();
}

// --- Login ---
app.post('/api/login',(req,res)=>{
    const {username,password} = req.body;
    const users = readJSON(USERS_FILE);
    const user = users[username];
    if(!user || user.password !== password){
        return res.status(400).json({error:'Invalid username or password'});
    }
    // create a simple token
    user.token = Math.random().toString(36).substr(2);
    users[username] = user;
    writeJSON(USERS_FILE,users);
    res.json({token:user.token, username:user.username, role:user.role, name:user.name});
});

// --- Notifications ---
app.get('/api/notifications', (req,res)=>{
    const notifs = readJSON(NOTIF_FILE);
    res.json(notifs);
});

app.post('/api/notifications', authMiddleware, (req,res)=>{
    if(req.user.role!=='teacher') return res.status(403).json({error:'Only teachers can post'});
    const notifs = readJSON(NOTIF_FILE);
    const id = Date.now();
    notifs[id] = {id, text:req.body.text, author:req.user.name, date:new Date().toISOString()};
    writeJSON(NOTIF_FILE,notifs);
    res.json({message:'Notification posted', id});
});

// --- Practice / Errors / Notes ---
function getUserFolder(basePath, username){
    const folder = path.join(basePath, username);
    ensureFolder(folder);
    return folder;
}

function readUserJSON(basePath, username){
    const file = path.join(getUserFolder(basePath, username),'data.json');
    if(!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file));
}

function writeUserJSON(basePath, username,data){
    const file = path.join(getUserFolder(basePath, username),'data.json');
    fs.writeFileSync(file, JSON.stringify(data,null,2));
}

// Generic routes
['practice','errors','notes'].forEach(type=>{
    app.get(`/api/${type}/:username`, authMiddleware, (req,res)=>{
        if(req.params.username !== req.user.username) return res.status(403).json({error:'Forbidden'});
        const data = readUserJSON(eval(type.toUpperCase()+'_PATH'), req.params.username);
        res.json(data);
    });

    app.post(`/api/${type}/:username`, authMiddleware, (req,res)=>{
        if(req.params.username !== req.user.username) return res.status(403).json({error:'Forbidden'});
        writeUserJSON(eval(type.toUpperCase()+'_PATH'), req.params.username, req.body);
        res.json({message:'Saved'});
    });
});

// --- Profile (change password) ---
app.post('/api/profile/:username', authMiddleware, (req,res)=>{
    if(req.params.username!==req.user.username) return res.status(403).json({error:'Forbidden'});
    const users = readJSON(USERS_FILE);
    users[req.user.username].password = req.body.password;
    writeJSON(USERS_FILE,users);
    res.json({message:'Password updated'});
});

// --- Public Library ---
ensureFolder(PUBLIC_LIB_PATH);
const uploadPublic = multer({ dest: PUBLIC_LIB_PATH });

app.get('/api/library/public',(req,res)=>{
    fs.readdir(PUBLIC_LIB_PATH,(err,files)=>{
        if(err) return res.status(500).json({error:'Cannot read public library'});
        res.json({files});
    });
});

app.post('/api/library/public', authMiddleware, uploadPublic.single('file'), (req,res)=>{
    if(req.user.role!=='teacher') return res.status(403).json({error:'Only teachers can post'});
    const originalName = req.file.originalname;
    fs.renameSync(req.file.path, path.join(PUBLIC_LIB_PATH, originalName));
    res.json({message:'File uploaded', filename:originalName});
});

// --- Private Library ---
ensureFolder(PRIVATE_LIB_PATH);
const uploadPrivate = multer({ dest: 'temp_uploads/' });

app.get('/api/library/private/:username', authMiddleware, (req,res)=>{
    if(req.params.username!==req.user.username) return res.status(403).json({error:'Forbidden'});
    const folder = getUserFolder(PRIVATE_LIB_PATH, req.params.username);
    fs.readdir(folder,(err,files)=>{
        if(err) return res.status(500).json({error:'Cannot read private library'});
        res.json({files});
    });
});

app.post('/api/library/private/:username', authMiddleware, uploadPrivate.single('file'), (req,res)=>{
    if(req.params.username!==req.user.username) return res.status(403).json({error:'Forbidden'});
    const folder = getUserFolder(PRIVATE_LIB_PATH, req.params.username);
    const originalName = req.file.originalname;
    fs.renameSync(req.file.path, path.join(folder,originalName));
    res.json({message:'File uploaded', filename:originalName});
});

// --- Start server ---
app.listen(PORT, ()=>console.log(`Backend running on port ${PORT}`));