import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

export const useAppStore = create((set, get) => ({
  apiBaseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,

  token: localStorage.getItem("dabba_token") || "",
  role: localStorage.getItem("dabba_role") || "customer",

  setAuth: ({ token, role }) => {
    if (token) localStorage.setItem("dabba_token", token);
    if (role) localStorage.setItem("dabba_role", role);
    set({ token: token || "", role: role || "customer" });
  },
  logout: () => {
    localStorage.removeItem("dabba_token");
    set({ token: "", role: "customer" });
  },

  authHeader: () => {
    const t = get().token;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
}));

