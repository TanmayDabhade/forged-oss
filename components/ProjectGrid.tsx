"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/lib/datasource";
import { ProjectCard } from "@/components/ProjectCard";

export function ProjectsGrid({ initialProjects }: { initialProjects: Project[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    initialProjects.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [initialProjects]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return initialProjects.filter((p) => {
      const matchesQ = term
        ? p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
        : true;
      const matchesTag = active ? p.tags.includes(active) : true;
      return matchesQ && matchesTag;
    });
  }, [initialProjects, q, active]);

  // Keyboard shortcut: '/' focuses the search input (not when typing in inputs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="mt-8">
      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <label className="relative block md:w-96">
          <span className="sr-only">Search projects</span>
          <span className="pointer-events-none absolute left-3 top-0 h-full flex items-center text-neutral-500">⌕</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="h-11 w-full rounded-md border border-neutral-300 bg-white px-9 text-sm outline-none placeholder-neutral-400 focus:border-neutral-900 focus:ring-0"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </label>

        {/* Active filter summary */}
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span className="hidden sm:inline">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
            {active ? (
              <>
                {" "}&middot; tag: <span className="font-medium">{active}</span>
              </>
            ) : null}
            {q ? (
              <>
                {" "}&middot; query: <span className="font-medium">“{q}”</span>
              </>
            ) : null}
          </span>
          {(active || q) && (
            <button
              onClick={() => {
                setActive(null);
                setQ("");
                inputRef.current?.focus();
              }}
              className="rounded border border-neutral-300 px-2.5 py-1 hover:bg-neutral-100"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-800">Tags</h2>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Tag
            label="All"
            active={active === null}
            onClick={() => setActive(null)}
          />
          {allTags.map((t) => (
            <Tag
              key={t}
              label={t}
              active={active === t}
              onClick={() => setActive(active === t ? null : t)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-neutral-200 hover:border-neutral-900 transition-colors"
          >
            <ProjectCard project={p} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-md border border-neutral-200 p-6 text-sm text-neutral-600">
            No projects match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 text-neutral-800 hover:bg-neutral-100",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
