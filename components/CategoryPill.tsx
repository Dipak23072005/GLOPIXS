import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Category {
  id: string;
  label: string;
}

interface CategoryPillsProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryPills({ categories, selected, onSelect }: CategoryPillsProps) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isSelected = cat.id === selected;
        const label = cat.label;
        const icon =
          cat.id === "all" || cat.id === "All"
            ? "apps-outline"
            : cat.id === "movies"
            ? "film-outline"
            : cat.id === "series"
            ? "albums-outline"
            : cat.id === "shortzone"
            ? "flash-outline"
            : cat.id === "romance"
            ? "heart-outline"
            : cat.id === "kids"
            ? "happy-outline"
            : "language-outline";
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.78}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? colors.gold : colors.card,
                borderColor: isSelected ? colors.gold : colors.border,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={14}
              color={isSelected ? "#000" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.pillText,
                {
                  color: isSelected ? "#000" : colors.mutedForeground,
                  fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 58,
  },
  pillText: {
    fontSize: 13,
    includeFontPadding: false,
    textAlign: "center",
  },
});
