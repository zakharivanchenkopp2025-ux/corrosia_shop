document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     1. Мобільне меню (Гамбургер у Header)
     ========================================================================== */
  const menuBtn = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      const isExpanded = !mobileMenu.classList.contains("hidden");
      menuBtn.setAttribute("aria-expanded", isExpanded);
    });
  }

  /* ==========================================================================
     2. Логіка Кошика через LocalStorage
     ========================================================================== */
  function getCart() {
    return JSON.parse(localStorage.getItem("corrosia_cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("corrosia_cart", JSON.stringify(cart));
    updateCartCounter();
  }

  function updateCartCounter() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll(".cart-box-btn").forEach(el => {
      el.textContent = `Кошик (${totalCount})`;
    });
  }

  // Оновлюємо лічильник одразу при завантаженні сторінки
  updateCartCounter();

  // Додавання товару зі сторінки product.html
  const addToCartBtn = document.querySelector(".btn-add-to-cart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const activeSizeBtn = document.querySelector(".size-btn.active");
      const size = activeSizeBtn ? activeSizeBtn.textContent.trim() : "M";
      const qtySpan = document.querySelector(".qty-wrap span");
      const qty = qtySpan ? parseInt(qtySpan.textContent) || 1 : 1;

      const product = {
        id: "hoodie-corrosia",
        name: "Худі CORROSIA",
        price: 1890,
        color: "Чорний",
        size: size,
        image: "assets/images/category-hoodie.png",
        qty: qty
      };

      const cart = getCart();
      const existing = cart.find(item => item.id === product.id && item.size === product.size);
      if (existing) {
        existing.qty += product.qty;
      } else {
        cart.push(product);
      }

      saveCart(cart);
      alert("Товар додано в кошик!");
    });
  }

  // Рендер кошика на сторінці cart.html
  const cartItemsContainer = document.getElementById("cart-items-list");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartTotalEl = document.getElementById("cart-total");
  const cartSubtitleEl = document.getElementById("cart-subtitle");

  function renderCart() {
    if (!cartItemsContainer) return;
    const cart = getCart();

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="padding: 40px 0; color: var(--text-gray);">
          <p style="font-size: 1.1rem; margin-bottom: 20px;">Твій кошик порожній.</p>
          <a href="catalog.html" class="btn btn-secondary">&larr; Перейти до покупок</a>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = "0 ₴";
      if (cartTotalEl) cartTotalEl.textContent = "0 ₴";
      if (cartSubtitleEl) cartSubtitleEl.textContent = "0 речей / Кошик порожній";
      return;
    }

    let subtotal = 0;
    let totalItems = 0;
    cartItemsContainer.innerHTML = "";

    cart.forEach((item, index) => {
      subtotal += item.price * item.qty;
      totalItems += item.qty;

      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <div>
          <h4>${item.name}</h4>
          <p style="color: var(--text-gray); font-size: 0.9rem;">${item.color} / ${item.size}</p>
          <strong style="margin-top: 8px; display: block;">${item.price} ₴</strong>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <div class="qty-wrap" style="margin: 0;">
            <button class="qty-btn" data-action="dec" data-index="${index}">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-index="${index}">+</button>
          </div>
          <button class="btn btn-secondary btn-del" data-index="${index}" style="padding: 6px 12px;">Видалити</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    if (cartSubtotalEl) cartSubtotalEl.textContent = `${subtotal.toLocaleString()} ₴`;
    if (cartTotalEl) cartTotalEl.textContent = `${subtotal.toLocaleString()} ₴`;
    if (cartSubtitleEl) cartSubtitleEl.textContent = `${totalItems} речей / Перевір деталі перед оформленням.`;

    cartItemsContainer.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.index;
        if (btn.dataset.action === "inc") {
          cart[idx].qty++;
        } else if (btn.dataset.action === "dec" && cart[idx].qty > 1) {
          cart[idx].qty--;
        }
        saveCart(cart);
        renderCart();
      });
    });

    cartItemsContainer.querySelectorAll(".btn-del").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.index;
        cart.splice(idx, 1);
        saveCart(cart);
        renderCart();
      });
    });
  }

  renderCart();

  /* ==========================================================================
     3. Перемикання розмірів (S, M, L, XL)
     ========================================================================== */
  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      sizeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  /* ==========================================================================
     4. Фільтрація каталогу за чекбоксами (catalog.html)
     ========================================================================== */
  const categoryCheckboxes = document.querySelectorAll(".filter-checkboxes input[type='checkbox']");
  const productCards = document.querySelectorAll(".catalog-grid .product-card");
  const noProductsMsg = document.getElementById("no-products");
  const resetBtn = document.getElementById("reset-filter-btn");
  const applyBtn = document.getElementById("apply-filter-btn");

  function runFilter() {
    if (!productCards.length) return;
    const checked = Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    let visible = 0;

    productCards.forEach(card => {
      const cat = card.getAttribute("data-category") || "";
      if (checked.length === 0 || checked.includes(cat)) {
        card.style.display = "block";
        visible++;
      } else {
        card.style.display = "none";
      }
    });

    if (noProductsMsg) {
      noProductsMsg.style.display = visible === 0 ? "block" : "none";
    }
  }

  if (categoryCheckboxes.length > 0) {
    categoryCheckboxes.forEach(cb => cb.addEventListener("change", runFilter));
  }
  if (applyBtn) applyBtn.addEventListener("click", runFilter);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      categoryCheckboxes.forEach(cb => cb.checked = false);
      runFilter();
    });
  }
});