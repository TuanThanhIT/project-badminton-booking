// context/AuthProvider.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthState } from "../../types/auth";
import { AuthContext, defaultAuthState } from "./authContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuthState);
  const [appLoading, setAppLoading] = useState<boolean>(true);

  return (
    <AuthContext.Provider value={{ auth, setAuth, appLoading, setAppLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
