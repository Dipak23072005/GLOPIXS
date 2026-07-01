import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLocalSearchParams, router } from "expo-router";
import { FEATURED_CONTENT } from "@/constants/data";
import { fetchApiContent } from "@/constants/api";
import { ContentCard } from "@/components/ContentCard";
import { VideoView, useVideoPlayer } from "expo-video";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FALLBACK_LOGO = require("../assets/images/poster-banner-logo.png");
const SPOTLIGHT_BACKGROUND_VIDEO = require("../assets/videos/logo-reveal.mp4");
const LOCAL_BANNER_KEY = "glopixs-local-banner";
const API_BACKGROUND = "#1E1D1B";

function isVideoUri(value?: string) {
  return Boolean(value && /\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(value));
}

function LogoVideoFallback() {
  const player = useVideoPlayer(SPOTLIGHT_BACKGROUND_VIDEO, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
    videoPlayer.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.bannerVideo}
      nativeControls={false}
      contentFit="cover"
      fullscreenOptions={{ enable: false }}
      surfaceType="textureView"
      useExoShutter={false}
    />
  );
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [liked, setLiked] = useState(false);
  const [content, setContent] = useState(FEATURED_CONTENT);

  useEffect(() => {
    fetchApiContent()
      .then((items) => setContent(items.length > 0 ? items : FEATURED_CONTENT))
      .catch(() => setContent(FEATURED_CONTENT));
  }, []);

  const item = content.find((c) => c.id === id) ?? FEATURED_CONTENT.find((c) => c.id === id) ?? content[0] ?? FEATURED_CONTENT[0];
  const [bannerError, setBannerError] = useState(false);
  const hasRemoteVideoBanner = isVideoUri(item.banner) && /^https?:\/\//i.test(item.banner);
  const hasVideoBanner =
    (item.banner === LOCAL_BANNER_KEY || (isVideoUri(item.banner) && !hasRemoteVideoBanner)) &&
    !bannerError;
  const hasImageBanner = Boolean(item.banner && item.banner !== LOCAL_BANNER_KEY && !hasVideoBanner && !bannerError);
  const bannerSource = hasImageBanner ? { uri: item.banner } : FALLBACK_LOGO;
  const similar = content.filter((c) => c.id !== item.id && (c.genre.split("/")[0].trim() === item.genre.split("/")[0].trim())).slice(0, 4);

  useEffect(() => {
    setBannerError(false);
  }, [item.id]);
  const toggleWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInWatchlist((v) => !v);
  };

  const toggleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((v) => !v);
  };

  const playVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: "/player",
      params: {
        id: item.id,
        videoUrl: item.videoUrl ?? "",
        section: item.section ?? "",
        category: item.category ?? item.genre,
      },
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: API_BACKGROUND }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[
        styles.scroll,
        Platform.OS === "web" && { paddingBottom: 34 },
      ]}>
        {/* Banner */}
        <View style={styles.bannerWrapper}>
          {hasVideoBanner ? (
            <LogoVideoFallback />
          ) : hasImageBanner ? (
            <Image
              source={bannerSource}
              style={styles.banner}
              resizeMode="cover"
              onError={() => setBannerError(true)}
            />
          ) : (
            <LogoVideoFallback />
          )}
          <View style={styles.bannerOverlay} />
          <TouchableOpacity
            style={styles.bannerTapTarget}
            activeOpacity={0.92}
            onPress={playVideo}
          />
          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: topPad + 12, backgroundColor: "rgba(0,0,0,0.6)" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

        </View>

        {/* Content Info */}
        <View style={styles.content}>
          {/* Premium badge */}
          {item.isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.gold }]}>
              <Ionicons name="star" size={10} color="#000" />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}

          <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={colors.gold} />
              <Text style={[styles.metaText, { color: colors.foreground }]}>{item.rating}/10</Text>
            </View>
            <View style={[styles.dot2, { backgroundColor: colors.mutedForeground }]} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.year}</Text>
            <View style={[styles.dot2, { backgroundColor: colors.mutedForeground }]} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.duration}</Text>
            <View style={[styles.dot2, { backgroundColor: colors.mutedForeground }]} />
            <View style={[styles.langBadge, { borderColor: colors.border }]}>
              <Text style={[styles.langText, { color: colors.mutedForeground }]}>{item.language}</Text>
            </View>
          </View>

          <Text style={[styles.genre, { color: colors.gold }]}>{item.genre}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: colors.gold }]}
              onPress={playVideo}
            >
              <Ionicons name="play" size={18} color="#000" />
              <Text style={styles.playBtnText}>
                {item.type === "series" ? "Watch S1 E1" : "Watch Now"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
              onPress={toggleWatchlist}
            >
              <Ionicons
                name={inWatchlist ? "bookmark" : "bookmark-outline"}
                size={20}
                color={inWatchlist ? colors.gold : colors.foreground}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
              onPress={toggleLike}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#EF4444" : colors.foreground}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
            >
              <Ionicons name="share-outline" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={[styles.descLabel, { color: colors.foreground }]}>About</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>

          {/* Cast */}
          <Text style={[styles.descLabel, { color: colors.foreground }]}>Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castRow}>
            {item.cast.map((name, i) => (
              <View key={i} style={styles.castItem}>
                <View style={[styles.castAvatar, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="person" size={20} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.castName, { color: colors.foreground }]} numberOfLines={2}>{name}</Text>
              </View>
            ))}
          </ScrollView>

          {/* More Episodes if series */}
          {item.type === "series" && (
            <>
              <Text style={[styles.descLabel, { color: colors.foreground }]}>Episodes</Text>
              {Array.from({ length: Math.min(item.episodes ?? 3, 5) }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.episodeRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={[styles.epNum, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.epNumText, { color: colors.mutedForeground }]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.epTitle, { color: colors.foreground }]}>Episode {i + 1}</Text>
                    <Text style={[styles.epMeta, { color: colors.mutedForeground }]}>42 min</Text>
                  </View>
                  <Ionicons name="play-circle-outline" size={28} color={colors.gold} />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Similar Content */}
          {similar.length > 0 && (
            <>
              <Text style={[styles.descLabel, { color: colors.foreground }]}>More Like This</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
                {similar.map((s) => (
                  <ContentCard key={s.id} item={s} size="small" />
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },
  bannerWrapper: {
    backgroundColor: API_BACKGROUND,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    position: "relative",
  },
  banner: { width: "100%", height: "100%" },
  bannerVideo: { width: "100%", height: "100%", transform: [{ scale: 1.22 }] },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(30,29,27,0.92)",
  },
  bannerTapTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    marginBottom: 10,
  },
  premiumText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#000", letterSpacing: 1 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  dot2: { width: 3, height: 3, borderRadius: 1.5 },
  langBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  langText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  genre: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 20, letterSpacing: 0.5 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 24 },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  playBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#000" },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  descLabel: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 4 },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 24 },
  castRow: { gap: 12, paddingRight: 8, marginBottom: 24 },
  castItem: { alignItems: "center", width: 64 },
  castAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  castName: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  epNum: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  epNumText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  epTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  epMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

