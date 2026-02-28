import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api"; // axios instance
import { setAuthToken, getAuthToken } from "@/lib/api";
import API from "@/lib/apiEndpoints";

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.get(API.users.me)
        .then(setUser)
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post(API.auth.login, {
      email: email.trim(),
      password,
    });

    setAuthToken(res.access_token);
    setUser(res.user);
  };

  const signup = async (email: string, password: string) => {
    const res = await api.post(API.auth.signup, {
      email: email.trim(),
      password,
    });

    if (res?.access_token) {
      setAuthToken(res.access_token);
    }

    if (res?.user) {
      setUser(res.user);
      return;
    }

    try {
      const me = await api.get(API.users.me);
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
