export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  updated_at: string;
  language: string | null;
  description: string | null;
};

export type GithubTreeItem = {
  path: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
};

export type GithubTree = {
  sha: string;
  tree: GithubTreeItem[];
  truncated: boolean;
};
