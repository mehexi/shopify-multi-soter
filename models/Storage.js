const fs = require('fs');
const path = require('path');

const TOKENS_FILE = path.join(__dirname, '../store-tokens.json');
const APPS_FILE = path.join(__dirname, '../store-apps.json');

class Storage {
  // Token management
  static loadTokens() {
    try {
      if (fs.existsSync(TOKENS_FILE)) {
        return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
    return {};
  }

  static saveTokens(tokens) {
    try {
      fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
      console.log('✅ Tokens saved');
    } catch (error) {
      console.error('❌ Error saving tokens:', error);
    }
  }

  static getToken(shop) {
    const tokens = this.loadTokens();
    return tokens[shop];
  }

  static setToken(shop, token) {
    const tokens = this.loadTokens();
    tokens[shop] = token;
    tokens[shop + '_connected_at'] = new Date().toISOString();
    this.saveTokens(tokens);
  }

  static removeToken(shop) {
    const tokens = this.loadTokens();
    delete tokens[shop];
    delete tokens[shop + '_connected_at'];
    this.saveTokens(tokens);
  }

  static getAllStores() {
    const tokens = this.loadTokens();
    return Object.keys(tokens).filter(k => !k.endsWith('_connected_at'));
  }

  // App credentials management
  static loadApps() {
    try {
      if (fs.existsSync(APPS_FILE)) {
        return JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading apps:', error);
    }
    return {};
  }

  static saveApps(apps) {
    try {
      fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2));
      console.log('✅ Apps saved');
    } catch (error) {
      console.error('❌ Error saving apps:', error);
    }
  }

  static getApp(shop) {
    const apps = this.loadApps();
    return apps[shop];
  }

  static setApp(shop, clientId, clientSecret) {
    const apps = this.loadApps();
    apps[shop] = { clientId, clientSecret };
    this.saveApps(apps);
  }

  static removeApp(shop) {
    const apps = this.loadApps();
    delete apps[shop];
    this.saveApps(apps);
  }

  static getAllApps() {
    return this.loadApps();
  }
}

module.exports = Storage;
