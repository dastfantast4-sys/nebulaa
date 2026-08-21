/* ============================================
   NEBULA — логика магазина
   Каталог, фильтрация, поиск, корзина.
   Всё в памяти + localStorage, без бэкенда.
   ============================================ */

(function () {
    "use strict";

    /* ---------- Состояние ---------- */
    let currentCategory = "all";
    let searchQuery = "";
    /** @type {{id:number, qty:number}[]} */
    let cart = loadCart();

    /* ---------- Элементы ---------- */
    const grid = document.getElementById("productGrid");
    const emptyState = document.getElementById("emptyState");
    const resultCount = document.getElementById("resultCount");
    const searchInput = document.getElementById("searchInput");
    const searchClear = document.getElementById("searchClear");
    const filterWrap = document.getElementById("filterCategories");
    const cartPanel = document.getElementById("cartPanel");
    const cartList = document.getElementById("cartList");
    const cartEmpty = document.getElementById("cartEmpty");
    const cartFoot = document.getElementById("cartFoot");
    const cartBadge = document.getElementById("cartBadge");
    const cartTotal = document.getElementById("cartTotal");
    const overlay = document.getElementById("overlay");
    const toast = document.getElementById("toast");
    const header = document.getElementById("header");

    /* ---------- Утилиты ---------- */
    const formatPrice = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
    const byId = (id) => PRODUCTS.find((p) => p.id === id);

    function plural(n, forms) {
        const n10 = n % 10, n100 = n % 100;
        if (n10 === 1 && n100 !== 11) return forms[0];
        if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
        return forms[2];
    }

    /* Транслит кириллицы → латиницы, чтобы «атлас» находил «Atlas» */
    const TR = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
    const translit = (s) => s.split("").map((c) => TR[c] ?? c).join("");

    /* ---------- Рендер каталога ---------- */
    function getFiltered() {
        const q = searchQuery.trim().toLowerCase();
        const qt = translit(q);
        return PRODUCTS.filter((p) => {
            const okCat = currentCategory === "all" || p.category === currentCategory;
            const name = p.name.toLowerCase();
            const okSearch = !q || name.includes(q) || name.includes(qt);
            return okCat && okSearch;
        });
    }

    function cardHTML(p, i) {
        return `
        <article class="product-card" style="--i:${i}" data-id="${p.id}">
            <div class="product-card__media">
                <img src="${p.image}" alt="${p.name}" loading="lazy" />
                ${p.inStock ? "" : '<span class="product-card__stock">нет в наличии</span>'}
            </div>
            <div class="product-card__body">
                <span class="product-card__category">${p.category}</span>
                <h3 class="product-card__title">${p.name}</h3>
                <div class="product-card__row">
                    <span class="product-card__price">${formatPrice(p.price)}</span>
                    <button class="add-to-cart" data-add="${p.id}" ${p.inStock ? "" : "disabled"}>
                        ${p.inStock ? "В корзину" : "Нет в наличии"}
                    </button>
                </div>
            </div>
        </article>`;
    }

    function renderProducts(animate = true) {
        const items = getFiltered();
        grid.innerHTML = items.map(cardHTML).join("");
        emptyState.hidden = items.length > 0;

        const n = items.length;
        resultCount.textContent =
            n === PRODUCTS.length
                ? `${n} ${plural(n, ["товар", "товара", "товаров"])}`
                : `Найдено: ${n} ${plural(n, ["товар", "товара", "товаров"])}`;

        if (animate) {
            grid.classList.remove("catalog__grid--fading");
        }
    }

    /* Плавная смена фильтра: сначала fade-out, потом перерендер с fade-in */
    let filterTimer = null;
    function applyFilterSmooth() {
        grid.classList.add("catalog__grid--fading");
        clearTimeout(filterTimer);
        filterTimer = setTimeout(() => renderProducts(true), 220);
    }

    /* ---------- Фильтры ---------- */
    filterWrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn || btn.classList.contains("active")) return;
        filterWrap.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.filter;
        applyFilterSmooth();
    });

    /* ---------- Поиск (debounce) ---------- */
    let searchTimer = null;
    searchInput.addEventListener("input", () => {
        searchClear.classList.toggle("filters__search-clear--visible", searchInput.value.length > 0);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            searchQuery = searchInput.value;
            applyFilterSmooth();
        }, 180);
    });

    searchClear.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        searchClear.classList.remove("filters__search-clear--visible");
        applyFilterSmooth();
        searchInput.focus();
    });

    document.getElementById("resetFilters").addEventListener("click", () => {
        currentCategory = "all";
        searchQuery = "";
        searchInput.value = "";
        searchClear.classList.remove("filters__search-clear--visible");
        filterWrap.querySelectorAll(".filter-btn").forEach((b) =>
            b.classList.toggle("active", b.dataset.filter === "all")
        );
        applyFilterSmooth();
    });

    /* Кнопка поиска в шапке: скролл к фильтрам + фокус */
    document.getElementById("searchToggle").addEventListener("click", () => {
        document.getElementById("filters").scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => searchInput.focus(), 350);
    });

    /* ---------- Корзина ---------- */
    function loadCart() {
        try {
            const raw = localStorage.getItem("nebula_cart");
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter((i) => byId(i.id)) : [];
        } catch {
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem("nebula_cart", JSON.stringify(cart));
        } catch { /* приватный режим — просто работаем в памяти */ }
    }

    const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
    const cartSum = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);

    function updateBadge(pulse = false) {
        const n = cartCount();
        cartBadge.textContent = n;
        cartBadge.classList.toggle("cart-badge--visible", n > 0);
        if (pulse && n > 0) {
            cartBadge.classList.remove("cart-badge--pulse");
            void cartBadge.offsetWidth; // перезапуск анимации
            cartBadge.classList.add("cart-badge--pulse");
        }
    }

    function renderCart() {
        const has = cart.length > 0;
        cartEmpty.style.display = has ? "none" : "";
        cartFoot.style.display = has ? "" : "none";
        cartList.innerHTML = cart
            .map(({ id, qty }) => {
                const p = byId(id);
                return `
            <li class="cart-item" data-id="${id}">
                <img src="${p.image}" alt="${p.name}" />
                <div>
                    <div class="cart-item__name">${p.name}</div>
                    <div class="cart-item__price">${formatPrice(p.price)}</div>
                    <div class="cart-item__controls">
                        <button class="qty-btn" data-dec="${id}" aria-label="Убавить">−</button>
                        <span class="cart-item__qty">${qty}</span>
                        <button class="qty-btn" data-inc="${id}" aria-label="Прибавить">+</button>
                    </div>
                </div>
                <button class="cart-item__remove" data-remove="${id}" aria-label="Удалить">✕</button>
            </li>`;
            })
            .join("");
        cartTotal.textContent = formatPrice(cartSum());
        updateBadge();
        saveCart();
    }

    function addToCart(id, sourceImg) {
        const item = cart.find((i) => i.id === id);
        if (item) item.qty += 1;
        else cart.push({ id, qty: 1 });
        renderCart();
        updateBadge(true);
        if (sourceImg) flyToCart(sourceImg);
    }

    function changeQty(id, delta) {
        const item = cart.find((i) => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
        renderCart();
    }

    function removeFromCart(id) {
        cart = cart.filter((i) => i.id !== id);
        renderCart();
    }

    /* ---------- Панель корзины ---------- */
    function openCart() {
        renderCart();
        cartPanel.classList.add("cart-panel--open");
        cartPanel.setAttribute("aria-hidden", "false");
        overlay.classList.add("overlay--visible");
        document.body.style.overflow = "hidden";
    }

    function closeCart() {
        cartPanel.classList.remove("cart-panel--open");
        cartPanel.setAttribute("aria-hidden", "true");
        overlay.classList.remove("overlay--visible");
        document.body.style.overflow = "";
    }

    document.getElementById("cartToggle").addEventListener("click", openCart);
    document.getElementById("cartClose").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeCart();
    });

    /* ---------- «Улетание» картинки в корзину ---------- */
    function flyToCart(img) {
        const cartBtn = document.getElementById("cartToggle");
        const from = img.getBoundingClientRect();
        const to = cartBtn.getBoundingClientRect();

        const ghost = img.cloneNode();
        ghost.className = "fly-img";
        Object.assign(ghost.style, {
            left: from.left + "px",
            top: from.top + "px",
            width: from.width + "px",
            height: from.height + "px",
        });
        document.body.appendChild(ghost);

        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);

        requestAnimationFrame(() => {
            ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.08)`;
            ghost.style.opacity = "0.25";
        });
        ghost.addEventListener("transitionend", () => ghost.remove(), { once: true });
        setTimeout(() => ghost.remove(), 900); // страховка
    }

    /* ---------- Делегированные клики ---------- */
    grid.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add]");
        if (!btn) return;
        const id = Number(btn.dataset.add);
        const card = btn.closest(".product-card");
        addToCart(id, card ? card.querySelector("img") : null);
    });

    cartList.addEventListener("click", (e) => {
        const inc = e.target.closest("[data-inc]");
        const dec = e.target.closest("[data-dec]");
        const rem = e.target.closest("[data-remove]");
        if (inc) changeQty(Number(inc.dataset.inc), +1);
        else if (dec) changeQty(Number(dec.dataset.dec), -1);
        else if (rem) removeFromCart(Number(rem.dataset.remove));
    });

    /* ---------- Оформление заказа (демо) ---------- */
    let toastTimer = null;
    function showToast(text) {
        toast.textContent = text;
        toast.classList.add("toast--visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("toast--visible"), 2800);
    }

    document.getElementById("checkoutBtn").addEventListener("click", () => {
        if (!cart.length) return;
        const sum = formatPrice(cartSum());
        cart = [];
        renderCart();
        closeCart();
        showToast(`Заказ на ${sum} оформлен. Спасибо!`);
    });

    /* ---------- Тень шапки при скролле ---------- */
    const onScroll = () => header.classList.toggle("header--scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Старт ---------- */
    renderProducts(false);
    renderCart();
    onScroll();
})();
