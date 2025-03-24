"use client";

import { useState, useEffect } from "react";

export const useAuth = () => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = localStorage.getItem("auth-store");
    if (authData) {
      setAuth(JSON.parse(authData));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("auth-store");
    setAuth(null);
  };

  return { auth, loading, logout };
};