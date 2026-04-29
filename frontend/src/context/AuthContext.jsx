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
          // Robust role override for the primary admin email
          if (parsedUser.email === "admin@campus.com") {
            parsedUser.role = "ADMIN";
            localStorage.setItem("role", "ADMIN");
          } else {
            const storedRole = localStorage.getItem("role");
            if (storedRole) {
              parsedUser.role = storedRole;
            }
          }
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
    // Ensure the role key is also set during login call for consistency
    if (userData.role) {
      localStorage.setItem("role", userData.role);
    }
  }, []);

  // Wrap in useCallback
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("role"); // CRITICAL: Prevent role leakage
    setUser(null);
    window.location.href = "http://localhost:8081/logout";
  }, []);

  const getRole = (u) => {
    const r = u?.role;
    if (!r) return null;
    if (typeof r === "string") return r.toUpperCase();
    if (typeof r === "object" && r.name) return r.name.toUpperCase();
    return String(r).toUpperCase();
  };

  const value = {
    user,
    setUser,
    role: getRole(user),
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
