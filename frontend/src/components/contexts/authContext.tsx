// context/AuthContext.ts
import { createContext } from "react";
import type { AuthContextType, AuthState } from "../../types/auth";

export const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: {
    id: 0,
    email: "",
    username: "",
  },
};

export const AuthContext = createContext<AuthContextType>({
  auth: defaultAuthState,
  setAuth: () => {},
  appLoading: true,
  setAppLoading: () => {},
});
