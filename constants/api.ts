import { Platform } from "react-native";

import { ContentItem, ContentSection, FEATURED_CONTENT, LOCAL_MEDIA_KEY, SECTIONS } from "@/constants/data";

const DEFAULT_API_BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_GLOPIXS_API_URL ||
  DEFAULT_API_BASE_URL;

const API_CANDIDATES = [
  process.env.EXPO_PUBLIC_GLOPIXS_API_URL,
  DEFAULT_API_BASE_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter((url, index, urls): url is string => Boolean(url) && urls.indexOf(url) === index);

let cachedContent: ContentItem[] | null = null;

export function clearApiContentCache() {
  cachedContent = null;
  inFlightContent = null;
}
let inFlightContent: Promise<ContentItem[]> | null = null;
const LOCAL_BANNER_KEY = LOCAL_MEDIA_KEY;
const INDIAN_LANGUAGES = new Set([
  "hindi",
  "marathi",
  "tamil",
  "telugu",
  "kannada",
  "malayalam",
  "bengali",
  "punjabi",
  "gujarati",
  "bhojpuri",
  "odia",
  "assamese",
  "urdu",
]);

type ApiTitle = {
  id?: string | number;
  _id?: string | number;
  contentId?: string | number;
  title?: string;
  name?: string;
  type?: string;
  rail?: string;
  category?: string;
  categories?: string[];
  genre?: string;
  genres?: string[];
  rating?: number;
  year?: number;
  releaseYear?: number;
  duration?: string;
  runtime?: string;
  cast?: string[];
  actors?: string[];
  description?: string;
  overview?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  poster?: string;
  posterUrl?: string;
  banner?: string;
  bannerUrl?: string;
  bannerImageUrl?: string;
  bannerVideoUrl?: string;
  logoUrl?: string;
  video?: string;
  videoUrl?: string;
  url?: string;
  fileUrl?: string;
  mediaUrl?: string;
  streamUrl?: string;
  trailerUrl?: string;
  language?: string;
  lang?: string;
  isPremium?: boolean;
  premium?: boolean;
  views?: number;
  episodes?: number;
};

type ApiResponse =
  | ApiTitle[]
  | {
      titles?: ApiTitle[];
      data?: ApiTitle[];
      items?: ApiTitle[];
      results?: ApiTitle[];
      content?: ApiTitle[];
    };

function toContentType(type?: string): ContentItem["type"] {
  const normalized = type?.toLowerCase();
  if (normalized === "series" || normalized === "show" || normalized === "webseries") return "series";
  if (normalized === "short" || normalized === "shorts" || normalized === "shortzone") return "short";
  return "movie";
}

function toContentSection(item: ApiTitle, category: string, index: number): ContentSection {
  const haystack = [
    item.type,
    item.category,
    item.rail,
    item.genre,
    ...(item.categories ?? []),
    ...(item.genres ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("short")) return "shortzone";
  if (haystack.includes("romance") || haystack.includes("love")) return "romance";
  if (haystack.includes("kid") || haystack.includes("cartoon")) return "kids";
  if (haystack.includes("series") || haystack.includes("show")) return "series";

  const sections = SECTIONS.map((section) => section.id);
  return sections[index % sections.length];
}

function titleCase(value?: string) {
  if (!value) return "Featured";
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function absoluteAssetUrl(path?: string, baseUrl = API_BASE_URL) {
  if (!path) return LOCAL_BANNER_KEY;
  const cleanPath = path.trim();
  if (!cleanPath) return LOCAL_BANNER_KEY;
  if (/^(https?:)?\/\//i.test(cleanPath)) {
    return cleanPath.startsWith("//") ? `http:${cleanPath}` : cleanPath;
  }
  if (/^(file|content):\/\//i.test(cleanPath)) return cleanPath;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  return `${cleanBase}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

function pickFirstUrl(baseUrl: string, ...paths: Array<string | undefined>) {
  return absoluteAssetUrl(paths.find((path) => typeof path === "string" && path.trim()), baseUrl);
}

function pickOptionalUrl(baseUrl: string, ...paths: Array<string | undefined>) {
  const path = paths.find((value) => typeof value === "string" && value.trim());
  return path ? absoluteAssetUrl(path, baseUrl) : undefined;
}

function pickFirstImageUrl(baseUrl: string, ...paths: Array<string | undefined>) {
  return pickFirstUrl(
    baseUrl,
    ...paths.filter((path) => !path || !/\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(path))
  );
}

function pickList(payload: ApiResponse) {
  if (Array.isArray(payload)) return payload;
  const directList = payload.titles || payload.data || payload.items || payload.results || payload.content;
  if (Array.isArray(directList)) return directList;

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value as ApiTitle[];
  }

  return [];
}

function safeCast(item: ApiTitle) {
  const cast = item.cast || item.actors;
  return Array.isArray(cast) && cast.length > 0
    ? cast.map(String)
    : ["GLOPIXS Originals", "Featured Artist", "V Studio"];
}

function safeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeIndianLanguage(value: unknown) {
  const language = safeText(value, "Hindi");
  return INDIAN_LANGUAGES.has(language.toLowerCase()) ? language : "Hindi";
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function mapApiTitle(item: ApiTitle, index: number, baseUrl = API_BASE_URL): ContentItem {
  const category =
    item.genre ||
    item.genres?.join(" / ") ||
    item.categories?.join(" / ") ||
    titleCase(item.category || item.rail || item.type);
  const type = toContentType(item.type);
  const section = toContentSection(item, category, index);
  const thumbnail = pickFirstImageUrl(
    baseUrl,
    item.thumbnailUrl,
    item.thumbnail,
    item.logoUrl,
    item.posterUrl,
    item.poster,
    item.bannerImageUrl
  );
  // Always use local banner media so the app does not crash when API video assets are unavailable.
  const banner = LOCAL_BANNER_KEY;
  const episodes = typeof item.episodes === "number" ? item.episodes : type === "series" ? 8 : undefined;

  return {
    id: String(item.id || item._id || item.contentId || `api_${index}`),
    title: safeText(item.title || item.name, "V GLOPIXS"),
    genre: category,
    category,
    section,
    rating: typeof item.rating === "number" ? item.rating : Math.min(9.8, 7.6 + (index % 8) * 0.2),
    year: item.year || item.releaseYear || 2026,
    duration: item.duration || item.runtime || (type === "series" ? `${episodes ?? 8} Episodes` : "2h 10m"),
    type,
    isPremium: Boolean(item.isPremium || item.premium),
    description: safeText(item.description || item.overview, "Ready to stream on GLOPIXS."),
    episodes,
    language: safeIndianLanguage(item.language || item.lang),
    cast: safeCast(item),
    thumbnail,
    banner,
    videoUrl: pickOptionalUrl(
      baseUrl,
      item.bannerVideoUrl,
      item.streamUrl,
      item.mediaUrl,
      item.fileUrl,
      item.url,
      item.trailerUrl,
      item.video,
      item.videoUrl
    ),
  };
}

export async function fetchApiContent() {
  if (cachedContent) return cachedContent;
  if (inFlightContent) return inFlightContent;

  inFlightContent = loadApiContent();
  try {
    const result = await inFlightContent;
    cachedContent = result.length > 0 ? result : FEATURED_CONTENT;
    return cachedContent;
  } finally {
    inFlightContent = null;
  }
}

async function loadApiContent() {
  let lastError: unknown;

  for (const baseUrl of API_CANDIDATES) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/titles`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const payload = (await response.json()) as ApiResponse;
      const titles = pickList(payload);
      if (!Array.isArray(titles) || titles.length === 0) return FEATURED_CONTENT;

      const mapped = titles
        .map((title, index) => mapApiTitle(title, index, baseUrl))
        .filter((item) => item.id && item.title);
      return mapped.length > 0 ? mapped : FEATURED_CONTENT;
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("GLOPIXS API unavailable, using fallback content.", lastError);
  return FEATURED_CONTENT;
}
