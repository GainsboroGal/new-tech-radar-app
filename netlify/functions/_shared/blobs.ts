/**
 * Netlify Blobs helpers for versioned opportunity snapshots.
 * Publication sequence: write snapshot → strong-consistency readback → update pointer.
 */

import { getStore } from "@netlify/blobs";

export const STORES = {
  published: "published-opportunities",
  scanState: "scan-state",
  reviewQueue: "review-queue",
  suppressionLogs: "suppression-logs",
  operatorAudit: "operator-audit",
} as const;

export function publishedStore() {
  return getStore(STORES.published);
}

export function scanStateStore() {
  return getStore(STORES.scanState);
}

export type SnapshotPayload = {
  version: string;
  generatedAt: string;
  opportunities: unknown[];
  scanMeta: {
    lastScan: string | null;
    examined: number;
    kept: number;
    suppressed: number;
    partial: boolean;
    status: "ok" | "partial" | "failed" | "never";
    message?: string;
  };
  checksum?: string;
};

export type Pointer = {
  version: string;
  updatedAt: string;
  opportunityCount: number;
};

export async function simpleChecksum(data: unknown): Promise<string> {
  const text = JSON.stringify(data);
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `c${(h >>> 0).toString(16)}`;
}

export async function publishSnapshot(payload: SnapshotPayload): Promise<Pointer> {
  const store = publishedStore();
  const checksum = await simpleChecksum(payload.opportunities);
  const version = payload.version || `snap-${Date.now()}`;
  const full: SnapshotPayload = { ...payload, version, checksum };

  await store.setJSON(`snapshots/${version}`, full);

  const readback = await store.get(`snapshots/${version}`, {
    type: "json",
    consistency: "strong",
  });
  if (!readback) {
    throw new Error("Snapshot write verification failed");
  }

  const pointer: Pointer = {
    version,
    updatedAt: new Date().toISOString(),
    opportunityCount: Array.isArray(payload.opportunities)
      ? payload.opportunities.length
      : 0,
  };
  await store.setJSON("current-pointer", pointer);
  return pointer;
}

export async function getCurrentSnapshot(): Promise<SnapshotPayload | null> {
  const store = publishedStore();
  const pointer = (await store.get("current-pointer", { type: "json" })) as Pointer | null;
  if (!pointer?.version) return null;
  const snap = (await store.get(`snapshots/${pointer.version}`, {
    type: "json",
  })) as SnapshotPayload | null;
  return snap;
}

export type ScanLock = {
  scanId: string;
  acquiredAt: string;
  owner: string;
};

export async function acquireScanLock(owner: string, ttlMs = 15 * 60 * 1000): Promise<ScanLock | null> {
  const store = scanStateStore();
  const existing = (await store.get("active-lock", { type: "json" })) as ScanLock | null;
  if (existing?.acquiredAt) {
    const age = Date.now() - new Date(existing.acquiredAt).getTime();
    if (age < ttlMs) return null;
  }
  const lock: ScanLock = {
    scanId: `scan-${Date.now()}`,
    acquiredAt: new Date().toISOString(),
    owner,
  };
  await store.setJSON("active-lock", lock);
  return lock;
}

export async function releaseScanLock(scanId: string): Promise<void> {
  const store = scanStateStore();
  const existing = (await store.get("active-lock", { type: "json" })) as ScanLock | null;
  if (existing?.scanId === scanId) {
    await store.delete("active-lock");
  }
}

export async function saveScanRun(scanId: string, data: unknown): Promise<void> {
  const store = scanStateStore();
  await store.setJSON(`runs/${scanId}`, data);
}

export async function saveLastSuccess(data: unknown): Promise<void> {
  const store = scanStateStore();
  await store.setJSON("last-success", data);
}
