import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ContentItem, SECTIONS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 50) / 2.45;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const POSTER_BANNER_LOGO = require("../assets/images/poster-banner-logo.png");
const HOME_BACKGROUND_VIDEO = require("../assets/videos/logo-reveal.mp4");
const LOCAL_BANNER_KEY = "glopixs-local-banner";
const APP_BACKGROUND = "#1E1D1B";

function isVideoUri(value?: string) {
  return Boolean(value && /\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(value));
}

function isLocalPoster(uri?: string) {
  return !uri || uri === LOCAL_BANNER_KEY || !/^https?:\/\//i.test(uri);
}

function isRemoteUri(uri?: string) {
  return Boolean(uri && /^https?:\/\//i.test(uri));
}

function shouldPlayBannerVideo(uri: string | undefined, fillBanner: boolean, hasError: boolean) {
  if (fillBanner && (!uri || uri === LOCAL_BANNER_KEY)) return true;
  if (isVideoUri(uri) && isRemoteUri(uri)) return true;
  if (hasError && fillBanner) return true;
  return isVideoUri(uri) && !isRemoteUri(uri) && !hasError;
}

function PosterImageMedia({
  uri,
  style,
  borderRadius,
  fillBanner,
  onError,
}: {
  uri?: string;
  style: object;
  borderRadius?: number;
  fillBanner: boolean;
  onError: () => void;
}) {
  const useLogoPoster = isLocalPoster(uri);
  const source = useLogoPoster ? POSTER_BANNER_LOGO : { uri: uri! };

  return (
    <View style={[style, styles.mediaWrap, borderRadius ? { borderRadius } : null]}>
      <View style={[styles.posterFrame, fillBanner && styles.posterFrameFill]}>
        <Image
          source={source}
          style={[styles.posterLogo, fillBanner && styles.posterLogoFill]}
          resizeMode={fillBanner ? "cover" : "contain"}
          onError={onError}
        />
      </View>
    </View>
  );
}

function PosterVideoMedia({
  uri,
  style,
  borderRadius,
  fillBanner,
}: {
  uri?: string;
  style: object;
  borderRadius?: number;
  fillBanner: boolean;
}) {
  const videoSource = uri && uri !== LOCAL_BANNER_KEY ? uri : undefined;
  if (!videoSource) {
    return (
      <PosterImageMedia
        uri={LOCAL_BANNER_KEY}
        style={style}
        borderRadius={borderRadius}
        fillBanner={fillBanner}
        onError={() => undefined}
      />
    );
  }

  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
    videoPlayer.play();
  });

  return (
    <View style={[style, styles.mediaWrap, borderRadius ? { borderRadius } : null]}>
      <VideoView
        player={player}
        style={fillBanner ? styles.videoFillScaled : styles.fill}
        nativeControls={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        surfaceType="textureView"
        useExoShutter={false}
      />
    </View>
  );
}

function PosterMedia({
  uri,
  style,
  borderRadius,
  resizeMode = "contain",
}: {
  uri?: string;
  style: object;
  borderRadius?: number;
  resizeMode?: "cover" | "contain";
}) {
  const [hasError, setHasError] = useState(false);
  const fillBanner = resizeMode === "cover";
  const showVideo = shouldPlayBannerVideo(uri, fillBanner, hasError);

  if (showVideo) {
    return (
      <PosterVideoMedia
        uri={uri}
        style={style}
        borderRadius={borderRadius}
        fillBanner={fillBanner}
      />
    );
  }

  return (
    <PosterImageMedia
      uri={uri}
      style={style}
      borderRadius={borderRadius}
      fillBanner={fillBanner}
      onError={() => setHasError(true)}
    />
  );
}

function HomeHeroVideo() {
  const [posterVisible, setPosterVisible] = useState(true);
  const player = useVideoPlayer(HOME_BACKGROUND_VIDEO, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
  });

  React.useEffect(() => {
    const playTimer = setTimeout(() => {
      player.play();
      setPosterVisible(false);
    }, 5200);
    return () => clearTimeout(playTimer);
  }, [player]);

  return (
    <View style={styles.heroMedia}>
      <VideoView
        player={player}
        style={styles.heroVideo}
        nativeControls={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        surfaceType="textureView"
        useExoShutter={false}
      />
      {posterVisible ? (
        <Image source={POSTER_BANNER_LOGO} style={styles.heroPoster} resizeMode="cover" />
      ) : null}
    </View>
  );
}

interface ContentCardProps {
  item: ContentItem;
  size?: "small" | "medium" | "large";
}

function sectionLabel(section?: ContentItem["section"]) {
  return SECTIONS.find((entry) => entry.id === section)?.label ?? "GLOPIXS";
}

