

const CART_KEY = "BookNestCart";

const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}


function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


function getBook(bookId) {
    return books.find(book => String(book.id) === String(bookId));
}

function getBookPrice(book, formatName = "paperback") {
    const selected = book.formats.find(
        format => format.format === formatName
    );

    return selected
        ? Number(String(selected.price).replace(/[^0-9.]/g, "")) || 0
        : 0;
}

function formatPrice(price) {
    return price.toFixed(2);
}



function displayCart() {

    const cart = getCart();

    const validCart = cart.filter(item => getBook(item.bookId));

    if (validCart.length !== cart.length) {
        saveCart(validCart);
    }

    const totalQuantity = validCart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    document.getElementById("cartCount").textContent = totalQuantity;

    if (validCart.length === 0) {

        emptyCart.classList.remove("d-none");
        cartItems.innerHTML = "";

        updateSummary(0);

        return;
    }

    emptyCart.classList.add("d-none");

    let subtotal = 0;

    cartItems.innerHTML = validCart.map(item => {

        const book = getBook(item.bookId);

        const price = getBookPrice(book);
        const quantity = Number(item.quantity) || 1;

        const itemTotal = price * quantity;

        subtotal += itemTotal;

        return `
            <div class="cart-item">

                <div class="cart-book-image">
                    <img src="${book.img}" alt="${book.title}">
                </div>

                <div class="cart-book-details">

                    <span class="book-category">
                        ${categoryLabel(book.category)}
                    </span>

                    <h5>${book.title}</h5>

                    <p>By ${book.author}</p>

                    <strong>${formatPrice(price)}</strong>

                </div>

                <div class="cart-item-actions">

                    <div class="quantity-control">

                        <button class="quantity-btn"
                            data-action="decrease"
                            data-id="${book.id}">
                            <i class="fa-solid fa-minus"></i>
                        </button>

                        <span>${quantity}</span>

                        <button class="quantity-btn"
                            data-action="increase"
                            data-id="${book.id}">
                            <i class="fa-solid fa-plus"></i>
                        </button>

                    </div>

                    <strong>${formatPrice(itemTotal)}</strong>

                    <button class="remove-btn"
                        data-action="remove"
                        data-id="${book.id}">

                        <i class="fa-solid fa-trash"></i>
                        Remove

                    </button>

                </div>

            </div>
        `;

    }).join("");

    updateSummary(subtotal);
}



function updateSummary(subtotal) {

    const shipping = subtotal > 0 ? 50 : 0;
    const total = subtotal + shipping;

    document.getElementById("subtotal").textContent =
        formatPrice(subtotal);

    document.getElementById("shipping").textContent =
        formatPrice(shipping);

    document.getElementById("total").textContent =
        formatPrice(total);

    document.getElementById("checkoutBtn").disabled =
        subtotal === 0;
}



cartItems.addEventListener("click", function(event) {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const bookId = button.dataset.id;
    const action = button.dataset.action;

    let cart = getCart();

    const item = cart.find(
        item => String(item.bookId) === String(bookId)
    );

    if (!item) return;

    if (action === "increase") {
        item.quantity++;
    }

    else if (action === "decrease") {

        item.quantity--;

        if (item.quantity <= 0) {
            cart = cart.filter(
                item => String(item.bookId) !== String(bookId)
            );
        }

    }

    else if (action === "remove") {

        cart = cart.filter(
            item => String(item.bookId) !== String(bookId)
        );

    }

    saveCart(cart);
    displayCart();

});



document.getElementById("checkoutBtn").addEventListener(
    "click",
    function() {

        if (getCart().length === 0) return;

        window.location.href = "checkout.html";

    }
);


displayCart();
