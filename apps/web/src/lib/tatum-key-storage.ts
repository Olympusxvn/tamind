const STORAGE_KEY = 'tamind:tatumApiKey:v1';

export function getStoredTatumApiKey(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function setStoredTatumApiKey(key: string): void {
  const trimmed = key.trim();
  if (!trimmed) throw new Error('API key cannot be empty');
  if (trimmed.length > 512) throw new Error('API key is too long');
  localStorage.setItem(STORAGE_KEY, trimmed);
}

export function clearStoredTatumApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasStoredTatumApiKey(): boolean {
  return getStoredTatumApiKey() !== null;
}
