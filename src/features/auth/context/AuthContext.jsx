import { createContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'santri' | 'alumni'

  const login = useCallback((role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole(null);
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
    userRole,
    login,
    logout
  }), [isLoggedIn, userRole, login, logout]);

  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}

export { AuthContext };
