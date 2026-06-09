## Contributing

### Setup

1. Clone from repo root, open VS Code from repo root — never from a subfolder
2. Copy `.env.example` to `web/.env.local` and fill in your own keys
3. `cd web && npm install && npm run dev`

### Git rules

- Never run `git init` inside any subfolder
- Always run git commands from the repo root
- Never commit directly to `main` — always use a branch + PR
- Never commit `.env`, `.env.local`, `node_modules/`, or `.next/`

### Commit format

feat(scope): description
fix(scope): description
docs(scope): description

Scope = web | chunk-service | embed-service | rag-service | infra
