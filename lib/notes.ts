"use client";

import {
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  off,
} from "firebase/database";
import { db } from "./firebase";
import type { Note, Goals } from "./types";

const NOTES_PATH = "notes";
const GOALS_PATH = "goals";

/**
 * Subscribe to all notes. Callback receives notes sorted newest-first.
 * Returns an unsubscribe function.
 */
export function subscribeNotes(cb: (notes: Note[]) => void): () => void {
  const r = ref(db, NOTES_PATH);
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, Partial<Note>> | null;
    if (!val) {
      cb([]);
      return;
    }
    const list: Note[] = [];
    for (const [id, v] of Object.entries(val)) {
      if (
        !v ||
        typeof v.body !== "string" ||
        typeof v.createdAt !== "number" ||
        typeof v.authorSlug !== "string" ||
        typeof v.authorName !== "string" ||
        typeof v.target !== "string"
      ) {
        continue;
      }
      list.push({
        id,
        authorSlug: v.authorSlug,
        authorName: v.authorName,
        target: v.target,
        recipientSlug: v.recipientSlug,
        recipientName: v.recipientName,
        body: v.body,
        color: typeof v.color === "string" ? v.color : "#F4F4F7",
        createdAt: v.createdAt,
        pinned: v.pinned === true,
        done: v.done === true,
      });
    }
    list.sort((a, b) => b.createdAt - a.createdAt);
    cb(list);
  });
  return () => {
    off(r, "value", handler);
  };
}

export async function createNote(
  input: Omit<Note, "id" | "createdAt">
): Promise<void> {
  const r = ref(db, NOTES_PATH);
  const newRef = push(r);
  const note: Omit<Note, "id"> = {
    ...input,
    createdAt: Date.now(),
  };
  // Strip undefined fields (RTDB rejects them).
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(note)) {
    if (v !== undefined) clean[k] = v;
  }
  await set(newRef, clean);
}

export async function togglePin(id: string, pinned: boolean): Promise<void> {
  await update(ref(db, `${NOTES_PATH}/${id}`), { pinned });
}

export async function toggleDone(id: string, done: boolean): Promise<void> {
  await update(ref(db, `${NOTES_PATH}/${id}`), { done });
}

export async function deleteNote(id: string): Promise<void> {
  await remove(ref(db, `${NOTES_PATH}/${id}`));
}

/**
 * Subscribe to team goals. Callback receives a Goals object (with defaults
 * when the node is empty).
 */
export function subscribeGoals(cb: (g: Goals) => void): () => void {
  const r = ref(db, GOALS_PATH);
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Partial<Goals> | null;
    cb({
      overall: val?.overall ?? "",
      monthly: val?.monthly ?? "",
      weekly: val?.weekly ?? "",
      updatedAt: val?.updatedAt ?? 0,
      updatedBy: val?.updatedBy ?? "",
    });
  });
  return () => {
    off(r, "value", handler);
  };
}

export async function updateGoals(
  g: Partial<Goals>,
  by: string
): Promise<void> {
  const patch: Record<string, unknown> = {
    ...g,
    updatedAt: Date.now(),
    updatedBy: by,
  };
  for (const k of Object.keys(patch)) {
    if (patch[k] === undefined) delete patch[k];
  }
  await update(ref(db, GOALS_PATH), patch);
}
