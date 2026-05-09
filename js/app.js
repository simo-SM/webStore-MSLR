// MSLR App - Core Logic
const WHATSAPP_NUMBER = "+212691446200";
const DELIVERY_FEES = { standard: 30, fast: 45 };


function formatPrice(priceDH) {
  const currency = localStorage.getItem("mslr_currency") || "DH";
  if (currency === "USD") {
    return "$" + Math.round(priceDH / 10);
  }
  return Math.round(priceDH) + " DH";
}

function updateCurrencyUI() {
  const currency = localStorage.getItem("mslr_currency") || "DH";
  
  // Update buttons active state
  document.querySelectorAll(".curr-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.curr === currency);
  });

  // Update all elements with data-price
  document.querySelectorAll("[data-price]").forEach(el => {
    const priceDH = parseFloat(el.getAttribute("data-price"));
    if (!isNaN(priceDH)) {
      el.textContent = formatPrice(priceDH);
    }
  });

  // Page-specific updates
  const page = document.body.dataset.page;
  if (page === "cart") updateCartTotals();
  if (page === "checkout") updateCheckoutTotals();
}

function initCurrencySwitcher() {
  const btns = document.querySelectorAll(".curr-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      const curr = btn.dataset.curr;
      localStorage.setItem("mslr_currency", curr);
      updateCurrencyUI();
      // Close mobile dropdown if selection is from it
      const mobileDropdown = document.getElementById("mobile-settings-dropdown");
      if (mobileDropdown) mobileDropdown.classList.remove("active");
    });
  });
  updateCurrencyUI();
}

// Cart
function getCart() {
  try { return JSON.parse(localStorage.getItem("mslr_cart")) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem("mslr_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? "flex" : "none";
  });
}

function addToCart(productId, size, color, colorName, quantity = 1) {
  if (!size) { showToast("Please select a size", "error"); return false; }
  const product = products.find(p => p.id === productId);
  if (!product) return false;
  const cart = getCart();
  const key = `${productId}-${size}-${color}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      key, productId, name: product.name,
      price: product.price, size, color, colorName,
      quantity, image: product.images[0]
    });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart`, "success");
  return true;
}

function removeFromCart(key) {
  const cart = getCart().filter(i => i.key !== key);
  saveCart(cart);
}

function updateQuantity(key, delta) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem("mslr_cart");
  updateCartCount();
}

