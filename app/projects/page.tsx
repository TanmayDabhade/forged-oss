"use client";
import React from "react";

// --- Types ---
export type Project = {
  id: string;
  title: string;
  tagline: string;
  tags: string[];
  stars?: number;
  issues?: number;
  lookingFor?: string[]; // roles/skills
  repo?: string;
  owner?: string;
  updatedAt?: string; // ISO
};

// --- Dummy Data ---
const DUMMY_PROJECTS: Project[] = [
  {
    id: "ob-1",
    title: "Realtime Chat SDK",
    tagline: "Lightweight WebSocket layer for RN & web",
    tags: ["TypeScript", "WebSocket", "React Native"],
    stars: 412,
    issues: 12,
    lookingFor: ["RN dev", "DX writer"],
    repo: "https://github.com/openboard/realtime-chat",
    owner: "@dev-aria",
    updatedAt: "2025-08-22T12:00:00.000Z",
  },
  {
    id: "ob-2",
    title: "EcoRoute",
    tagline: "Green routing plugin for OpenStreetMap",
    tags: ["Python", "OSM", "Routing"],
    stars: 1587,
    issues: 7,
    lookingFor: ["ML eng", "Docs"],
    repo: "https://github.com/openboard/ecoroute",
    owner: "@samir",
    updatedAt: "2025-08-11T10:00:00.000Z",
  },
  {
    id: "ob-3",
    title: "PixieUI",
    tagline: "Tiny headless UI for solid, svelte, react",
    tags: ["TypeScript", "UI", "Accessibility"],
    stars: 231,
    issues: 3,
    lookingFor: ["A11y reviewer"],
    repo: "https://github.com/openboard/pixieui",
    owner: "@lin",
    updatedAt: "2025-07-30T17:30:00.000Z",
  },
  {
    id: "ob-4",
    title: "DataFrame.rs",
    tagline: "Rust-first DataFrame with Arrow backend",
    tags: ["Rust", "Arrow", "Data"],
    stars: 3204,
    issues: 21,
    lookingFor: ["Rust dev", "Benchmarks"],
    repo: "https://github.com/openboard/dataframe-rs",
    owner: "@mira",
    updatedAt: "2025-08-25T08:15:00.000Z",
  },
];

// --- Helpers ---
function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Safely determine initial mode without assuming Node's `process` exists in the browser.
function getInitialMode(): "dummy" | "live" {
  // 1) Optional: allow an attribute on <html data-openboard-mode="live"> to control default
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-openboard-mode");
    if (attr === "live" || attr === "dummy") return attr;
  }
  // 2) Try NEXT_PUBLIC env var if Next.js inlined it at build time
  const useDummyEnv =
    typeof process !== "undefined" &&
    (process as any).env &&
    (process as any).env.NEXT_PUBLIC_USE_DUMMY;
  if (useDummyEnv === "false") return "live";
  // 3) Fallback to demo data
  return "dummy";
}

