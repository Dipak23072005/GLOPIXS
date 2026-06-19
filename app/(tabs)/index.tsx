import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { GlopixsHeader } from "@/components/GlopixsHeader";
import { FeaturedCard } from "@/components/ContentCard";
import { CategoryPills } from "@/components/CategoryPill";
import { ContentRow } from "@/components/ContentRow";
import {
  CATEGORIES,
  ContentItem,
  ContentSection,
  FEATURED_CONTENT,
  getHeroBanners,
  getSectionItems,
  LANGUAGES,
  SECTIONS,
} from "@/constants/data";
import { fetchApiContent } from "@/constants/api";

function groupBySection(items: ContentItem[]) {
  const grouped: Partial<Record<ContentSection, ContentItem[]>> = {};
  for (const item of items) {
    if (!item.section) continue;
    grouped[item.section] = grouped[item.section] ?? [];
    grouped[item.section]!.push(item);
  }
  return grouped;
}

export default function HomeScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [content, setContent] = useState(FEATURED_CONTENT);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchApiContent()
      .then((items) => setContent(items.length > 0 ? items : FEATURED_CONTENT))
      .catch(() => setContent(FEATURED_CONTENT));
  }, []);

  const safeContent = content.length > 0 ? content : FEATURED_CONTENT;
  const languageContent =
    selectedLanguage === "All"
      ? safeContent
      : safeContent.filter((c) => c.language.toLowerCase() === selectedLanguage.toLowerCase());
  const visibleContent = languageContent.length > 0 ? languageContent : safeContent;
  const groupedContent = groupBySection(visibleContent);

  const heroItems =
    selectedCategory === "all"
      ? getHeroBanners()
      : getSectionItems(selectedCategory as ContentSection).slice(0, 5);

  const activeSections =
    selectedCategory === "all"
      ? SECTIONS
      : SECTIONS.filter((section) => section.id === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlopixsHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={heroItems}
          horizontal
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          windowSize={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeaturedCard item={item} />}
        />

        <View style={styles.spacer} />

        <CategoryPills
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <View style={styles.spacer} />

        <CategoryPills
          categories={[
            { id: "All", label: "All Languages" },
            ...LANGUAGES.map((language) => ({ id: language, label: language })),
          ]}
          selected={selectedLanguage}
          onSelect={setSelectedLanguage}
        />

        <View style={styles.spacer} />

        {activeSections.map((section) => {
          const items =
            groupedContent[section.id]?.slice(0, 5) ??
            getSectionItems(section.id).slice(0, 5);

          return (
            <ContentRow
              key={section.id}
              title={section.label}
              subtitle={section.categories.join(" - ")}
              items={items}
              size="medium"
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 100,
  },
  spacer: {
    height: 16,
  },
});
