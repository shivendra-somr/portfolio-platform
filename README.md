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

## Deploy (free tier)

| Piece | Where | Config in repo |
|---|---|---|
| Frontend | Netlify, Vercel **or** Cloudflare Pages | `netlify.toml` · `frontend/vercel.json` · `frontend/functions/` + `frontend/public/_routes.json` |
| Backend | Render (Docker, free) | `render.yaml`, `backend/Dockerfile` |
| PostgreSQL | [Neon](https://neon.com) free plan (Render's free Postgres expires after 30 days) | — |
| Redis | Optional: [Upstash](https://upstash.com) free, or none (`CACHE_TYPE=simple`) | — |

The frontend host **proxies `/api/*` to the backend**, so the browser only talks to one origin:
no `VITE_API_URL`, no CORS issues, and the RSS/Swagger links work.

### 1. Database: Neon
Create a project and note host, database, user and password.
`DB_URL` = `jdbc:postgresql://<host>/<database>?sslmode=require`

### 2. Backend: Render
1. **New → Blueprint** → select this repo (reads `render.yaml`), or **New → Web Service** with
   Root Directory `backend`, runtime Docker, health check `/actuator/health`.
2. Fill in the env vars it asks for: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `ADMIN_USERNAME`,
   `ADMIN_PASSWORD`, `APP_SITE_URL` and `CORS_ORIGINS` (both = your frontend URL).
   `JWT_SECRET` is generated for you.
3. Check `https://<service>.onrender.com/actuator/health` → `{"status":"UP"}`.

Free instances sleep after 15 min idle and take ~1 min to wake. An uptime pinger
(UptimeRobot, Uptime Kuma) hitting `/actuator/health` every 10 min keeps it warm.

**Using Upstash Redis instead of the in-memory cache:** set `CACHE_TYPE=redis`, `REDIS_HOST`,
`REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_SSL=true`, `REDIS_HEALTH_ENABLED=true`.

### 3. Frontend
Replace `YOUR-BACKEND` with your Render service name in the file for your host, and set
`siteUrl` in `frontend/src/static-data/site.json` to your real URL.

- **Netlify:** import the repo. `netlify.toml` sets base dir, build command and redirects.
- **Vercel:** import the repo, set Root Directory to `frontend`. `vercel.json` handles rewrites.
- **Cloudflare Pages:** connect the repo, root directory `frontend`, build `npm run build`,
  output `dist`, and add env var `BACKEND_URL=https://<service>.onrender.com`.
  (No file edit needed; the Function in `frontend/functions/` reads that variable.)

### Backend environment variables

| Variable | Default | Notes |
|---|---|---|
| `PORT` | 8080 | Set automatically by Render |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | local docker | |
| `DB_POOL_SIZE` | 5 | Keep small on free Postgres |
| `JWT_SECRET` | dev value | **Required** in prod, 32+ chars |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | admin / none | Admin is created on first start only |
| `CACHE_TYPE` | redis | `simple` = in-memory, no Redis |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_SSL` | localhost:6379 | |
| `REDIS_HEALTH_ENABLED` | true | Set `false` when not using Redis |
| `CORS_ORIGINS`, `APP_SITE_URL` | localhost:5173 | Your frontend URL |
| `MAIL_ENABLED`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `CONTACT_NOTIFY_TO` | off | Any SMTP provider |

## Editing portfolio content

Everything on Home / Projects / Resume comes from `frontend/src/static-data/*.json`.
See [frontend/src/static-data/README.md](frontend/src/static-data/README.md).

## Roadmap

- [ ] Analytics: page-view tracking + charts in admin
- [ ] Newsletter: subscribers + weekly digest via `@Scheduled` and Spring Mail
- [ ] GitHub integration: pull repos/pinned projects via GitHub API, cached in Redis
- [ ] Image upload for posts (S3 or local storage)
- [ ] Frontend tests (Vitest + React Testing Library)
- [ ] Blog posts about how this was built (e.g. "How I designed JWT auth in Spring Boot")
