# OpenBoard — Frontend Integration Pack (Mock ⇄ API Toggle)

This pack gives you **frontend code** with **backend integrations wired** and a **runtime switch** between:

* **Mock mode** (no backend yet)
* **API mode** (hit your future backend or a proxy)

It includes:

* A **data mode cookie** + env var override
* A **toggle UI** (`DataModeSwitch`) to flip between modes at runtime
* A unified **data access layer** (`lib/datasource.ts`) used by pages/components
* Thin **API routes** that either log/mock or forward to your real backend

> Works with your existing Stage‑1 layout/components. Copy files by path.

---

## 0) Env

Create or update `.env.local`:

```
# Data source: mock | api  (default mock)
NEXT_PUBLIC_DATA_SOURCE=mock

# When in API mode, where to send requests (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Optional: to use the built-in proxy route instead of CORS on your backend
# If set to 'true', frontend calls /api/proxy/* which forwards to NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_USE_PROXY=true

# Existing from Stage 1 (if using waitlist email fallback)
RESEND_API_KEY=
WAITLIST_FORWARD_TO=
FROM_EMAIL=OpenBoard <hello@example.com>
NEXTAUTH_SECRET=... (if using auth)
```

---

## 1) Data mode utilities

**`lib/dataMode.ts`**

```ts
import { cookies } from "next/headers";

export type DataMode = "mock" | "api";

export function getEnvDefaultMode(): DataMode {
  const env = process.env.NEXT_PUBLIC_DATA_SOURCE?.toLowerCase();
  return (env === "api" ? "api" : "mock");
}

export function getDataMode(): DataMode {
  // Cookie overrides env at runtime
  const c = cookies().get("ob_datamode")?.value as DataMode | undefined;
  if (c === "api" || c === "mock") return c;
  return getEnvDefaultMode();
}

export function getApiBase(): string | null {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || null;
  return base;
}

export function useProxy(): boolean {
  return process.env.NEXT_PUBLIC_USE_PROXY === "true";
}
```

---

## 2) Client toggle (sets cookie + refreshes)

**`components/DataModeSwitch.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DataModeSwitch() {
  const router = useRouter();
  const [mode, setMode] = useState<"mock" | "api">("mock");

  useEffect(() => {
    // Try to read current mode from a data attribute set server-side
    const el = document.getElementById("__data_mode__");
    const current = el?.getAttribute("data-mode");
    if (current === "api" || current === "mock") setMode(current);
  }, []);

  async function change(next: "mock" | "api") {
    await fetch("/api/datamode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: next }) });
    setMode(next);
    router.refresh(); // RSC refresh to pick up cookie
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 py-2 text-sm">
        <span className="mr-2 text-zinc-400">Data:</span>
        <button onClick={() => change("mock")} className={`px-2 py-1 rounded ${mode === "mock" ? "bg-white/20" : "hover:bg-white/10"}`}>mock</button>
        <button onClick={() => change("api")} className={`ml-1 px-2 py-1 rounded ${mode === "api" ? "bg-white/20" : "hover:bg-white/10"}`}>api</button>
      </div>
    </div>
  );
}
```

**Add this marker in your layout to expose the current mode to the client:**
**`app/layout.tsx`** (near the end of `<body>`)

```tsx
import { getDataMode } from "@/lib/dataMode";
import { DataModeSwitch } from "@/components/DataModeSwitch";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = getDataMode();
  return (
    <html lang="en" className="dark">
      <body>
        {/* existing Providers / Navbar ... */}
        <div id="__data_mode__" data-mode={mode} />
        {children}
        <DataModeSwitch />
        {/* Footer ... */}
      </body>
    </html>
  );
}
```

---

## 3) Unified data access layer

**`lib/datasource.ts`**
(Use everywhere you need data. It auto-switches based on mode.)

```ts
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
    if (mode === "mock") return mockProjects;
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
    if (mode === "mock") return { email: "mock@openboard.dev", roles: ["user"], name: "Mock User" };
    const json = await apiFetch("/profile");
    return json.data || null;
  },
};
```

---

## 4) Thin API routes (mock ↔ forward)

### 4.1 Data mode set/get

**`app/api/datamode/route.ts`**

```ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { mode } = await req.json();
  if (mode !== "mock" && mode !== "api") {
    return NextResponse.json({ error: "invalid mode" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, mode });
  res.cookies.set("ob_datamode", mode, { path: "/", httpOnly: false, sameSite: "lax" });
  return res;
}
```

### 4.2 Proxy (optional, avoids CORS during early dev)

**`app/api/proxy/[...path]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/dataMode";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const base = getApiBase();
  if (!base) return NextResponse.json({ error: "API base not configured" }, { status: 500 });
  const url = `${base}/${params.path.join("/")}${req.nextUrl.search}`;
  const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const base = getApiBase();
  if (!base) return NextResponse.json({ error: "API base not configured" }, { status: 500 });
  const url = `${base}/${params.path.join("/")}${req.nextUrl.search}`;
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": req.headers.get("content-type") || "application/json" }, body: await req.text() });
  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}
```

### 4.3 Waitlist route (mock logs or forward)

