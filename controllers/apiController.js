const ShopifyAPI = require('../utils/shopifyAPI');
const Storage = require('../models/Storage');

class ApiController {
  // Products
  static async getProducts(req, res) {
    try {
      const { store } = req.query;
      
      if (store === 'all') {
        const stores = Storage.getAllStores();
        const results = await ShopifyAPI.multiStoreCall(stores, '/products.json?limit=50');
        res.json(results);
      } else {

        const {products} = await ShopifyAPI.call(store, '/products.json?limit=50');
        const {count} = await ShopifyAPI.call(store,"/products/count.json")

        res.json({products,count});
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const { store, product } = req.body;
      
      if (store === 'all') {
        const stores = Storage.getAllStores();
        const results = await ShopifyAPI.multiStoreCall(stores, '/products.json', 'POST', { product });
        res.json(results);
      } else {
        const data = await ShopifyAPI.call(store, '/products.json', 'POST', { product });
        res.json(data);
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  }

  // Orders
  static async getOrders(req, res) {
    try {
      const { store } = req.query;
      
      if (store === 'all') {
        const stores = Storage.getAllStores();
        const results = await ShopifyAPI.multiStoreCall(stores, '/orders.json?limit=50');
        res.json(results);
      } else {
        const data = await ShopifyAPI.call(store, '/orders.json?limit=50');
        res.json(data);
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  }

  // Shop Info
  static async getShopInfo(req, res) {
    try {
      const { store } = req.query;
      
      if (store === 'all') {
        const stores = Storage.getAllStores();
        const results = await ShopifyAPI.multiStoreCall(stores, '/shop.json');
        res.json(results);
      } else {
        const data = await ShopifyAPI.call(store, '/shop.json');
        res.json(data);
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  }

  static async deleteShopTheme(req, res) {
 try {
    const { store } = req.body;
    
    console.log('Delete theme API called for store:', store);
    
    if (store === 'all') {
      const stores = Storage.getAllStores();
      const results = {};
      
      for (const shop of stores) {
        try {
          // Get all themes (but don't delete)
          const themesData = await ShopifyAPI.call(shop, '/themes.json');
          const themes = themesData.themes || [];
          
          results[shop] = {
            success: true,
            count: themes.length,
            message: 'TEST MODE - Found ' + themes.length + ' themes (not deleted)'
          };
        } catch (error) {
          results[shop] = {
            success: false,
            error: error.message
          };
        }
      }
      
      res.json(results);
    } else {
      const themesData = await ShopifyAPI.call(store, '/themes.json');
      const themes = themesData.themes || [];
      
      res.json({
        success: true,
        count: themes.length,
        message: 'TEST MODE - Found ' + themes.length + ' themes (not deleted)',
        themes: themes.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role
        }))
      });
    }
  } catch (error) {
    console.error('Delete theme error:', error);
    res.json({ error: error.message });
  }
  }

static async deleteSingleTheme(req, res) {
  let tempThemeId = null;
  
  try {
    const { store, themeId } = req.body;
    
    if (!themeId) {
      return res.json({ error: 'Theme ID is required' });
    }
    
    console.log('Deleting theme:', themeId, 'from store:', store);
    
    // Get the theme details
    const themeData = await ShopifyAPI.call(store, `/themes/${themeId}.json`, 'GET');
    
    if (themeData.theme.role === 'main') {
      console.log('Target is main theme, creating temporary theme...');
      
      // Create a minimal theme with basic structure
      const tempTheme = await ShopifyAPI.call(store, '/themes.json', 'POST', {
        theme: {
          name: `Temp-${Date.now()}`,
          role: 'unpublished'
        }
      });
      
      tempThemeId = tempTheme.theme.id;
      console.log('Temporary theme created:', tempThemeId);
      
      // Add minimal required assets to make it valid
      const minimalLayout = `<!DOCTYPE html>
<html>
<head>
  <title>{{ page_title }}</title>
  {{ content_for_header }}
</head>
<body>
  {{ content_for_layout }}
</body>
</html>`;

      const minimalTemplate = `<div></div>`;
      
      // Upload layout
      await ShopifyAPI.call(store, `/themes/${tempThemeId}/assets.json`, 'PUT', {
        asset: {
          key: 'layout/theme.liquid',
          value: minimalLayout
        }
      });
      
      // Upload index template
      await ShopifyAPI.call(store, `/themes/${tempThemeId}/assets.json`, 'PUT', {
        asset: {
          key: 'templates/index.liquid',
          value: minimalTemplate
        }
      });
      
      console.log('Temporary theme assets uploaded');
      
      // Publish the temporary theme
      await ShopifyAPI.call(store, `/themes/${tempThemeId}.json`, 'PUT', {
        theme: { role: 'main' }
      });
      
      console.log('Temporary theme published');
    }
    
    // Delete the target theme
    await ShopifyAPI.call(store, `/themes/${themeId}.json`, 'DELETE');
    console.log('Target theme deleted');
    
    // Clean up: delete temporary theme if created
    if (tempThemeId) {
      try {
        // Get all themes
        const allThemes = await ShopifyAPI.call(store, '/themes.json', 'GET');
        const alternativeTheme = allThemes.themes.find(
          t => t.id !== tempThemeId && t.role !== 'demo'
        );
        
        if (alternativeTheme) {
          // Publish the alternative theme
          await ShopifyAPI.call(store, `/themes/${alternativeTheme.id}.json`, 'PUT', {
            theme: { role: 'main' }
          });
          console.log('Alternative theme published');
          
          // Delete temporary theme
          await ShopifyAPI.call(store, `/themes/${tempThemeId}.json`, 'DELETE');
          console.log('Temporary theme deleted');
        } else {
          console.log('No alternative theme, keeping temp theme as main');
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Theme deleted successfully'
    });
  } catch (error) {
    console.error('Delete single theme error:', error);
    
    // Emergency cleanup
    if (tempThemeId) {
      try {
        await ShopifyAPI.call(store, `/themes/${tempThemeId}.json`, 'DELETE');
      } catch (e) {
        console.error('Failed to cleanup temp theme:', e.message);
      }
    }
    
    res.json({ 
      error: error.response?.data?.errors || error.message 
    });
  }
}

static async deleteProduct(req, res) {
  try {
    const { store, productId } = req.body;

    if (!productId) {
      return res.json({ error: 'Product ID is required' });
    }

    if (store === 'all') {
      const stores = Storage.getAllStores();
      const results = {};

      for (const shop of stores) {
        try {
          await ShopifyAPI.call(shop, `/products/${productId}.json`, 'DELETE');
          results[shop] = { success: true, message: `Product ${productId} deleted` };
        } catch (error) {
          results[shop] = { success: false, error: error.message };
        }
      }

      res.json(results);
    } else {
      await ShopifyAPI.call(store, `/products/${productId}.json`, 'DELETE');
      res.json({ success: true, message: `Product ${productId} deleted successfully` });
    }
  } catch (error) {
    res.json({ error: error.response?.data?.errors || error.message });
  }
}
}
module.exports = ApiController;
