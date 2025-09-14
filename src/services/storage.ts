/**
 * 本地数据存储（浏览器 IndexedDB）
 * 说明：用于在浏览器端持久化解析后的记录，支持保存/加载/列举/删除。
 */
import { InsuranceRecord } from "@/types/insurance";

const DB_NAME = "car-insurance-dashboard";
const DB_VERSION = 1;
const STORE = "datasets";

export interface DatasetMeta {
  id: string;
  name: string;
  createdAt: number; // 时间戳
  weekNumbers?: number[];
  count: number;
}

export interface DatasetPayload {
  id: string;
  name: string;
  records: InsuranceRecord[];
  meta?: Partial<Omit<DatasetMeta, "id" | "name" | "createdAt" | "count">>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDataset(payload: DatasetPayload): Promise<DatasetMeta> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const weekNumbers = Array.from(new Set(payload.records.map((r) => r.week_number))).sort((a, b) => a - b);
  const meta: DatasetMeta = {
    id: payload.id,
    name: payload.name,
    createdAt: Date.now(),
    weekNumbers,
    count: payload.records.length,
  };
  await new Promise((resolve, reject) => {
    const req = store.put({ ...payload, meta });
    req.onsuccess = () => resolve(null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  // 保存 latest 指针
  try {
    localStorage.setItem("cidb_latest", payload.id);
  } catch {}
  return meta;
}

export async function loadDataset(id: string): Promise<{ meta: DatasetMeta; records: InsuranceRecord[] } | null> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const data: any = await new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!data) return null;
  return { meta: data.meta as DatasetMeta, records: data.records as InsuranceRecord[] };
}

export async function listDatasets(): Promise<DatasetMeta[]> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const items: DatasetMeta[] = await new Promise((resolve, reject) => {
    const arr: DatasetMeta[] = [];
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null;
      if (cursor) {
        const v: any = cursor.value;
        if (v?.meta) arr.push(v.meta as DatasetMeta);
        cursor.continue();
      } else {
        resolve(arr.sort((a, b) => b.createdAt - a.createdAt));
      }
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items;
}

export async function deleteDataset(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  await new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve(null);
    req.onerror = () => reject(req.error);
  });
  db.close();
}

export function getLatestId(): string | null {
  try {
    return localStorage.getItem("cidb_latest");
  } catch {
    return null;
  }
}