**`app/api/waitlist/route.ts`**

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getDataMode, useProxy } from "@/lib/dataMode";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().optional(),
  about: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const mode = getDataMode();

    if (mode === "api") {
      // Forward to backend waitlist endpoint (via proxy if enabled)
      const endpoint = "/waitlist"; // your backend route
      const url = useProxy() ? `/api/proxy${endpoint}` : endpoint; // api/proxy uses NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await res.json();
      if (!res.ok) return NextResponse.json(j, { status: res.status });
      return NextResponse.json({ ok: true });
    }

    // MOCK: Email forward via Resend if available, else console log
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && process.env.WAITLIST_FORWARD_TO) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        subject: `New waitlist signup — ${data.name}`,
        to: process.env.WAITLIST_FORWARD_TO!,
        from: process.env.FROM_EMAIL || "OpenBoard <noreply@openboard.dev>",
        html: `<div><h2>Waitlist signup</h2><p><b>Name:</b> ${data.name}</p><p><b>Email:</b> ${data.email}</p><p><b>Role:</b> ${data.role ?? ""}</p><p><b>About:</b> ${data.about ?? ""}</p></div>`,
      });
    } else {
      console.log("[WAITLIST MOCK]", data);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid payload" }, { status: 400 });
  }
}
```

---

## 5) Pages wired to datasource

### 5.1 Projects (Server Component)

**`app/projects/page.tsx`**

```tsx
import { datasource } from "@/lib/datasource";
import { ProjectCard } from "@/components/ProjectCard";

export default async function ProjectsPage() {
  const projects = await datasource.listProjects();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Explore projects</h1>
          <p className="text-zinc-400 mt-1">Data mode: mock or api — use the toggle bottom-right.</p>
        </div>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  );
}
```

### 5.2 Landing waitlist form (Client Component)

**`components/WaitlistForm.tsx`**

```tsx
"use client";
import { useState } from "react";

export function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setLoading(true); setOk(null); setErr(null);
    try {
      const payload = Object.fromEntries(formData) as Record<string,string>;
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Something went wrong");
      setOk("You're on the list! We'll be in touch soon.");
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoading(false); }
  }

  return (
    <form action={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <input name="name" placeholder="Your name" required className="h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
      <input name="email" placeholder="Email" type="email" required className="h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
      <select name="role" className="h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:ring-2 focus:ring-brand-500">
        <option>Contributor</option>
        <option>Maintainer</option>
        <option>Both</option>
      </select>
      <button className="h-12 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-medium shadow-soft" disabled={loading}>{loading ? "Joining…" : "Join waitlist"}</button>
      <textarea name="about" placeholder="What do you want to build? (optional)" className="md:col-span-4 h-24 rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" />
      {ok && <p className="text-emerald-400 md:col-span-4">{ok}</p>}
      {err && <p className="text-rose-400 md:col-span-4">{err}</p>}
    </form>
  );
}
```

---

## 6) Mock data (unchanged)

**`lib/mockProjects.ts`**

```ts
export type Project = {
  id: string; name: string; description: string; tags: string[]; stars: number; maintainer: string;
};

export const mockProjects: Project[] = [
  { id: "1", name: "OpenBoard Core", description: "Monorepo for the OpenBoard platform — APIs, UI kit, and matching engine.", tags: ["TypeScript","Next.js","Tailwind"], stars: 128, maintainer: "openboard-devs" },
  { id: "2", name: "LensKit", description: "Computer vision utilities for document scanning and enhancement on-device.", tags: ["Swift","Vision","iOS"], stars: 412, maintainer: "vision-labs" },
  { id: "3", name: "StreamQL", description: "Streaming SQL for edge analytics with a simple JSX-style DSL.", tags: ["Rust","WASM","Edge"], stars: 986, maintainer: "compute-collective" },
  { id: "4", name: "DocuWeave", description: "AI-powered docs builder that converts READMEs into interactive tutorials.", tags: ["Python","LangChain","Docs"], stars: 233, maintainer: "docu-team" },
];
```

---

## 7) Optional: Project card

**`components/ProjectCard.tsx`**

```tsx
import type { Project } from "@/lib/datasource";
import { Star } from "lucide-react";
import Link from "next/link";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold"><Link href="#">{project.name}</Link></h3>
        <div className="flex items-center gap-1 text-sm text-zinc-400"><Star className="size-4" />{project.stars}</div>
      </div>
      <p className="text-zinc-300 text-sm leading-6">{project.description}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {project.tags.map((t) => <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-300">{t}</span>)}
      </div>
      <div className="text-xs text-zinc-400 mt-auto">Maintainer: <span className="text-zinc-200">{project.maintainer}</span></div>
    </article>
  );
}
```

> If you’d rather avoid `lucide-react`, replace the star with plain text or an inline SVG.

---

## 8) How your future backend should look (minimal contract)

For API mode, your backend should expose:

* `GET /projects` → `{ data: Project[] }`
* `GET /profile` → `{ data: { email: string; roles: string[]; name: string } }` (auth TBD)
* `POST /waitlist` → `{ ok: true }`

If CORS is not configured yet, keep `NEXT_PUBLIC_USE_PROXY=true` so the frontend calls `/api/proxy/*` and the proxy forwards to `NEXT_PUBLIC_API_BASE_URL`.

---

## 9) Usage

1. **Default (mock mode):** run `npm run dev` → you’ll see seed projects and waitlist works (email/log fallback).
2. **Switch to API mode at runtime:** click the **Data: mock/api** toggle (bottom-right). The cookie overrides your env.
3. **API base:** set `NEXT_PUBLIC_API_BASE_URL` to your backend (e.g., `http://localhost:8787`) and keep the proxy on while you work on CORS.

That’s it—your frontend now cleanly flips between **dummy** and **real** data with zero code changes to pages/components.
