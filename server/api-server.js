const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const ASSET_ALIASES = {
  "assets/animate-logo.mp4": "assets/videos/animate-logo.mp4",
  "assets/company-logo.mp4": "assets/videos/home-logo-video.mp4",
  "assets/home-logo-video.mp4": "assets/videos/home-logo-video.mp4",
  "assets/ai-logo-tv.mp4": "assets/videos/ai-logo-tv.mp4",
  "assets/glopixs-spotlight-tv.mp4": "assets/videos/glopixs-spotlight-tv.mp4",
  "assets/logo-reveal.mp4": "assets/videos/logo-reveal.mp4",
  "assets/videos/glopixs-new-logo.mp4": "video data/GLOPIXS New logo.mp4",
  "assets/company-logo.png": "assets/images/company-logo.png",
  "assets/intro-banner-logo.png": "assets/images/intro-banner-logo.png",
  "assets/top-left-logo.png": "assets/images/top-left-logo.png",
};


function toTitleFromFile(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/\s+with\s+logo\s*$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toIdFromTitle(title) {
  return `upcoming-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

const GENERATED_TRAILER_FILES = [
  "h2o-just-add-water-trailer.m4v",
  "ladyas-vendetta-trailer.m4v",
  "morkut-drama-trailer.m4v",
];

const GENERATED_UPCOMING_TITLES = [
  "H2O - Just Add Water",
  "The Legend Of The Mekong River",
  "Ladyas Vendetta",
  "Morkut Drama",
  "Mortal Wound",
  "My Name Is Riya",
  "Sister Of Murder",
  "Standing Tall",
  "Thai Vampire",
  "The Blue Blood",
  "The Blue Whale",
  "The Demon King",
  "The Queen Of Beegars",
  "The Rebel",
  "The Retribution",
  "The Revenge",
  "Wild District",
];

function getAvailableTrailers() {
  const withLogoDir = path.resolve(ROOT, "with logo");
  if (process.env.GLOPIXS_USE_GENERATED_MEDIA !== "1" && fs.existsSync(withLogoDir)) {
    const files = fs
      .readdirSync(withLogoDir)
      .filter((fileName) => /\.mp4$/i.test(fileName))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    if (files.length > 0) {
      return files.map((fileName, index) => ({
        fileName,
        title: toTitleFromFile(fileName),
        url: `/assets/upcoming/${encodeURIComponent(fileName)}`,
        posterNumber: (index % 17) + 1,
      }));
    }
  }

  return GENERATED_UPCOMING_TITLES.map((title, index) => {
    const fileName = GENERATED_TRAILER_FILES[index % GENERATED_TRAILER_FILES.length];
    return {
      fileName,
      title,
      url: `/assets/generated_trailers/${encodeURIComponent(fileName)}`,
      posterNumber: (index % 17) + 1,
    };
  });
}

function getUpcomingItems() {
  return getAvailableTrailers().map((trailer) => ({
    id: toIdFromTitle(trailer.title),
    title: trailer.title,
    type: "trailer",
    duration: "trailer",
    videoUrl: trailer.url,
    movieUrl: trailer.url,
    thumbnailUrl: `/assets/posters/poster-${trailer.posterNumber}.jpg`,
    posterUrl: `/assets/posters/poster-${trailer.posterNumber}.jpg`,
  }));
}
const catalogSections = [
  {
    section: "movies",
    type: "movie",
    items: [
      ["GLOPIXS Spotlight", "Indian OTT / Brand", "30 sec"],
      ["H2O - Just Add Water", "Adventure", "2h 08m"],
      ["Ladyas Vendetta", "Action Thriller", "1h 52m"],
      ["Morkut Drama", "Drama", "1h 46m"],
      ["Mortal Wound", "Crime", "1h 58m"],
      ["My Name Is Riya", "Mystery", "1h 44m"],
      ["Sister Of Murder", "Thriller", "1h 50m"],
      ["Standing Tall", "Action", "2h 01m"],
      ["Thai Vampire", "Horror", "1h 39m"],
      ["The Blue Blood", "Classic", "2h 06m"],
    ],
  },
  {
    section: "series",
    type: "series",
    items: [
      ["The Demon King", "Fantasy", "8 Episodes"],
      ["The Legend Of The Mekong River", "Historical", "7 Episodes"],
      ["The Queen Of Beegars", "Drama", "9 Episodes"],
      ["The Rebel", "Action", "6 Episodes"],
      ["The Retribution", "Thriller", "8 Episodes"],
      ["The Revenge", "Crime", "7 Episodes"],
      ["Wild District", "Adventure", "10 Episodes"],
      ["H2O Files", "Sci-Fi", "6 Episodes"],
      ["Vendetta Files", "Mystery", "8 Episodes"],
      ["Morkut Stories", "Comedy", "6 Episodes"],
    ],
  },
  {
    section: "shortzone",
    type: "short",
    items: [
      ["Spotlight Cut", "Trending Shorts", "4 min"],
      ["Fast Fear", "Horror Shorts", "5 min"],
      ["Riya Moment", "Drama Shorts", "6 min"],
      ["Action Pulse", "Action Shorts", "5 min"],
      ["Comedy Beat", "Comedy Shorts", "4 min"],
      ["Motivation Drop", "Motivational", "3 min"],
      ["Love Flash", "Romance Shorts", "5 min"],
      ["Music Drop", "Music Shorts", "4 min"],
      ["Kids Spark", "Kids Shorts", "6 min"],
      ["Thrill Bite", "Thriller Shorts", "5 min"],
    ],
  },
  {
    section: "romance",
    type: "movie",
    items: [
      ["Call Me By Your Name", "Love Story", "2h 02m"],
      ["College Love", "College Love", "1h 48m"],
      ["Wedding Night", "Wedding", "1h 55m"],
      ["Heartbreak Season", "Heartbreak", "1h 42m"],
      ["Feel Good Love", "Feel Good", "1h 49m"],
      ["Classic Hearts", "Classic Romance", "2h 01m"],
      ["Teen Dream", "Teen Romance", "1h 38m"],
      ["Musical Love", "Musical Romance", "1h 57m"],
      ["Family Promise", "Family Romance", "1h 51m"],
      ["Romantic Drama", "Romantic Drama", "2h 04m"],
    ],
  },
  {
    section: "kids",
    type: "movie",
    items: [
      ["Jungle Adventure", "Adventure", "1h 22m"],
      ["Learning Stars", "Educational", "48 min"],
      ["Fairy Tale World", "Fairy Tales", "1h 12m"],
      ["Superhero Kids", "Superhero", "1h 18m"],
      ["Cartoon Club", "Cartoon", "42 min"],
      ["Bedtime Magic", "Bedtime", "38 min"],
      ["Fantasy School", "Fantasy", "1h 05m"],
      ["Comedy Kids", "Comedy", "45 min"],
      ["Animal Friends", "Animals", "52 min"],
      ["Learning Fun", "Learning", "44 min"],
    ],
  },
];

function buildCatalogTitles() {
  const availableTrailers = getAvailableTrailers();
  let globalIndex = 0;
  return catalogSections.flatMap((sectionConfig) =>
    sectionConfig.items.map(([title, genre, duration], index) => {
      const posterNumber = (globalIndex % 17) + 1;
      const trailer = availableTrailers[globalIndex % availableTrailers.length];
      const item = {
        id: `${sectionConfig.section}-${index + 1}`,
        title,
        name: title,
        type: sectionConfig.type,
        rail: sectionConfig.section,
        category: genre,
        genre,
        rating: Number((8.1 + (index % 6) * 0.2).toFixed(1)),
        year: 2024 + (index % 3),
        duration,
        language: ["Hindi", "Marathi", "Tamil", "Telugu", "Bengali"][index % 5],
        isPremium: index % 2 === 0,
        description: `${title} streaming on GLOPIXS ${sectionConfig.section}.`,
        thumbnailUrl: `/assets/posters/poster-${posterNumber}.jpg`,
        posterUrl: `/assets/posters/poster-${posterNumber}.jpg`,
        bannerImageUrl: `/assets/posters/poster-${posterNumber}.jpg`,
        videoUrl: trailer.url,
        trailerUrl: trailer.url,
        streamUrl: trailer.url,
        cast: ["GLOPIXS Originals", "Featured Artist", "V Studio"],
        episodes: sectionConfig.type === "series" ? Number.parseInt(duration, 10) || 6 : undefined,
      };
      globalIndex += 1;
      return item;
    })
  );
}

const titles = buildCatalogTitles();
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
  let aliasedPath = ASSET_ALIASES[cleanRelativePath] || cleanRelativePath;
  if (cleanRelativePath.startsWith("assets/upcoming/")) {
    aliasedPath = cleanRelativePath.replace("assets/upcoming/", "with logo/");
  }
  if (cleanRelativePath.startsWith("assets/generated_trailers/")) {
    aliasedPath = cleanRelativePath.replace("assets/generated_trailers/", "server/generated_trailers/");
  }
  if (cleanRelativePath.startsWith("assets/generated_movies/")) {
    aliasedPath = cleanRelativePath.replace("assets/generated_movies/", "server/generated_movies/");
  }
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
      endpoints: ["/health", "/api/titles", "/api/upcoming", "/assets/videos/glopixs-new-logo.mp4"],
    });
    return;
  }

  if (url.pathname === "/api/titles") {
    sendJson(res, 200, { titles });
    return;
  }

  if (url.pathname === "/api/upcoming") {
    sendJson(res, 200, { items: getUpcomingItems() });
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














