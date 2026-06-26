import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentItem, FEATURED_CONTENT, LOCAL_MEDIA_KEY, SECTIONS } from "@/constants/data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const APP_BACKGROUND = "#1E1D1B";
const POSTER_LOGO = require("../assets/images/poster-banner-logo.png");

type StandardVideoPlayerProps = {
  title: string;
  subtitle: string;
  sectionLabel?: string;
  category?: string;
  videoSource?: string | number | null;
  relatedItems?: ContentItem[];
  onBack: () => void;
};

export function StandardVideoPlayer({
  title,
  subtitle,
  sectionLabel,
  category,
  videoSource,
  relatedItems: relatedItemsProp,
  onBack,
}: StandardVideoPlayerProps) {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(true);
  const source = useMemo(() => {
    if (typeof videoSource === "string" && /^https?:\/\//i.test(videoSource)) {
      return { uri: videoSource };
    }
    return typeof videoSource === "number" ? videoSource : null;
  }, [videoSource]);
  const hasPlayableSource = Boolean(source);

  const relatedItems = useMemo(() => {
    const sourceItems = relatedItemsProp && relatedItemsProp.length > 0 ? relatedItemsProp : FEATURED_CONTENT;
    const matching = category ? sourceItems.filter((item) => item.category === category) : [];
    return (matching.length >= 6 ? matching : sourceItems).slice(0, 6);
  }, [category, relatedItemsProp]);

  const player = useVideoPlayer(source ?? { uri: "about:blank" }, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = false;
    videoPlayer.volume = 1;
    if (source) videoPlayer.play();
  });


  const togglePlayback = () => {
    if (!hasPlayableSource) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying((value) => !value);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
      >
        <View style={[styles.stage, { paddingTop: topPad + 8 }]}>
          <Pressable style={styles.videoShell} onPress={togglePlayback}>
                        {hasPlayableSource ? (
              <VideoView
                player={player}
                style={styles.video}
                nativeControls
                contentFit="contain"
                fullscreenOptions={{ enable: true }}
                surfaceType="textureView"
                useExoShutter={false}
              />
            ) : (
              <View style={[styles.video, styles.noVideoState]}>
                <Ionicons name="play-circle-outline" size={44} color="#E3BD36" />
                <Text style={styles.noVideoText}>Trailer unavailable</Text>
              </View>
            )}

            <LinearGradient
              colors={["rgba(0,0,0,0.04)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.96)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.playerTopControls}>
              <TouchableOpacity style={styles.playerIcon} onPress={onBack} activeOpacity={0.86}>
                <Ionicons name="close-circle-outline" size={19} color="#F3F3F3" />
              </TouchableOpacity>
              <View style={styles.playerRightControls}>
                <Ionicons name="tv-outline" size={16} color="#F3F3F3" />
                <Ionicons name="chatbubble" size={15} color="#F3F3F3" />
                <Ionicons name="settings-sharp" size={15} color="#F3F3F3" />
              </View>
            </View>

            {!isPlaying ? (
              <View style={styles.centerControl}>
                <Ionicons name="play" size={34} color="#0A0A0F" />
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta} numberOfLines={1}>
              2013
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>U/A 16+</Text>
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {sectionLabel ?? "Movies"}
            </Text>
            {category ? (
              <Text style={styles.meta} numberOfLines={1}>
                {category}
              </Text>
            ) : null}
          </View>
          <Text style={styles.description} numberOfLines={3}>
            {subtitle}
          </Text>

          <Text style={styles.sectionHeading}>More like this</Text>
          <View style={styles.relatedGrid}>
            {relatedItems.map((item) => (
              <RelatedPoster key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function RelatedPoster({ item }: { item: ContentItem }) {
  const hasPoster = item.thumbnail && item.thumbnail !== LOCAL_MEDIA_KEY;

  return (
    <Pressable
      style={styles.relatedCard}
      onPress={() =>
        router.push({
          pathname: "/player",
          params: {
            id: item.id,
            title: item.title,
            videoUrl: item.videoUrl ?? "",
            section: item.section ?? "",
            category: item.category ?? item.genre,
          },
        })
      }
    >
      <View style={styles.relatedArt}>
        <Image
          source={hasPoster ? { uri: item.thumbnail } : POSTER_LOGO}
          style={hasPoster ? styles.relatedImage : styles.relatedLogo}
          resizeMode={hasPoster ? "cover" : "contain"}
        />
        <View style={styles.relatedPlay}>
          <Ionicons name="play" size={14} color="#10100E" />
        </View>
      </View>
      <Text style={styles.relatedTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </Pressable>
  );
}

export function getSectionLabel(sectionId?: string) {
  return SECTIONS.find((section) => section.id === sectionId)?.label;
}

const posterWidth = (SCREEN_WIDTH - 64) / 3;

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_BACKGROUND,
    flex: 1,
  },
  scrollContent: {
    backgroundColor: APP_BACKGROUND,
  },
  stage: {
    backgroundColor: "#000",
  },
  videoShell: {
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    overflow: "hidden",
    width: SCREEN_WIDTH,
  },
  video: {
    height: "100%",
    width: "100%",
  },
  noVideoState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noVideoText: {
    color: "#F5F5F5",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  playerTopControls: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 14,
    position: "absolute",
    right: 14,
    top: 12,
  },
  playerIcon: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  playerRightControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  centerControl: {
    alignItems: "center",
    backgroundColor: "#E3BD36",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    left: "50%",
    marginLeft: -34,
    marginTop: -34,
    opacity: 0.94,
    position: "absolute",
    top: "50%",
    width: 68,
  },
  details: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  title: {
    color: "#F5F5F5",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  meta: {
    color: "#DFD8C8",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  ratingBadge: {
    backgroundColor: "#E3BD36",
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    color: "#10100E",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
  },
  description: {
    color: "#BEB7AA",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 9,
  },
  sectionHeading: {
    color: "#F5F5F5",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    marginBottom: 10,
    marginTop: 20,
  },
  relatedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  relatedCard: {
    width: posterWidth,
  },
  relatedArt: {
    alignItems: "center",
    aspectRatio: 0.72,
    backgroundColor: "#11110F",
    borderRadius: 8,
    justifyContent: "center",
    overflow: "hidden",
  },
  relatedLogo: {
    height: "34%",
    width: "58%",
  },
  relatedImage: {
    height: "100%",
    width: "100%",
  },
  relatedPlay: { alignItems: "center", backgroundColor: "#E3BD36", borderRadius: 15, height: 30, justifyContent: "center", left: "50%", marginLeft: -15, marginTop: -15, position: "absolute", top: "50%", width: 30 },
  relatedTitle: {
    color: "#F5F5F5",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    marginTop: 6,
  },
});






