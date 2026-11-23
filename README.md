# Shivendra Kumar · Portfolio Platform

A portfolio and blog with a real Java backend.

```
shivendra_project/
├── backend/    Spring Boot 4 (Java 17): REST API, JWT auth, PostgreSQL, Redis, Flyway
├── frontend/   React 19 + TypeScript + Vite
│   └── src/static-data/   ← all portfolio content as JSON (profile, skills, experience, projects…)
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## What's built

**Frontend**: Home, Projects, Blog (search, tags, pagination, reading time, RSS link), Blog post (Markdown +
syntax highlighting, likes, nested comments), Resume (rendered from JSON + PDF download), Contact,
"Built with" (architecture + design decisions), dark/light mode, per-page `<title>`/meta.
Admin panel at `/admin`: post list with views/likes, Markdown editor with preview, drafts/publish, comment moderation.

**Backend**

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` (visitor), `GET /api/auth/me` |
| Posts (public) | `GET /api/posts?q=&tag=&page=`, `GET /api/posts/{slug}`, `/popular`, `/tags`, `POST /api/posts/{slug}/like` |
| Comments | `GET/POST /api/posts/{slug}/comments` (nested, moderated, rate-limited, honeypot) |
| Contact | `POST /api/contact` (validated, rate-limited, honeypot, email notification) |
| Admin (ROLE_ADMIN) | `/api/admin/posts` CRUD, `/api/admin/comments` moderation, `/api/admin/contact` inbox |
| Feed / docs | `GET /api/feed.xml`, Swagger UI at `/swagger-ui.html` |

PostgreSQL full-text search (weighted generated `tsvector` + GIN index), Redis caching for single/popular posts
and tags, Flyway migrations with `ddl-auto=validate`, Testcontainers integration tests.

## Run it

### Everything in Docker

```bash
cp .env.example .env   # then set JWT_SECRET and ADMIN_PASSWORD
docker compose up --build
```

- Site: http://localhost:3000 · Admin: http://localhost:3000/admin
- API docs: http://localhost:8080/swagger-ui.html
- Caught emails (Mailpit): http://localhost:8025

### Local dev

```bash
docker compose up -d postgres redis mailpit
cd backend && ADMIN_PASSWORD=devpass ./mvnw spring-boot:run
cd frontend && npm install && npm run dev        # http://localhost:5173
```

### Tests

```bash
cd backend && ./mvnw verify      # unit + Testcontainers (needs Docker)
cd frontend && npm run build
```

## Editing portfolio content

Everything on Home / Projects / Resume comes from `frontend/src/static-data/*.json`.
See [frontend/src/static-data/README.md](frontend/src/static-data/README.md).

## Roadmap

- [ ] Analytics: page-view tracking + charts in admin
- [ ] Newsletter: subscribers + weekly digest via `@Scheduled` and Spring Mail
- [ ] GitHub integration: pull repos/pinned projects via GitHub API, cached in Redis
- [ ] Image upload for posts (S3 or local storage)
- [ ] Frontend tests (Vitest + React Testing Library)
- [ ] Deploy: frontend on Vercel/Netlify, backend + Postgres on Render/Railway
- [ ] Blog posts about how this was built (e.g. "How I designed JWT auth in Spring Boot")
