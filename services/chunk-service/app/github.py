import httpx
from app.config import settings

SUPPORTED_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java",
    ".rs", ".cpp", ".c", ".cs", ".rb", ".php", ".swift",
    ".kt", ".md", ".json", ".yaml", ".yml"
}

IGNORED_DIRS = {"node_modules", ".git", "__pycache__", ".next", "dist", "build"}

async def fetch_github_files(repo: str, branch: str, token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}

    async with httpx.AsyncClient() as client:
        # get branch sha
        branch_res = await client.get(
            f"https://api.github.com/repos/{repo}/branches/{branch}",
            headers=headers
        )
        sha = branch_res.json()["commit"]["sha"]

        # get full tree
        tree_res = await client.get(
            f"https://api.github.com/repos/{repo}/git/trees/{sha}?recursive=1",
            headers=headers
        )
        tree = tree_res.json().get("tree", [])

        # filter files
        blobs = [
            item for item in tree
            if item["type"] == "blob"
            and any(item["path"].endswith(ext) for ext in SUPPORTED_EXTENSIONS)
            and not any(part in IGNORED_DIRS for part in item["path"].split("/"))
        ]

        # fetch contents concurrently — cap at 100 files
        import asyncio
        async def fetch_file(item):
            res = await client.get(
                f"https://api.github.com/repos/{repo}/contents/{item['path']}",
                headers=headers
            )
            data = res.json()
            import base64
            content = base64.b64decode(data.get("content", "")).decode("utf-8", errors="ignore")
            return {"path": item["path"], "content": content}

        files = await asyncio.gather(*[fetch_file(b) for b in blobs[:100]])
        return list(files)