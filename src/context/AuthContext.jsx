import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { apiConfig, apiRequest } from "../services/apiClient";

const AuthContext = createContext(null);
const STORAGE_KEY = "ovarc_auth_user";

const fallbackUser = {
  id: 0,
  name: "Demo User",
  email: "demo@ovarc.dev",
  role: "viewer",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      setStatus("loading");
      setError(null);

      try {
        let authedUser = fallbackUser;
        if (apiConfig.mode === "mock") {
          const result = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          authedUser = result.user;
        }
        persistUser(authedUser);
        setStatus("authenticated");
        return authedUser;
      } catch (err) {
        setStatus("error");
        setError(err.message || "Unable to sign in");
        throw err;
      }
    },
    [persistUser]
  );

  const signOut = useCallback(async () => {
    try {
      if (apiConfig.mode === "mock" && user) {
        await apiRequest("/auth/logout", { method: "POST" });
      }
    } catch {
      // ignore logout errors
    } finally {
      persistUser(null);
      setStatus("idle");
      setError(null);
    }
  }, [persistUser, user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: status === "loading",
      error,
      signIn,
      signOut,
    }),
    [user, status, error, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
