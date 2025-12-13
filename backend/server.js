const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* ================= PATHS ================= */

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");

const PRACTICE_DIR = path.join(DATA_DIR, "practice");
const ERRORS_DIR = path.join(DATA_DIR, "errors");
const NOTES_DIR = path.join(DATA_DIR, "notes");
const PRIVATE_LIB_DIR = path.join(DATA_DIR, "private_libraries");
const PUBLIC_LIB_DIR = path.join(DATA_DIR, "public_library");

/* ================= HELPERS ================= */

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureFile(file, defaultData = {}) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
  }
}

function loadJSON(file) {
  ensureFile(file, {});
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function userFile(dir, username) {
  ensureDir(dir);
  const file = path.join(dir, `${username}.json`);
  ensureFile(file, {});
  return file;
}

/* ================= INIT ================= */

ensureDir(DATA_DIR);
ensureDir(PRACTICE_DIR);
ensureDir(ERRORS_DIR);
ensureDir(NOTES_DIR);
ensureDir(PRIVATE_LIB_DIR);
ensureDir(PUBLIC_LIB_DIR);

ensureFile(USERS_FILE, {});
ensureFile(NOTIFICATIONS_FILE, {});

/* ================= AUTH ================= */

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const users = loadJSON(USERS_FILE);
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json({
    username: user.username,
    role: user.role,
    name: user.name
  });
});

/* ================= PRACTICE ================= */

app.get("/api/practice/:username", (req, res) => {
  const file = userFile(PRACTICE_DIR, req.params.username);
  res.json(loadJSON(file));
});

app.post("/api/practice/:username", (req, res) => {
  const file = userFile(PRACTICE_DIR, req.params.username);
  saveJSON(file, req.body);
  res.json({ success: true });
});

/* ================= ERRORS ================= */

app.get("/api/errors/:username", (req, res) => {
  const file = userFile(ERRORS_DIR, req.params.username);
  res.json(loadJSON(file));
});

app.post("/api/errors/:username", (req, res) => {
  const file = userFile(ERRORS_DIR, req.params.username);
  saveJSON(file, req.body);
  res.json({ success: true });
});

/* ================= NOTES ================= */

app.get("/api/notes/:username", (req, res) => {
  const file = userFile(NOTES_DIR, req.params.username);
  res.json(loadJSON(file));
});

app.post("/api/notes/:username", (req, res) => {
  const file = userFile(NOTES_DIR, req.params.username);
  saveJSON(file, req.body);
  res.json({ success: true });
});

/* ================= NOTIFICATIONS ================= */

app.get("/api/notifications", (req, res) => {
  res.json(loadJSON(NOTIFICATIONS_FILE));
});

app.post("/api/notifications", (req, res) => {
  saveJSON(NOTIFICATIONS_FILE, req.body);
  res.json({ success: true });
});

/* ================= LIBRARIES ================= */

app.get("/api/public-library", (req, res) => {
  ensureDir(PUBLIC_LIB_DIR);
  res.json(fs.readdirSync(PUBLIC_LIB_DIR));
});

app.get("/api/private-library/:username", (req, res) => {
  const dir = path.join(PRIVATE_LIB_DIR, req.params.username);
  ensureDir(dir);
  res.json(fs.readdirSync(dir));
});

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.send("Music Progress Tracker backend running");
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});