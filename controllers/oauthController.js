const axios = require('axios');
const config = require('../config/config');
const Storage = require('../models/Storage');

class OAuthController {
  static install(req, res) {
    const { shop } = req.query;
    
    if (!shop) {
      return res.send('❌ Error: Please provide a shop parameter');
    }
    
    if (!shop.endsWith('.myshopify.com')) {
      return res.send('❌ Error: Invalid shop format. Use: your-store.myshopify.com');
    }
    
    const appConfig = Storage.getApp(shop);
    const clientId = appConfig ? appConfig.clientId : config.defaultClientId;
    const clientSecret = appConfig ? appConfig.clientSecret : config.defaultClientSecret;
    
    console.log('\n🔍 OAuth Install Debug:');
    console.log(`   Shop: ${shop}`);
    console.log(`   Has dedicated app config: ${!!appConfig}`);
    console.log(`   Client ID: ${clientId ? clientId.substring(0, 10) + '...' : 'MISSING'}`);
    
    if (!clientId || !clientSecret) {
      return res.render('error', {
        title: 'No OAuth Client ID configured',
        message: 'Please configure OAuth credentials for this store in the "Manage Apps" section.',
        shop
      });
    }
    
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${config.scopes}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
    
    console.log(`✅ Redirecting to Shopify OAuth...`);
    res.redirect(authUrl);
  }

  static async callback(req, res) {
    const { code, shop } = req.query;
    
    if (!code || !shop) {
      return res.send('❌ Error: Missing code or shop parameter');
    }

    console.log(`\n📝 Processing OAuth callback for: ${shop}`);

    const appConfig = Storage.getApp(shop);
    const clientId = appConfig ? appConfig.clientId : config.defaultClientId;
    const clientSecret = appConfig ? appConfig.clientSecret : config.defaultClientSecret;
    
    if (!clientId || !clientSecret) {
      return res.render('error', {
        title: 'No OAuth credentials found',
        message: `Cannot complete OAuth flow - credentials are missing for ${shop}`,
        shop
      });
    }

    try {
      const tokenPayload = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      };
      
      const tokenResponse = await axios.post(
        `https://${shop}/admin/oauth/access_token`,
        tokenPayload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const accessToken = tokenResponse.data.access_token;
      Storage.setToken(shop, accessToken);
      
      console.log(`✅ Successfully connected: ${shop}`);

      res.render('success', {
        shop,
        accessToken: accessToken.substring(0, 20) + '...',
        appType: appConfig ? 'Dedicated app for this store' : 'Default app credentials'
      });
    } catch (error) {
      console.error('❌ Error during token exchange:', error.message);
      
      res.render('oauth-error', {
        error: error.message,
        shop,
        details: error.response?.data || 'No additional details',
        appType: appConfig ? 'Dedicated app' : 'Default .env credentials',
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      });
    }
  }
}

module.exports = OAuthController;
