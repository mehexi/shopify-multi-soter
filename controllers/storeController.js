const Storage = require('../models/Storage');

class StoreController {
  // App Management
  static addApp(req, res) {
    try {
      const { shop, clientId, clientSecret } = req.body;
      
      if (!shop || !clientId || !clientSecret) {
        return res.json({ success: false, error: 'All fields are required' });
      }
      
      if (!shop.endsWith('.myshopify.com')) {
        return res.json({ success: false, error: 'Invalid shop format. Use: your-store.myshopify.com' });
      }
      
      Storage.setApp(shop, clientId, clientSecret);
      console.log(`✅ App configured for: ${shop}`);
      
      res.json({ success: true });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  }

  static removeApp(req, res) {
    const { shop } = req.query;
    
    if (shop) {
      Storage.removeApp(shop);
      console.log(`🗑️ Removed app config for: ${shop}`);
    }
    
    res.json({ success: true });
  }

  // Token Management
  static addManualToken(req, res) {
    try {
      const { shop, token } = req.body;
      
      if (!shop || !token) {
        return res.json({ success: false, error: 'Shop and token are required' });
      }
      
      if (!token.startsWith('shpat_')) {
        return res.json({ success: false, error: 'Invalid token format. Should start with shpat_' });
      }
      
      Storage.setToken(shop, token);
      console.log(`✅ Manually added: ${shop}`);
      
      res.json({ success: true });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  }

  static removeStore(req, res) {
    const { shop } = req.query;
    
    if (shop) {
      Storage.removeToken(shop);
      console.log(`🗑️ Removed store: ${shop}`);
    }
    
    res.json({ success: true });
  }
}

module.exports = StoreController;
