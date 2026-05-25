// ===== SIDEBAR =====
function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('sidebarClose');
  const overlay = document.getElementById('sidebarOverlay');

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });
});

// ===== TAB SWITCHING =====
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(btn => btn.classList.remove('active'));

  const targetContent = document.getElementById(tab + '-tab');
  if (targetContent) targetContent.classList.add('active');

  const targetBtn = document.querySelector(`.sidebar-item[data-tab="${tab}"]`);
  if (targetBtn) targetBtn.classList.add('active');

  const pageTitle = document.getElementById('pageTitle');
  const labels = {
    dashboard: 'Dashboard',
    apps: 'Apps',
    connect: 'Connect App',
    product: 'Products',
    manage: 'Manage',
    manual: 'Manual Setup',
    delete: 'Delete Theme'
  };
  if (pageTitle) pageTitle.textContent = labels[tab] || tab;
}

// ===== PRODUCT FORM TOGGLE =====
function toggleAddProductForm() {
  const form = document.getElementById('addProductForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// ===== SHOW RESULT =====
function showResult(html, elementId) {
  const el = document.getElementById(elementId || 'result');
  if (!el) return;
  el.innerHTML = html;
  el.style.display = 'block';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===== REMOVE STORE =====
async function removeStore(shop) {
  if (!confirm('Remove ' + shop + '?')) return;
  try {
    await fetch('/remove-store?shop=' + shop, { method: 'POST' });
    location.reload();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ===== REMOVE APP =====
async function removeApp(shop) {
  if (!confirm('Remove app configuration for ' + shop + '?')) return;
  try {
    await fetch('/remove-app?shop=' + shop, { method: 'POST' });
    location.reload();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ===== ADD APP =====
async function addApp(e) {
  e.preventDefault();
  const shop = document.getElementById('connectAppShop').value.trim();
  const clientId = document.getElementById('connectAppClientId').value.trim();
  const clientSecret = document.getElementById('connectAppClientSecret').value.trim();

  showResult('<p class="info-box"><i data-lucide="loader" class="icon-inline"></i> Saving app configuration...</p>', 'connectAppResult');

  try {
    const response = await fetch('/add-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop, clientId, clientSecret })
    });

    const data = await response.json();

    if (data.success) {
      const resultHtml = '<p class="success"><i data-lucide="check-circle" class="icon-inline"></i> App credentials saved for <strong>' + shop + '</strong>!</p>';
      showResult(resultHtml, 'connectAppResult');

      document.getElementById('connectAppForm').reset();

      const step2 = document.getElementById('connectStep2');
      step2.style.display = 'flex';
      document.getElementById('connectShopUrl').value = shop;
      document.getElementById('connectStep2Message').textContent = 'App saved for ' + shop + '! Now connect your store via OAuth.';

      step2.scrollIntoView({ behavior: 'smooth' });
    } else {
      showResult('<p class="error"><i data-lucide="x-circle" class="icon-inline"></i> Error: ' + data.error + '</p>', 'connectAppResult');
    }
  } catch (error) {
    showResult('<p class="error"><i data-lucide="x-circle" class="icon-inline"></i> Error: ' + error.message + '</p>', 'connectAppResult');
  }
}

// ===== ADD MANUAL TOKEN =====
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
      showResult('<p class="success"><i data-lucide="check-circle" class="icon-inline"></i> Store added successfully!</p>', 'manualResult');
      setTimeout(() => location.reload(), 1500);
    } else {
      showResult('<p class="error"><i data-lucide="x-circle" class="icon-inline"></i> Error: ' + data.error + '</p>', 'manualResult');
    }
  } catch (error) {
    showResult('<p class="error"><i data-lucide="x-circle" class="icon-inline"></i> Error: ' + error.message + '</p>', 'manualResult');
  }
}

// ===== LIST PRODUCTS =====
async function listProducts() {
  showResult('<i data-lucide="package" class="icon-inline"></i> Loading products...');
  try {
    const store = document.getElementById('storeSelect').value;
    const response = await fetch('/api/products?store=' + store);
    const data = await response.json();

    let html = '<h3><i data-lucide="package" class="icon-inline"></i> Products</h3>';
    if (data.error) {
      html += '<p class="error">' + data.error + '</p>';
    } else if (store === 'all') {
      for (const [shop, result] of Object.entries(data)) {
        html += '<div class="result-item"><h4>' + shop + '</h4>';
        if (result.success) {
          html += '<p>Found ' + result.data.products.length + ' products</p>';
          result.data.products.slice(0, 5).forEach(p => {
            html += '<div style="margin:10px 0; padding:10px; background:var(--card-bg); border-radius:4px;">';
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

// ===== LIST ORDERS =====
async function listOrders() {
  showResult('<i data-lucide="shopping-cart" class="icon-inline"></i> Loading orders...');
  try {
    const store = document.getElementById('storeSelect').value;
    const response = await fetch('/api/orders?store=' + store);
    const data = await response.json();

    let html = '<h3><i data-lucide="shopping-cart" class="icon-inline"></i> Orders</h3>';
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

// ===== SHOP INFO =====
async function getShopInfo() {
  showResult('<i data-lucide="info" class="icon-inline"></i> Loading shop info...');
  try {
    const store = document.getElementById('storeSelect').value;
    const response = await fetch('/api/shop-info?store=' + store);
    const data = await response.json();

    let html = '<h3><i data-lucide="info" class="icon-inline"></i> Shop Information</h3>';
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

// ===== CREATE PRODUCT =====
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

  showResult('<i data-lucide="loader" class="icon-inline"></i> Creating product...', 'manageResult');

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
      let html = '<p class="success"><i data-lucide="check-circle" class="icon-inline"></i> Products created!</p>';
      for (const [shop, result] of Object.entries(data)) {
        html += '<div class="result-item">';
        html += '<strong>' + shop + ':</strong> ';
        html += result.success ? '<i data-lucide="check-circle" class="icon-inline"></i> Success' : '<i data-lucide="x-circle" class="icon-inline"></i> ' + result.error;
        html += '</div>';
      }
      showResult(html, 'manageResult');
    } else {
      showResult('<p class="success"><i data-lucide="check-circle" class="icon-inline"></i> Product created!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>', 'manageResult');
    }
  } catch (error) {
    showResult('<p class="error">Error: ' + error.message + '</p>', 'manageResult');
  }
}

// ===== FETCH PRODUCTS =====
async function fetchProduct(storeId) {
  const store = storeId;

  if (!store) {
    showResult('<p class="error-message"><i data-lucide="alert-triangle" class="icon-inline"></i> Please select a store</p>', 'fetchProduct');
    return;
  }

  showResult('<i data-lucide="loader" class="icon-inline"></i> Loading Products...', 'fetchProduct');

  try {
    const response = await fetch(`/api/products?store=${encodeURIComponent(store)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let html = '';

    if (!data.products || data.products.length === 0) {
      html = '<div class="pl-empty"><i data-lucide="package" style="width:40px;height:40px;color:var(--text-muted);"></i><p>No products found for this store.</p></div>';
    } else {
      html = `
        <div class="pl-bar">
          <span class="pl-bar-title"><i data-lucide="package" style="width:16px;height:16px;"></i> ${store.replace('.myshopify.com', '')}</span>
          <span class="pl-bar-count">${data.products.length} product${data.products.length === 1 ? '' : 's'}</span>
        </div>
        <div class="pl-list">
      `;

      data.products.forEach(product => {
        const imgSrc = product.image ? product.image.src : null;
        html += `
          <div class="pl-row" data-product-id="${product.id}">
            ${imgSrc ? `<img src="${imgSrc}" alt="" class="pl-thumb">` : '<div class="pl-thumb pl-thumb-missing"><i data-lucide="image" style="width:16px;height:16px;"></i></div>'}
            <div class="pl-info">
              <span class="pl-title">${escapeHtml(product.title) || 'Untitled Product'}</span>
              <span class="pl-meta">
                ${product.price ? `<span class="pl-price">$${product.price}</span>` : ''}
                ${product.status ? `<span class="product-status ${product.status}">${product.status}</span>` : ''}
              </span>
            </div>
            <button class="pl-delete" onclick="deleteProduct('${store}', ${product.id}, '${escapeHtml(product.title)}')" title="Delete">
              <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
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
      `<p class="error-message"><i data-lucide="x-circle" class="icon-inline"></i> Error while fetching products: ${error.message}</p>`,
      'fetchProduct'
    );
  }
}

// ===== ESCAPE HTML =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== DELETE PRODUCT =====
async function deleteProduct(store, productId, productTitle) {
  if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) {
    return;
  }

  showResult(`<i data-lucide="loader" class="icon-inline"></i> Deleting product "${productTitle}"...`, 'fetchProduct');

  try {
    const response = await fetch('/api/products/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store, productId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    showResult(`<i data-lucide="check-circle" class="icon-inline"></i> Successfully deleted "${productTitle}"`, 'fetchProduct');

    setTimeout(() => {
      fetchProduct(store);
      showResult('', 'fetchProduct');
    }, 1500);

  } catch (error) {
    console.error('Error deleting product:', error);
    showResult(`<i data-lucide="x-circle" class="icon-inline"></i> Error deleting product: ${error.message}`, 'fetchProduct');
  }
}

// ===== FETCH THEMES =====
async function fetchTheme(storeId) {
  const store = storeId;

  showResult('<i data-lucide="loader" class="icon-inline"></i> Loading themes...', 'deleteResult');

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
showResult('<p class="error"><i data-lucide="x-circle" class="icon-inline"></i> Error: ' + data.error + '</p>', 'deleteResult');
      } else {
        let html = '<p class="success"><i data-lucide="check-circle" class="icon-inline"></i> Found ' + data.count + ' theme(s)</p>';
        html = '<p class="success">' + store + '</p>';
        if (data.themes && data.themes.length > 0) {
          html += '<div style="max-height: 400px; overflow-y: auto; margin-top: 15px;">';
          data.themes.forEach(theme => {
            html += '<div class="result-item" style="display: flex; justify-content: space-between; align-items: center;">';
            html += '<div>';
            html += '<strong>' + theme.name + '</strong><br>';
            html += '<small>ID: ' + theme.id + ' | Role: ' + theme.role + '</small>';
            html += '</div>';
            html += '<button class="btn-danger btn-small" onclick="deleteSingleTheme(\'' + store + '\', ' + theme.id + ', \'' + theme.name.replace(/'/g, "\\'") + '\')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i> Delete</button>';
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

// ===== DASHBOARD: SEARCH & FILTER =====
function filterStores() {
  const query = document.getElementById('storeSearch').value.toLowerCase();
  const cards = document.querySelectorAll('.dash-card');

  let visibleCount = 0;
  cards.forEach(card => {
    const name = card.querySelector('.dash-card-name').textContent.toLowerCase();
    const domain = card.querySelector('.dash-card-domain').textContent.toLowerCase();
    const match = name.includes(query) || domain.includes(query);
    card.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });

  const existing = document.querySelector('.dash-empty');
  if (visibleCount === 0 && cards.length > 0) {
    if (!existing) {
      const empty = document.createElement('div');
      empty.className = 'dash-empty';
      empty.innerHTML = '<h3><i data-lucide="search" class="icon-inline"></i> No stores found</h3><p>Try a different search term.</p>';
      document.getElementById('storeGrid').appendChild(empty);
    }
  } else if (existing) {
    existing.remove();
  }
}

function sortStores() {
  const sort = document.getElementById('storeSort').value;
  const grid = document.getElementById('storeGrid');
  const cards = Array.from(grid.querySelectorAll('.dash-card'));

  cards.sort((a, b) => {
    if (sort === 'name') {
      const nameA = a.querySelector('.dash-card-name').textContent.toLowerCase();
      const nameB = b.querySelector('.dash-card-name').textContent.toLowerCase();
      return nameA.localeCompare(nameB);
    }
    const dateA = parseInt(a.dataset.date) || 0;
    const dateB = parseInt(b.dataset.date) || 0;
    return sort === 'recent' ? dateB - dateA : dateA - dateB;
  });

  cards.forEach(card => grid.appendChild(card));
}

// ===== DASHBOARD: QUICK ACTION =====
function quickAction(shop, action) {
  switchTab('dashboard');

  const select = document.getElementById('storeSelect');
  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === shop) {
        select.value = shop;
        break;
      }
    }
  }

  const fn = action === 'products' ? listProducts : action === 'orders' ? listOrders : getShopInfo;
  setTimeout(fn, 100);
  document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

// ===== DELETE SINGLE THEME =====
async function deleteSingleTheme(store, themeId, themeName) {
  if (!confirm('Are you sure you want to delete the theme:\n\n"' + themeName + '"\n(ID: ' + themeId + ')\n\nThis action CANNOT be undone!')) {
    return;
  }

  showResult('<i data-lucide="loader" class="icon-inline"></i> Deleting theme "' + themeName + '"...', 'deleteResult');

  try {
    const response = await fetch('/api/delete-single-theme', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store, themeId })
    });

    const data = await response.json();

    if (data.error) {
      showResult('<p class="error"><i data-lucide="x-circle" class="icon-inline"></i> Error: ' + data.error + '</p>', 'deleteResult');
    } else {
      showResult('<p class="success"><i data-lucide="check-circle" class="icon-inline"></i> Theme "' + themeName + '" deleted successfully!</p>', 'deleteResult');
      setTimeout(() => deleteTheme(), 1500);
    }
  } catch (error) {
    showResult('<p class="error">Error: ' + error.message + '</p>', 'deleteResult');
  }
}
