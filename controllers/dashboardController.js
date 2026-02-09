const Storage = require('../models/Storage');
const config = require('../config/config');

class DashboardController {
  static renderDashboard(req, res) {
    const stores = Storage.getAllStores();
    const apps = Storage.getAllApps();
    const storeCount = stores.length;
    const appCount = Object.keys(apps).length;
    const tokens = Storage.loadTokens();
    
    res.render('dashboard', {
      stores,
      apps,
      storeCount,
      appCount,
      tokens,
      redirectUri: config.redirectUri,
      hasDefaultApp: !!config.defaultClientId,
      configuredApps: JSON.stringify(Object.keys(apps))
    });
  }
}

module.exports = DashboardController;
