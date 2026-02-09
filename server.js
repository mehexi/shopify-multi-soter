const express = require('express');
const path = require('path');
const config = require('./config/config');
const Storage = require('./models/Storage');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/oauth'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/store'));

// Start server
app.listen(config.port, () => {
  const stores = Storage.getAllStores();
  const apps = Storage.getAllApps();
  
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('\n║   🏪 Shopify Multi-Store Manager (Multi-App)     ║');
  console.log('\n╚══════════════════════════════════════════════════╝\n');
  console.log(`📍 Dashboard: http://localhost:${config.port}`);
  console.log(`🔗 OAuth Redirect: ${config.redirectUri}`);
  console.log(`🏪 Connected Stores: ${stores.length}`);
  console.log(`🔑 Configured Apps: ${Object.keys(apps).length}\n`);
  console.log('✨ Features:');
  console.log('   • Multiple OAuth apps per store');
  console.log('   • Connect stores via OAuth');
  console.log('   • Add stores manually (for collaborators)');
  console.log('   • View products, orders, shop info');
  console.log('   • Create products across multiple stores');
  console.log('   • Multi-store operations\n');
  console.log('🔐 To get started:');
  console.log(`   1. Visit: http://localhost:${config.port}`);
  console.log('   2. Go to "Manage Apps" tab');
  console.log('   3. Configure OAuth credentials for each store');
  console.log('   4. Connect stores via OAuth\n');
  console.log('════════════════════════════════════════════════\n');
});
