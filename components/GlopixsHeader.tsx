import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

interface GlopixsHeaderProps {
  showSearch?: boolean;
  showNotification?: boolean;
  showLogo?: boolean;
  title?: string;
}

export function GlopixsHeader({
  showSearch = true,
  showNotification = true,
  showLogo = true,
  title,
}: GlopixsHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPad + 10,
        },
      ]}
    >
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.logoRow}>
        {title ? (
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title}</Text>
        ) : showLogo ? (
          <View style={styles.logoBackdrop}>
            <Image
              source={require("@/assets/images/brand-header-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.logoPlaceholder} />
        )}
        <View style={styles.actions}>
          {showSearch && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/search")}
            >
              <Ionicons name="search-outline" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
          {showNotification && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
              <View style={[styles.badge, { backgroundColor: colors.gold }]} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.avatar, { borderColor: colors.goldDark }]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    left: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoImage: {
    width: 154,
    height: 38,
  },
  logoBackdrop: {
    alignItems: "center",
    backgroundColor: "transparent",
    height: 42,
    justifyContent: "center",
    width: 158,
  },
  logoPlaceholder: {
    height: 40,
    width: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D4AF37",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
