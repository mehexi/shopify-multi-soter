function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById(tab + '-tab').classList.add('active');
}

function toggleAddProductForm() {
  const form = document.getElementById('addProductForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showResult(html, elementId = 'result') {
  const result = document.getElementById(elementId);
  result.innerHTML = html;
  result.style.display = 'block';
}

async function removeStore(shop) {
  if (!confirm('Remove ' + shop + '?')) return;
  try {
    await fetch('/remove-store?shop=' + shop, { method: 'POST' });
    location.reload();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function removeApp(shop) {
  if (!confirm('Remove app configuration for ' + shop + '?')) return;
  try {
    await fetch('/remove-app?shop=' + shop, { method: 'POST' });
    location.reload();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function addApp(e) {
  e.preventDefault();
  const shop = document.getElementById('appShop').value;
  const clientId = document.getElementById('appClientId').value;
  const clientSecret = document.getElementById('appClientSecret').value;
  
  try {
    const response = await fetch('/add-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop, clientId, clientSecret })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showResult('<p class="success">✅ App configuration saved!</p>', 'appResult');
      setTimeout(() => location.reload(), 1500);
    } else {
      showResult('<p class="error">❌ Error: ' + data.error + '</p>', 'appResult');
    }
  } catch (error) {
    showResult('<p class="error">❌ Error: ' + error.message + '</p>', 'appResult');
  }
}

async function addManualToken(e) {
  e.preventDefault();
  const shop = document.getElementById('manualShop').value;
  const token = document.getElementById('manualToken').value;
  
  try {
    const response = await fetch('/add-manual-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop, token })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showResult('<p class="success">✅ Store added successfully!</p>', 'manualResult');
      setTimeout(() => location.reload(), 1500);
    } else {
      showResult('<p class="error">❌ Error: ' + data.error + '</p>', 'manualResult');
    }
  } catch (error) {
    showResult('<p class="error">❌ Error: ' + error.message + '</p>', 'manualResult');
  }
}

async function listProducts() {
  showResult('⏳ Loading products...');
  try {
    const store = document.getElementById('storeSelect').value;
    const response = await fetch('/api/products?store=' + store);
    const data = await response.json();
    
    let html = '<h3>📦 Products</h3>';
    if (data.error) {
      html += '<p class="error">' + data.error + '</p>';
    } else if (store === 'all') {
      for (const [shop, result] of Object.entries(data)) {
        html += '<div class="result-item"><h4>' + shop + '</h4>';
        if (result.success) {
          html += '<p>Found ' + result.data.products.length + ' products</p>';
          result.data.products.slice(0, 5).forEach(p => {
            html += '<div style="margin:10px 0; padding:10px; background:#f9fafb; border-radius:4px;">';
            html += '<strong>' + p.title + '</strong><br>';
            html += 'ID: ' + p.id + ' | Price: $' + (p.variants[0]?.price || 'N/A');
            html += '</div>';
          });
        } else {
          html += '<p class="error">' + result.error + '</p>';
        }
        html += '</div>';
      }
    } else {
      html += '<p>Found ' + data.products.length + ' products</p>';
      data.products.forEach(p => {
        html += '<div class="result-item">';
        html += '<strong>' + p.title + '</strong><br>';
        html += 'ID: ' + p.id + ' | Price: $' + (p.variants[0]?.price || 'N/A') + ' | Status: ' + p.status;
        html += '</div>';
      });
    }
    showResult(html);
  } catch (error) {
    showResult('<p class="error">Error: ' + error.message + '</p>');
  }
}

async function listOrders() {
  showResult('⏳ Loading orders...');
  try {
    const store = document.getElementById('storeSelect').value;
    const response = await fetch('/api/orders?store=' + store);
    const data = await response.json();
    
    let html = '<h3>🛒 Orders</h3>';
    if (data.error) {
      html += '<p class="error">' + data.error + '</p>';
    } else if (store === 'all') {
      for (const [shop, result] of Object.entries(data)) {
        html += '<div class="result-item"><h4>' + shop + '</h4>';
        if (result.success) {
          html += '<p>Found ' + result.data.orders.length + ' orders</p>';
        } else {
          html += '<p class="error">' + result.error + '</p>';
        }
        html += '</div>';
      }
    } else {
      html += '<p>Found ' + data.orders.length + ' orders</p>';
      data.orders.forEach(o => {
        html += '<div class="result-item">';
        html += '<strong>Order #' + o.order_number + '</strong><br>';
        html += 'Total: $' + o.total_price + ' | Status: ' + o.financial_status;
        html += '</div>';
      });
    }
    showResult(html);
  } catch (error) {
    showResult('<p class="error">Error: ' + error.message + '</p>');
  }
}

async function getShopInfo() {
  showResult('⏳ Loading shop info...');
  try {
    const store = document.getElementById('storeSelect').value;
    const response = await fetch('/api/shop-info?store=' + store);
    const data = await response.json();
    
    let html = '<h3>ℹ️ Shop Information</h3>';
    if (store === 'all') {
      for (const [shop, result] of Object.entries(data)) {
        html += '<div class="result-item"><h4>' + shop + '</h4>';
        if (result.success) {
          const s = result.data.shop;
          html += '<strong>Name:</strong> ' + s.name + '<br>';
          html += '<strong>Email:</strong> ' + s.email + '<br>';
          html += '<strong>Currency:</strong> ' + s.currency + '<br>';
          html += '<strong>Plan:</strong> ' + s.plan_name;
        } else {
          html += '<p class="error">' + result.error + '</p>';
        }
        html += '</div>';
      }
    } else {
      const s = data.shop;
      html += '<div class="result-item">';
      html += '<strong>Name:</strong> ' + s.name + '<br>';
      html += '<strong>Email:</strong> ' + s.email + '<br>';
      html += '<strong>Domain:</strong> ' + s.domain + '<br>';
      html += '<strong>Currency:</strong> ' + s.currency + '<br>';
      html += '<strong>Plan:</strong> ' + s.plan_name;
      html += '</div>';
    }
    showResult(html);
  } catch (error) {
    showResult('<p class="error">Error: ' + error.message + '</p>');
  }
}

async function createProduct() {
  const store = document.getElementById('manageStore').value;
  const title = document.getElementById('productTitle').value;
  const price = document.getElementById('productPrice').value;
  const sku = document.getElementById('productSku').value;
  const description = document.getElementById('productDescription').value;
  
  if (!title || !price) {
    alert('Please fill in title and price');
    return;
  }
  
  showResult('⏳ Creating product...', 'manageResult');
  
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store,
        product: {
          title,
          body_html: description,
          variants: [{ price, sku }]
        }
      })
    });
    
    const data = await response.json();
    if (store === 'all') {
      let html = '<p class="success">✅ Products created!</p>';
      for (const [shop, result] of Object.entries(data)) {
        html += '<div class="result-item">';
        html += '<strong>' + shop + ':</strong> ';
        html += result.success ? '✅ Success' : '❌ ' + result.error;
        html += '</div>';
      }
      showResult(html, 'manageResult');
    } else {
      showResult('<p class="success">✅ Product created!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>', 'manageResult');
    }
  } catch (error) {
    showResult('<p class="error">Error: ' + error.message + '</p>', 'manageResult');
  }
}

