import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (typeof parsedUser === "object" && parsedUser !== null) {
          return parsedUser;
        } else {
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  });
  const [loading] = useState(false);


  // Wrap in useCallback to prevent infinite render loops!
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // Wrap in useCallback
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "http://localhost:8081/logout";
  }, []);

  const value = {
    user,
    setUser,
    role: user?.role || null,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading: loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
