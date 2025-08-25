import { createContext, useEffect, useState } from "react";
import { getStorage, removeStorage, setStorage } from "./mainStorage";
import { setAccessToken as setVolatileToken, clearAccessToken as clearVolatileToken } from "../utils/tokenStore";
import { refreshToken as refreshAccessToken } from "../utils/authService";
import { cacheUtils } from "../utils/api";

export const AuthContext = createContext({
  token: "",
  isAuthenticated: false,
  authenticate: (token, refreshToken, user) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [user, setUser] = useState();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Bootstrap from storage on mount
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedUser = await getStorage("userData");
        const storedRefresh = await getStorage("refreshToken");
        if (storedUser) setUser(storedUser);
        // Auto-login: if refresh token exists, refresh to obtain access token
        if (storedRefresh) {
          const res = await refreshAccessToken(storedRefresh);
          if (res?.success && res.data?.accessToken) {
            setVolatileToken(res.data.accessToken);
            setAuthToken(res.data.accessToken);
            if (res.data.user) {
              setUser(res.data.user);
              await setStorage("userData", res.data.user);
            }
          } else {
            // Clean any stale tokens
            await removeStorage("refreshToken");
          }
        }
      } finally {
        setIsBootstrapping(false);
      }
    };
    bootstrap();
  }, []);

  function authenticate(token, refreshToken, user) {
    setAuthToken(token);
    setUser(user);
    // Access token stays in memory
    setVolatileToken(token);
    setStorage("refreshToken", refreshToken);
    if (user) {
      setStorage("userData", user);
    }
    try { cacheUtils.clear(); } catch {}
    // AsyncStorage.setItem('token', token);
  }

  function logout() {
    setAuthToken(null);
    setUser(undefined);
    clearVolatileToken();
    removeStorage("refreshToken");
    removeStorage("userData");
    try { cacheUtils.clear(); } catch {}
    // AsyncStorage.removeItem('token');
  }

  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    user: user,
    authenticate: authenticate,
    logout: logout,
    isBootstrapping,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
