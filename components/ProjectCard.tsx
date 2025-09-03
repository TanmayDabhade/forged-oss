import Link from "next/link";
import type { Project } from "@/lib/datasource";

export function ProjectCard({ project }: { project: Project }) {
  const { id, name, description, tags, stars } = project;
  const href = `/projects/${id}`;

  return (
    <Link
      href={href}
      className="group block rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-900"
    >
      {/* top meta */}
      <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          {stars ?? 0}
        </span>
      </div>

      {/* title */}
      <h3 className="text-base font-medium text-neutral-900 group-hover:underline underline-offset-4">
        {name}
      </h3>

      {/* description */}
      <p className="mt-2 text-sm leading-6 text-neutral-600 line-clamp-2">
        {description}
      </p>

      {/* tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
