import type { ApiResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.kementan.brmprb.site";

function getToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("token");
}

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, opts: FetchOptions = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts.auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;
  return json;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "POST", body, auth }),
  patch: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "PATCH", body, auth }),
  delete: <T>(path: string, auth = false) => request<T>(path, { method: "DELETE", auth }),
  setToken: (token: string) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("token", token);
    }
  },
  clearToken: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("token");
    }
  },
  baseUrl: API_BASE,
};
