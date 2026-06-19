import React, { useCallback, useEffect, useRef, useState } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { Animated, Easing, StyleSheet } from "react-native";

type IntroVideoProps = {
  onFinish: () => void;
};

const INTRO_VIDEO = require("../assets/videos/intro-4-sec-2-2-logo-revel-20260617.mp4");
const APP_BACKGROUND = "#1E1D1B";
const INTRO_VISIBLE_MS = 1000;

export function IntroVideo({ onFinish }: IntroVideoProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [firstFrameRendered, setFirstFrameRendered] = useState(false);
  const player = useVideoPlayer(INTRO_VIDEO, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
    videoPlayer.play();
  });

  const handleFirstFrameRender = useCallback(() => {
    setFirstFrameRendered(true);
    player.play();
  }, [player]);

  useEffect(() => {
    const fadeOut = Animated.sequence([
      Animated.delay(INTRO_VISIBLE_MS),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    fadeOut.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => {
      fadeOut.stop();
    };
  }, [onFinish, opacity]);

  useEffect(() => {
    player.play();
    const timer = setTimeout(onFinish, INTRO_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [onFinish, player]);

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        useExoShutter={false}
        onFirstFrameRender={handleFirstFrameRender}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: APP_BACKGROUND,
    justifyContent: "center",
    zIndex: 50,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
});
