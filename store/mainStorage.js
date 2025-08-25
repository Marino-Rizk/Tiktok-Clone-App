import AsyncStorage from "@react-native-async-storage/async-storage";

const setStorage = async (key, value) => {
  try {
    if (value === null || value === undefined) {
      await AsyncStorage.removeItem(key);
      return;
    }

    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  } catch (e) {
    // saving error
    console.warn(`AsyncStorage set error for key "${key}":`, e);
  }
};

const getStorage = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null || raw === undefined) return null;
    try {
      return JSON.parse(raw);
    } catch {
      if (raw === "[object Object]") {
        try { await AsyncStorage.removeItem(key); } catch {}
        return null;
      }
      return raw;
    }
  } catch (e) {
    // error reading value
    console.warn(`AsyncStorage get error for key "${key}":`, e);
    return null;
  }
};

const removeStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // error removing value
    console.warn(`AsyncStorage remove error for key "${key}":`, e);
  }
};

export { setStorage, getStorage, removeStorage };
