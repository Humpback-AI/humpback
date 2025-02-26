"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { generateJWT } from "@/lib/tinybird/token";

interface TinybirdContextType {
  fetchAnalytics: <T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>
  ) => Promise<T | undefined>;
  queryKey: string;
}

const TinybirdContext = createContext<TinybirdContextType | null>(null);

export function useTinybird() {
  const context = useContext(TinybirdContext);
  if (!context) {
    throw new Error("useTinybird must be used within a TinybirdProvider");
  }
  return context;
}

interface TinybirdProviderProps {
  children: ReactNode;
}

export function TinybirdProvider({ children }: TinybirdProviderProps) {
  const [token, setToken] = useState("");

  const refreshToken = useCallback(async () => {
    const newToken = await generateJWT();
    setToken(newToken);
    return newToken;
  }, []);

  const fetchAnalytics = useCallback(
    async <T = unknown,>(
      url: string,
      params?: Record<string, string | number | boolean>
    ): Promise<T | undefined> => {
      let currentToken = token;
      if (!currentToken) {
        currentToken = await refreshToken();
      }

      // Construct URL with parameters
      const urlObj = new URL(url);
      urlObj.searchParams.append("token", currentToken);

      // Add any additional parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(urlObj.toString());

      if (response.status === 200) {
        return response.json();
      }
      if (response.status === 403) {
        const newToken = await refreshToken();
        // Retry with new token
        urlObj.searchParams.set("token", newToken);
        return fetch(urlObj.toString()).then((res) => res.json());
      }
      return undefined;
    },
    [token, refreshToken]
  );

  const value = {
    fetchAnalytics,
    queryKey: "/contexts/TinybirdContext/fetchAnalytics",
  };

  return (
    <TinybirdContext.Provider value={value}>
      {children}
    </TinybirdContext.Provider>
  );
}
