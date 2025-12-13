const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function readJSON(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ---------------- LOGIN ---------------- */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE, {});
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid login" });
  }

  res.json({
    token: "ok",
    username,
    role: user.role,
    name: user.name
  });
});

/* ---------------- PRACTICE / NOTES / ERRORS ---------------- */
["practice", "notes", "errors"].forEach(type => {
  app.post(`/api/${type}`, (req, res) => {
    const { username, date, text } = req.body;
    const file = path.join(DATA_DIR, type, `${username}.json`);

    let data = readJSON(file, {});
    data[date] = text;
    writeJSON(file, data);

    res.json({ success: true });
  });

  app.get(`/api/${type}/:username`, (req, res) => {
    const file = path.join(DATA_DIR, type, `${req.params.username}.json`);
    res.json(readJSON(file, {}));
  });
});

/* ---------------- NOTIFICATIONS ---------------- */
const notificationsFile = path.join(DATA_DIR, "notifications.json");

app.get("/api/notifications", (req, res) => {
  res.json(readJSON(notificationsFile, []));
});

app.post("/api/notifications", (req, res) => {
  const { message } = req.body;
  const list = readJSON(notificationsFile, []);
  list.unshift({ message, time: Date.now() });
  writeJSON(notificationsFile, list);
  res.json({ success: true });
});

/* ---------------- PUBLIC LIBRARY ---------------- */
const publicDir = path.join(DATA_DIR, "public_library");
fs.mkdirSync(publicDir, { recursive: true });

const upload = multer({ dest: publicDir });

app.post("/api/public-library", upload.single("file"), (req, res) => {
  res.json({ success: true });
});

app.get("/api/public-library", (req, res) => {
  res.json(fs.readdirSync(publicDir));
});

app.use("/public_library", express.static(publicDir));

/* ---------------- START ---------------- */
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});