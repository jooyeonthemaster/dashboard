export type Member = {
  slug: string;
  name: string;
  role: "임원" | "직원";
};

export const MEMBERS: Member[] = [
  { slug: "yjy", name: "유재영", role: "임원" },
  { slug: "kjy", name: "김주연", role: "임원" },
  { slug: "ysh", name: "유선화", role: "임원" },
  { slug: "ldj", name: "이동주", role: "임원" },
  { slug: "kjy2", name: "김정연", role: "직원" },
  { slug: "rdh", name: "류다혜", role: "직원" },
  { slug: "kjh", name: "김주희", role: "직원" },
  { slug: "kje", name: "김제연", role: "직원" },
];

export function getMemberBySlug(slug: string): Member | undefined {
  return MEMBERS.find((m) => m.slug === slug);
}