async function fetchProduct(storeId) {
  const store = storeId;
  
  if (!store) {
    showResult('<p class="error-message">⚠️ Please select a store</p>', 'fetchProduct');
    return;
  }
  
  showResult('⏳ Loading Products...', 'fetchProduct');
  
  try {
    const response = await fetch(`/api/products?store=${encodeURIComponent(store)}`);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    let html = '';
    
    if (!data.products || data.products.length === 0) {
      html = '<p class="no-data">📦 No products found for this store.</p>';
    } else {
      html = `
        <div class="product-header">
          <h4>Products for: ${store}</h4>
          <p class="product-count">Total products: ${data.products.length}</p>
          <buton class="btn-small>Delete All </button>
        </div>
        <div class="product-grid" style="display:flex; flex-direction:column; gap:30px">
      `;
      
      data.products.forEach(product => {
        html += `
          <div class="product-card" data-product-id="${product.id}">
            ${product.image ? `<img src="${product.image.src}" alt="${product.title}" class="product-image">` : '<div class="no-image">No Image</div>'}
            <div class="product-details">
              <h5 class="product-title">${product.title || 'Untitled Product'}</h5>
              ${product.price ? `<p class="product-price">$${product.price}</p>` : ''}
              ${product.status ? `<span class="product-status ${product.status}">${product.status}</span>` : ''}
            </div>
            <button 
              class="btn-danger btn-small" 
              onclick="deleteProduct('${store}', ${product.id}, '${escapeHtml(product.title)}')">
              🗑️ Delete
            </button>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    showResult(html, 'fetchProduct');
    
  } catch (error) {
    console.error('Error fetching products:', error);
    showResult(
      `<p class="error-message">❌ Error while fetching products: ${error.message}</p>`, 
      'fetchProduct'
    );
  }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Delete product function
async function deleteProduct(store, productId, productTitle) {
  if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) {
    return;
  }
  
  showResult(`⏳ Deleting product "${productTitle}"...`, 'fetchProduct');
  
  try {
    const response = await fetch('/api/products/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ store, productId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    showResult(`✅ Successfully deleted "${productTitle}"`, 'fetchProduct');
    
    // Refresh the product list after 1.5 seconds
    setTimeout(() => {
      fetchProduct(store);
      showResult('', 'fetchProduct');
    }, 1500);
    
  } catch (error) {
    console.error('Error deleting product:', error);
    showResult(`❌ Error deleting product: ${error.message}`, 'fetchProduct');
  }
}

// Helper function to display results
function showResult(message, elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = message;
  }
}

async function fetchTheme(storeId) {
  const store = storeId;
  
  showResult('⏳ Loading themes...', 'deleteResult');
  
  try {
    const response = await fetch('/api/delete-theme', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store })
    });
    
    const data = await response.json();
    
    if (store === 'all') {
      let html = '<p class="warning-box">Please select a specific store to delete individual themes.</p>';
      showResult(html, 'deleteResult');
    } else {
      if (data.error) {
        showResult('<p class="error">❌ Error: ' + data.error + '</p>', 'deleteResult');
      } else {
        let html = '<p class="success">✅ Found ' + data.count + ' theme(s)</p>';
         html = '<p class="success">' + store + '</p>'
        if (data.themes && data.themes.length > 0) {
          html += '<div style="max-height: 400px; overflow-y: auto; margin-top: 15px;">';
          data.themes.forEach(theme => {
            html += '<div class="result-item" style="display: flex; justify-content: space-between; align-items: center;">';
            html += '<div>';
            html += '<strong>' + theme.name + '</strong><br>';
            html += '<small>ID: ' + theme.id + ' | Role: ' + theme.role + '</small>';
            html += '</div>';
            html += '<button class="btn-danger btn-small" onclick="deleteSingleTheme(\'' + store + '\', ' + theme.id + ', \'' + theme.name.replace(/'/g, "\\'") + '\')">🗑️ Delete</button>';
            html += '</div>';
          });
          html += '</div>';
        } else {
          html += '<p>No themes found.</p>';
        }
        showResult(html, 'deleteResult');
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showResult('<p class="error">Error: ' + error.message + '</p>', 'deleteResult');
  }
}

async function deleteSingleTheme(store, themeId, themeName) {
  if (!confirm('⚠️ Are you sure you want to delete the theme:\n\n"' + themeName + '"\n(ID: ' + themeId + ')\n\nThis action CANNOT be undone!')) {
    return;
  }
  
  showResult('⏳ Deleting theme "' + themeName + '"...', 'deleteResult');
  
  try {
    const response = await fetch('/api/delete-single-theme', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store, themeId })
    });
    
    const data = await response.json();
    
    if (data.error) {
      showResult('<p class="error">❌ Error: ' + data.error + '</p>', 'deleteResult');
    } else {
      showResult('<p class="success">✅ Theme "' + themeName + '" deleted successfully!</p>', 'deleteResult');
      // Reload themes list
      setTimeout(() => deleteTheme(), 1500);
    }
  } catch (error) {
    showResult('<p class="error">Error: ' + error.message + '</p>', 'deleteResult');
  }
}
