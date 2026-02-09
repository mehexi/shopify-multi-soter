# Shopify Multi-Store Manager

A comprehensive Express.js application for managing multiple Shopify stores with support for multiple OAuth apps.

## Features

- 🏪 Connect and manage multiple Shopify stores
- 🔑 Support for multiple OAuth apps (one per store)
- 📝 Manual token setup for collaborators
- 📦 View and manage products across all stores
- 🛒 View orders from all connected stores
- ⚙️ Create products on single or multiple stores simultaneously
- ℹ️ View store information and details

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```
SHOPIFY_CLIENT_ID=your_default_client_id
SHOPIFY_CLIENT_SECRET=your_default_client_secret
PORT=3000
REDIRECT_URI=http://localhost:3000/auth
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Visit `http://localhost:3000` to access the dashboard.

## Project Structure

```
shopify-multi-store/
├── config/
│   └── config.js           # Application configuration
├── controllers/
│   ├── apiController.js    # Shopify API operations
│   ├── dashboardController.js
│   ├── oauthController.js  # OAuth flow handling
│   └── storeController.js  # Store management
├── models/
│   └── Storage.js          # Token & app storage
├── routes/
│   ├── api.js              # API routes
│   ├── index.js            # Main routes
│   ├── oauth.js            # OAuth routes
│   └── store.js            # Store management routes
├── utils/
│   └── shopifyAPI.js       # Shopify API helper
├── views/
│   ├── partials/           # EJS partials
│   ├── dashboard.ejs       # Main dashboard
│   ├── error.ejs           # Error page
│   ├── oauth-error.ejs     # OAuth error page
│   └── success.ejs         # OAuth success page
├── public/
│   ├── css/
│   │   └── style.css       # Styles
│   └── js/
│       └── app.js          # Frontend JavaScript
├── .env                    # Environment variables
├── .env.example            # Example environment file
├── package.json
├── server.js               # Main application file
└── README.md
```

## How to Connect a Store

### Method 1: OAuth (Recommended)

1. Go to "Manage Apps" tab
2. Add your app credentials (Client ID & Secret)
3. Go to "Connect Store" tab
4. Enter your store URL
5. Click "Connect Store via OAuth"
6. Authorize the app in Shopify

### Method 2: Manual Setup

1. Go to "Manual Setup" tab
2. Follow the instructions to create a custom app in Shopify
3. Copy the Admin API access token
4. Enter store URL and token
5. Click "Add Store Manually"

## API Endpoints

- `GET /` - Dashboard
- `GET /install` - OAuth install
- `GET /auth` - OAuth callback
- `GET /api/products` - Get products
- `POST /api/products` - Create product
- `GET /api/orders` - Get orders
- `GET /api/shop-info` - Get shop information
- `POST /add-app` - Add app configuration
- `POST /remove-app` - Remove app
- `POST /add-manual-token` - Add manual token
- `POST /remove-store` - Remove store

## Security Notes

- Store tokens and app credentials are saved locally in JSON files
- Never commit `.env`, `store-tokens.json`, or `store-apps.json` to version control
- Use HTTPS in production
- Validate all OAuth redirects

## License

ISC
