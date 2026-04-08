"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDFJuwQ9_HxfZNR2hT0RiKsJSUYAKv4GeI",
  authDomain: "dashboard-de492.firebaseapp.com",
  databaseURL:
    "https://dashboard-de492-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dashboard-de492",
  storageBucket: "dashboard-de492.firebasestorage.app",
  messagingSenderId: "660121366741",
  appId: "1:660121366741:web:6ae5000bcab399b7a0f25c",
  measurementId: "G-V0YJ2BYXLP",
};

// Guard against double-init in Next.js hot reload / multi-import scenarios.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Realtime Database (asia-southeast1). Do NOT initialize analytics — it breaks SSR.
export const db: Database = getDatabase(app);
export { app };
