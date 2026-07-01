import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

import { getSectionLabel, StandardVideoPlayer } from "@/components/StandardVideoPlayer";
import { API_BASE_URL, fetchApiContent } from "@/constants/api";
import { ContentItem, FEATURED_CONTENT } from "@/constants/data";

const DEFAULT_VIDEO = require("../assets/videos/logo-reveal.mp4");

type ApiUpcomingItem = {
  id: string;
  title: string;
  videoUrl: string;
  movieUrl?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  duration?: string;
};

function absoluteApiUrl(path?: string) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function upcomingToContent(item: ApiUpcomingItem, index: number): ContentItem {
  const videoUrl = absoluteApiUrl(item.movieUrl || item.videoUrl);
  const thumbnail = absoluteApiUrl(item.thumbnailUrl || item.posterUrl);
  return {
    id: item.id,
    title: item.title,
    genre: "Upcoming",
    category: "Upcoming",
    section: "movies",
    rating: Number((8.5 + (index % 5) * 0.1).toFixed(1)),
    year: 2026,
    duration: item.duration || "Trailer",
    type: "movie",
    isPremium: false,
    description: `${item.title} trailer streaming on GLOPIXS Upcoming.`,
    language: "Hindi",
    cast: ["GLOPIXS Originals", "Featured Artist", "V Studio"],
    thumbnail: thumbnail || "glopixs-local-banner",
    banner: thumbnail || "glopixs-local-banner",
    videoUrl,
  };
}

async function fetchUpcomingContent() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upcoming`);
    if (!response.ok) return [];
    const payload = (await response.json()) as { items?: ApiUpcomingItem[] };
    return (payload.items ?? []).map(upcomingToContent);
  } catch {
    return [];
  }
}

function uniqueById(items: ContentItem[]) {
  return items.filter((item, index, all) => all.findIndex((entry) => entry.id === item.id) === index);
}

function findContent(items: ContentItem[], id?: string) {
  if (!id) return undefined;
  const normalized = id.replace(/^hero-/, "");
  return (
    items.find((item) => item.id === id) ??
    items.find((item) => item.id === normalized) ??
    FEATURED_CONTENT.find((item) => item.id === id || item.id === normalized)
  );
}

export default function PlayerScreen() {
  const { id, title: routeTitle, videoUrl, section, category } = useLocalSearchParams<{
    id: string;
    title?: string;
    videoUrl?: string;
    section?: string;
    category?: string;
  }>();
  const [content, setContent] = useState(FEATURED_CONTENT);

  useEffect(() => {
    Promise.all([fetchApiContent(), fetchUpcomingContent()])
      .then(([apiItems, upcomingItems]) => {
        const merged = uniqueById([...(upcomingItems.length > 0 ? upcomingItems : []), ...(apiItems.length > 0 ? apiItems : FEATURED_CONTENT)]);
        setContent(merged.length > 0 ? merged : FEATURED_CONTENT);
      })
      .catch(() => setContent(FEATURED_CONTENT));
  }, []);

  const routeId = Array.isArray(id) ? id[0] : id;
  const item = findContent(content, routeId);
  const routeVideoUrl = Array.isArray(videoUrl) ? videoUrl[0] : videoUrl;
  const routeTitleValue = Array.isArray(routeTitle) ? routeTitle[0] : routeTitle;
  const routeSection = Array.isArray(section) ? section[0] : section;
  const routeCategory = Array.isArray(category) ? category[0] : category;
  const resolvedSection = routeSection || item?.section;
  const resolvedCategory = routeCategory || item?.category || item?.genre;
  const sectionLabel = getSectionLabel(resolvedSection);
  const candidateUrl = routeVideoUrl?.trim() || item?.videoUrl;
  const videoSource = candidateUrl || DEFAULT_VIDEO;
  const title = routeTitleValue || item?.title || "GLOPIXS Video";
  const subtitle = item
    ? `${resolvedCategory ?? item.genre} • ${item.year} • ${
        item.type === "series" ? `${item.episodes ?? 1} Episodes` : item.duration
      }`
    : "Streaming on GLOPIXS";

  return (
    <StandardVideoPlayer
      title={title}
      subtitle={subtitle}
      sectionLabel={sectionLabel}
      category={resolvedCategory}
      videoSource={videoSource}
      relatedItems={content}
      onBack={() => router.back()}
    />
  );
}

