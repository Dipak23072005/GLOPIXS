import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  gold?: boolean;
}

function SettingRow({ icon, label, value, toggle, toggleValue, onToggle, gold }: SettingRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon as any} size={18} color={gold ? colors.gold : colors.foreground} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.gold }}
            thumbColor={toggleValue ? "#fff" : "#ccc"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [downloadWifi, setDownloadWifi] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { paddingTop: topPad + 24, backgroundColor: colors.surface }]}>
          <View style={[styles.avatarLg, { backgroundColor: colors.gold }]}>
            <Ionicons name="person" size={40} color="#000" />
          </View>
          <Text style={[styles.userName, { color: colors.foreground }]}>Guest User</Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>guest@glopixs.com</Text>
          <TouchableOpacity
            style={[styles.premiumBtn, { borderColor: colors.gold }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Ionicons name="star" size={14} color={colors.gold} />
            <Text style={[styles.premiumBtnText, { color: colors.gold }]}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Info */}
        <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.subLeft}>
            <Ionicons name="shield-checkmark" size={22} color={colors.gold} />
            <View>
              <Text style={[styles.subTitle, { color: colors.foreground }]}>Free Plan</Text>
              <Text style={[styles.subDetail, { color: colors.mutedForeground }]}>Limited content access</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.upgradeBtn, { backgroundColor: colors.gold }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="person-outline" label="Edit Profile" />
          <SettingRow icon="lock-closed-outline" label="Change Password" />
          <SettingRow icon="card-outline" label="Subscriptions & Billing" />
          <SettingRow icon="download-outline" label="My Downloads" />
          <SettingRow icon="heart-outline" label="Watchlist" value="12 titles" />
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PREFERENCES</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="notifications-outline"
            label="Push Notifications"
            toggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <SettingRow
            icon="play-circle-outline"
            label="Autoplay Next Episode"
            toggle
            toggleValue={autoplay}
            onToggle={setAutoplay}
          />
          <SettingRow
            icon="wifi-outline"
            label="Download on Wi-Fi Only"
            toggle
            toggleValue={downloadWifi}
            onToggle={setDownloadWifi}
          />
          <SettingRow icon="language-outline" label="Content Language" value="Hindi" />
          <SettingRow icon="tv-outline" label="Video Quality" value="Auto" />
        </View>

        {/* Support */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SUPPORT</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="help-circle-outline" label="Help Center" />
          <SettingRow icon="chatbubble-outline" label="Contact Support" />
          <SettingRow icon="star-outline" label="Rate GLOPIXS" gold />
          <SettingRow icon="share-outline" label="Share App" />
          <SettingRow icon="information-circle-outline" label="About" value="v1.0.0" />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: "#EF4444" }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  profileCard: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  avatarLg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  premiumBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  premiumBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  subLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  subTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  subDetail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  upgradeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#000",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  settingsCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#EF4444",
  },
});
