# 90s Homestay CMS backend

JavaScript Express + PostgreSQL + Prisma API for the existing React/Vite landing page. The React app includes the admin CMS and public API integration. Staff edits appear on the public website after it reloads; there is no booking, availability or payment flow. See the repository README for frontend setup and end-to-end tests.

## Local setup

Prerequisites: Node.js 22.12+ with npm, PostgreSQL 15+ running, and an empty development database owned by your PostgreSQL user. For `migrate dev`, the database user needs permission to create the shadow database, or configure a separate shadow database using Prisma's documented configuration.

From the repository root:

```sh
npm ci
npm run build
cd server
npm ci
cp .env.example .env
```

Edit `server/.env` locally (it is ignored by Git):

- `DATABASE_URL`: PostgreSQL connection URL, for example `postgresql://USER:PASSWORD@localhost:5432/homestay?schema=public`.
- `JWT_SECRET`: random secret containing at least 32 bytes; use a secure generator and keep the value private.
- `PORT`: API port, default `3000`.
- `FRONTEND_URL`: exact allowed browser origin, default `http://localhost:5173` (no trailing slash). Set the deployed HTTPS frontend origin in production.
- `SEED_ADMIN_EMAIL`: initial admin email, normalized to lowercase.
- `SEED_ADMIN_PASSWORD`: initial admin password, at least 12 characters and at most 72 UTF-8 bytes (bcrypt limit).

Then:

