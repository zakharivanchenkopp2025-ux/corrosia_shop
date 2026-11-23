document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     0. Інтерактивний хаб Atelier (WAI-ARIA Segmented Control)
     ========================================================================== */
  const atelierHub = document.getElementById("atelier-hub");

  if (atelierHub) {
    const tabs = Array.from(atelierHub.querySelectorAll('[role="tab"][data-atelier-tab]'));
    const panels = {
      drops: document.getElementById("drops"),
      gallery: document.getElementById("gallery")
    };

    const activeClasses = "bg-[#8A0303] text-white border-[#8A0303] rounded-none";
    const inactiveClasses = "bg-[#0d0d0d] text-[#a3a3a3] border-white/10 hover:text-white rounded-none";

    function normalizeAtelierTab(tabName) {
      if (!tabName) return "drops";
      const normalized = String(tabName).toLowerCase().trim();
      if (["gallery", "archive", "archive-gallery", "custom"].includes(normalized)) return "gallery";
      return "drops";
    }

    window.switchAtelierTab = function switchAtelierTab(tabName, options = {}) {
      const normalized = normalizeAtelierTab(tabName);

      tabs.forEach((tab) => {
        const isSelected = tab.dataset.atelierTab === normalized;
        tab.setAttribute("aria-selected", isSelected ? "true" : "false");
        tab.setAttribute("tabindex", isSelected ? "0" : "-1");

        activeClasses.split(" ").forEach((className) => tab.classList.remove(className));
        inactiveClasses.split(" ").forEach((className) => tab.classList.remove(className));
        const selectedClasses = isSelected ? activeClasses : inactiveClasses;
        selectedClasses.split(" ").forEach((className) => tab.classList.add(className));
      });

      Object.entries(panels).forEach(([name, panel]) => {
        if (!panel) return;
        const isSelected = name === normalized;
        panel.hidden = !isSelected;
        panel.setAttribute("aria-hidden", isSelected ? "false" : "true");
      });

      if (options.updateHash !== false) {
        const nextHash = normalized === "gallery" ? "#gallery" : "#drops";
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, "", `${window.location.pathname}${nextHash}`);
        }
      }

      if (options.scroll) {
        const target = normalized === "gallery" ? panels.gallery : panels.drops;
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      return normalized;
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        window.switchAtelierTab(tab.dataset.atelierTab);
      });

      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();

        let nextIndex;
        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else nextIndex = (index - 1 + tabs.length) % tabs.length;

        const nextTab = tabs[nextIndex];
        window.switchAtelierTab(nextTab.dataset.atelierTab);
        nextTab.focus();
      });
    });

    function handleAtelierHash() {
      const hash = window.location.hash.slice(1).toLowerCase();
      if (hash === "gallery" || hash === "archive") {
        window.switchAtelierTab("gallery", { updateHash: false, scroll: true });
      } else if (hash === "drops") {
        window.switchAtelierTab("drops", { updateHash: false, scroll: true });
      }
    }

    handleAtelierHash();
    if (!window.location.hash) {
      window.switchAtelierTab("drops", { updateHash: false });
    }
    window.addEventListener("hashchange", handleAtelierHash);
  }

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
      const emptyState = document.createElement("div");
      emptyState.style.padding = "40px 0";
      emptyState.style.color = "var(--text-gray)";

      const emptyText = document.createElement("p");
      emptyText.style.fontSize = "1.1rem";
      emptyText.style.marginBottom = "20px";
      emptyText.textContent = "Твій кошик порожній.";

      const shopLink = document.createElement("a");
      shopLink.href = "catalog.html";
      shopLink.className = "btn btn-secondary";
      shopLink.textContent = "← Перейти до покупок";

      emptyState.appendChild(emptyText);
      emptyState.appendChild(shopLink);
      cartItemsContainer.replaceChildren(emptyState);
      if (cartSubtotalEl) cartSubtotalEl.textContent = "0 ₴";
      if (cartTotalEl) cartTotalEl.textContent = "0 ₴";
      if (cartSubtitleEl) cartSubtitleEl.textContent = "0 речей / Кошик порожній";
      return;
    }

    let subtotal = 0;
    let totalItems = 0;
    cartItemsContainer.replaceChildren();

    cart.forEach((item, index) => {
      subtotal += item.price * item.qty;
      totalItems += item.qty;

      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";

      const image = document.createElement("img");
      image.src = typeof item.image === "string" ? item.image : "";
      image.alt = typeof item.name === "string" ? item.name : "";
      image.loading = "lazy";

      const info = document.createElement("div");
      const name = document.createElement("h4");
      name.textContent = typeof item.name === "string" ? item.name : "";

      const variant = document.createElement("p");
      variant.style.color = "var(--text-gray)";
      variant.style.fontSize = "0.9rem";
      variant.textContent = `${item.color || ""} / ${item.size || ""}`;

      const price = document.createElement("strong");
      price.style.marginTop = "8px";
      price.style.display = "block";
      price.textContent = `${item.price || 0} ₴`;
      info.appendChild(name);
      info.appendChild(variant);
      info.appendChild(price);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "12px";
      actions.style.alignItems = "center";

      const qtyWrap = document.createElement("div");
      qtyWrap.className = "qty-wrap";
      qtyWrap.style.margin = "0";

      const decButton = document.createElement("button");
      decButton.className = "qty-btn";
      decButton.dataset.action = "dec";
      decButton.dataset.index = String(index);
      decButton.textContent = "-";

      const qty = document.createElement("span");
      qty.textContent = String(item.qty);

      const incButton = document.createElement("button");
      incButton.className = "qty-btn";
      incButton.dataset.action = "inc";
      incButton.dataset.index = String(index);
      incButton.textContent = "+";

      qtyWrap.appendChild(decButton);
      qtyWrap.appendChild(qty);
      qtyWrap.appendChild(incButton);

      const deleteButton = document.createElement("button");
      deleteButton.className = "btn btn-secondary btn-del";
      deleteButton.dataset.index = String(index);
      deleteButton.style.padding = "6px 12px";
      deleteButton.textContent = "Видалити";

      actions.appendChild(qtyWrap);
      actions.appendChild(deleteButton);
      itemEl.appendChild(image);
      itemEl.appendChild(info);
      itemEl.appendChild(actions);
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