import { createContext, useEffect, useState } from "react";
import { removeStorage, setStorage } from "./mainStorage";

export const AuthContext = createContext({
  token: "",
  isAuthenticated: false,
  authenticate: (token, refreshToken, user) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [user, setUser] = useState();

  function authenticate(token, refreshToken, user) {
    setAuthToken(token);
    setUser(user);
    setStorage("token", token);
    setStorage("refreshToken", refreshToken);
    // AsyncStorage.setItem('token', token);
  }

  function logout() {
    setAuthToken(null);
    removeStorage("token");
    removeStorage("refreshToken");
    // AsyncStorage.removeItem('token');
  }

  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    user: user,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
