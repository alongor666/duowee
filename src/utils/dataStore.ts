import type { CarInsuranceRecord, ImportSourceMeta, StoredImportSnapshot } from '@/types';

const DB_NAME = 'car-insurance-dashboard';
const STORE_NAME = 'imported_data';
const STORE_KEY = 'latest';
const META_STORAGE_KEY = 'imported_data_meta_v1';

type StoredValue = {
  id: string;
  records: CarInsuranceRecord[];
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

function promisifyRequest<T>(request: IDBRequest<T> | IDBOpenDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

function awaitTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    throw new Error('IndexedDB 在当前环境不可用');
  }

  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  return promisifyRequest<IDBDatabase>(request);
}

export function summariseRecordsSources(records: CarInsuranceRecord[], sourceName = '临时导入'): ImportSourceMeta {
  const years = Array.from(new Set(records.map(r => r.policy_start_year).filter(Boolean))).sort();
  const weeks = Array.from(new Set(records.map(r => r.week_number).filter(Boolean))).sort();
  return {
    fileName: sourceName,
    rowCount: records.length,
    years,
    weeks,
    uploadedAt: new Date().toISOString()
  };
}

export async function saveImportedData(records: CarInsuranceRecord[], meta: StoredImportSnapshot): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const payload: StoredValue = { id: STORE_KEY, records };
  store.put(payload);
  await awaitTransaction(transaction);
  window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify({
    createdAt: meta.createdAt,
    sources: meta.sources,
    warnings: meta.warnings ?? []
  }));
}

export async function appendImportedData(records: CarInsuranceRecord[], meta: ImportSourceMeta): Promise<StoredImportSnapshot> {
  const existing = await loadImportedData();
  const mergedRecords = existing ? [...existing.records, ...records] : records;
  const sources = existing ? [...existing.sources, meta] : [meta];
  const snapshot: StoredImportSnapshot = {
    createdAt: new Date().toISOString(),
    records: mergedRecords,
    sources,
    warnings: existing?.warnings ?? []
  };
  await saveImportedData(mergedRecords, snapshot);
  return snapshot;
}

export async function loadImportedData(): Promise<StoredImportSnapshot | null> {
  if (!isBrowser()) return null;
  const metaRaw = window.localStorage.getItem(META_STORAGE_KEY);
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(STORE_KEY) as IDBRequest<StoredValue | undefined>;
  const value = await promisifyRequest(request);
  await awaitTransaction(transaction);

  if (!value) {
    return null;
  }

  let meta: Pick<StoredImportSnapshot, 'createdAt' | 'sources' | 'warnings'> = {
    createdAt: new Date().toISOString(),
    sources: [],
    warnings: []
  };

  if (metaRaw) {
    try {
      const parsed = JSON.parse(metaRaw) as { createdAt: string; sources: ImportSourceMeta[]; warnings?: string[] };
      meta = {
        createdAt: parsed.createdAt,
        sources: parsed.sources || [],
        warnings: parsed.warnings || []
      };
    } catch {
      // 忽略损坏的元数据
    }
  }

  return {
    createdAt: meta.createdAt,
    sources: meta.sources,
    warnings: meta.warnings,
    records: value.records
  };
}

export async function clearImportedData(): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).delete(STORE_KEY);
  await awaitTransaction(transaction);
  window.localStorage.removeItem(META_STORAGE_KEY);
}
