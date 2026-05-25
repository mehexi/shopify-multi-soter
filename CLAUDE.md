# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Shopify Multi-Store Manager** - an Express.js web application that allows managing multiple Shopify stores with OAuth authentication. The app supports both OAuth-based store connections and manual token setup for collaborators.

**Tech Stack:**
- Node.js + Express 4.x
- EJS templating engine
- Axios for HTTP requests
- No database (JSON file-based storage)
- Shopify Admin API integration

## Architecture

**Pattern:** MVC (Model-View-Controller) with a modular route structure

**Key Components:**

1. **server.js** - Application entry point, sets up Express middleware and routes
2. **config/config.js** - Application configuration (port, API version, scopes, redirect URI)
3. **models/Storage.js** - File-based storage layer for tokens and app credentials (JSON files)
4. **utils/shopifyAPI.js** - Shopify API wrapper with `call()` and `multiStoreCall()` methods
5. **controllers/** - Business logic layer:
   - `dashboardController.js` - Renders main dashboard
   - `oauthController.js` - Handles OAuth install and callback flows
   - `storeController.js` - App and token management (POST endpoints)
   - `apiController.js` - Shopify data operations (products, orders, shop info, themes)
6. **routes/** - Express routers mapping URLs to controller methods:
   - `index.js` - `/` (dashboard)
   - `oauth.js` - `/install` and `/auth` routes
   - `api.js` - REST API endpoints under `/api`
   - `store.js` - Management POST endpoints under `/`
7. **views/** - EJS templates with partials in `views/partials/`
8. **public/** - Static assets (CSS, JavaScript)

**Data Flow:**
- Store tokens → `store-tokens.json` (key: shop domain, value: access token)
- App credentials → `store-apps.json` (key: shop domain, value: {clientId, clientSecret})
- Tokens and apps can be per-store or use default `.env` credentials

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Start production server
npm start
```

**Default:** Server runs on http://localhost:3000 (configurable via PORT env var)

## Environment Configuration

Create a `.env` file (see `.env.example`). Required variables:

```env
PORT=3000
REDIRECT_URI=http://localhost:3000/auth
API_VERSION=2024-01
SCOPES=read_products,write_products,read_orders,write_orders
SHOPIFY_CLIENT_ID=your_client_id  # Optional: default app credentials
SHOPIFY_CLIENT_SECRET=your_client_secret  # Optional: default app credentials
```

## Testing & Quality

**No testing framework is currently configured.** If adding tests:
- Consider using Jest or Mocha/Chai
- Test controllers and utility functions
- Mock Storage and Shopify API calls

**No linting/prettier configured.** If adding:
- Standard ESLint config for Node.js
- Prettier for consistent formatting

## Important Implementation Notes

**Storage System:**
- `Storage.js` uses synchronous file operations (fs.readFileSync/writeFileSync)
- All methods are static; no instantiation needed
- Data files: `store-tokens.json` and `store-apps.json` (auto-created)
- Token format for manual setup: must start with `shpat_` (private app tokens)

**OAuth Flow:**
1. `/install?shop=store.myshopify.com` → validates shop, builds authorization URL, redirects to Shopify
2. User authorizes → Shopify redirects to `/auth?code=X&shop=X`
3. Callback exchanges code for token → stores in `store-tokens.json`
4. Supports per-store app credentials (from `store-apps.json`) or defaults from `.env`

**Multi-Store Operations:**
- `ShopifyAPI.multiStoreCall(stores, endpoint)` loops through all connected stores
- Results object: `{ shop1: {success: true, data: {...}}, shop2: {success: false, error: '...'} }`
- API endpoints accept `store=all` query param or `store=<domain>` for single store

**View Rendering:**
- Dashboard uses EJS partials: `views/partials/*.ejs` (apps-tab, connect-tab, dashboard-tab, delete-tab, manage-tab, manual-tab, product-tab, tabs)
- DashboardController passes `stores`, `apps`, `storeCount`, `appCount` to view
- Partial files are included dynamically in `dashboard.ejs` based on active tab

## Security Considerations

- Access tokens stored in plain JSON files - ensure files are in `.gitignore`
- Only HTTPS should be used in production (set REDIRECT_URI accordingly)
- OAuth state validation is not implemented (CSRF protection)
- Token format validation for manual setup (checks `shpat_` prefix)
- Never commit `.env`, `store-tokens.json`, or `store-apps.json`

## Common Development Tasks

**Adding a new API endpoint:**
1. Add route in `routes/api.js` (or other route file)
2. Implement method in `controllers/apiController.js`
3. Use `ShopifyAPI.call(shop, endpoint)` for single store or `ShopifyAPI.multiStoreCall(stores, endpoint)` for all stores
4. Update dashboard view if needed (add button/UI in appropriate partial)

**Modifying OAuth scopes:**
- Update `SCOPES` in `.env` or `config/config.js` default
- Must re-authorize stores for scope changes to take effect

**Adding a new controller:**
- Create file in `controllers/`
- Export class with static methods
- Create/update route file to map endpoints
- Import and use `Storage` and `ShopifyAPI` as needed

**Changing storage backend:**
- All persistence logic is in `models/Storage.js`
- Currently synchronous file I/O; could be replaced with database
- Keep the same static method signatures

## File Structure Reference

```
C:\Users\Kamal\projects\shopify-multi-store/
├── config/
│   └── config.js           # Application configuration
├── controllers/
│   ├── apiController.js    # Shopify API operations
│   ├── dashboardController.js
│   ├── oauthController.js  # OAuth flow handling
│   └── storeController.js  # Store management
├── models/
│   └── Storage.js          # Token & app storage (JSON files)
├── routes/
│   ├── api.js              # API routes (products, orders, shop-info, themes)
│   ├── index.js            # Main routes
│   ├── oauth.js            # OAuth routes
│   └── store.js            # Store management routes
├── utils/
│   └── shopifyAPI.js       # Shopify API wrapper
├── views/
│   ├── partials/           # EJS partials for dashboard tabs
│   ├── dashboard.ejs       # Main dashboard layout
│   ├── error.ejs           # Error page
│   ├── oauth-error.ejs     # OAuth error page
│   └── success.ejs         # OAuth success page
├── public/
│   ├── css/style.css       # Styles
│   └── js/app.js           # Frontend JavaScript
├── store-tokens.json       # Runtime: access tokens (gitignored)
├── store-apps.json         # Runtime: app credentials (gitignored)
├── .env                    # Environment variables (gitignored)
├── .env.example            # Example env file
├── server.js               # Entry point
├── package.json            # Dependencies (express, axios, ejs, dotenv)
└── README.md               # User-facing documentation
```

## Debugging Tips

**OAuth failures:**
- Check console logs in `oauthController.js` (shows shop, client ID, and errors)
- Verify app credentials exist for the shop domain in `store-apps.json` or `.env`
- Ensure REDIRECT_URI matches the app's OAuth settings in Shopify Partners dashboard
- Shopify scopes must match what the app is configured for

**API call failures:**
- `ApiController` catches errors and returns JSON `{error: message}`
- Shopify API errors include `error.response?.data?.errors`
- Token may be invalid/expired - try reconnecting the store
- Check that shop domain includes `.myshopify.com`

**Storage issues:**
- `Storage` methods log success/error to console
- JSON files created automatically on first write
- File permissions issues will throw errors

**View/tab issues:**
- Dashboard tabs are rendered dynamically based on active tab selector
- Check browser console for JavaScript errors in `public/js/app.js`
- CSS in `public/css/style.css`

## Important Patterns & Conventions

- **Static class methods** used throughout controllers and models
- **RESTful API design** for `/api` routes (GET/POST/DELETE)
- **Consistent error handling:** Controllers catch errors and return JSON responses
- **Configuration-driven:** API version, scopes, and redirect URI are configurable
- **Separation of concerns:** Routes → Controllers → ShopifyAPI/Storage
- **Multi-store "all" pattern:** Many methods accept `store='all'` to operate on all connected stores
- **Time-sensitive operations:** Theme deletion uses temporary theme creation with `Date.now()` for unique names

## Notes for Future Development

- Currently no user authentication/sessions - anyone with access can manage stores
- Consider adding authentication middleware for production use
- Consider database persistence instead of JSON files for better concurrency
- Add input validation/sanitization for all form inputs
- OAuth flow lacks state parameter for CSRF protection
- No rate limiting on API endpoints
- Theme deletion is complex due to Shopify's "main theme cannot be deleted" rule
