const products = [
    {
        id: 1,
        name: "Mumbai Indians Team Jersey",
        category: "JERSEY",
        price: 2499,
        icon: "fa-shirt",
        featured: true
    },
    {
        id: 2,
        name: "Mumbai Indians Fan Cap",
        category: "CAP",
        price: 799,
        icon: "fa-hat-cowboy"
    },
    {
        id: 3,
        name: "MI One Family T-Shirt",
        category: "T-SHIRT",
        price: 1299,
        icon: "fa-shirt"
    },
    {
        id: 4,
        name: "MI Fan Accessories",
        category: "ACCESSORIES",
        price: 999,
        icon: "fa-bag-shopping"
    }
];

let cart = JSON.parse(localStorage.getItem("miCart")) || [];

const productGrid = document.querySelector(".product-grid");

function renderProducts(list = products) {

    if (!productGrid) return;

    productGrid.innerHTML = "";

    list.forEach(product => {

        const card = document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">

                ${
                    product.featured
                    ? `<span class="product-badge">FEATURED</span>`
                    : ""
                }

                <div class="product-placeholder">
                    <i class="fa-solid ${product.icon}"></i>
                </div>

            </div>

            <div class="product-content">

                <p class="product-category">
                    ${product.category}
                </p>

                <h3>
                    ${product.name}
                </h3>

                <p class="product-description">
                    Mumbai Indians inspired merchandise
                    for the One Family.
                </p>

                <div class="product-bottom">

                    <strong>
                        ₹${product.price.toLocaleString("en-IN")}
                    </strong>

                    <button
                        class="buy-btn"
                        onclick="addToCart(${product.id})">
                        Add to Cart
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>

                </div>

            </div>
        `;

        productGrid.appendChild(card);
    });
}


function addToCart(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const existing = cart.find(
        item => item.id === productId
    );

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();

    alert(`${product.name} added to cart.`);
}


function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    saveCart();
}


function updateQuantity(productId, change) {

    const item = cart.find(
        product => product.id === productId
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
}


function saveCart() {

    localStorage.setItem(
        "miCart",
        JSON.stringify(cart)
    );

    updateCartCount();
}


function updateCartCount() {

    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartCount = document.querySelector(".cart-count");

    if (cartCount) {
        cartCount.textContent = count;
    }
}


function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );
}


function showCart() {

    if (!cart.length) {
        alert("Your cart is empty.");
        return;
    }

    let message = "MI CART\n\n";

    cart.forEach(item => {

        message +=
            `${item.name} × ${item.quantity} = ₹${
                (item.price * item.quantity)
                .toLocaleString("en-IN")
            }\n`;
    });

    message +=
        `\nTotal: ₹${getCartTotal().toLocaleString("en-IN")}`;

    alert(message);
}


renderProducts();
updateCartCount();
