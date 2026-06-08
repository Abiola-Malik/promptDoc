import { GithubTreeItem } from "../models/github";

export async function getGithubFileBytes(
  repo: string,
  files: GithubTreeItem[],
  token: string,
): Promise<{ path: string; content: string }[]> {
  const results = await Promise.all(
    files.map(async (file) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/contents/${file.path}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch ${file.path}: ${res.status} ${res.statusText}`,
          );
        }

        const data = await res.json();

        let content = "";
        if (data?.content) {
          // github returns base64 encoded content for smaller files
          content = Buffer.from(data.content, "base64").toString("utf-8");
        } else if (data?.download_url) {
          // For files >1MB, GitHub may omit content and provide a raw download URL.
          try {
            const rawRes = await fetch(data.download_url, {
              signal: controller.signal,
            });
            if (!rawRes.ok) {
              console.error(
                `Failed to download raw file ${file.path}: ${rawRes.status} ${rawRes.statusText}`,
              );
              return {
                path: file.path,
                content: `Error fetching raw content for ${file.path}: ${rawRes.status} ${rawRes.statusText}`,
              };
            }
            content = await rawRes.text();
          } catch (error) {
            console.error(`Error downloading raw file ${file.path}:`, error);
            return {
              path: file.path,
              content: `Error fetching raw content for ${file.path}: ${error instanceof Error ? error.message : String(error)}`,
            };
          }
        } else {
          console.error(`GitHub API returned no content for ${file.path}`);
          return {
            path: file.path,
            content: `Unable to load ${file.path}: no content or download_url returned by GitHub.`,
          };
        }

        return { path: file.path, content };
      } finally {
        clearTimeout(timeoutId);
      }
    }),
  );
  return results;
}
