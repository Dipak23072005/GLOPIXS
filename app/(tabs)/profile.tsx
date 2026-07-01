import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const STORAGE_KEY = "glopixs-profile-v1";
const API_URL = "https://glopixs-api.onrender.com";

type ProfileData = {
  name: string;
  email: string;
  notifications: boolean;
  autoplay: boolean;
  wifiOnly: boolean;
  language: string;
  quality: string;
};

const DEFAULT_PROFILE: ProfileData = {
  name: "Guest User",
  email: "guest@glopixs.com",
  notifications: true,
  autoplay: true,
  wifiOnly: true,
  language: "Hindi",
  quality: "Auto",
};

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  toggleValue?: boolean;
  danger?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
};

function SettingRow({ icon, label, value, toggleValue, danger, onPress, onToggle }: RowProps) {
  const colors = useColors();
  const isToggle = typeof toggleValue === "boolean";

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      disabled={isToggle}
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon} size={18} color={danger ? "#EF4444" : colors.gold} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? "#EF4444" : colors.foreground }]}>{label}</Text>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.gold }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <View style={styles.rowEnd}>
          {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </View>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editVisible, setEditVisible] = useState(false);
  const [picker, setPicker] = useState<"language" | "quality" | null>(null);
  const [draftName, setDraftName] = useState(DEFAULT_PROFILE.name);
  const [draftEmail, setDraftEmail] = useState(DEFAULT_PROFILE.email);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => stored && setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) }))
      .catch(() => undefined);
  }, []);

  const updateProfile = (next: Partial<ProfileData>) => {
    setProfile((current) => {
      const updated = { ...current, ...next };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => undefined);
      return updated;
    });
  };

  const openEdit = () => {
    setDraftName(profile.name);
    setDraftEmail(profile.email);
    setEditVisible(true);
  };

  const saveProfile = () => {
    const name = draftName.trim();
    const email = draftEmail.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Check details", "Enter a valid name and email address.");
      return;
    }
    updateProfile({ name, email });
    setEditVisible(false);
  };

  const showComingSoon = (title: string) => Alert.alert(title, "This feature will be available in the next GLOPIXS update.");
  const initials = profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "G";
  const options = picker === "language" ? ["Hindi", "Marathi", "Tamil", "Telugu", "Bengali"] : ["Auto", "Data Saver", "HD", "Full HD"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 18, paddingBottom: insets.bottom + 96 }]}> 
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Profile</Text>
          <Pressable onPress={openEdit} style={[styles.editButton, { borderColor: colors.border }]}>
            <Ionicons name="pencil" size={17} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: colors.gold }]}><Text style={styles.initials}>{initials}</Text></View>
          <View style={styles.identityCopy}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{profile.name}</Text>
            <Text style={[styles.email, { color: colors.mutedForeground }]} numberOfLines={1}>{profile.email}</Text>
            <View style={[styles.planBadge, { borderColor: colors.gold }]}><Ionicons name="sparkles" size={12} color={colors.gold} /><Text style={[styles.planBadgeText, { color: colors.gold }]}>Free member</Text></View>
          </View>
        </View>

        <View style={[styles.planBand, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View><Text style={[styles.planTitle, { color: colors.foreground }]}>Unlock GLOPIXS Premium</Text><Text style={[styles.planSub, { color: colors.mutedForeground }]}>Ad-free streaming and Full HD</Text></View>
          <Pressable onPress={() => showComingSoon("Premium plans")} style={[styles.goldButton, { backgroundColor: colors.gold }]}><Text style={styles.goldButtonText}>View plans</Text></Pressable>
        </View>

        <View style={styles.stats}>
          {[{ icon: "heart", value: "12", label: "My List" }, { icon: "download", value: "0", label: "Downloads" }, { icon: "time", value: "8h", label: "Watched" }].map((item) => (
            <Pressable key={item.label} onPress={() => showComingSoon(item.label)} style={[styles.stat, { borderColor: colors.border }]}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={19} color={colors.gold} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="person-outline" label="Edit profile" onPress={openEdit} />
          <SettingRow icon="card-outline" label="Subscription and billing" value="Free" onPress={() => showComingSoon("Subscription and billing")} />
          <SettingRow icon="heart-outline" label="My List" value="12 titles" onPress={() => showComingSoon("My List")} />
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>PLAYBACK</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="play-circle-outline" label="Autoplay next video" toggleValue={profile.autoplay} onToggle={(autoplay) => updateProfile({ autoplay })} />
          <SettingRow icon="wifi-outline" label="Download on Wi-Fi only" toggleValue={profile.wifiOnly} onToggle={(wifiOnly) => updateProfile({ wifiOnly })} />
          <SettingRow icon="language-outline" label="Content language" value={profile.language} onPress={() => setPicker("language")} />
          <SettingRow icon="videocam-outline" label="Video quality" value={profile.quality} onPress={() => setPicker("quality")} />
          <SettingRow icon="notifications-outline" label="Notifications" toggleValue={profile.notifications} onToggle={(notifications) => updateProfile({ notifications })} />
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>SUPPORT</Text>
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="help-circle-outline" label="Help center" onPress={() => Linking.openURL(`${API_URL}/health`)} />
          <SettingRow icon="mail-outline" label="Contact support" onPress={() => Linking.openURL("mailto:support@glopixs.com?subject=GLOPIXS%20Support")} />
          <SettingRow icon="share-social-outline" label="Share GLOPIXS" onPress={() => Share.share({ message: `Watch GLOPIXS: ${API_URL}` })} />
          <SettingRow icon="information-circle-outline" label="About GLOPIXS" value="v1.0.0" onPress={() => Alert.alert("GLOPIXS", "Entertainment beyond boundaries.\nVersion 1.0.0")} />
        </View>

        <Pressable onPress={() => Alert.alert("Sign out?", "Your saved preferences will remain on this device.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: () => updateProfile({ name: "Guest User", email: "guest@glopixs.com" }) }])} style={[styles.signOut, { borderColor: "#EF4444" }]}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" /><Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.overlay}><View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit profile</Text>
          <TextInput value={draftName} onChangeText={setDraftName} placeholder="Name" placeholderTextColor={colors.mutedForeground} style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} />
          <TextInput value={draftEmail} onChangeText={setDraftEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.mutedForeground} style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} />
          <View style={styles.modalActions}><Pressable onPress={() => setEditVisible(false)} style={styles.textButton}><Text style={[styles.textButtonLabel, { color: colors.mutedForeground }]}>Cancel</Text></Pressable><Pressable onPress={saveProfile} style={[styles.saveButton, { backgroundColor: colors.gold }]}><Text style={styles.goldButtonText}>Save</Text></Pressable></View>
        </View></View>
      </Modal>

      <Modal visible={picker !== null} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <Pressable style={styles.overlay} onPress={() => setPicker(null)}><View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>{picker === "language" ? "Content language" : "Video quality"}</Text>
          {options.map((option) => { const selected = option === (picker === "language" ? profile.language : profile.quality); return <Pressable key={option} onPress={() => { updateProfile(picker === "language" ? { language: option } : { quality: option }); setPicker(null); }} style={[styles.option, { borderBottomColor: colors.border }]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>{selected ? <Ionicons name="checkmark-circle" size={20} color={colors.gold} /> : null}</Pressable>; })}
        </View></Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { paddingHorizontal: 16 }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 22 }, heading: { fontFamily: "Inter_700Bold", fontSize: 24 }, editButton: { alignItems: "center", borderRadius: 6, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  identity: { alignItems: "center", flexDirection: "row", marginBottom: 20 }, avatar: { alignItems: "center", borderRadius: 8, height: 72, justifyContent: "center", width: 72 }, initials: { color: "#080808", fontFamily: "Inter_700Bold", fontSize: 23 }, identityCopy: { flex: 1, marginLeft: 14 }, name: { fontFamily: "Inter_700Bold", fontSize: 20 }, email: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3 }, planBadge: { alignItems: "center", alignSelf: "flex-start", borderRadius: 4, borderWidth: 1, flexDirection: "row", gap: 4, marginTop: 8, paddingHorizontal: 7, paddingVertical: 3 }, planBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  planBand: { alignItems: "center", borderRadius: 7, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 14 }, planTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13 }, planSub: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 3 }, goldButton: { borderRadius: 5, paddingHorizontal: 12, paddingVertical: 9 }, goldButtonText: { color: "#090909", fontFamily: "Inter_700Bold", fontSize: 11 },
  stats: { flexDirection: "row", gap: 8, marginTop: 12 }, stat: { alignItems: "center", borderRadius: 7, borderWidth: 1, flex: 1, minHeight: 92, paddingVertical: 11 }, statValue: { fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 5 }, statLabel: { fontFamily: "Inter_400Regular", fontSize: 9, marginTop: 2 }, section: { fontFamily: "Inter_600SemiBold", fontSize: 10, marginBottom: 7, marginTop: 22 }, group: { borderRadius: 7, borderWidth: 1, overflow: "hidden" },
  row: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 11, minHeight: 56, paddingHorizontal: 12 }, rowIcon: { alignItems: "center", borderRadius: 5, height: 32, justifyContent: "center", width: 32 }, rowLabel: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13 }, rowEnd: { alignItems: "center", flexDirection: "row", gap: 5 }, rowValue: { fontFamily: "Inter_400Regular", fontSize: 11 }, signOut: { alignItems: "center", borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 7, justifyContent: "center", marginTop: 22, paddingVertical: 14 }, signOutText: { color: "#EF4444", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  overlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.72)", flex: 1, justifyContent: "center", padding: 22 }, modal: { borderRadius: 8, borderWidth: 1, maxWidth: 420, padding: 18, width: "100%" }, modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 16 }, input: { borderRadius: 6, borderWidth: 1, fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 11, paddingHorizontal: 12, paddingVertical: 11 }, modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6 }, textButton: { paddingHorizontal: 15, paddingVertical: 10 }, textButtonLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12 }, saveButton: { borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10 }, option: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", minHeight: 48 }, optionText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
