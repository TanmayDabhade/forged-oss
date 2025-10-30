import { cookies } from "next/headers";

export type DataMode = "mock" | "api";

export function getEnvDefaultMode(): DataMode {
  const env = process.env.NEXT_PUBLIC_DATA_SOURCE?.toLowerCase();
  return (env === "api" ? "api" : "mock");
}

export async function getDataMode(): Promise<DataMode> {
  // Cookie overrides env at runtime
  const cookieStore = await cookies();
  const c = cookieStore.get("ob_datamode")?.value as DataMode | undefined;
  if (c === "api" || c === "mock") return c;
  return getEnvDefaultMode();
}

export function getApiBase(): string | null {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || null;
  return base;
}

export function isProxyEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_PROXY === "true";
}

// Backwards-compatible alias (avoid breaking imports in external forks)
export { isProxyEnabled as useProxy };
