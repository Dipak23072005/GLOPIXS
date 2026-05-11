const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "database.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9.\-_]/gi, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(__dirname));

function defaultDatabase() {
  return {
    users: [],
    plans: [
      { id: "plan_1_month", name: "1 Month", price: 79, durationDays: 30, devices: 1 },
      { id: "plan_3_months", name: "3 Months", price: 299, durationDays: 90, devices: 2 },
      { id: "plan_1_year", name: "1 Year", price: 799, durationDays: 365, devices: 4 }
    ],
    titles: [],
    subscriptions: [],
    watchlist: []
  };
}

function readDb() {
  if (!fs.existsSync(DATA_FILE)) {
    const seed = defaultDatabase();
    writeDb(seed);
    return seed;
  }

  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeDb(database) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2));
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "V GLOPIXS", time: new Date().toISOString() });
});

app.get("/api/titles", (req, res) => {
  const database = readDb();
  res.json(database.titles);
});

app.post("/api/titles", (req, res) => {
  const database = readDb();
  const title = {
    id: `title_${Date.now()}`,
    title: req.body.title,
    type: req.body.type || "movies",
    category: req.body.category || req.body.type || "movies",
    description: req.body.description || "",
    posterUrl: req.body.posterUrl || "",
    trailerUrl: req.body.trailerUrl || "",
    videoUrl: req.body.videoUrl || "",
    isPremium: Boolean(req.body.isPremium),
    createdAt: new Date().toISOString()
  };
  database.titles.push(title);
  writeDb(database);
  res.status(201).json(title);
});

app.post("/api/upload", upload.fields([{ name: "poster", maxCount: 1 }, { name: "video", maxCount: 1 }]), (req, res) => {
  const poster = req.files.poster?.[0];
  const video = req.files.video?.[0];
  res.status(201).json({
    posterUrl: poster ? `/uploads/${poster.filename}` : "",
    videoUrl: video ? `/uploads/${video.filename}` : ""
  });
});

app.get("/api/plans", (req, res) => {
  res.json(readDb().plans);
});

app.post("/api/users", (req, res) => {
  const database = readDb();
  const existing = database.users.find(user => user.email === req.body.email);
  if (existing) {
    existing.name = req.body.name || existing.name;
    writeDb(database);
    return res.json(existing);
  }

  const user = {
    id: `user_${Date.now()}`,
    name: req.body.name || "User",
    email: req.body.email,
    createdAt: new Date().toISOString()
  };
  database.users.push(user);
  writeDb(database);
  res.status(201).json(user);
});

app.post("/api/subscriptions", (req, res) => {
  const database = readDb();
  const record = {
    id: `sub_${Date.now()}`,
    userEmail: req.body.userEmail,
    planId: req.body.planId,
    status: "active",
    startedAt: new Date().toISOString()
  };
  database.subscriptions.push(record);
  writeDb(database);
  res.status(201).json(record);
});

app.listen(PORT, () => {
  console.log(`V GLOPIXS backend running at http://localhost:${PORT}`);
});
