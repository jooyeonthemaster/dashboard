export type Member = {
  slug: string;
  name: string;
  role: "임원" | "직원";
  color: string; // distinctive per-member accent (hex)
};

export const MEMBERS: Member[] = [
  { slug: "yjy",  name: "유재영", role: "임원", color: "#FF6B6B" }, // coral red
  { slug: "kjy",  name: "김주연", role: "임원", color: "#4ECDC4" }, // teal
  { slug: "ysh",  name: "유선화", role: "임원", color: "#FFD93D" }, // yellow
  { slug: "ldj",  name: "이동주", role: "임원", color: "#A78BFA" }, // violet
  { slug: "kjy2", name: "김정연", role: "직원", color: "#F472B6" }, // pink
  { slug: "rdh",  name: "류다혜", role: "직원", color: "#34D399" }, // emerald
  { slug: "kjh",  name: "김주희", role: "직원", color: "#FB923C" }, // orange
  { slug: "kje",  name: "김제연", role: "직원", color: "#60A5FA" }, // sky
];

export function getMemberBySlug(slug: string): Member | undefined {
  return MEMBERS.find((m) => m.slug === slug);
}

export function getMemberColor(slug: string): string {
  return getMemberBySlug(slug)?.color ?? "#94A3B8";
}
