import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// --- SQLite storage (more reliable than a plain JSON file) ---
// Use a persistent Railway Volume if one is mounted (set DATA_DIR to its path),
// otherwise fall back to the app folder (NOT persistent across redeploys).
import fs from "fs";
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, "data.sqlite"));
db.exec(`CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT)`);

const readState = () => {
  const row = db.prepare("SELECT value FROM state WHERE key = 'main'").get();
  return row ? JSON.parse(row.value) : {};
};

const writeState = (data) => {
  db.prepare(
    "INSERT INTO state (key, value) VALUES ('main', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(data));
};

app.use(express.json({ limit: "50mb" }));

app.get("/api/state", (req, res) => {
  try {
    res.json(readState());
  } catch {
    res.json({});
  }
});

app.post("/api/state", (req, res) => {
  try {
    writeState(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Automatic Telegram backup (sends a copy of the data every 6 hours) ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendBackupToTelegram() {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const data = readState();
    const json = JSON.stringify(data, null, 2);
    const form = new FormData();
    form.append("chat_id", TELEGRAM_CHAT_ID);
    form.append(
      "document",
      new Blob([json], { type: "application/json" }),
      `backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    form.append("caption", "📦 پشتیبان خودکار اطلاعات انبار");
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, {
      method: "POST",
      body: form,
    });
  } catch (err) {
    console.error("Telegram backup failed:", err);
  }
}

setInterval(sendBackupToTelegram, 6 * 60 * 60 * 1000); // every 6 hours

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
