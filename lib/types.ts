export type TeamKey = "marketing" | "sales" | "dev" | "ops";
export type NoteTarget = TeamKey | "all";

export const TEAMS: { key: TeamKey; label: string; accent: string }[] = [
  { key: "marketing", label: "마케팅", accent: "#FF6B6B" },
  { key: "sales", label: "영업", accent: "#4ECDC4" },
  { key: "dev", label: "개발", accent: "#FFD93D" },
  { key: "ops", label: "운영", accent: "#A78BFA" },
];

export type Note = {
  id: string;
  authorSlug: string;
  authorName: string;
  target: NoteTarget;
  recipientSlug?: string;
  recipientName?: string;
  body: string;
  color: string;
  createdAt: number;
  pinned?: boolean;
  done?: boolean;
};

export type Goals = {
  overall: string;
  monthly: string;
  weekly: string;
  updatedAt: number;
  updatedBy: string;
};
