// ---------- AUTH CONTEXT ----------
// "Context" is React's way of sharing data with every page without passing it down by hand.
// Here we share: who is logged in, plus login / register / logout functions.
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext); // shortcut hook used by other files

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for a saved login

  // When the app first opens: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token')) // token was old or invalid
      .finally(() => setLoading(false));
  }, []);

  // Saves the token and the user after a successful login/register
  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const login = async (email, password) =>
    saveSession(await api('/auth/login', { method: 'POST', body: { email, password } }));

  const register = async (name, email, password) =>
    saveSession(await api('/auth/register', { method: 'POST', body: { name, email, password } }));

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
