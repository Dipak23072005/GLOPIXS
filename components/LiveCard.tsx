import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { LiveChannel } from "@/constants/data";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LiveCardProps {
  channel: LiveChannel;
}

export function LiveCard({ channel }: LiveCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.channelLogo, { backgroundColor: colors.secondary }]}>
        <Ionicons name="tv-outline" size={24} color={colors.gold} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.channelName, { color: colors.foreground }]}>{channel.name}</Text>
          {channel.isLive && (
            <View style={[styles.liveBadge, { backgroundColor: "#EF4444" }]}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.showName, { color: colors.mutedForeground }]} numberOfLines={1}>
          {channel.currentShow}
        </Text>
        <View style={styles.viewers}>
          <Ionicons name="eye-outline" size={11} color={colors.mutedForeground} />
          <Text style={[styles.viewerText, { color: colors.mutedForeground }]}>{channel.viewers}</Text>
        </View>
      </View>
      <Ionicons name="play-circle" size={32} color={colors.gold} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  channelLogo: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  channelName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  showName: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  viewers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewerText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
