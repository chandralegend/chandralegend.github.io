import { projects, type Project } from "./content";

/**
 * Refreshes star counts from the GitHub API at build time.
 * Falls back to the numbers in content.ts when offline or rate-limited.
 */
export async function getProjects(): Promise<Project[]> {
  const token = process.env.GITHUB_TOKEN;
  return Promise.all(
    projects.map(async (project) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${project.repo}`, {
          headers: {
            Accept: "application/vnd.github+json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "force-cache",
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return project;
        const data = (await res.json()) as { stargazers_count?: number };
        return { ...project, stars: data.stargazers_count ?? project.stars };
      } catch {
        return project;
      }
    }),
  );
}
