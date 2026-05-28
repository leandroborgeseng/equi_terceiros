"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface OfflineUpload {
  id: string;
  requestId: string;
  type: string;
  photoType?: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  createdAt: number;
  status: "pending" | "syncing" | "done" | "error";
  error?: string;
}

interface HomologDB extends DBSchema {
  uploads: {
    key: string;
    value: OfflineUpload;
    indexes: { "by-status": string; "by-request": string };
  };
}

let dbPromise: Promise<IDBPDatabase<HomologDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HomologDB>("homologacao-offline", 1, {
      upgrade(db) {
        const store = db.createObjectStore("uploads", { keyPath: "id" });
        store.createIndex("by-status", "status");
        store.createIndex("by-request", "requestId");
      },
    });
  }
  return dbPromise;
}

export async function queueOfflineUpload(item: Omit<OfflineUpload, "id" | "createdAt" | "status">) {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db.put("uploads", {
    ...item,
    id,
    createdAt: Date.now(),
    status: "pending",
  });
  return id;
}

export async function getPendingUploads() {
  const db = await getDB();
  return db.getAllFromIndex("uploads", "by-status", "pending");
}

export async function getAllOfflineUploads(requestId?: string) {
  const db = await getDB();
  if (requestId) {
    return db.getAllFromIndex("uploads", "by-request", requestId);
  }
  return db.getAll("uploads");
}

export async function updateUploadStatus(
  id: string,
  status: OfflineUpload["status"],
  error?: string
) {
  const db = await getDB();
  const item = await db.get("uploads", id);
  if (!item) return;
  await db.put("uploads", { ...item, status, error });
}

export async function removeOfflineUpload(id: string) {
  const db = await getDB();
  await db.delete("uploads", id);
}
