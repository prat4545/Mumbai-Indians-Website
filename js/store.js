const storeClient = window.MIAuth?.client;
const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

let products = [];
let cart = [];

const FALLBACK_PRODUCTS = [
    { id: "fan-jersey", name: "Mumbai Indians Fan Jersey", category: "JERSEY", price: 1499, description: "Blue match-day inspired fan jersey for the One Family.", image: "https://www.mumbaiindians.com/static-assets/waf-images/c7/6e/c1/16-9/592-444/DAtzKSYFre.jpg", stock: 20 },
    { id: "mi-cap", name: "Mumbai Indians Cap", category: "CAP", price: 699, description: "A classic MI cap for everyday fan style.", image: "https://www.mumbaiindians.com/static-assets/waf-images/4f/9a/2a/16-9/592-444/9Z2Z6jTj1p.jpg", stock: 20 },
    { id: "mi-mug", name: "Mumbai Indians Mug", category: "LIFESTYLE", price: 399, description: "Start your day with Mumbai Indians pride.", image: "https://www.mumbaiindians.com/static-assets/waf-images/22/0c/7c/16-9/592-444/3xqvW8r2JY.jpg", stock: 20 },
    { id: "mi-flag", name: "Mumbai Indians Flag", category: "FAN GEAR", price: 499, description: "Bring the Blue Army atmosphere home.", image: "https://www.mumbaiindians.com/static-assets/waf-images/4f/9a/2a/16-9/592-444/9Z2Z6jTj1p.jpg", stock: 20 }
];

function escapeHTML(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function formatPrice(value) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0); }
function getProductImage(product) { return product.image_url || product.image || ""; }
function loadCart() { try { const saved = JSON.parse(localStorage.getItem("mi_cart") || "[]"); cart = Array.isArray(saved) ? saved.filter(item => item && item.id != null && Number(item.quantity) > 0) : []; } catch { cart = []; } renderCart(); }
function saveCart() { localStorage.setItem("mi_cart", JSON.stringify(cart)); }

async function loadProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = `<div class="loading-products"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading MI Collection...</p></div>`;
    try {
        if (storeClient) {
            const { data, error } = await storeClient.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });
            if (!error && Array.isArray(data) && data.length) products = data;
        }
    } catch (error) {
        console.error("Product Load Error:", error);
    }
    if (!products.length) products = FALLBACK_PRODUCTS;
    renderProducts();
    reconcileCartStock();
}

function renderProducts() {
    productGrid.innerHTML = "";
    products.forEach(product => {
        const stock = Math.max(0, Number(product.stock) || 0);
        const image = getProductImage(product);
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `<div class="product-image"><span class="product-badge">MI COLLECTION</span>${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(product.name)}" class="product-real-image">` : `<div class="product-placeholder"><i class="fa-solid fa-shirt"></i></div>`}</div><div class="product-content"><p class="product-category">${escapeHTML(product.category || "MI MERCHANDISE")}</p><h3>${escapeHTML(product.name || "MI Product")}</h3><p class="product-description">${escapeHTML(product.description || "Mumbai Indians fan merchandise.")}</p><div class="product-bottom"><strong>${formatPrice(product.price)}</strong><button type="button" class="buy-btn" ${stock <= 0 ? "disabled" : ""}>${stock > 0 ? "Add to Cart" : "Out of Stock"} <i class="fa-solid fa-cart-plus"></i></button></div></div>`;
        const imageEl = card.querySelector("img");
        imageEl?.addEventListener("error", () => imageEl.replaceWith(Object.assign(document.createElement("div"), { className: "product-placeholder", innerHTML: '<i class="fa-solid fa-shirt"></i>' })));
        card.querySelector(".buy-btn")?.addEventListener("click", () => addToCart(product.id));
        productGrid.appendChild(card);
    });
}

function reconcileCartStock() {
    cart = cart.map(item => {
        const product = products.find(p => String(p.id) === String(item.id));
        if (!product) return null;
        const stock = Math.max(0, Number(product.stock) || 0);
        return { ...item, name: product.name, category: product.category, price: Number(product.price) || 0, image: getProductImage(product), quantity: Math.min(Number(item.quantity) || 1, stock) };
    }).filter(Boolean).filter(item => item.quantity > 0);
    saveCart(); renderCart();
}
function addToCart(productId) { const product = products.find(item => String(item.id) === String(productId)); if (!product) return; const stock = Math.max(0, Number(product.stock) || 0); const existing = cart.find(item => String(item.id) === String(productId)); if (existing) { if (existing.quantity >= stock) return; existing.quantity += 1; } else cart.push({ id: product.id, name: product.name, category: product.category || "MI MERCHANDISE", price: Number(product.price) || 0, image: getProductImage(product), quantity: 1 }); saveCart(); renderCart(); openCart(); }
function changeQuantity(id, change) { const item = cart.find(entry => String(entry.id) === String(id)); if (!item) return; const product = products.find(entry => String(entry.id) === String(id)); const stock = product ? Math.max(0, Number(product.stock) || 0) : Number.MAX_SAFE_INTEGER; item.quantity += change; if (item.quantity > stock) item.quantity = stock; if (item.quantity <= 0) cart = cart.filter(entry => String(entry.id) !== String(id)); saveCart(); renderCart(); }
function removeFromCart(id) { cart = cart.filter(item => String(item.id) !== String(id)); saveCart(); renderCart(); }
function renderCart() { if (!cartItems) return; const total = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0); const amount = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0); cartCount.textContent = total; cartTotal.textContent = formatPrice(amount); if (!cart.length) { cartItems.innerHTML = `<div class="empty-cart"><i class="fa-solid fa-cart-shopping"></i><h3>Your cart is empty</h3><p>Add some MI gear to continue.</p></div>`; return; } cartItems.innerHTML = ""; cart.forEach(item => { const row = document.createElement("div"); row.className = "cart-item"; row.innerHTML = `<div class="cart-item-icon">${item.image ? `<img src="${escapeHTML(item.image)}" alt="">` : `<i class="fa-solid fa-shirt"></i>`}</div><div class="cart-item-info"><h4>${escapeHTML(item.name)}</h4><p>${formatPrice(item.price)}</p><div class="quantity-control"><button type="button" data-action="decrease">−</button><span>${item.quantity}</span><button type="button" data-action="increase">+</button></div></div><div class="cart-item-right"><strong>${formatPrice(Number(item.price) * Number(item.quantity))}</strong><button type="button" data-action="remove" aria-label="Remove item"><i class="fa-solid fa-trash"></i></button></div>`; row.querySelector('[data-action="decrease"]').onclick = () => changeQuantity(item.id, -1); row.querySelector('[data-action="increase"]').onclick = () => changeQuantity(item.id, 1); row.querySelector('[data-action="remove"]').onclick = () => removeFromCart(item.id); cartItems.appendChild(row); }); }
function openCart() { cartDrawer?.classList.add("open"); cartOverlay?.classList.add("show"); document.body.classList.add("cart-open"); }
function closeCart() { cartDrawer?.classList.remove("open"); cartOverlay?.classList.remove("show"); document.body.classList.remove("cart-open"); }
async function checkout() { if (!cart.length) return; const user = await window.MIAuth?.getCurrentUser(); if (!user) { window.location.href = "login.html?redirect=store.html"; return; } window.location.href = "checkout.html"; }
document.getElementById("cartNavBtn")?.addEventListener("click", openCart);
document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
cartOverlay?.addEventListener("click", closeCart);
checkoutBtn?.addEventListener("click", checkout);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
loadCart();
loadProducts();
