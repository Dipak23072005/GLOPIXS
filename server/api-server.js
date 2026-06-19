const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const ASSET_ALIASES = {
  "assets/animate-logo.mp4": "assets/videos/animate-logo.mp4",
  "assets/company-logo.mp4": "assets/videos/home-logo-video.mp4",
  "assets/home-logo-video.mp4": "assets/videos/home-logo-video.mp4",
  "assets/ai-logo-tv.mp4": "assets/videos/ai-logo-tv.mp4",
  "assets/glopixs-spotlight-tv.mp4": "assets/videos/glopixs-spotlight-tv.mp4",
  "assets/logo-reveal.mp4": "assets/videos/logo-reveal.mp4",
  "assets/company-logo.png": "assets/images/company-logo.png",
  "assets/intro-banner-logo.png": "assets/images/intro-banner-logo.png",
  "assets/top-left-logo.png": "assets/images/top-left-logo.png",
};

const titles = [
  {
    id: "api-logo-video",
    title: "GLOPIXS Spotlight",
    type: "movie",
    genre: "Indian OTT / Brand",
    rating: 9.8,
    year: 2026,
    duration: "30 sec",
    language: "Hindi",
    isPremium: true,
    description: "GLOPIXS Spotlight with the official V logo video background.",
    thumbnailUrl: "/assets/images/intro-banner-logo.png",
    bannerVideoUrl: "/assets/videos/glopixs-spotlight-tv.mp4",
    videoUrl: "/assets/videos/glopixs-spotlight-tv.mp4",
    cast: ["GLOPIXS"],
  },
  {
    id: "api-tv-logo",
    title: "GLOPIXS TV Logo",
    type: "movie",
    genre: "Brand / Video",
    rating: 9.6,
    year: 2026,
    duration: "30 sec",
    language: "Hindi",
    isPremium: false,
    description: "GLOPIXS TV size logo video.",
    thumbnailUrl: "/assets/images/top-left-logo.png",
    bannerVideoUrl: "/assets/videos/ai-logo-tv.mp4",
    videoUrl: "/assets/videos/ai-logo-tv.mp4",
    cast: ["GLOPIXS"],
  },
  {
    id: "api-reveal",
    title: "GLOPIXS Logo Reveal",
    type: "movie",
    genre: "Reveal / Intro",
    rating: 9.4,
    year: 2026,
    duration: "4 sec",
    language: "Hindi",
    isPremium: false,
    description: "Short GLOPIXS reveal animation.",
    thumbnailUrl: "/assets/images/company-logo.png",
    bannerVideoUrl: "/assets/videos/logo-reveal.mp4",
    videoUrl: "/assets/videos/logo-reveal.mp4",
    cast: ["GLOPIXS"],
  },
];

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": MIME_TYPES[".json"],
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function safeEnd(res) {
  if (!res.destroyed && !res.writableEnded) {
    res.end();
  }
}

function sendFile(req, res, relativePath) {
  const cleanRelativePath = relativePath.replace(/^\/+/, "");
  const aliasedPath = ASSET_ALIASES[cleanRelativePath] || cleanRelativePath;
  const filePath = path.resolve(ROOT, aliasedPath);

  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJson(res, 404, { error: "File not found" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const range = req.headers.range;

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
        res.end();
        return;
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stats.size - 1;

      if (start >= stats.size || end >= stats.size || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
        res.end();
        return;
      }

      res.writeHead(206, {
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
        "Content-Type": contentType,
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
      });
      const stream = fs.createReadStream(filePath, { start, end });
      req.on("close", () => stream.destroy());
      stream.on("error", () => safeEnd(res));
      res.on("error", () => stream.destroy());
      stream.pipe(res);
      return;
    }

    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes",
      "Content-Type": contentType,
      "Content-Length": stats.size,
    });
    const stream = fs.createReadStream(filePath);
    req.on("close", () => stream.destroy());
    res.on("error", () => stream.destroy());
    stream
      .on("error", () => {
        if (!res.headersSent) {
          sendJson(res, 500, { error: "Unable to read file" });
        } else {
          safeEnd(res);
        }
      })
      .pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  } catch {
    sendJson(res, 400, { error: "Bad request" });
    return;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (url.pathname === "/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === "/") {
    sendJson(res, 200, {
      ok: true,
      service: "GLOPIXS API",
      endpoints: ["/health", "/api/titles", "/assets/videos/ai-logo-tv.mp4"],
    });
    return;
  }

  if (url.pathname === "/api/titles") {
    sendJson(res, 200, { titles });
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    try {
      sendFile(req, res, decodeURIComponent(url.pathname));
    } catch {
      sendJson(res, 400, { error: "Bad asset path" });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.log(`GLOPIXS API is already running on port ${PORT}.`);
    console.log("This window will stay open so it does not look like a crash.");
    console.log("Use the existing API process, then start Metro/app launch.");
    setInterval(() => {}, 60 * 60 * 1000);
    return;
  }

  throw error;
});

process.on("uncaughtException", (error) => {
  console.error("GLOPIXS API recovered from an unexpected error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("GLOPIXS API recovered from an async error:", error);
});

server.listen(PORT, HOST, () => {
  console.log(`GLOPIXS API running at http://localhost:${PORT}`);
  console.log(`Android emulator can use http://10.0.2.2:${PORT}`);
});
