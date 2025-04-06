import AsyncStorage from "@react-native-async-storage/async-storage";

const setStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

const getStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    // error reading value
    return null;
  }
};

const removeStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // error reading value
  }
};

export { setStorage, getStorage, removeStorage };
