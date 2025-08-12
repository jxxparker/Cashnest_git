// Ensure config.js is loaded before this script in index.html
// API_URL will be available globally
// Helper function to format currency with smart abbreviations
function formatCurrency(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + "M";
  } else if (amount >= 10000) {
    return Math.round(amount / 1000) + "K";
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + "K";
  } else {
    return amount.toLocaleString();
  }
}

// Fetch assets, debts, stocks and calculate net worth
async function fetchNetWorth() {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const [assetsRes, debtsRes, stocksRes] = await Promise.all([
      fetch(API_URL + "/assets", { headers: headers }),
      fetch(API_URL + "/debts", { headers: headers }),
      fetch(API_URL + "/stocks", { headers: headers }),
    ]);
    const assets = await assetsRes.json();
    const debts = await debtsRes.json();
    const stocks = await stocksRes.json();

    const assetsTotal = assets.reduce((sum, a) => sum + a.value, 0);
    const debtsTotal = debts.reduce((sum, d) => sum + d.value, 0);
    const stocksTotal = stocks.reduce(
      (sum, s) => sum + (s.price || 0) * s.shares,
      0
    );
    const netWorth = assetsTotal + stocksTotal - debtsTotal;

    // Render stats
    renderNetWorthStats(assetsTotal, stocksTotal, debtsTotal, netWorth);

    // Render forms
    renderNetWorthForms();

    // Render lists
    renderNetWorthLists(assets, debts, stocks);
  } catch (error) {
    console.error("Error fetching net worth data:", error);
    showNetWorthError("Failed to load data. Please try again.");
  }
}

function renderNetWorthStats(assetsTotal, stocksTotal, debtsTotal, netWorth) {
  const statsContainer = document.getElementById("networth-stats");
  statsContainer.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">Total Assets</div>
          <div class="stat-subtitle">Physical & Financial</div>
        </div>
        <div class="stat-value positive" title="$${assetsTotal.toLocaleString()}">$${formatCurrency(
    assetsTotal
  )}</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">Stock Holdings</div>
          <div class="stat-subtitle">Market Value</div>
        </div>
        <div class="stat-value primary" title="$${stocksTotal.toLocaleString()}">$${formatCurrency(
    stocksTotal
  )}</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">Total Debts</div>
          <div class="stat-subtitle">Outstanding Balance</div>
        </div>
        <div class="stat-value negative" title="$${debtsTotal.toLocaleString()}">$${formatCurrency(
    debtsTotal
  )}</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">Net Worth</div>
          <div class="stat-subtitle">Assets - Debts</div>
        </div>
        <div class="stat-value ${
          netWorth >= 0 ? "positive" : "negative"
        }" style="font-size: 1.5rem; font-weight: 900;" title="$${netWorth.toLocaleString()}">
          $${formatCurrency(netWorth)}
        </div>
      </div>
    </div>
  `;
}

function renderNetWorthForms() {
  const formsContainer = document.getElementById("networth-forms");
  formsContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-2xl);">
      <div class="card">
        <div class="card-header">
          <h3>💰 Add Asset</h3>
        </div>
        <div class="card-content">
          <form id="add-asset-form" class="form-grid">
            <div class="form-group">
              <label for="asset-name">Asset Name</label>
              <input type="text" id="asset-name" placeholder="e.g., Savings Account" required />
            </div>
            <div class="form-group">
              <label for="asset-value">Value</label>
              <input type="number" id="asset-value" placeholder="0.00" step="0.01" required />
            </div>
            <button type="submit" class="btn btn-success">Add Asset</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>💳 Add Debt</h3>
        </div>
        <div class="card-content">
          <form id="add-debt-form" class="form-grid">
            <div class="form-group">
              <label for="debt-name">Debt Name</label>
              <input type="text" id="debt-name" placeholder="e.g., Credit Card" required />
            </div>
            <div class="form-group">
              <label for="debt-value">Amount</label>
              <input type="number" id="debt-value" placeholder="0.00" step="0.01" required />
            </div>
            <button type="submit" class="btn btn-danger">Add Debt</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>📈 Add Stock</h3>
        </div>
        <div class="card-content">
          <form id="add-stock-form" class="form-grid">
            <div class="form-group">
              <label for="stock-symbol">Stock Symbol</label>
              <input type="text" id="stock-symbol" placeholder="e.g., AAPL" required style="text-transform: uppercase;" />
            </div>
            <div class="form-group">
              <label for="stock-shares">Shares</label>
              <input type="number" id="stock-shares" placeholder="Number of shares" step="0.01" required />
            </div>
            <button type="submit" class="btn btn-primary">Add Stock</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // Re-attach form listeners
  attachFormListeners();
}

function renderNetWorthLists(assets, debts, stocks) {
  const listsContainer = document.getElementById("networth-lists");

  const assetsHTML =
    assets.length > 0
      ? assets
          .map(
            (asset) => `
      <div class="list-item">
        <div class="list-item-content">
          <div class="list-item-title">${asset.name}</div>
          <div class="list-item-subtitle">Asset</div>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-md);">
          <div class="list-item-value positive">$${asset.value.toLocaleString()}</div>
          <button class="btn btn-danger" onclick="deleteItem('asset', '${
            asset._id
          }')">Delete</button>
        </div>
      </div>
    `
          )
          .join("")
      : '<div class="list-item"><div class="list-item-content"><div class="list-item-title">No assets yet</div><div class="list-item-subtitle">Add your first asset above</div></div></div>';

  const debtsHTML =
    debts.length > 0
      ? debts
          .map(
            (debt) => `
      <div class="list-item">
        <div class="list-item-content">
          <div class="list-item-title">${debt.name}</div>
          <div class="list-item-subtitle">Debt</div>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-md);">
          <div class="list-item-value negative">$${debt.value.toLocaleString()}</div>
          <button class="btn btn-danger" onclick="deleteItem('debt', '${
            debt._id
          }')">Delete</button>
        </div>
      </div>
    `
          )
          .join("")
      : '<div class="list-item"><div class="list-item-content"><div class="list-item-title">No debts yet</div><div class="list-item-subtitle">Add debt information above</div></div></div>';

  const stocksHTML =
    stocks.length > 0
      ? stocks
          .map(
            (stock) => `
      <div class="list-item">
        <div class="list-item-content">
          <div class="list-item-title">${stock.symbol}</div>
          <div class="list-item-subtitle">${stock.shares} shares @ $${
              stock.price || "Loading..."
            }</div>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-md);">
          <div class="list-item-value primary">$${(
            (stock.price || 0) * stock.shares
          ).toLocaleString()}</div>
          <button class="btn btn-danger" onclick="deleteItem('stock', '${
            stock._id
          }')">Delete</button>
        </div>
      </div>
    `
          )
          .join("")
      : '<div class="list-item"><div class="list-item-content"><div class="list-item-title">No stocks yet</div><div class="list-item-subtitle">Add your first stock above</div></div></div>';

  listsContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--space-lg);">
      <div class="list-container">
        <div class="list-header">💰 Assets</div>
        ${assetsHTML}
      </div>
      
      <div class="list-container">
        <div class="list-header">💳 Debts</div>
        ${debtsHTML}
      </div>
      
      <div class="list-container">
        <div class="list-header">📈 Stocks</div>
        ${stocksHTML}
      </div>
    </div>
  `;
}

