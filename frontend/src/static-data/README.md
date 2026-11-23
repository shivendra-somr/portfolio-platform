# static-data

All portfolio content lives here as JSON. Edit these files to change what the site shows; no component code changes needed.

| File | Drives |
|---|---|
| `profile.json` | Name, headline, summary, highlights, contact links, resume PDF path |
| `skills.json` | Skill groups (add a new `{ "category", "items" }` object to add a group) |
| `experience.json` | Work history, newest first. `endDate: null` + `current: true` = "Present" |
| `projects.json` | Project cards. `featured: true` shows it on the home page |
| `education.json` | Degrees and courses |
| `certifications.json` | Certifications and awards |
| `site.json` | Site title, SEO description, nav links |

Types for every file are in `src/types/portfolio.ts`, so a typo in a field name fails the build.
Dates use `YYYY-MM` (or `YYYY`). Empty strings for `url`/`repoUrl`/`image` hide that link.
