export type ContentSection = "movies" | "series" | "shortzone" | "romance" | "kids";
export type ContentFormat = "movie" | "series" | "short";

export interface ContentItem {
  id: string;
  title: string;
  genre: string;
  category: string;
  section: ContentSection;
  rating: number;
  year: number;
  duration: string;
  type: ContentFormat;
  isPremium: boolean;
  description: string;
  episodes?: number;
  language: string;
  cast: string[];
  thumbnail: string;
  banner: string;
  videoUrl?: string;
}

export const LOCAL_MEDIA_KEY = "glopixs-local-banner";

export const SECTIONS: {
  id: ContentSection;
  label: string;
  categories: string[];
}[] = [
  {
    id: "movies",
    label: "Movies",
    categories: [
      "Upcoming",
      "Drama",
      "Thriller",
      "Comedy",
      "Horror",
      "Adventure",
      "Crime",
      "Mystery",
      "Family",
      "Classic",
    ],
  },
  {
    id: "series",
    label: "Series",
    categories: [
      "Crime",
      "Sci-Fi",
      "Fantasy",
      "Mystery",
      "Historical",
      "Drama",
      "Action",
      "Comedy",
      "Romance",
      "Thriller",
    ],
  },
  {
    id: "shortzone",
    label: "Shortzone",
    categories: [
      "Comedy Shorts",
      "Drama Shorts",
      "Thriller Shorts",
      "Motivational",
      "Trending Shorts",
      "Romance Shorts",
      "Action Shorts",
      "Horror Shorts",
      "Kids Shorts",
      "Music Shorts",
    ],
  },
  {
    id: "romance",
    label: "Romance",
    categories: [
      "Romantic Drama",
      "Love Story",
      "Teen Romance",
      "Musical Romance",
      "Classic Romance",
      "Wedding",
      "College Love",
      "Heartbreak",
      "Family Romance",
      "Feel Good",
    ],
  },
  {
    id: "kids",
    label: "Kids",
    categories: [
      "Cartoon",
      "Educational",
      "Adventure",
      "Fairy Tales",
      "Superhero",
      "Animals",
      "Learning",
      "Comedy",
      "Fantasy",
      "Bedtime",
    ],
  },
];

export const CATEGORIES = [
  { id: "all", label: "all" },
  ...SECTIONS.map((section) => ({ id: section.id, label: section.label })),
];

export const LANGUAGES = [
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Punjabi",
  "Gujarati",
  "Bhojpuri",
];

export const GENRES = [
  "Action", "Drama", "Comedy", "Thriller", "Romance",
  "Horror", "Sci-Fi", "Crime", "Fantasy", "Documentary",
];

const CAST = ["Vency L.A", "GLOPIXS Team"];
const LANGUAGES_POOL = ["Hindi", "Marathi", "Tamil", "Telugu", "Bengali"];

function sectionFormat(section: ContentSection): ContentFormat {
  if (section === "series") return "series";
  if (section === "shortzone") return "short";
  return "movie";
}

function sectionDuration(section: ContentSection, category: string, index: number): string {
  if (section === "series") return `${6 + index} Episodes`;
  if (section === "shortzone") return `${3 + index} min`;
  return `${1 + (index % 2)}h ${10 + index * 8}m`;
}

function buildSectionItems(section: ContentSection, categories: string[]): ContentItem[] {
  const format = sectionFormat(section);

  return categories.map((category, index) => ({
    id: `${section}-${index + 1}`,
    title: `GLOPIXS ${category}`,
    genre: category,
    category,
    section,
    rating: Number((7.8 + index * 0.3).toFixed(1)),
    year: 2024 + (index % 3),
    duration: sectionDuration(section, category, index),
    type: format,
    isPremium: index % 2 === 0,
    description: `${category} content streaming on GLOPIXS ${SECTIONS.find((s) => s.id === section)?.label ?? section}.`,
    episodes: format === "series" ? 6 + index : undefined,
    language: LANGUAGES_POOL[index % LANGUAGES_POOL.length],
    cast: CAST,
    thumbnail: LOCAL_MEDIA_KEY,
    banner: LOCAL_MEDIA_KEY,
    videoUrl: undefined,
  }));
}

export const SECTION_CONTENT: Record<ContentSection, ContentItem[]> = SECTIONS.reduce(
  (acc, section) => {
    acc[section.id] = buildSectionItems(section.id, section.categories);
    return acc;
  },
  {} as Record<ContentSection, ContentItem[]>
);

export const FEATURED_CONTENT: ContentItem[] = SECTIONS.flatMap(
  (section) => SECTION_CONTENT[section.id]
);

export function getSectionItems(section: ContentSection): ContentItem[] {
  return SECTION_CONTENT[section] ?? [];
}

export function getHeroBanners(): ContentItem[] {
  return SECTIONS.map((section, index) => {
    const item = SECTION_CONTENT[section.id][0];
    return {
      ...item,
      id: `hero-${section.id}`,
      title: section.label,
      genre: section.categories.join(" • "),
      description: "Premium OTT streaming for movies, series, short zone, romance, and kids. Launching 23 August 2026.",
      rating: 9.5 - index * 0.1,
      banner: LOCAL_MEDIA_KEY,
      videoUrl: undefined,
    };
  });
}

export interface LiveChannel {
  id: string;
  name: string;
  currentShow: string;
  logo: string;
  isLive: boolean;
  viewers: string;
}

export const LIVE_CHANNELS: LiveChannel[] = [];



