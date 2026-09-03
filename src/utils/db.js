/**
 * Native IndexedDB helper to persist weather data payloads and app state
 * surviving browser restarts for full offline availability.
 */
const DB_NAME = "WeatherApp_DB";
const DB_VERSION = 4;
const STORE_WEATHER = "weather_cache";
const STORE_SETTINGS = "user_settings";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_WEATHER)) {
        db.createObjectStore(STORE_WEATHER, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveCachedWeather(key, data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WEATHER, "readwrite");
      const store = tx.objectStore(STORE_WEATHER);
      store.put({ key, data, storedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("IndexedDB saveCachedWeather error:", err);
    return false;
  }
}

export async function getCachedWeather(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_WEATHER, "readonly");
      const store = tx.objectStore(STORE_WEATHER);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("IndexedDB getCachedWeather error:", err);
    return null;
  }
}

export async function saveSetting(key, val) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, "readwrite");
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key, value: val });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("IndexedDB saveSetting error:", err);
    return false;
  }
}

export async function getSetting(key, defaultValue = null) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, "readonly");
      const store = tx.objectStore(STORE_SETTINGS);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : defaultValue);
      request.onerror = () => resolve(defaultValue);
    });
  } catch (err) {
    return defaultValue;
  }
}