export function ContentCard({ item, size = "medium" }: ContentCardProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const cardWidth =
    size === "large" ? SCREEN_WIDTH * 0.65 : size === "small" ? SCREEN_WIDTH * 0.35 : CARD_WIDTH;
  const cardHeight = cardWidth * 1.48;

  const animatePress = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      damping: 16,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const posterUri = item.thumbnail || (!isVideoUri(item.banner) ? item.banner : undefined) || LOCAL_BANNER_KEY;

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={() => animatePress(0.97)}
      onPressOut={() => animatePress(1)}
      activeOpacity={0.9}
      style={[styles.card, { width: cardWidth, transform: [{ scale }] }]}
    >
      <View
        style={[
          styles.imageContainer,
          {
            height: cardHeight,
            borderColor: colors.border,
            borderRadius: colors.radius,
            backgroundColor: colors.card,
          },
        ]}
      >
        <PosterMedia uri={posterUri} style={styles.image} borderRadius={colors.radius} />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.82)"]}
          style={[styles.overlay, { borderRadius: colors.radius }]}
        />
        <View style={[styles.sectionBadge, { backgroundColor: colors.gold }]}>
          <Text style={styles.sectionBadgeText}>{sectionLabel(item.section)}</Text>
        </View>
        {item.isPremium ? (
          <View style={[styles.premiumBadge, { backgroundColor: colors.gold }]}>
            <Ionicons name="star" size={8} color="#000" />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        ) : null}
        <View style={[styles.playOverlay, { backgroundColor: colors.overlay }]}>
          <Ionicons name="play" size={14} color={colors.gold} />
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={colors.gold} />
          <Text style={[styles.ratingText, { color: colors.foreground }]}>{item.rating}</Text>
        </View>
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.genre, { color: colors.mutedForeground }]} numberOfLines={1}>
        {item.category || item.genre}
      </Text>
    </AnimatedTouchable>
  );
}

export function FeaturedCard({ item }: { item: ContentItem }) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const isHero = item.id.startsWith("hero-") || item.title.toLowerCase().includes("spotlight");

  const animatePress = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      damping: 18,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const openPlayer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  return (
    <AnimatedTouchable
      onPress={openPlayer}
      onPressIn={() => animatePress(0.985)}
      onPressOut={() => animatePress(1)}
      activeOpacity={0.9}
      style={[styles.featuredCard, { transform: [{ scale }] }]}
    >
      {isHero ? (
        <HomeHeroVideo />
      ) : (
        <PosterMedia
          uri={item.thumbnail || (!isVideoUri(item.banner) ? item.banner : undefined) || LOCAL_BANNER_KEY}
          style={styles.featuredImage}
          resizeMode="cover"
        />
      )}
      <LinearGradient
        colors={["rgba(9, 9, 5, 0.04)", "rgba(8,9,10,0.46)", "rgba(8,10,12,0.94)"]}
        locations={[0, 0.52, 1]}
        style={styles.featuredGradient}
      />
      <View style={styles.featuredContent}>
        {!isHero ? (
          <View style={[styles.sectionBadgeLg, { backgroundColor: colors.gold }]}>
            <Text style={styles.sectionBadgeTextLg}>{sectionLabel(item.section)}</Text>
          </View>
        ) : null}
        <View style={styles.featuredActions}>
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: colors.gold }]}
            onPress={openPlayer}
            activeOpacity={0.86}
          >
            <Ionicons name="play" size={16} color="#000" />
            <Text style={styles.playText}>Play Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.moreBtn, { backgroundColor: colors.secondary }]}
            activeOpacity={0.86}
          >
            <Ionicons name="add" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: 10,
  },
  imageContainer: {
    borderWidth: 1,
    elevation: 3,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  mediaWrap: {
    backgroundColor: APP_BACKGROUND,
    overflow: "hidden",
  },
  posterFrame: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: APP_BACKGROUND,
    justifyContent: "center",
    padding: 18,
  },
  posterLogo: {
    height: "72%",
    width: "72%",
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
  posterFrameFill: {
    padding: 0,
  },
  posterLogoFill: {
    height: "100%",
    width: "100%",
  },
  videoFillScaled: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    transform: [{ scale: 1.22 }],
    width: "100%",
  },
  overlay: {
    bottom: 0,
    height: "48%",
    left: 0,
    position: "absolute",
    right: 0,
  },
  sectionBadge: {
    borderRadius: 5,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: "absolute",
    top: 8,
  },
  sectionBadgeText: {
    color: "#000",
    fontFamily: "Inter_700Bold",
    fontSize: 7,
    letterSpacing: 0.4,
  },
  premiumBadge: {
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row",
    gap: 2,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: "absolute",
    top: 28,
  },
  premiumText: {
    color: "#000",
    fontFamily: "Inter_700Bold",
    fontSize: 7,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
    borderRadius: 8,
    bottom: 8,
    flexDirection: "row",
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: "absolute",
    right: 8,
  },
  ratingText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 7,
  },
  genre: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  playOverlay: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    left: 8,
    position: "absolute",
    top: 56,
    width: 32,
  },
  featuredCard: {
    backgroundColor: APP_BACKGROUND,
    height: SCREEN_WIDTH * 0.78,
    overflow: "hidden",
    position: "relative",
    width: SCREEN_WIDTH,
  },
  featuredImage: {
    height: "100%",
    width: "100%",
  },
  heroMedia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: APP_BACKGROUND,
  },
  heroPoster: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    opacity: 0.72,
    width: "100%",
  },
  heroVideo: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    bottom: 18,
    left: 20,
    position: "absolute",
    right: 20,
  },
  sectionBadgeLg: {
    alignSelf: "flex-start",
    borderRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionBadgeTextLg: {
    color: "#000",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.6,
  },
  featuredTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 0,
    marginBottom: 6,
  },
  featuredMeta: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  featuredActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  playBtn: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  playText: {
    color: "#000",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  moreBtn: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
});

