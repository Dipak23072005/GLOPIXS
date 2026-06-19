import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SECTIONS } from "@/constants/data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const APP_BACKGROUND = "#1E1D1B";
const POSTER_LOGO = require("../assets/images/poster-banner-logo.png");
const DEFAULT_VIDEO = require("../assets/videos/ai-logo-tv.mp4");

type StandardVideoPlayerProps = {
  title: string;
  subtitle: string;
  sectionLabel?: string;
  category?: string;
  videoSource?: string | number | null;
  onBack: () => void;
};

export function StandardVideoPlayer({
  title,
  subtitle,
  sectionLabel,
  category,
  videoSource,
  onBack,
}: StandardVideoPlayerProps) {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(true);
  const source =
    typeof videoSource === "string" && /^https?:\/\//i.test(videoSource)
      ? DEFAULT_VIDEO
      : (videoSource ?? DEFAULT_VIDEO);

  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = false;
    videoPlayer.volume = 1;
    videoPlayer.play();
  });

  useEffect(() => {
    player.play();
    setIsPlaying(true);
  }, [player, source]);

  const togglePlayback = () => {
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
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity style={styles.roundButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={22} color="#F5F5F5" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            GLOPIXS Player
          </Text>
          {sectionLabel ? (
            <Text style={styles.headerMeta} numberOfLines={1}>
              {sectionLabel}{category ? ` • ${category}` : ""}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.roundButton} activeOpacity={0.85}>
          <Ionicons name="ellipsis-vertical" size={20} color="#F5F5F5" />
        </TouchableOpacity>
      </View>

      <View style={styles.stage}>
        <Pressable style={styles.videoShell} onPress={togglePlayback}>
          <VideoView
            player={player}
            style={styles.video}
            nativeControls={false}
            contentFit="contain"
            fullscreenOptions={{ enable: true }}
            surfaceType="textureView"
            useExoShutter={false}
          />
          <LinearGradient
            colors={["rgba(30,29,27,0.08)", "rgba(30,29,27,0.72)"]}
            style={styles.videoShade}
          />
          {!isPlaying ? (
            <View style={styles.centerControl}>
              <Ionicons name="play" size={34} color="#0A0A0F" />
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.details}>
        <View style={styles.logoRow}>
          <Image source={POSTER_LOGO} style={styles.logoMark} resizeMode="contain" />
          <View style={styles.copyBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.meta} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          {sectionLabel ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{sectionLabel}</Text>
            </View>
          ) : null}
          {category ? (
            <View style={[styles.tag, styles.tagMuted]}>
              <Text style={styles.tagTextMuted}>{category}</Text>
            </View>
          ) : null}
          <View style={[styles.tag, styles.tagMuted]}>
            <Text style={styles.tagTextMuted}>HD</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={togglePlayback} activeOpacity={0.86}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#0A0A0F" />
            <Text style={styles.primaryText}>{isPlaying ? "Pause" : "Play"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.86}>
            <Ionicons name="play-skip-forward-outline" size={20} color="#F5F5F5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.86}>
            <Ionicons name="expand-outline" size={20} color="#F5F5F5" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function getSectionLabel(sectionId?: string) {
  return SECTIONS.find((section) => section.id === sectionId)?.label;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_BACKGROUND,
    flex: 1,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: "#F5F5F5",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    textAlign: "center",
  },
  headerMeta: {
    color: "#B8B2A8",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  stage: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  videoShell: {
    alignItems: "center",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderColor: "#3A3630",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
    width: SCREEN_WIDTH - 24,
  },
  video: {
    height: "100%",
    width: "100%",
  },
  videoShade: {
    ...StyleSheet.absoluteFillObject,
  },
  centerControl: {
    alignItems: "center",
    backgroundColor: "#D4AF37",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    opacity: 0.92,
    position: "absolute",
    width: 68,
  },
  details: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  logoMark: {
    height: 64,
    width: 64,
  },
  copyBlock: {
    flex: 1,
  },
  title: {
    color: "#F5F5F5",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginBottom: 6,
  },
  meta: {
    color: "#B8B2A8",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  tag: {
    backgroundColor: "#D4AF37",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagMuted: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tagText: {
    color: "#0A0A0F",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  tagTextMuted: {
    color: "#F5F5F5",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 14,
  },
  primaryText: {
    color: "#0A0A0F",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
});
