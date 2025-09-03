export type Project = {
  id: string; name: string; description: string; tags: string[]; stars: number; maintainer: string;
};

export const mockProjects: Project[] = [
  { id: "1", name: "OpenBoard Core", description: "Monorepo for the OpenBoard platform — APIs, UI kit, and matching engine.", tags: ["TypeScript","Next.js","Tailwind"], stars: 128, maintainer: "openboard-devs" },
  { id: "2", name: "LensKit", description: "Computer vision utilities for document scanning and enhancement on-device.", tags: ["Swift","Vision","iOS"], stars: 412, maintainer: "vision-labs" },
  { id: "3", name: "StreamQL", description: "Streaming SQL for edge analytics with a simple JSX-style DSL.", tags: ["Rust","WASM","Edge"], stars: 986, maintainer: "compute-collective" },
  { id: "4", name: "DocuWeave", description: "AI-powered docs builder that converts READMEs into interactive tutorials.", tags: ["Python","LangChain","Docs"], stars: 233, maintainer: "docu-team" },
];
