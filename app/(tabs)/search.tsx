import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { FEATURED_CONTENT, GENRES, LANGUAGES, ContentItem } from "@/constants/data";
import { fetchApiContent } from "@/constants/api";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = (SCREEN_WIDTH - 48) / 3;
const FALLBACK_LOGO = require("../../assets/images/poster-banner-logo.png");
const API_BACKGROUND = "#1E1D1B";

function SearchResultCard({
  item,
  onPress,
  colors,
}: {
  item: ContentItem;
  onPress: (item: ContentItem) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      style={[styles.gridCard, { width: CARD_W }]}
    >
      <View style={[styles.gridImage, { backgroundColor: API_BACKGROUND, borderRadius: colors.radius }]}>
        <Image
          source={FALLBACK_LOGO}
          style={[styles.gridImg, { borderRadius: colors.radius }]}
          resizeMode="contain"
        />
        {item.isPremium && (
          <View style={[styles.premBadge, { backgroundColor: colors.gold }]}>
            <Ionicons name="star" size={7} color="#000" />
          </View>
        )}
      </View>
      <Text style={[styles.gridTitle, { color: colors.foreground }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.gridMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
        {item.genre}
      </Text>
      <Text style={[styles.gridMeta, { color: colors.gold }]} numberOfLines={1}>
        {item.language}
      </Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [content, setContent] = useState(FEATURED_CONTENT);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    fetchApiContent()
      .then((items) => setContent(items.length > 0 ? items : FEATURED_CONTENT))
      .catch(() => setContent(FEATURED_CONTENT));
  }, []);

  const results = content.filter((c) => {
    const matchesQuery = query.length === 0 || c.title.toLowerCase().includes(query.toLowerCase()) || c.genre.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = !selectedGenre || c.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesLanguage = !selectedLanguage || c.language.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesQuery && matchesGenre && matchesLanguage;
  });

  const handlePress = (item: ContentItem) => {
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.gold }]}>Search</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search movies, shows..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
      >
        {/* Genre filter */}
        {query.length === 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Browse by Genre</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRow}>
              {GENRES.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setSelectedGenre(selectedGenre === g ? null : g)}
                  activeOpacity={0.7}
                  style={[
                    styles.genrePill,
                    {
                      backgroundColor: selectedGenre === g ? colors.gold : colors.card,
                      borderColor: selectedGenre === g ? colors.gold : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.genreText, { color: selectedGenre === g ? "#000" : colors.foreground }]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Browse by Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRow}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language}
                  onPress={() => setSelectedLanguage(selectedLanguage === language ? null : language)}
                  activeOpacity={0.7}
                  style={[
                    styles.genrePill,
                    {
                      backgroundColor: selectedLanguage === language ? colors.gold : colors.card,
                      borderColor: selectedLanguage === language ? colors.gold : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.genreText, { color: selectedLanguage === language ? "#000" : colors.foreground }]}>
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Results */}
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          {query.length > 0 ? `Results for "${query}"` : selectedLanguage || selectedGenre || "All Content"}
        </Text>

        <View style={styles.grid}>
          {results.map((item) => (
            <SearchResultCard key={item.id} item={item} onPress={handlePress} colors={colors} />
          ))}
        </View>

        {results.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 2, marginBottom: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  scroll: { paddingBottom: 100 },
  sectionLabel: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 16, paddingHorizontal: 16 },
  genreRow: { paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  gridCard: { marginBottom: 4 },
  gridImage: { width: "100%", aspectRatio: 0.67, overflow: "hidden", position: "relative" },
  gridImg: { width: "100%", height: "100%" },
  premBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  gridTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 6 },
  gridMeta: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
