# lightbook.info

A Medium-style blog platform. Monorepo with two independent projects — see
their own `CLAUDE.md` for stack-specific rules; this file is just the map.

```
.
├── backend/          FastAPI + PostgreSQL API — see backend/CLAUDE.md
├── frontend/          React + Tailwind UI       — see frontend/CLAUDE.md
├── PROGRESS.md        sprint-by-sprint status — read this every session
└── docker-compose.yml  runs both together locally
```

@PROGRESS.md

## Whole-project conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- `docker-compose up` runs backend + frontend + db together for local dev
- Environment variables live in `.env` files per-service, never committed —
  see `.env.example` in each folder once they exist

## Where to look for detail

- Frontend conventions, design tokens, component structure → `frontend/CLAUDE.md`
- Backend conventions, DB schema, API structure → `backend/CLAUDE.md` (add
  when backend work starts)