// --- Page ---
export default function ProjectsPage() {
  const [mode, setMode] = React.useState<"dummy" | "live">(getInitialMode());
  const [q, setQ] = React.useState("");
  const [activeTags, setActiveTags] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<"recent" | "stars" | "issues">("recent");
  const [projects, setProjects] = React.useState<Project[]>(DUMMY_PROJECTS);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    (mode === "dummy" ? DUMMY_PROJECTS : projects).forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [mode, projects]);

  React.useEffect(() => {
    if (mode === "live") {
      setLoading(true);
      setError(null);
      fetch("/api/projects")
        .then(async (r) => {
          if (!r.ok) throw new Error(`API ${r.status}`);
          const data = (await r.json()) as Project[];
          setProjects(data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setProjects(DUMMY_PROJECTS);
    }
  }, [mode]);

  const filtered = React.useMemo(() => {
    let list = [...projects];
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.tagline.toLowerCase().includes(needle) ||
          p.tags.some((t) => t.toLowerCase().includes(needle))
      );
    }
    if (activeTags.length) {
      list = list.filter((p) => activeTags.every((t) => p.tags.includes(t)));
    }
    list.sort((a, b) => {
      if (sort === "stars") return (b.stars ?? 0) - (a.stars ?? 0);
      if (sort === "issues") return (b.issues ?? 0) - (a.issues ?? 0);
      // recent
      return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
    });
    return list;
  }, [projects, q, activeTags, sort]);

  function toggleTag(tag: string) {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  // --- Lightweight self-tests (run once in the browser console) ---
  React.useEffect(() => {
    // Always add some tests; they run silently and won't affect UI
    try {
      runSelfTests();
    } catch (err) {
      // keep UI resilient even if tests fail
      console.warn("Self-tests failed:", err);
    }
  }, []);

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Top border accent */}
      <div className="h-1 w-full bg-black" />

      {/* Heading */}
      <section className="relative mx-auto max-w-7xl px-4 pb-6 pt-10">
        <div className="absolute inset-x-4 -z-10 top-6 rounded-3xl border border-black/10" />
        <div className="grid gap-3">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Explore projects</h1>
          <p className="max-w-2xl text-sm text-black/70">Use search, tags, and sorting to find the right fit. Toggle between demo (dummy) data and your API.</p>
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 items-center gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <div className="flex items-center gap-2 rounded-xl border border-black/20 px-3">
              <IconSearch />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, stack, or tag"
                className="h-11 w-full bg-transparent outline-none placeholder:text-black/40"
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="h-11 w-full rounded-xl border border-black/20 bg-white px-3 text-sm"
              aria-label="Sort"
            >
              <option value="recent">Sort: Recent</option>
              <option value="stars">Sort: Stars</option>
              <option value="issues">Sort: Issues</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <button
              onClick={() => {
                setQ("");
                setActiveTags([]);
                setSort("recent");
              }}
              className="h-11 w-full rounded-xl border border-black px-3 text-sm font-semibold hover:bg-black hover:text-white"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Tag cloud */}
        <div className="mt-4 flex flex-wrap gap-2">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium " +
                (activeTags.includes(t)
                  ? "border-black bg-black text-white"
                  : "border-black/25 text-black hover:border-black hover:bg-white")
              }
            >
              {t}
            </button>
          ))}
          {!allTags.length && (
            <span className="text-xs text-black/60">No tags available.</span>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        {loading ? (
          <div className="rounded-3xl border border-black/15 p-6 text-sm">Loading projects…</div>
        ) : error ? (
          <div className="rounded-3xl border border-black/15 p-6 text-sm text-red-700">Failed to load: {error}</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} p={p} />)
            )}
            {!filtered.length && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="rounded-3xl border border-black/15 p-6 text-sm">No matching projects. Try clearing filters.</div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span className="text-sm">© {new Date().getFullYear()} OpenBoard</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a className="hover:opacity-70" href="#">Privacy</a>
            <a className="hover:opacity-70" href="#">Terms</a>
            <a className="hover:opacity-70" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}



function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="group rounded-3xl border border-black/15 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_#000]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
          <p className="mt-1 text-sm text-black/70">{p.tagline}</p>
        </div>
        <div className="text-right text-xs text-black/60">{timeAgo(p.updatedAt)}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <span key={t} className="rounded-full border border-black/20 px-2.5 py-0.5 text-[11px] font-medium">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-black/70">
        {typeof p.stars === "number" && (
          <span className="inline-flex items-center gap-1"><IconStar /> {p.stars}</span>
        )}
        {typeof p.issues === "number" && (
          <span className="inline-flex items-center gap-1"><IconIssue /> {p.issues} issues</span>
        )}
        {p.owner && <span className="ml-auto">Owner: {p.owner}</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {p.lookingFor?.map((r) => (
          <span key={r} className="rounded-full border border-black px-2.5 py-0.5 text-[11px] font-semibold">{r}</span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <a
          href={p.repo ?? "#"}
          className="rounded-full border border-black px-4 py-2 text-sm font-semibold hover:bg-black hover:text-white"
        >
          View repo
        </a>
        <button className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition group-hover:translate-y-0.5 active:translate-y-1">
          Request to join
        </button>
      </div>
    </article>
  );
}

// --- Icons ---
function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" className="fill-black" />
      <path d="M8 8h8v2H8zM8 12h8v2H8zM8 16h5v2H8z" className="fill-white" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="black" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 3l2.6 5.4L20 9.5l-4 3.9.9 5.6-4.9-2.7-4.9 2.7.9-5.6-4-3.9 5.4-1.1L12 3z" fill="black" />
    </svg>
  );
}

function IconIssue() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="2" />
      <path d="M12 7v6" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.2" fill="black" />
    </svg>
  );
}

// --- Self-test helpers ---
function runSelfTests() {
  // Test 1: timeAgo should show minutes for a fresh timestamp
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  console.assert(/m ago$/.test(timeAgo(thirtyMinAgo)), "timeAgo minutes test failed");

  // Test 2: search should match by title/tagline/tags (replicate the filtering logic on DUMMY_PROJECTS)
  const needle = "rust";
  const searchRes = DUMMY_PROJECTS.filter(
    (p) =>
      p.title.toLowerCase().includes(needle) ||
      p.tagline.toLowerCase().includes(needle) ||
      p.tags.some((t) => t.toLowerCase().includes(needle))
  );
  console.assert(searchRes.some((p) => p.title === "DataFrame.rs"), "search filter test failed");

  // Test 3: sort by stars brings the highest first
  const starsSorted = [...DUMMY_PROJECTS].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
  console.assert(starsSorted[0].title === "DataFrame.rs", "stars sort test failed");
}
