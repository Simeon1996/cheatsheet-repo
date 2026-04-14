export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const CATEGORY_COLORS = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "pink",
  "orange",
  "cyan",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export const COLOR_MAP: Record<CategoryColor, { bg: string; text: string; border: string; badge: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", badge: "bg-blue-500" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30", badge: "bg-green-500" },
  red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", badge: "bg-red-500" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", badge: "bg-yellow-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", badge: "bg-purple-500" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/30", badge: "bg-pink-500" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", badge: "bg-orange-500" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30", badge: "bg-cyan-500" },
};

export function getColorClasses(color: string | null | undefined) {
  const key = (color ?? "blue") as CategoryColor;
  return COLOR_MAP[key] ?? COLOR_MAP.blue;
}
