import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

import { getSectionLabel, StandardVideoPlayer } from "@/components/StandardVideoPlayer";
import { fetchApiContent } from "@/constants/api";
import { ContentItem, FEATURED_CONTENT } from "@/constants/data";

const DEFAULT_VIDEO = require("../assets/videos/ai-logo-tv.mp4");

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
  const { id, videoUrl, section, category } = useLocalSearchParams<{
    id: string;
    videoUrl?: string;
    section?: string;
    category?: string;
  }>();
  const [content, setContent] = useState(FEATURED_CONTENT);

  useEffect(() => {
    fetchApiContent()
      .then((items) => setContent(items.length > 0 ? items : FEATURED_CONTENT))
      .catch(() => setContent(FEATURED_CONTENT));
  }, []);

  const item = findContent(content, id);
  const routeVideoUrl = Array.isArray(videoUrl) ? videoUrl[0] : videoUrl;
  const routeSection = Array.isArray(section) ? section[0] : section;
  const routeCategory = Array.isArray(category) ? category[0] : category;
  const resolvedSection = routeSection || item?.section;
  const resolvedCategory = routeCategory || item?.category || item?.genre;
  const sectionLabel = getSectionLabel(resolvedSection);
  const candidateUrl = routeVideoUrl?.trim() || item?.videoUrl;
  const videoSource =
    candidateUrl && !/^https?:\/\//i.test(candidateUrl) ? candidateUrl : DEFAULT_VIDEO;
  const title = item?.title ?? "GLOPIXS Video";
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
      onBack={() => router.back()}
    />
  );
}
