import { useState, useEffect, useCallback } from "react";
import { api, ApiError, JWT_STORAGE_KEY, PHONE_STORAGE_KEY, NAME_STORAGE_KEY } from "../lib/api";

/**
 * Persistent auth.
 *
 * After a successful OTP verification we store the JWT + phone + name in
 * localStorage. The backend issues a long-lived token (1 year), so re-opening
 * the site on the same device restores the session instantly — no re-login.
 *
 * On load we OPTIMISTICALLY trust the stored token (UI shows logged-in
 * immediately) and validate it in the background. The token is only cleared on
 * an explicit 401 — transient network errors never log the user out.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPhone, setAuthPhone] = useState("");
  const [authName, setAuthName] = useState("");
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(JWT_STORAGE_KEY);
    const storedPhone = localStorage.getItem(PHONE_STORAGE_KEY) || "";
    const storedName = localStorage.getItem(NAME_STORAGE_KEY) || "";

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Optimistic restore — user sees logged-in state right away.
    setIsAuthenticated(true);
    setAuthPhone(storedPhone);
    setAuthName(storedName);
    setToken(storedToken);
    setIsLoading(false);

    // Background validation; only sign out on a real 401.
    api
      .me()
      .then((data) => {
        if (data?.phone) {
          setAuthPhone(data.phone);
          localStorage.setItem(PHONE_STORAGE_KEY, data.phone);
        }
        if (data?.name) {
          setAuthName(data.name);
          localStorage.setItem(NAME_STORAGE_KEY, data.name);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem(JWT_STORAGE_KEY);
          localStorage.removeItem(PHONE_STORAGE_KEY);
          localStorage.removeItem(NAME_STORAGE_KEY);
          setIsAuthenticated(false);
          setAuthPhone("");
          setAuthName("");
          setToken(null);
        }
        // Network / 5xx errors: keep the session — they're likely transient.
      });
  }, []);

  const login = useCallback((phone, jwtToken, name = "") => {
    localStorage.setItem(JWT_STORAGE_KEY, jwtToken);
    localStorage.setItem(PHONE_STORAGE_KEY, phone);
    if (name) localStorage.setItem(NAME_STORAGE_KEY, name);
    setIsAuthenticated(true);
    setAuthPhone(phone);
    setAuthName(name);
    setToken(jwtToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(PHONE_STORAGE_KEY);
    localStorage.removeItem(NAME_STORAGE_KEY);
    setIsAuthenticated(false);
    setAuthPhone("");
    setAuthName("");
    setToken(null);
  }, []);

  return { isAuthenticated, authPhone, authName, token, isLoading, login, logout };
}
