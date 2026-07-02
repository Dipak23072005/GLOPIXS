import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LiveCard } from "@/components/LiveCard";
import { LIVE_CHANNELS } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.gold }]}>Live TV</Text>
        <View style={styles.liveIndicator}>
          <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
          <Text style={[styles.liveLabel, { color: "#EF4444" }]}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {LIVE_CHANNELS.filter((c) => c.isLive).length} channels live now
        </Text>

        <View style={{ marginTop: 8 }}>
          {LIVE_CHANNELS.map((channel) => (
            <LiveCard key={channel.id} channel={channel} />
          ))}
        </View>

        {/* Entertainment Guide Banner */}
        <View style={[styles.guideBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.guideIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="calendar-outline" size={24} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.guideTitle, { color: colors.foreground }]}>TV Guide</Text>
            <Text style={[styles.guideSubtitle, { color: colors.mutedForeground }]}>Check upcoming shows</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </View>

        <View style={[styles.guideBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.guideIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="bookmark-outline" size={24} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.guideTitle, { color: colors.foreground }]}>My Recordings</Text>
            <Text style={[styles.guideSubtitle, { color: colors.mutedForeground }]}>Watch later at your pace</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveLabel: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  scroll: { paddingBottom: 100 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  guideBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  guideTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  guideSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
