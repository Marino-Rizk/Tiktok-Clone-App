let currentAccessToken = null;
let isRefreshing = false;
let refreshPromise = null;
const listeners = new Set();

export const getAccessToken = () => currentAccessToken;

export const setAccessToken = (token) => {
  currentAccessToken = token || null;
  for (const listener of listeners) {
    try {
      listener(currentAccessToken);
    } catch {}
  }
};

export const clearAccessToken = () => setAccessToken(null);

export const subscribeToToken = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Simple refresh coordination flags exposed for sharing between modules if needed
export const tokenRefreshState = {
  get isRefreshing() {
    return isRefreshing;
  },
  set isRefreshing(val) {
    isRefreshing = !!val;
  },
  get refreshPromise() {
    return refreshPromise;
  },
  set refreshPromise(p) {
    refreshPromise = p;
  },
};