// Toast
function showToast(message, type = "success") {
  const existing = document.getElementById("mslr-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "mslr-toast";
  toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
    type === "success" ? "bg-lime-400 text-black" : "bg-red-500 text-white"
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  if (window.anime) {
    anime({ targets: toast, translateY: [20, 0], translateX: ["-50%", "-50%"], opacity: [0, 1], duration: 300, easing: "easeOutCubic" });
  }
  setTimeout(() => {
    if (window.anime) {
      anime({ targets: toast, opacity: 0, translateY: 10, duration: 300, easing: "easeInCubic", complete: () => toast.remove() });
    } else { toast.remove(); }
  }, 2800);
}

// Product Card HTML
function createProductCard(product) {
  const stars = Array.from({length: 5}, (_, i) =>
    `<span class="${i < Math.floor(product.rating) ? "text-lime-400" : "text-gray-600"}">★</span>`
  ).join("");
  const badge = product.badge ? `<span class="absolute top-3 left-3 bg-lime-400 text-black text-xs font-bold px-2 py-1 rounded-full z-10">${product.badge}</span>` : "";
  const colorDots = product.colors.map((c, i) =>
    `<button class="w-4 h-4 rounded-full border-2 border-transparent hover:border-lime-400 transition-all" style="background:${c}; ${c==='#ffffff'?'border-color:#666;':''}" title="${product.colorNames[i]}"></button>`
  ).join("");

  return `
    <div class="product-card group bg-[#043F37] rounded-2xl overflow-hidden cursor-pointer opacity-0 translate-y-8" data-id="${product.id}">
      <div class="relative overflow-hidden aspect-[3/4]">
        ${badge}
        <a href="product.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" onerror="this.src='https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=800'">
        </a>
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <button onclick="openQuickView('${product.id}')" class="bg-lime-400 text-black text-xs font-bold px-5 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-lime-300" data-i18n="hero_btn_shop">Quick View</button>
        </div>
      </div>
      <div class="p-4">
        <div class="flex gap-1 mb-1">${stars}</div>
        <a href="product.html?id=${product.id}" class="block text-white font-semibold text-sm hover:text-lime-400 transition-colors leading-tight mb-1">${product.name}</a>
        <div class="flex items-center justify-between mt-2">
          <span class="text-lime-400 font-bold text-base" data-price="${product.price}">${formatPrice(product.price)}</span>
          <div class="flex gap-1">${colorDots}</div>
        </div>
        <button onclick="handleQuickAdd(event,'${product.id}')" class="mt-3 w-full bg-white/5 hover:bg-lime-400 hover:text-black text-white text-xs font-bold py-2 rounded-full transition-all duration-300 border border-white/10 hover:border-lime-400" data-i18n="hero_btn_shop">Add to Cart</button>
      </div>
    </div>`;
}

function handleQuickAdd(e, productId) {
  e.stopPropagation();
  openQuickView(productId, true);
}

// Quick View Modal
function openQuickView(productId, addMode = false) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  let selectedSize = product.sizes[0];
  let selectedColor = 0;

  const modal = document.createElement("div");
  modal.id = "quick-view-modal";
  modal.className = "fixed inset-0 z-[9990] flex items-center justify-center p-4";
  modal.innerHTML = `
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="closeQuickView()"></div>
    <div class="relative bg-[#043F37] rounded-2xl overflow-hidden max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 z-10 max-h-[90vh] overflow-y-auto">
      <div class="aspect-square overflow-hidden">
        <a href="product.html?id=${product.id}">
          <img id="qv-img" src="${product.images[0]}" class="w-full h-full object-cover" alt="${product.name}">
        </a>
      </div>
      <div class="p-6 flex flex-col gap-4">
        <button onclick="closeQuickView()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none">×</button>
        <div>
          <p class="text-lime-400 text-xs font-bold uppercase tracking-widest mb-1">${product.category}</p>
          <h3 class="text-white font-bold text-xl leading-tight">${product.name}</h3>
          <p class="text-lime-400 font-bold text-2xl mt-1" data-price="${product.price}">${formatPrice(product.price)}</p>
        </div>
        <p class="text-gray-400 text-sm leading-relaxed">${product.description}</p>
        <div>
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-2">Color: <span id="qv-color-name" class="text-white">${product.colorNames[0]}</span></p>
          <div class="flex gap-2">${product.colors.map((c, i) =>
            `<button class="qv-color w-7 h-7 rounded-full border-2 ${i===0?'border-lime-400':'border-transparent'} hover:border-lime-400 transition-all" style="background:${c}; ${c==='#ffffff'?'border-color:#666;':''}" data-idx="${i}" onclick="selectQVColor(this,'${product.colorNames[i]}')"></button>`
          ).join("")}</div>
        </div>
        <div>
          <p class="text-gray-400 text-xs uppercase tracking-widest mb-2">Size</p>
          <div class="flex flex-wrap gap-2">${product.sizes.map((s, i) =>
            `<button class="qv-size px-3 py-1.5 rounded-lg text-sm border ${i===0?'bg-lime-400 text-black border-lime-400':'border-gray-700 text-gray-300 hover:border-lime-400'} transition-all" onclick="selectQVSize(this,'${s}')">${s}</button>`
          ).join("")}</div>
        </div>
        <div class="flex gap-3 mt-auto">
          <button onclick="qvAddToCart('${product.id}')" class="flex-1 bg-lime-400 text-black font-bold py-3 rounded-full hover:bg-lime-300 transition-colors text-sm">Add to Cart</button>
          <a href="product.html?id=${product.id}" class="flex-1 border border-lime-400 text-lime-400 font-bold py-3 rounded-full hover:bg-lime-400/10 transition-colors text-sm text-center">View Details</a>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  window._qvSelected = { size: selectedSize, colorIdx: 0, productId };

  if (window.anime) {
    anime({ targets: modal.querySelector('.relative.bg-\\[\\#111\\]'), scale: [0.95, 1], opacity: [0, 1], duration: 300, easing: "easeOutCubic" });
  }
}

function selectQVColor(btn, name) {
  document.querySelectorAll(".qv-color").forEach(b => b.classList.remove("border-lime-400"));
  btn.classList.add("border-lime-400");
  document.getElementById("qv-color-name").textContent = name;
  if (window._qvSelected) window._qvSelected.colorIdx = parseInt(btn.dataset.idx);
}

function selectQVSize(btn, size) {
  document.querySelectorAll(".qv-size").forEach(b => {
    b.classList.remove("bg-lime-400", "text-black", "border-lime-400");
    b.classList.add("border-gray-700", "text-gray-300");
  });
  btn.classList.add("bg-lime-400", "text-black", "border-lime-400");
  btn.classList.remove("border-gray-700", "text-gray-300");
  if (window._qvSelected) window._qvSelected.size = size;
}

function qvAddToCart(productId) {
  const product = products.find(p => p.id === productId);
  const sel = window._qvSelected;
  if (!sel || !sel.size) { showToast("Please select a size", "error"); return; }
  const color = product.colors[sel.colorIdx];
  const colorName = product.colorNames[sel.colorIdx];
  addToCart(productId, sel.size, color, colorName);
  closeQuickView();
}

function closeQuickView() {
  const modal = document.getElementById("quick-view-modal");
  if (modal) {
    if (window.anime) {
      anime({ targets: modal, opacity: [1, 0], duration: 200, easing: "easeInCubic", complete: () => { modal.remove(); document.body.style.overflow = ""; } });
    } else { modal.remove(); document.body.style.overflow = ""; }
  }
}

// Render Products Grid
function renderProducts(container, productList, limit = null) {
  if (!container) return;
  const list = limit ? productList.slice(0, limit) : productList;
  container.innerHTML = list.map(createProductCard).join("");
  animateProductCards(container);
  
  // Re-run translations for dynamic content
  const currentLang = localStorage.getItem("mslr_lang") || "en";
  updateTranslations(currentLang);
}

function animateProductCards(container) {
  if (!window.anime) return;
  const cards = container.querySelectorAll(".product-card");
  anime({
    targets: cards,
    opacity: [0, 1],
    translateY: [30, 0],
    delay: anime.stagger(80),
    duration: 600,
    easing: "easeOutCubic"
  });
}

// Shop page filter/search/sort
function initShop() {
  const grid = document.getElementById("shop-grid");
  const searchInput = document.getElementById("shop-search");
  const categoryBtns = document.querySelectorAll("[data-category]");
  const sizeSelect = document.getElementById("filter-size");
  const sortSelect = document.getElementById("sort-order");
  const resultCount = document.getElementById("result-count");
  if (!grid) return;

  let currentCategory = "all";
  let currentSearch = "";
  let currentSize = "";
  let currentSort = "default";

  function filterAndRender() {
    let list = [...products];
    if (currentCategory !== "all") list = list.filter(p => p.category === currentCategory);
    if (currentSearch) list = list.filter(p => p.name.toLowerCase().includes(currentSearch.toLowerCase()));
    if (currentSize) list = list.filter(p => p.sizes.includes(currentSize));
    if (currentSort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (currentSort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (currentSort === "rating") list.sort((a, b) => b.rating - a.rating);
    renderProducts(grid, list);
    if (resultCount) resultCount.textContent = `${list.length} product${list.length !== 1 ? "s" : ""}`;
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach(b => b.classList.remove("active-cat"));
      btn.classList.add("active-cat");
      currentCategory = btn.dataset.category;
      filterAndRender();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", e => { currentSearch = e.target.value; filterAndRender(); });
  }
  if (sizeSelect) sizeSelect.addEventListener("change", e => { currentSize = e.target.value; filterAndRender(); });
  if (sortSelect) sortSelect.addEventListener("change", e => { currentSort = e.target.value; filterAndRender(); });

  filterAndRender();
}

// Product Detail Page
function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) { window.location.href = "shop.html"; return; }
  const product = products.find(p => p.id === productId);
  if (!product) { window.location.href = "shop.html"; return; }

  let selectedColor = 0;
  let selectedSize = "";
  let quantity = 1;

  // Populate page
  document.title = `${product.name} — MSLR`;
  safeSet("pd-name", product.name);
  const pdPriceEl = document.getElementById("pd-price");
  if (pdPriceEl) {
    pdPriceEl.setAttribute("data-price", product.price);
    pdPriceEl.textContent = formatPrice(product.price);
  }
  safeSet("pd-description", product.description);
  safeSet("pd-category", product.category.toUpperCase());
  safeSet("pd-category-label", product.category.toUpperCase());
  safeSet("pd-stock", product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock");

  // Rating
  const ratingEl = document.getElementById("pd-rating");
  if (ratingEl) {
    const stars = Array.from({length: 5}, (_, i) =>
      `<span class="${i < Math.floor(product.rating) ? "text-lime-400" : "text-gray-600"} text-lg">★</span>`
    ).join("");
    ratingEl.innerHTML = `${stars} <span class="text-gray-400 text-sm ml-1">(${product.reviewCount} reviews)</span>`;
  }

  // Main image
  const mainImg = document.getElementById("pd-main-img");
  if (mainImg) mainImg.src = product.images[0];

  // Thumbnails
  const thumbContainer = document.getElementById("pd-thumbnails");
  if (thumbContainer) {
    thumbContainer.innerHTML = product.images.map((img, i) =>
      `<button class="thumb-btn aspect-square overflow-hidden rounded-lg border-2 ${i===0?'border-lime-400':'border-transparent'} hover:border-lime-400 transition-all" onclick="selectThumb(this,'${img}')">
        <img src="${img}" class="w-full h-full object-cover" alt="View ${i+1}" onerror="this.src='https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=400'">
      </button>`
    ).join("");
  }

  // Colors
  const colorContainer = document.getElementById("pd-colors");
  if (colorContainer) {
    colorContainer.innerHTML = product.colors.map((c, i) =>
      `<button class="pd-color w-8 h-8 rounded-full border-2 ${i===0?'border-lime-400':'border-gray-600'} hover:border-lime-400 transition-all" style="background:${c}; ${c==='#ffffff'?'border-color:#666;':''}" title="${product.colorNames[i]}" data-idx="${i}" onclick="selectPDColor(this)"></button>`
    ).join("");
  }

  const colorNameEl = document.getElementById("pd-color-name");
  if (colorNameEl) colorNameEl.textContent = product.colorNames[0];

  // Sizes
  const sizeContainer = document.getElementById("pd-sizes");
  if (sizeContainer) {
    sizeContainer.innerHTML = product.sizes.map((s, i) =>
      `<button class="pd-size px-4 py-2 rounded-lg border text-sm font-medium ${i===0?'bg-lime-400 text-black border-lime-400':'border-gray-700 text-gray-300 hover:border-lime-400'} transition-all" onclick="selectPDSize(this,'${s}')">${s}</button>`
    ).join("");
    if (product.sizes.length > 0) selectedSize = product.sizes[0];
  }

  // Quantity
  const qtyDisplay = document.getElementById("pd-qty");
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");
  if (qtyMinus) qtyMinus.onclick = () => { quantity = Math.max(1, quantity - 1); if (qtyDisplay) qtyDisplay.textContent = quantity; };
  if (qtyPlus) qtyPlus.onclick = () => { quantity++; if (qtyDisplay) qtyDisplay.textContent = quantity; };

  // Add to Cart
  const addBtn = document.getElementById("pd-add-cart");
  if (addBtn) {
    addBtn.onclick = () => {
      const color = product.colors[selectedColor];
      const colorName = product.colorNames[selectedColor];
      addToCart(product.id, selectedSize, color, colorName, quantity);
    };
  }

  // Buy Now
  const buyBtn = document.getElementById("pd-buy-now");
  if (buyBtn) {
    buyBtn.onclick = () => {
      const color = product.colors[selectedColor];
      const colorName = product.colorNames[selectedColor];
      if (addToCart(product.id, selectedSize, color, colorName, quantity)) {
        window.location.href = "cart.html";
      }
    };
  }

  // WhatsApp quick order
  const waBtn = document.getElementById("pd-whatsapp");
  if (waBtn) {
    waBtn.onclick = () => {
      const color = product.colorNames[selectedColor];
      const msg = `Hello MSLR! I want to order:\n\n*${product.name}*\nColor: ${color}\nSize: ${selectedSize || "TBD"}\nQty: ${quantity}\nPrice: ${formatPrice(product.price * quantity)}\n\nPlease confirm availability.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/,"")}?text=${encodeURIComponent(msg)}`);
    };
  }

  // Related products
  const relatedContainer = document.getElementById("related-grid");
  if (relatedContainer) {
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    renderProducts(relatedContainer, related);
  }

  window.selectPDColor = (btn) => {
    document.querySelectorAll(".pd-color").forEach(b => b.classList.replace("border-lime-400","border-gray-600"));
    btn.classList.replace("border-gray-600","border-lime-400");
    selectedColor = parseInt(btn.dataset.idx);
    if (colorNameEl) colorNameEl.textContent = product.colorNames[selectedColor];
  };

  window.selectPDSize = (btn, size) => {
    document.querySelectorAll(".pd-size").forEach(b => {
      b.classList.remove("bg-lime-400","text-black","border-lime-400");
      b.classList.add("border-gray-700","text-gray-300");
    });
    btn.classList.add("bg-lime-400","text-black","border-lime-400");
    btn.classList.remove("border-gray-700","text-gray-300");
    selectedSize = size;
  };

  window.selectThumb = (btn, src) => {
    document.querySelectorAll(".thumb-btn").forEach(b => b.classList.replace("border-lime-400","border-transparent"));
    btn.classList.replace("border-transparent","border-lime-400");
    if (mainImg) {
      if (window.anime) {
        anime({ targets: mainImg, opacity: [0, 1], duration: 300, easing: "easeOutCubic", begin: () => mainImg.src = src });
      } else { mainImg.src = src; }
    }
  };
}

function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Cart Page
function initCartPage() {
  renderCartPage();
}

function renderCartPage() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const emptyMsg = document.getElementById("cart-empty");
  const cartSummary = document.getElementById("cart-summary");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "";
    if (emptyMsg) emptyMsg.style.display = "flex";
    if (cartSummary) cartSummary.style.display = "none";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (cartSummary) cartSummary.style.display = "block";

  container.innerHTML = cart.map(item => `
    <div class="cart-item flex gap-4 bg-[#043F37] rounded-2xl p-4 items-start" data-key="${item.key}">
      <a href="product.html?id=${item.productId}">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded-xl flex-shrink-0" onerror="this.src='https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=200'">
      </a>
      <div class="flex-1 min-w-0">
        <a href="product.html?id=${item.productId}" class="text-white font-semibold text-sm hover:text-lime-400 transition-colors block truncate">${item.name}</a>
        <div class="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
          <span>Size: <span class="text-gray-200">${item.size}</span></span>
          <span class="flex items-center gap-1">Color: <span class="inline-block w-3 h-3 rounded-full" style="background:${item.color}; ${item.color==='#ffffff'?'border:1px solid #666;':''}"></span> <span class="text-gray-200">${item.colorName}</span></span>
        </div>
        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center gap-2 bg-black/40 rounded-full px-1 py-0.5">
            <button onclick="cartUpdateQty('${item.key}', -1)" class="w-7 h-7 flex items-center justify-center text-white hover:text-lime-400 transition-colors text-lg leading-none">−</button>
            <span class="text-white font-medium w-5 text-center text-sm">${item.quantity}</span>
            <button onclick="cartUpdateQty('${item.key}', 1)" class="w-7 h-7 flex items-center justify-center text-white hover:text-lime-400 transition-colors text-lg leading-none">+</button>
          </div>
          <span class="text-lime-400 font-bold" data-price="${item.price * item.quantity}">${formatPrice((item.price * item.quantity).toFixed(2))}</span>
        </div>
      </div>
      <button onclick="cartRemove('${item.key}')" class="text-gray-600 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0">×</button>
    </div>
  `).join("");

  updateCartTotals();
}

function cartUpdateQty(key, delta) {
  updateQuantity(key, delta);
  renderCartPage();
}

function cartRemove(key) {
  removeFromCart(key);
  renderCartPage();
}

function updateCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryType = document.querySelector('input[name="cart-delivery"]:checked')?.value || "standard";
  const currency = localStorage.getItem("mslr_currency") || "DH";
  const delivery = currency === "USD" 
    ? (deliveryType === "fast" ? 50 : 30) // Use 50 as DH base to get $5 via formatPrice(50)
    : (DELIVERY_FEES[deliveryType] || DELIVERY_FEES.standard);
  
  const total = subtotal + (cart.length > 0 ? (currency === "USD" ? (deliveryType === "fast" ? 50 : 30) : delivery) : 0);

  const subtotalEl = document.getElementById("cart-subtotal");
  if (subtotalEl) {
    subtotalEl.setAttribute("data-price", subtotal);
    subtotalEl.textContent = formatPrice(subtotal);
  }
  
  const deliveryEl = document.getElementById("cart-delivery-fee");
  if (deliveryEl) {
    if (cart.length > 0) {
      const fee = currency === "USD" ? (deliveryType === "fast" ? 50 : 30) : delivery;
      deliveryEl.setAttribute("data-price", fee);
      deliveryEl.textContent = formatPrice(fee);
    } else {
      deliveryEl.textContent = "0 DH";
    }
  }

  const totalEl = document.getElementById("cart-total");
  if (totalEl) {
    if (cart.length > 0) {
      const totalVal = subtotal + (currency === "USD" ? (deliveryType === "fast" ? 50 : 30) : delivery);
      totalEl.setAttribute("data-price", totalVal);
      totalEl.textContent = formatPrice(totalVal);
    } else {
      totalEl.textContent = "0 DH";
    }
  }
}


window.cartUpdateQty = cartUpdateQty;
window.cartRemove = cartRemove;

// Checkout Page
function initCheckoutPage() {
  const cart = getCart();
  const itemsContainer = document.getElementById("checkout-items");
  if (!itemsContainer) return;
  if (cart.length === 0) { window.location.href = "cart.html"; return; }

  itemsContainer.innerHTML = cart.map(item => `
    <div class="flex items-center gap-3 py-3 border-b border-gray-800">
      <a href="product.html?id=${item.productId}">
        <img src="${item.image}" class="w-14 h-16 object-cover rounded-lg flex-shrink-0" onerror="this.src='https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=100'">
      </a>
      <div class="flex-1 min-w-0">
        <p class="text-white text-sm font-medium truncate">${item.name}</p>
        <p class="text-gray-400 text-xs mt-0.5">Size: ${item.size} · Color: ${item.colorName} · Qty: ${item.quantity}</p>
      </div>
      <span class="text-lime-400 font-bold text-sm flex-shrink-0" data-price="${item.price * item.quantity}">${formatPrice((item.price * item.quantity).toFixed(2))}</span>
    </div>
  `).join("");

  updateCheckoutTotals();
  
  // Re-run translations
  const currentLang = localStorage.getItem("mslr_lang") || "en";
  updateTranslations(currentLang);

  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener("change", updateCheckoutTotals);
  });

  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      sendWhatsAppOrder();
    });
  }
}

function updateCheckoutTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryType = document.querySelector('input[name="delivery"]:checked')?.value || "standard";
  
  const currency = localStorage.getItem("mslr_currency") || "DH";
  const deliveryFee = currency === "USD" ? (deliveryType === "fast" ? 50 : 30) : (DELIVERY_FEES[deliveryType]);
  const total = subtotal + deliveryFee;

  const subtotalEl = document.getElementById("co-subtotal");
  if (subtotalEl) {
    subtotalEl.setAttribute("data-price", subtotal);
    subtotalEl.textContent = formatPrice(subtotal);
  }

  const deliveryEl = document.getElementById("co-delivery-fee");
  if (deliveryEl) {
    deliveryEl.setAttribute("data-price", deliveryFee);
    deliveryEl.textContent = formatPrice(deliveryFee);
  }

  const totalEl = document.getElementById("co-total");
  if (totalEl) {
    totalEl.setAttribute("data-price", total);
    totalEl.textContent = formatPrice(total);
  }
}

function sendWhatsAppOrder() {
  const cart = getCart();
  const name = document.getElementById("co-name")?.value.trim();
  const phone = document.getElementById("co-phone")?.value.trim();
  const city = document.getElementById("co-city")?.value.trim();
  const address = document.getElementById("co-address")?.value.trim();
  const payment = document.querySelector('input[name="payment"]:checked')?.value || "Cash on Delivery";
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value || "standard";
  const currency = localStorage.getItem("mslr_currency") || "DH";
  const deliveryLabel = currency === "USD" 
    ? (delivery === "fast" ? "Fast Delivery ($5)" : "Standard Delivery ($3)")
    : (delivery === "fast" ? "Fast Delivery (+45 DH)" : "Standard Delivery (+30 DH)");
  const deliveryFee = currency === "USD" ? (delivery === "fast" ? 50 : 30) : DELIVERY_FEES[delivery];

  if (!name || !phone || !city || !address) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;

  const itemLines = cart.map(i =>
    `• ${i.name}\n  Size: ${i.size} | Color: ${i.colorName} | Qty: ${i.quantity} | ${formatPrice(i.price * i.quantity)}`
  ).join("\n\n");

  const msg = `▬▬ *New MSLR Order* ▬▬\n\n` +
    `*Customer Info*\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nAddress: ${address}\n\n` +
    `*Order Details*\n${itemLines}\n\n` +
    `*Payment:* ${payment}\n*Delivery:* ${deliveryLabel}\n\n` +
    `*Subtotal:* ${formatPrice(subtotal)}\n*Delivery:* ${formatPrice(deliveryFee)}\n*Total:* ${formatPrice(total)}\n\n` +
    `Currency: ${localStorage.getItem("mslr_currency") || "DH"}\n\n` +
    `Please confirm my order. Thank you!`;

  const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/,"")}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
  clearCart();
  setTimeout(() => { window.location.href = "thank-you.html"; }, 500);
}

// Mobile menu
function initMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.contains("open");
      if (isOpen) {
        if (window.anime) {
          anime({ targets: menu, translateY: [0, -20], opacity: [1, 0], duration: 250, easing: "easeInCubic", complete: () => menu.classList.remove("open") });
        } else { menu.classList.remove("open"); }
      } else {
        menu.classList.add("open");
        if (window.anime) {
          anime({ targets: menu, translateY: [-20, 0], opacity: [0, 1], duration: 250, easing: "easeOutCubic" });
        }
      }
    });
  }
}

// Scroll animations
function initScrollAnimations() {
  if (!window.anime) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.classList.contains("fade-up")) {
          anime({ targets: el, translateY: [40, 0], opacity: [0, 1], duration: 700, easing: "easeOutCubic" });
          el.classList.remove("fade-up");
        }
        if (el.classList.contains("fade-in")) {
          anime({ targets: el, opacity: [0, 1], duration: 700, easing: "easeOutCubic" });
          el.classList.remove("fade-in");
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".fade-up, .fade-in").forEach(el => observer.observe(el));
}

// Navbar scroll
function initNavbarScroll() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      nav.classList.add("nav-scrolled");
    } else {
      nav.classList.remove("nav-scrolled");
    }
  }, { passive: true });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  initMobileMenu();
  initNavbarScroll();

  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "shop") initShop();
  if (page === "product") initProductPage();
  if (page === "cart") initCartPage();
  if (page === "checkout") initCheckoutPage();

  setTimeout(initScrollAnimations, 100);
  initLanguageSwitcher();
  initCurrencySwitcher();
  initMobileSettings();
});

// ── LANGUAGE SWITCHER LOGIC ──
const mslr_translations = {
  en: {
    home: "Home",
    shop: "Shop",
    collections: "Collections",
    about: "About",
    contact: "Contact",
    view_cart: "View Cart",
    // Hero
    hero_tag: "New Collection — 2025",
    hero_title_1: "Unleash",
    hero_title_2: " Your",
    hero_title_3: " Style",
    hero_subtitle: "Shop premium streetwear built for everyday confidence. Crafted for those who move through life on their own terms.",
    hero_btn_shop: "Shop Now",
    hero_btn_coll: "View Collections",
    hero_stat_clients: "Happy Clients",
    hero_stat_coll: "Collections",
    scroll: "Scroll",
    // Sections
    sections_cat_tag: "Shop by Category",
    sections_cat_title: "Collections",
    sections_feat_tag: "Handpicked",
    sections_feat_title: "Featured Drops",
    sections_view_all: "View All",
    sections_style_tag: "Style Guides",
    sections_style_title: "How to Wear It",
    sections_story_tag: "Our Story",
    sections_story_title: "Born on the Streets. Built to Last.",
    sections_story_p1: "MSLR was founded on a simple belief — that premium quality and streetwear authenticity don't have to be a trade-off. Every piece we make starts with the highest quality fabrics, cut to silhouettes that move the way you do.",
    sections_story_p2: "No shortcuts. No compromises. Just clothing that earns its place in your rotation, season after season.",
    sections_story_btn: "Shop the Brand",
    sections_contact_tag: "Get in Touch",
    sections_contact_title: "Questions? We're Here.",
    sections_contact_p: "Reach us directly on WhatsApp for order help, custom requests, or just to say hello. We reply fast.",
    sections_whatsapp_btn: "Chat on WhatsApp",
    sections_browse_btn: "Browse Shop",
    // Stats
    stat_founded: "Founded",
    stat_customers: "Customers",
    stat_cotton: "Premium Cotton",
    stat_collections: "Collections",
    stat_promise_title: "Our Promise",
    stat_promise_p: "Every order ships with premium packaging, a personal note, and the guarantee that you're wearing something made to outlast trends.",
    // Footer
    footer_desc: "Premium streetwear built for everyday confidence. Quality without compromise.",
    footer_shop_title: "Shop",
    footer_info_title: "Info",
    footer_hoodies: "Hoodies",
    footer_tshirts: "T-Shirts",
    footer_sets: "Sets",
    footer_acc: "Accessories",
    footer_arrivals: "New Arrivals",
    footer_about: "About MSLR",
    footer_contact: "Contact Us",
    footer_size: "Size Guide",
    footer_shipping: "Shipping Policy",
    footer_returns: "Returns",
    footer_rights: "© 2025 MSLR. All rights reserved.",
    footer_tagline: "Premium Streetwear — Crafted with Intention",
    // Categories
    cat_hoodies: "Hoodies",
    cat_tshirts: "T-Shirts",
    cat_sets: "Sets",
    cat_acc: "Accessories",
    // Shop & Product
    shop_tag: "All Products",
    shop_title: "The Shop",
    filter_btn: "Filters",
    sort_btn: "Newest First",
    search_placeholder: "Search products...",
    price: "Price",
    color: "Color",
    size: "Size",
    pd_highlights: "Highlights",
    pd_shipping_title: "Free Shipping",
    pd_shipping_p: 'On all orders above <span data-price="1000">1000 DH</span>',
    pd_returns_title: "Easy Returns",
    pd_returns_p: "14-day hassle-free return policy",
    all: "All",
    sort_by: "Sort By",
    price_low_high: "Price: Low–High",
    price_high_low: "Price: High–Low",
    top_rated: "Top Rated",
    in_stock: "In Stock",
    buy_now: "Buy Now",
    quick_order_wa: "Quick Order on WhatsApp",
    // Cart & Checkout
    cart_title: "Your Cart",
    cart_empty: "Your cart is empty",
    cart_continue: "Continue Shopping",
    cart_subtotal: "Subtotal",
    cart_checkout: "Proceed to Checkout",
    co_steps_1: "Cart",
    co_steps_2: "Checkout",
    co_steps_3: "Confirm",
    co_back_cart: "Back to Cart",
    co_title: "Checkout",
    co_header_tag: "Complete Your Order",
    co_customer_title: "Customer Information",
    co_payment_title: "Payment Method",
    co_delivery_title: "Delivery Method",
    co_label_name: "Full Name *",
    co_label_phone: "Phone Number *",
    co_label_city: "City *",
    co_label_address: "Delivery Address *",
    co_summary_title: "Order Summary",
    co_delivery_fee: "Delivery",
    co_total: "Total",
    co_whatsapp_btn: "Send Order on WhatsApp",
    co_terms: "By placing your order, you agree to our Terms of Service",
    co_secure: "Secure",
    co_easy_return: "Easy Return",
    co_guaranteed: "Guaranteed",
    co_payment_cod: "Cash on Delivery",
    co_payment_cod_sub: "Pay when you receive",
    co_payment_bank: "Bank Transfer",
    co_payment_bank_sub: "Wire to our account",
    co_delivery_standard: "Standard Delivery",
    co_delivery_standard_sub: "3–5 business days · Tracked shipping",
    co_delivery_fast: "Fast Delivery",
    co_delivery_fast_sub: "1–2 business days · Priority handling",
    // Thank You
    ty_title: "Thank You for Your Order",
    ty_msg: "We received your request on WhatsApp and will contact you soon.",
    ty_msg2: "Our team typically responds within 1–2 hours during business hours. Keep an eye on your WhatsApp messages.",
    ty_continue: "Continue Shopping",
    ty_home: "Back to Home",
    ty_ref: "Order Reference"
  },
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    collections: "المجموعات",
    about: "حول",
    contact: "تواصل",
    view_cart: "عرض السلة",
    // Hero
    hero_tag: "مجموعة جديدة — 2025",
    hero_title_1: "أطلق",
    hero_title_2: " أسلوبك",
    hero_title_3: "",
    hero_subtitle: "تسوق ملابس الشارع الفاخرة المصممة للثقة اليومية. صنعت لأولئك الذين يتحركون في الحياة بشروطهم الخاصة.",
    hero_btn_shop: "تسوق الآن",
    hero_btn_coll: "عرض المجموعات",
    hero_stat_clients: "عملاء سعداء",
    hero_stat_coll: "مجموعات",
    scroll: "مرر",
    // Sections
    sections_cat_tag: "تسوق حسب الفئة",
    sections_cat_title: "المجموعات",
    sections_feat_tag: "مختارة بعناية",
    sections_feat_title: "الإصدارات المميزة",
    sections_view_all: "عرض الكل",
    sections_style_tag: "أدلة الأناقة",
    sections_style_title: "كيفية ارتدائه",
    sections_story_tag: "قصتنا",
    sections_story_title: "ولدت في الشوارع. صنعت لتدوم.",
    sections_story_p1: "تأسست MSLR على إيمان بسيط — وهو أن الجودة الفاخرة وأصالة ملابس الشارع لا يجب أن تكون مقايضة. كل قطعة نصنعها تبدأ بأقمشة عالية الجودة، مقصوصة بظلال تتحرك بالطريقة التي تتحرك بها.",
    sections_story_p2: "لا اختصارات. لا تنازلات. مجرد ملابس تستحق مكانها في دورتك، موسمًا بعد موسم.",
    sections_story_btn: "تسوق العلامة التجارية",
    sections_contact_tag: "تواصل معنا",
    sections_contact_title: "أسئلة؟ نحن هنا.",
    sections_contact_p: "تواصل معنا مباشرة عبر واتساب للحصول على مساعدة في الطلب، أو طلبات خاصة، أو فقط لقول مرحبًا. نحن نرد بسرعة.",
    sections_whatsapp_btn: "تحدث عبر واتساب",
    sections_browse_btn: "تصفح المتجر",
    // Stats
    stat_founded: "تأسست",
    stat_customers: "عملاء",
    stat_cotton: "قطن فاخر",
    stat_collections: "مجموعات",
    stat_promise_title: "وعدنا",
    stat_promise_p: "كل طلب يتم شحنه بتغليف مميز، وملاحظة شخصية، وضمان أنك ترتدي شيئًا صنع ليدوم أكثر من الصيحات العابرة.",
    // Footer
    footer_desc: "ملابس شارع فاخرة مصممة للثقة اليومية. جودة بدون تنازلات.",
    footer_shop_title: "المتجر",
    footer_info_title: "معلومات",
    footer_hoodies: "هوديز",
    footer_tshirts: "تيشرتات",
    footer_sets: "أطقم",
    footer_acc: "إكسسوارات",
    footer_arrivals: "وصلنا حديثاً",
    footer_about: "حول MSLR",
    footer_contact: "تواصل معنا",
    footer_size: "دليل المقاسات",
    footer_shipping: "سياسة الشحن",
    footer_returns: "المرتجعات",
    footer_rights: "© 2025 MSLR. جميع الحقوق محفوظة.",
    footer_tagline: "ملابس شارع فاخرة — صنعت بقصد",
    // Categories
    cat_hoodies: "هوديز",
    cat_tshirts: "تيشرتات",
    cat_sets: "أطقم",
    cat_acc: "إكسسوارات",
    // Shop & Product
    shop_tag: "جميع المنتجات",
    shop_title: "المتجر",
    filter_btn: "تصفية",
    sort_btn: "الأحدث أولاً",
    search_placeholder: "البحث عن المنتجات...",
    price: "السعر",
    color: "اللون",
    size: "المقاس",
    pd_highlights: "أهم الميزات",
    pd_shipping_title: "شحن مجاني",
    pd_shipping_p: 'على جميع الطلبات التي تزيد عن <span data-price="1000">1000 درهم</span>',
    pd_returns_title: "مرتجع سهل",
    pd_returns_p: "سياسة إرجاع خالية من المتاعب لمدة 14 يومًا",
    all: "الكل",
    sort_by: "ترتيب حسب",
    price_low_high: "السعر: من الأقل إلى الأعلى",
    price_high_low: "السعر: من الأعلى إلى الأقل",
    top_rated: "الأعلى تقييماً",
    in_stock: "متوفر",
    buy_now: "اشتري الآن",
    quick_order_wa: "طلب سريع عبر واتساب",
    // Cart & Checkout
    cart_title: "سلة التسوق",
    cart_empty: "سلتك فارغة",
    cart_continue: "متابعة التسوق",
    cart_subtotal: "المجموع الفرعي",
    cart_checkout: "إتمام الطلب",
    co_steps_1: "السلة",
    co_steps_2: "الدفع",
    co_steps_3: "تأكيد",
    co_back_cart: "الرجوع للسلة",
    co_title: "الدفع",
    co_header_tag: "أكمل طلبك",
    co_customer_title: "معلومات العميل",
    co_payment_title: "طريقة الدفع",
    co_delivery_title: "طريقة التوصيل",
    co_label_name: "الاسم الكامل *",
    co_label_phone: "رقم الهاتف *",
    co_label_city: "المدينة *",
    co_label_address: "عنوان التوصيل *",
    co_summary_title: "ملخص الطلب",
    co_delivery_fee: "التوصيل",
    co_total: "المجموع",
    co_whatsapp_btn: "إرسال الطلب عبر واتساب",
    co_terms: "بتقديم طلبك، فإنك توافق على شروط الخدمة الخاصة بنا",
    co_secure: "آمن",
    co_easy_return: "إرجاع سهل",
    co_guaranteed: "مضمون",
    co_payment_cod: "الدفع عند الاستلام",
    co_payment_cod_sub: "الدفع عند الاستلام",
    co_payment_bank: "تحويل بنكي",
    co_payment_bank_sub: "تحويل إلى حسابنا",
    co_delivery_standard: "توصيل عادي",
    co_delivery_standard_sub: "3-5 أيام عمل · شحن متتبع",
    co_delivery_fast: "توصيل سريع",
    co_delivery_fast_sub: "1-2 أيام عمل · معالجة ذات أولوية",
    // Thank You
    ty_title: "شكراً لطلبك",
    ty_msg: "لقد تلقينا طلبك على واتساب وسنتصل بك قريباً.",
    ty_msg2: "عادةً ما يقوم فريقنا بالرد خلال ساعة إلى ساعتين خلال ساعات العمل. ابقَ عينك على رسائل واتساب الخاصة بك.",
    ty_continue: "متابعة التسوق",
    ty_home: "العودة للرئيسية",
    ty_ref: "مرجع الطلب"
  }
};

function initLanguageSwitcher() {
  const currentLang = localStorage.getItem("mslr_lang") || "en";
  setLanguage(currentLang, false);

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
      // Close mobile dropdown if selection is from it
      const mobileDropdown = document.getElementById("mobile-settings-dropdown");
      if (mobileDropdown) mobileDropdown.classList.remove("active");
    });
  });
}

function setLanguage(lang, animate = true) {
  const oldLang = localStorage.getItem("mslr_lang") || "en";
  localStorage.setItem("mslr_lang", lang);
  
  // SEO & Direction
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Body classes
  document.body.classList.remove("rtl", "ltr");
  document.body.classList.add(lang === "ar" ? "rtl" : "ltr");

  // Update UI buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Smooth Transition Logic
  if (animate && oldLang !== lang && window.anime) {
    anime({
      targets: "main, .hero-section, footer",
      opacity: [1, 0.98, 1],
      duration: 400,
      easing: "easeInOutQuad",
      begin: () => {
        // Update translations mid-fade for smoothness
        setTimeout(() => updateTranslations(lang), 150);
      }
    });
  } else {
    updateTranslations(lang);
  }
}

function updateTranslations(lang) {
  const t = mslr_translations[lang];
  if (!t) return;

  // Update text content
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) {
      // Use innerHTML for keys containing line breaks or spans
      if (key.includes('hero_title') || key.includes('_p1') || key.includes('_p2') || key.includes('ty_title') || key === 'pd_shipping_p') {
        el.innerHTML = t[key];
        // If it contains a data-price, update it immediately
        const priceEl = el.querySelector('[data-price]');
        if (priceEl) {
          priceEl.textContent = formatPrice(priceEl.dataset.price);
        }
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key]) {
      el.placeholder = t[key];
    }
  });
}

function initHomePage() {
  const featuredGrid = document.getElementById("featured-grid");
// ... remaining code

  if (featuredGrid) {
    const featured = products.filter(p => p.featured);
    renderProducts(featuredGrid, featured);
  }

  // Hero animation
  if (window.anime) {
    anime({
      targets: ".hero-title span",
      translateY: [60, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 900,
      easing: "easeOutCubic"
    });
    anime({
      targets: ".hero-subtitle",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: 400,
      duration: 800,
      easing: "easeOutCubic"
    });
    anime({
      targets: ".hero-btns",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: 600,
      duration: 800,
      easing: "easeOutCubic"
    });
    anime({
      targets: ".hero-bg-logo",
      opacity: [0, 0.06],
      scale: [0.95, 1],
      delay: 200,
      duration: 1200,
      easing: "easeOutCubic"
    });
  }
}

// Mobile Settings Dropdown
function initMobileSettings() {
  const toggle = document.getElementById("mobile-settings-toggle");
  const dropdown = document.getElementById("mobile-settings-dropdown");
  
  if (!toggle || !dropdown) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
}
