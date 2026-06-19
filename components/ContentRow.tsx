import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { ContentItem } from "@/constants/data";
import { ContentCard } from "./ContentCard";

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: ContentItem[];
  size?: "small" | "medium" | "large";
}

export function ContentRow({ title, subtitle, items, size = "medium" }: ContentRowProps) {
  const colors = useColors();
  const hasItems = items.length > 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleWrap}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity style={[styles.seeAll, !hasItems && styles.disabledAction]}>
          <Text style={[styles.seeAllText, { color: colors.gold }]}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.gold} />
        </TouchableOpacity>
      </View>
      {hasItems ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {items.map((item) => (
            <ContentCard key={item.id} item={item} size={size} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.emptyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="film-outline" size={20} color={colors.gold} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Coming soon</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Fresh titles will appear here when the API sends this category.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  titleWrap: {
    flex: 1,
    marginRight: 12,
  },
  sectionSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 3,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  disabledAction: {
    opacity: 0.42,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  row: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  emptyRow: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 16,
    minHeight: 112,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    textAlign: "center",
  },
});
