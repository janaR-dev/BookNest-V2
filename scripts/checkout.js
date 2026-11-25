
const CART_KEY = "BookNestCart";
const ORDERS_KEY = "BookNestOrders";

const checkoutForm = document.getElementById("checkoutForm");
const shippingSection = document.getElementById("shippingSection");
const emptyCart = document.getElementById("emptyCart");

const SHIPPING_FEE = 50;

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

function getBook(bookId) {
    return books.find(book => String(book.id) === String(bookId));
}

function getPrice(book, formatName) {
    const format = book.formats.find(item =>
        item.format === (formatName || "paperback")
    );

    return format
        ? Number(String(format.price).replace(/[^0-9.]/g, "")) || 0
        : 0;
}

function isPhysicalCart() {
    return getCart().some(item =>
        (item.format || "paperback") !== "ebook"
    );
}

function calculateSubtotal() {
    return getCart().reduce((sum, item) => {
        const book = getBook(item.bookId);

        if (!book) return sum;

        return sum + getPrice(book, item.format) * item.quantity;
    }, 0);
}

function displayCheckout() {
    const cart = getCart();

    const validItems = cart.filter(item => getBook(item.bookId));

    if (validItems.length === 0) {
        checkoutForm.classList.add("d-none");
        emptyCart.classList.remove("d-none");
        return;
    }

    if (!isPhysicalCart()) {
        shippingSection.classList.add("d-none");
    } else {
        shippingSection.classList.remove("d-none");

        document.getElementById("shippingAddress").required = true;
        document.getElementById("shippingCity").required = true;
        document.getElementById("shippingPhone").required = true;
    }

    document.getElementById("checkoutItems").innerHTML =
        validItems.map(item => {
            const book = getBook(item.bookId);
            const price = getPrice(book, item.format);

            return `
                <div class="d-flex justify-content-between mb-3">
                    <div>
                        <strong>${book.title}</strong>
                        <div class="small text-muted">
                            ${item.format === "ebook" ? "E-book" : "Paperback"}
                            × ${item.quantity}
                        </div>
                    </div>
                    <span>${(price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        }).join("");

    const subtotal = calculateSubtotal();
    const shipping = isPhysicalCart() ? SHIPPING_FEE : 0;

    document.getElementById("subtotal").textContent =
        subtotal.toFixed(2);

    document.getElementById("shippingCost").textContent =
        shipping.toFixed(2);

    document.getElementById("totalPrice").textContent =
        (subtotal + shipping).toFixed(2);
}

document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
    input.addEventListener("change", () => {
        const cardSelected =
            document.getElementById("cardPayment").checked;

        document.getElementById("cardDetails")
            .classList.toggle("d-none", !cardSelected);

        document.getElementById("cardName").required = cardSelected;
        document.getElementById("cardNumber").required = cardSelected;
        document.getElementById("cardExpiry").required = cardSelected;
        document.getElementById("cardCvv").required = cardSelected;
    });
});

checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    const cart = getCart().filter(item => getBook(item.bookId));

    if (cart.length === 0) return;

    const customer = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();

    const hasPhysicalBooks = isPhysicalCart();

    const address = hasPhysicalBooks
        ? [
            document.getElementById("shippingAddress").value.trim(),
            document.getElementById("shippingCity").value.trim(),
            document.getElementById("shippingPhone").value.trim()
        ].join(", ")
        : "Digital delivery";

    const paymentMethod =
        document.querySelector('input[name="paymentMethod"]:checked').value;

    const subtotal = calculateSubtotal();
    const shipping = hasPhysicalBooks ? SHIPPING_FEE : 0;
    const total = subtotal + shipping;

    const orders = getOrders();

    const newOrders = cart.map(item => {
        const book = getBook(item.bookId);

        return {
            id: "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            customer: customer,
            email: email,
            bookId: book.id,
            bookTitle: book.title,
            quantity: item.quantity,
            format: item.format || "paperback",
            address: address,
            paymentMethod: paymentMethod,
            itemTotal: getPrice(book, item.format) * item.quantity,
            status: "Pending",
            createdAt: new Date().toISOString()
        };
    });

    orders.push(...newOrders);

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    localStorage.removeItem(CART_KEY);

    localStorage.setItem(
        "BookNestLastOrder",
        JSON.stringify(newOrders.map(order => order.id))
    );

    window.location.href = "track-order.html";
});

displayCheckout();