function attachFormListeners() {
  // Asset form
  const assetForm = document.getElementById("add-asset-form");
  if (assetForm) {
    assetForm.onsubmit = async function (e) {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.innerHTML =
        '<span class="loading"><span class="spinner"></span>Adding...</span>';
      submitBtn.disabled = true;

      const name = document.getElementById("asset-name").value;
      const value = parseFloat(document.getElementById("asset-value").value);
      const token = localStorage.getItem("token");

      try {
        await fetch(API_URL + "/assets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ name: name, value: value }),
        });

        document.getElementById("asset-name").value = "";
        document.getElementById("asset-value").value = "";
        fetchNetWorth();
      } catch (error) {
        console.error("Error adding asset:", error);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    };
  }

  // Debt form
  const debtForm = document.getElementById("add-debt-form");
  if (debtForm) {
    debtForm.onsubmit = async function (e) {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.innerHTML =
        '<span class="loading"><span class="spinner"></span>Adding...</span>';
      submitBtn.disabled = true;

      const name = document.getElementById("debt-name").value;
      const value = parseFloat(document.getElementById("debt-value").value);
      const token = localStorage.getItem("token");

      try {
        await fetch(API_URL + "/debts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ name: name, value: value }),
        });

        document.getElementById("debt-name").value = "";
        document.getElementById("debt-value").value = "";
        fetchNetWorth();
      } catch (error) {
        console.error("Error adding debt:", error);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    };
  }

  // Stock form
  const stockForm = document.getElementById("add-stock-form");
  if (stockForm) {
    stockForm.onsubmit = async function (e) {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.innerHTML =
        '<span class="loading"><span class="spinner"></span>Adding...</span>';
      submitBtn.disabled = true;

      const symbol = document
        .getElementById("stock-symbol")
        .value.toUpperCase();
      const shares = parseFloat(document.getElementById("stock-shares").value);
      const token = localStorage.getItem("token");

      try {
        await fetch(API_URL + "/stocks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ symbol: symbol, shares: shares }),
        });

        document.getElementById("stock-symbol").value = "";
        document.getElementById("stock-shares").value = "";
        fetchNetWorth();
      } catch (error) {
        console.error("Error adding stock:", error);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    };
  }
}

async function deleteItem(type, id) {
  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  try {
    await fetch(API_URL + "/" + type + "s/" + id, {
      method: "DELETE",
      headers: headers,
    });
    fetchNetWorth();
  } catch (error) {
    console.error("Error deleting " + type + ":", error);
  }
}

function showNetWorthError(message) {
  const statsContainer = document.getElementById("networth-stats");
  statsContainer.innerHTML =
    '<div class="alert alert-error">' + message + "</div>";
}

// Fetch and display username
function fetchUsername() {
  const token = localStorage.getItem("token");
  if (!token) return;
  const headers = { Authorization: "Bearer " + token };
  fetch(API_URL + "/auth/me", { headers: headers })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data && data.username) {
        var navUsername = document.getElementById("nav-username");
        if (navUsername) navUsername.textContent = data.username;
      }
    })
    .catch(function (err) {
      console.error("Error fetching username:", err);
    });
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", function () {
  fetchNetWorth();
  fetchUsername();
});
