import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const API_BASE = "https://api.dev.runwayml.com/v1";
const API_VERSION = "2024-11-06";

function requireKey(res) {
  if (!process.env.RUNWAYML_API_SECRET) {
    res.status(503).json({
      error: "API key missing. .env file mein RUNWAYML_API_SECRET set karo, phir server restart karo."
    });
    return false;
  }
  return true;
}

app.post("/api/generate", async (req, res) => {
  if (!requireKey(res)) return;
  const promptText = String(req.body?.prompt || "").trim();
  if (promptText.length < 5 || promptText.length > 1000) {
    return res.status(400).json({ error: "Prompt 5 se 1000 characters ka hona chahiye." });
  }

  try {
    const upstream = await fetch(`${API_BASE}/text_to_video`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RUNWAYML_API_SECRET}`,
        "X-Runway-Version": API_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.RUNWAY_MODEL || "gen4.5",
        promptText,
        ratio: req.body?.ratio === "1280:720" ? "1280:720" : "720:1280",
        duration: 5
      })
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Runway API error:", upstream.status, data);
      return res.status(upstream.status).json({
        error: data?.error || data?.message || `Video provider ne request reject ki (HTTP ${upstream.status}). API account, credits aur prompt check karo.`
      });
    }
    return res.json({ taskId: data.id, status: data.status || "PENDING" });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "Video service se connect nahi ho paya. Internet aur API configuration check karo." });
  }
});

app.get("/api/tasks/:id", async (req, res) => {
  if (!requireKey(res)) return;
  const id = String(req.params.id || "");
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return res.status(400).json({ error: "Invalid task ID." });
  try {
    const upstream = await fetch(`${API_BASE}/tasks/${encodeURIComponent(id)}`, {
      headers: {
        "Authorization": `Bearer ${process.env.RUNWAYML_API_SECRET}`,
        "X-Runway-Version": API_VERSION
      }
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Runway task error:", upstream.status, data);
      return res.status(upstream.status).json({ error: data?.error || data?.message || "Task status check nahi ho paya." });
    }
    const output = Array.isArray(data.output) ? data.output : (data.output ? [data.output] : []);
    return res.json({
      id: data.id,
      status: data.status,
      videoUrl: output.find(x => typeof x === "string" && x.startsWith("https://")) || null,
      failure: data.failure || null
    });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "Task status ke liye provider se connect nahi ho paya." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Adnex AI Studio running at http://localhost:${port}`));
