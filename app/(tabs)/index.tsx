import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_BASE_URL, fetchApiContent } from "@/constants/api";
import {
  ContentItem,
  ContentSection,
  FEATURED_CONTENT,
  LOCAL_MEDIA_KEY,
  SECTIONS,
  getSectionItems,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const POSTER_BANNER_LOGO = require("@/assets/images/poster-banner-logo.png");
const HERO_SLIDE_MS = 8000;
const TRAILER_PREVIEW_START_SECONDS = 6;

type UpcomingVideo = {
  id: string;
  title: string;
  videoUrl: string;
  movieUrl?: string;
  duration?: string;
  type?: string;
};

function imageSource(uri?: string, fallback = POSTER_BANNER_LOGO) {
  return uri && uri !== LOCAL_MEDIA_KEY ? { uri } : fallback;
}

function apiAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function fallbackUpcomingVideos(): UpcomingVideo[] {
  const items = [
    {
      id: "upcoming-h2o",
      title: "H2O - Just Add Water",
      videoUrl: "/assets/upcoming/H2O%20%E2%80%93%20Just%20Add%20Water%20with%20logo.mp4",
      duration: "trailer",
      type: "trailer",
    },
    {
      id: "upcoming-ladyas-vendetta",
      title: "Ladyas Vendetta",
      videoUrl: "/assets/upcoming/ladyas%20vendetta%20with%20logo.mp4",
      duration: "trailer",
      type: "trailer",
    },
    {
      id: "upcoming-morkut-drama",
      title: "Morkut Drama",
      videoUrl: "/assets/upcoming/morkut%20drama%20with%20logo.mp4",
      duration: "trailer",
      type: "trailer",
    },
  ];

  return items.map((item) => ({
    ...item,
    videoUrl: apiAssetUrl(item.videoUrl),
    movieUrl: apiAssetUrl(item.videoUrl),
  }));
}

async function fetchUpcomingVideos(): Promise<UpcomingVideo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upcoming`);
    if (!response.ok) return fallbackUpcomingVideos();
    const payload = (await response.json()) as { items?: UpcomingVideo[] };
    const items = (payload.items ?? [])
      .filter((item) => item.id && item.title && item.videoUrl)
      .map((item) => ({
        ...item,
        videoUrl: apiAssetUrl(item.videoUrl),
        movieUrl: item.movieUrl ? apiAssetUrl(item.movieUrl) : apiAssetUrl(item.videoUrl),
      }));
    return items.length > 0 ? items : fallbackUpcomingVideos();
  } catch {
    return fallbackUpcomingVideos();
  }
}

function sectionTitle(section: ContentSection) {
  return SECTIONS.find((entry) => entry.id === section)?.label ?? "GLOPIXS";
}

function openPlayer(params: { id: string; title: string; videoUrl?: string; section?: string; category?: string }) {
  router.push({ pathname: "/player", params });
}

function PosterTile({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const colors = useColors();

  return (
    <Pressable
      onPress={() =>
        openPlayer({
          id: item.id,
          title: item.title,
          videoUrl: item.videoUrl ?? "",
          section: item.section ?? "",
          category: item.category ?? item.genre,
        })
      }
      style={[styles.posterTile, compact && styles.posterTileCompact]}
    >
      <View style={[styles.posterArt, { borderColor: colors.border }]}> 
        <Image
          source={imageSource(item.thumbnail)}
          style={item.thumbnail !== LOCAL_MEDIA_KEY ? styles.posterImage : styles.posterLogo}
          resizeMode={item.thumbnail !== LOCAL_MEDIA_KEY ? "cover" : "contain"}
        />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.72)"]} style={StyleSheet.absoluteFill} />
        <View style={[styles.posterTag, { backgroundColor: colors.gold }]}> 
          <Text style={styles.posterTagText}>{item.category || sectionTitle(item.section)}</Text>
        </View>
      </View>
      <Text style={[styles.posterTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.posterMeta, { color: colors.mutedForeground }]} numberOfLines={1}>{item.duration}</Text>
    </Pressable>
  );
}

function ContentRail({ title, items }: { title: string; items: ContentItem[] }) {
  const colors = useColors();

  if (items.length === 0) return null;

  return (
    <View style={styles.rail}>
      <Text style={[styles.railTitle, { color: colors.foreground }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railContent}>
        {items.map((item) => <PosterTile key={item.id} item={item} compact />)}
      </ScrollView>
    </View>
  );
}

function HeroVideoBackground({ sourceUrl }: { sourceUrl?: string }) {
  if (!sourceUrl) {
    return <View style={[styles.heroImage, styles.heroVideoFallback]} />;
  }

  return <HeroVideoPlayer key={sourceUrl} sourceUrl={sourceUrl} />;
}

function HeroVideoPlayer({ sourceUrl }: { sourceUrl: string }) {
  const player = useVideoPlayer({ uri: sourceUrl }, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.currentTime = TRAILER_PREVIEW_START_SECONDS;
    videoPlayer.play();
  });

  useEffect(() => {
    player.currentTime = TRAILER_PREVIEW_START_SECONDS;
    player.play();
  }, [player, sourceUrl]);

  return (
    <VideoView
      player={player}
      style={styles.heroImage}
      nativeControls={false}
      contentFit="cover"
      surfaceType="textureView"
      useExoShutter={false}
    />
  );
}

function HomeHero({ items }: { items: UpcomingVideo[] }) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const timer = setInterval(() => setActiveIndex((index) => (index + 1) % items.length), HERO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <View style={[styles.heroCard, { borderColor: colors.gold }]}> 
      <HeroVideoBackground sourceUrl={activeItem?.videoUrl} />
      <LinearGradient
        colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.24)", "rgba(0,0,0,0.88)"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroCopy}>
        <Text style={[styles.heroTitle, { color: colors.foreground }]} numberOfLines={1}>GLOPIXS Upcoming</Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]} numberOfLines={1}>{activeItem?.title ?? "Trailers loading"}</Text>
      </View>
      <View style={styles.heroActions}>
        <Pressable
          onPress={() => activeItem && openPlayer({ id: activeItem.id, title: activeItem.title, videoUrl: activeItem.movieUrl ?? activeItem.videoUrl, section: "movies", category: "Upcoming" })}
          style={[styles.heroButton, { backgroundColor: colors.foreground }]}
        >
          <Ionicons name="play" size={15} color="#000" />
          <Text style={[styles.heroButtonText, styles.heroPlayText]} allowFontScaling={false}>Play</Text>
        </Pressable>
      </View>
      <View style={[styles.upcomingDots, styles.heroDots]}>
        {items.map((item, index) => (
          <View key={item.id} style={[styles.upcomingDot, styles.heroDot, { backgroundColor: index === activeIndex ? colors.gold : "rgba(255,255,255,0.44)" }]} />
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"movies" | "series">("movies");
  const [content, setContent] = useState<ContentItem[]>(FEATURED_CONTENT);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingVideo[]>(fallbackUpcomingVideos);

  useEffect(() => {
    fetchApiContent()
      .then((items) => setContent(items.length > 0 ? items : FEATURED_CONTENT))
      .catch(() => setContent(FEATURED_CONTENT));
    fetchUpcomingVideos().then(setUpcomingItems).catch(() => setUpcomingItems(fallbackUpcomingVideos()));
  }, []);

  const sectionItems = (section: ContentSection) => {
    const apiItems = content.filter((item) => item.section === section);
    const source = apiItems.length > 0 ? apiItems : getSectionItems(section);
    return source.filter((item, index, items) => items.findIndex((entry) => entry.id === item.id) === index).slice(0, 10);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 92 }]}
      >
        <View style={styles.topBar}>
          <View style={styles.segmented}>
            {(["movies", "series"] as const).map((entry) => {
              const selected = mode === entry;
              return (
                <Pressable
                  key={entry}
                  onPress={() => setMode(entry)}
                  style={[styles.segment, { borderColor: selected ? colors.gold : colors.border, backgroundColor: selected ? "rgba(227,189,54,0.14)" : "transparent" }]}
                >
                  <Text style={[styles.segmentText, { color: selected ? colors.goldLight : colors.foreground }]}>{entry === "movies" ? "Movies" : "Series"}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={[styles.menuButton, { borderColor: colors.border }]}>
            <Ionicons name="menu" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <HomeHero items={upcomingItems} />
        <ContentRail title="Blockbuster Movies" items={sectionItems("movies")} />
        <ContentRail title="Series" items={sectionItems("series")} />
        <ContentRail title="Shortzone" items={sectionItems("shortzone")} />
        <ContentRail title="Romance" items={sectionItems("romance")} />
        <ContentRail title="Kids" items={sectionItems("kids")} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 14 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  segmented: { flexDirection: "row", gap: 8 },
  segment: { borderRadius: 5, borderWidth: 1, minWidth: 54, paddingHorizontal: 10, paddingVertical: 5 },
  segmentText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textAlign: "center" },
  menuButton: { alignItems: "center", borderRadius: 5, borderWidth: 1, height: 28, justifyContent: "center", width: 28 },
  heroCard: { aspectRatio: 0.78, borderRadius: 16, borderWidth: 1, elevation: 6, marginBottom: 12, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 18, width: "100%" },
  heroImage: { ...StyleSheet.absoluteFillObject, height: "100%", width: "100%" },
  heroVideoFallback: { backgroundColor: "#090907" },
  heroCopy: { bottom: 96, left: 16, position: "absolute", right: 16, zIndex: 3 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 19 },
  heroSub: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 4 },
  heroActions: { bottom: 44, flexDirection: "row", gap: 10, left: 16, position: "absolute", right: 16, zIndex: 3 },
  heroButton: { alignItems: "center", borderRadius: 8, flexDirection: "row", gap: 5, justifyContent: "center", minHeight: 42, minWidth: 152, paddingHorizontal: 16, paddingVertical: 8 },
  heroButtonText: { color: "#000", fontFamily: "Inter_700Bold", fontSize: 12, lineHeight: 17 },
  heroPlayText: { width: 38 },
  rail: { marginTop: 12 },
  railTitle: { fontFamily: "Inter_700Bold", fontSize: 12, marginBottom: 7 },
  railContent: { gap: 8, paddingRight: 12 },
  posterTile: { width: (SCREEN_WIDTH - 52) / 3 },
  posterTileCompact: { width: 92 },
  upcomingDots: { alignItems: "center", flexDirection: "row", gap: 4, justifyContent: "center", left: 0, position: "absolute", right: 0, zIndex: 3 },
  heroDots: { bottom: 18 },
  upcomingDot: { borderRadius: 3, height: 5, width: 5 },
  heroDot: { height: 6, width: 6 },
  posterArt: { alignItems: "center", aspectRatio: 0.68, backgroundColor: "#161616", borderRadius: 5, borderWidth: 1, justifyContent: "center", overflow: "hidden" },
  posterLogo: { height: "56%", width: "56%" },
  posterImage: { height: "100%", width: "100%" },
  posterTag: { borderRadius: 3, bottom: 5, left: 5, paddingHorizontal: 5, paddingVertical: 2, position: "absolute" },
  posterTagText: { color: "#000", fontFamily: "Inter_700Bold", fontSize: 7 },
  posterTitle: { fontFamily: "Inter_600SemiBold", fontSize: 10, marginTop: 5 },
  posterMeta: { fontFamily: "Inter_400Regular", fontSize: 9, marginTop: 1 },
});























