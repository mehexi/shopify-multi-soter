const axios = require('axios');
const config = require('../config/config');
const Storage = require('../models/Storage');

class ShopifyAPI {
  static async call(shop, endpoint, method = 'GET', data = null) {
    const token = Storage.getToken(shop);
    
    if (!token) {
      throw new Error(`Store ${shop} not connected. Please connect it first.`);
    }

    const url = `https://${shop}/admin/api/${config.apiVersion}${endpoint}`;
    
    const apiConfig = {
      method,
      url,
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      apiConfig.data = data;
    }

    const response = await axios(apiConfig);
    return response.data;
  }

  static async multiStoreCall(stores, endpoint, method = 'GET', data = null) {
    const results = {};
    
    for (const shop of stores) {
      try {
        results[shop] = {
          success: true,
          data: await this.call(shop, endpoint, method, data)
        };
      } catch (error) {
        results[shop] = { 
          success: false, 
          error: error.message 
        };
      }
    }
    
    return results;
  }
}

module.exports = ShopifyAPI;
