const STORAGE_KEY = 'system-design-workbook-progress';

export function readProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function writeProgress(progress: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...progress]));
}

