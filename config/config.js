require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  apiVersion: process.env.API_VERSION || '2024-01',
  scopes: process.env.SCOPES || 'read_products,write_products,read_orders,write_orders',
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth',
  defaultClientId: process.env.SHOPIFY_CLIENT_ID,
  defaultClientSecret: process.env.SHOPIFY_CLIENT_SECRET
};
