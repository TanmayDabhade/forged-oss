import { getDataMode, getApiBase, useProxy } from "@/lib/dataMode";
import { mockProjects } from "@/lib/mockProjects";

export type Project = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  stars: number;
  maintainer: string;
};

async function apiFetch(path: string, init?: RequestInit) {
  const base = getApiBase();
  if (!base) throw new Error("API base URL not set");
  if (useProxy()) {
    // call our proxy route to avoid CORS
    const url = `/api/proxy${path.startsWith("/") ? path : "/" + path}`;
    const res = await fetch(url, { ...init, cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  const url = `${base}${path.startsWith("/") ? path : "/" + path}`;
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const datasource = {
  async listProjects(): Promise<Project[]> {
    const mode = getDataMode();
    if (await mode === "mock") return mockProjects;
    const json = await apiFetch("/projects");
    return json.data || [];
  },

  async submitWaitlist(input: { name: string; email: string; role?: string; about?: string }) {
    // Always hit our internal route; it decides mock vs forward
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Waitlist failed");
    return j;
  },

  async getProfile(): Promise<{ email: string; roles: string[]; name: string } | null> {
    const mode = getDataMode();
    if (await mode === "mock") return { email: "mock@openboard.dev", roles: ["user"], name: "Mock User" };
    const json = await apiFetch("/profile");
    return json.data || null;
  },
};