```sh
npx prisma validate
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

From another shell:

```sh
curl http://localhost:3000/api/health
```

Expected response: `{"status":"ok"}`. The server connects to PostgreSQL before listening. For production, generate the client, run `npm run migrate:deploy`, then `npm start`; do not run development migrations against production. Apply migrations with a suitable database migration account. Configure HTTPS and rate limiting appropriately at your deployment boundary; the included login limiter is process-local.

## Frontend mapping and seed

The audited frontend uses `rooms` (`id`, `name`, `count`, `view`, `price`, `guests`, `beds`, `q`, `description`), `HERO_SLIDES` (`id`, `image`, `eyebrow`, `title`, `description`, CTA and badge), and `NEWS_DATA` (`id`, `category`, `title`, `excerpt`, `image`, `publishedAt`, `href`). Rooms map `guests` → `maxGuests` and `view` → `viewType`; `count` is display metadata only, never inventory or availability. `q` preserves the existing collage quadrant. Images map to `imageUrl`; IDs are preserved and room/news slugs initially use those IDs. The public adapters in `src/api/adapters.js` map these fields back for the existing components, preserving their layouts and consultation interactions.

`prisma/frontend-data.json` is a snapshot of the original frontend demo data; `src/data/demoFixtures.js` retains the original fixtures only for seed fidelity tests. `seed-data.js` adds the existing restaurant dishes/subtitles, café descriptions, demo offers and about-section content from the inspected components. Cards retain `dishes` and `q` so the admin UI can edit this content without a page builder. Content sections are fixed to `restaurant`, `cafe`, `promotion`, `experience`. The empty promotion images reflect the existing text-only offers.

The seed inserts 4 rooms, 3 slides, 16 explicitly labelled sample news articles (8 per category), 10 content cards and 7 settings. Placeholder contact values remain placeholders. News `content` uses the existing excerpt because no full article exists. `publishedAt` retains the sample frontend dates at midnight UTC. Published sample news is intentionally visible to match the prototype; staff should replace or unpublish it before launch.

`SiteConfig` is key/value storage exposed as a JSON object. `zalo` → `zaloUrl`, `facebook` → `facebookUrl`, `location` → `address`, `map` → `mapUrl`; site title/description come from the actual HTML. No precise street address or official contacts are invented.

Seeding is transactional and repeatable: it inserts missing records and preserves existing staff changes and admin passwords. It does not reset an existing password. Running it with another email intentionally creates another admin. Seed credentials are required from the environment, never embedded in source; passwords are bcrypt hashes with cost 12. No API exposes the Admin model or password hash.

## Public APIs

- `GET /api/health`
- `GET /api/rooms`, `GET /api/rooms/:slug`
- `GET /api/hero-slides`
- `GET /api/news?page=1&limit=6&category=90s`, `GET /api/news/:slug`
- `GET /api/content/:section`
- `GET /api/site-config`

Lists return arrays except news, which returns `{data, pagination:{page,limit,total,totalPages}}`. News category is optional; valid values are `90s` (Về 90s) and `tam-dao` (Về Tam Đảo). Page must be a positive integer up to 1,000,000; limit 1–50, default 6. Out-of-range pages return an empty list. Only active rooms/slides/cards and published news are public. News sorts by publication date descending, then ID; other lists sort by `sortOrder` then ID. `isPublished` controls visibility explicitly; publication dates are descriptive rather than a scheduling system.

## Admin APIs

`POST /api/admin/login` accepts `{email,password}` and returns `{token,admin:{id,email,name}}`. Use `Authorization: Bearer TOKEN` on every other admin endpoint. JWTs expire after two hours, use HS256 and verify issuer, audience and the continued existence of the admin account. Failed logins return the same 401 response for absent users and wrong passwords; login is rate limited to 20 attempts per IP per 15 minutes.

For each of `rooms`, `hero-slides`, `news`, `content`:

- `GET /api/admin/RESOURCE` and `GET /api/admin/RESOURCE/:id`
- `POST /api/admin/RESOURCE`
- `PATCH /api/admin/RESOURCE/:id`
- `DELETE /api/admin/RESOURCE/:id`

`GET /api/admin/site-config` and `PATCH /api/admin/site-config` read/update settings. PATCH accepts an object of known setting keys and is atomic.

Example minimum create bodies:

```json
{ "name": "Room title", "slug": "room-title", "price": 850000, "maxGuests": 2 }
```

```json
{ "title": "Hero title", "ctaText": "Nhận tư vấn", "ctaTarget": "#lien-he" }
```

```json
{
  "title": "News title",
  "slug": "news-title",
  "category": "90s",
  "isPublished": false
}
```

```json
{ "section": "cafe", "title": "Cafe card" }
```

Room view types are `valley`/`town`; count and sort order are nonnegative integers, q is 0–3, and price is an integer amount in VND (no floating-point currency). Update existing image URLs directly; no upload/storage API is provided yet. URL fields accept HTTP(S), current `assets/...` paths, anchors and existing placeholders, rejecting executable schemes. Content strings are plain text; the admin/public UI renders stored content as plain text rather than trusted HTML. Unknown/protected fields, invalid types, empty objects and invalid dates are rejected before Prisma. IDs and timestamps are generated on create and cannot be supplied through CRUD bodies.

Errors use `{error:"message"}` with 400 validation/malformed JSON, 401 authentication, 403 disallowed CORS origin, 404 missing records, 409 duplicate slug, 413 oversized body, 429 login rate limit, and generic 500 server failures. Stack traces, credentials and database details are never returned.

The backend pins Prisma 6.19.3 and uses a scoped `deepmerge-ts` 8.0.2 override for `@prisma/config` to address its recursive-merge security advisory. Prisma validation, generation and migrations are verified with that override. Login limiting uses express-rate-limit 8.7.1.

## Tests

```sh
npm test
```

Runs the validation/security tests; the PostgreSQL integration suite is explicitly skipped unless enabled. To run the full suite, use a dedicated empty test database (never production), set `DATABASE_URL`, `JWT_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, apply migrations, seed, then:

```sh
npx prisma migrate deploy
npm run seed
RUN_DB_TESTS=1 npm test
```

The database tests check seed fidelity, hashing, login success/failure/expiry, protected routes, CRUD for all four resources, inactive/unpublished visibility, duplicate slugs, validation, ordering, both news categories/pagination and atomic site settings. Temporary CRUD records are cleaned up and the changed site title is restored. Seed assertions expect a database containing only the initial seed; use a fresh test database per run when changing seed content. Test credentials must stay outside Git.
