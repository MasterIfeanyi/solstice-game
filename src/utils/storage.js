export const getStoredItem = (key, fallback = null) => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
};

export const storeItem = (key, value) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const clearItems = (items) => {
  if (typeof window === "undefined") return;
  if (Array.isArray(items)) {
    items.forEach((item) => localStorage.removeItem(item));
  }
};