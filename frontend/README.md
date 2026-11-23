# Frontend (React + TypeScript + Vite)

```bash
npm install
npm run dev      # http://localhost:5173, /api is proxied to http://localhost:8080
npm run build
```

- **Portfolio content** (profile, skills, experience, projects, education, certifications) is JSON in
  [`src/static-data/`](src/static-data/README.md). Edit those files; no component changes needed.
- **Blog, comments, contact** come from the Spring Boot API (`src/lib/api.ts`).
- Admin panel: `/admin` (log in with the backend's `ADMIN_USERNAME` / `ADMIN_PASSWORD`).
- Set `VITE_API_URL` when the API is on another origin (e.g. Vercel frontend + Render backend).
