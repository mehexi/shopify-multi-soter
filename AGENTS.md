# AGENTS.md

## TL;DR

- **No tests, no linter** — `npm test`/`npm run lint` will fail
- **Storage**: sync `fs.readFileSync/writeFileSync` to JSON files (`store-tokens.json`, `store-apps.json`)
- **Manual tokens** must start with `shpat_` (validated in `storeController.js:46`)
- **OAuth** uses per-store creds from `store-apps.json`, falls back to `.env` defaults
- **Theme deletion** (`apiController.js:130`) is an elaborate workaround: creates temp theme, publishes it as main, deletes target, cleans up

## Two projects in this repo

| Path | Stack | Entrypoint |
|------|-------|------------|
| `/` root | Express 4 + EJS (MVC) | `server.js` |
| `dashboard/` | Next.js 16 + React 19 + shadcn | `dashboard/` (separate sub-project) |

The `dashboard/` subdirectory is a standalone Next.js 16 app. Read `dashboard/AGENTS.md` before editing it — Next.js 16 has breaking changes vs your training data.

## Key commands

```bash
npm run dev    # nodemon server.js
npm start      # node server.js
```

No Tailwind build step exists in root. `postcss.config.js` and `tailwind.config.js` exist but `public/css/style.css` is hand-written CSS. The `dashboard/` sub-project handles its own Tailwind v4 build.

## Architecture quirks

- **Multi-store**: endpoints accept `?store=all` or `?store=store.myshopify.com` (`apiController.js`)
- **`ShopifyAPI.call()`** hits `https://${shop}/admin/api/${apiVersion}${endpoint}` using the REST Admin API
- **`ShopifyAPI.multiStoreCall()`** runs sequentially (no Promise.all) — can be slow with many stores
- **No sessions/auth middleware** — anyone with access to the server can manage stores
- **ngrok** is a dependency (`package.json`) for local HTTPS tunneling during OAuth
- **`REDIRECT_URI`** in `.env.example` points to an ngrok URL — must match exactly what's configured in Shopify Partners

## Routes summary

| Method | Path | Handler |
|--------|------|---------|
| GET | `/` | Dashboard |
| GET | `/install?shop=X` | OAuth start (`oauthController.js`) |
| GET | `/auth?code=X&shop=X` | OAuth callback |
| GET/POST/DELETE | `/api/*` | REST API (`apiController.js`) |
| POST | `/add-app`, `/remove-app`, `/add-manual-token`, `/remove-store` | Store management (`storeController.js`) |

## If something is unclear

Check existing instruction files: `CLAUDE.md`, `dashboard/AGENTS.md`.
