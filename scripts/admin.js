

const KEYS = {
    orders: "BookNestOrders",
    inventory: "BookNestInventory",
    promotions: "BookNestPromotions",
    role: "BookNestDashboardRole"
};

const STATUSES = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled"
];

let currentRole = localStorage.getItem(KEYS.role) || "admin";

function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function initializeDashboard() {

    if (!localStorage.getItem(KEYS.inventory)) {
        const inventory = books.map(book => ({
            bookId: book.id,
            title: book.title,
            category: book.category,
            stock: 10
        }));

        saveData(KEYS.inventory, inventory);
    }

    if (!localStorage.getItem(KEYS.orders)) {

        const sampleOrders = books.slice(0, 3).map((book, index) => ({
            id: "ORD-" + (1001 + index),
            customer: ["Ahmed Ali", "Mariam Hassan", "Omar Samir"][index],
            email: [
                "ahmed@example.com",
                "mariam@example.com",
                "omar@example.com"
            ][index],
            bookId: book.id,
            bookTitle: book.title,
            quantity: 1,
            address: [
                "Nasr City, Cairo",
                "Maadi, Cairo",
                "New Cairo"
            ][index],
            status: ["Pending", "Processing", "Shipped"][index],
            createdAt: new Date().toISOString()
        }));

        saveData(KEYS.orders, sampleOrders);
    }

    if (!localStorage.getItem(KEYS.promotions)) {
        saveData(KEYS.promotions, []);
    }
}

function notify(message) {
    document.getElementById("toastMessage").textContent = message;

    const toastElement = document.getElementById("dashboardToast");
    bootstrap.Toast.getOrCreateInstance(toastElement).show();
}

const roleSelect = document.getElementById("roleSelect");

roleSelect.value = currentRole;

function updateRole() {

    const isAdmin = currentRole === "admin";

    document.querySelectorAll(".admin-only").forEach(element => {
        element.classList.toggle("d-none", !isAdmin);
    });

    document.getElementById("adminLinks").classList.toggle(
        "d-none",
        !isAdmin
    );

    if (!isAdmin) {
        const currentView = document.querySelector(
            ".dashboard-view:not(.d-none)"
        );

        if (currentView?.id === "inventoryView" ||
            currentView?.id === "promotionsView") {
            showView("overview");
        }
    }

    renderDashboard();
}

roleSelect.addEventListener("change", function() {
    currentRole = this.value;
    localStorage.setItem(KEYS.role, currentRole);
    updateRole();
});

const pageTitles = {
    overview: "Dashboard Overview",
    orders: "Order Management",
    inventory: "Inventory Management",
    promotions: "Discount Codes & Promotions"
};

function showView(viewName) {

    if (currentRole !== "admin" &&
        ["inventory", "promotions"].includes(viewName)) {
        return;
    }

    document.querySelectorAll(".dashboard-view").forEach(view => {
        view.classList.add("d-none");
    });

    document.getElementById(viewName + "View").classList.remove("d-none");

    document.querySelectorAll(".sidebar-link[data-view]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });

    document.getElementById("pageTitle").textContent =
        pageTitles[viewName];

    document.getElementById("pageSubtitle").textContent =
        viewName === "orders"
            ? "Track and manage customer orders"
            : viewName === "inventory"
            ? "Manage your bookstore stock"
            : viewName === "promotions"
            ? "Manage discounts and offers"
            : "Welcome to BookNest management";
}

document.querySelectorAll(".sidebar-link[data-view]").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.view);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.go);
    });
});


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


function renderDashboard() {

    const orders = getData(KEYS.orders);
    const inventory = getData(KEYS.inventory);

    document.getElementById("totalOrders").textContent = orders.length;

    document.getElementById("pendingOrders").textContent =
        orders.filter(order => order.status === "Pending").length;

    document.getElementById("shippedOrders").textContent =
        orders.filter(order =>
            ["Shipped", "Delivered"].includes(order.status)
        ).length;

    document.getElementById("totalStock").textContent =
        inventory.reduce((total, book) => total + book.stock, 0);

    const recentOrders = [...orders].slice(-5).reverse();

    document.getElementById("recentOrders").innerHTML =
        recentOrders.map(order => `
            <tr>
                <td>${escapeHTML(order.id)}</td>
                <td>${escapeHTML(order.customer)}</td>
                <td>${escapeHTML(order.bookTitle)}</td>
                <td>${statusBadge(order.status)}</td>
            </tr>
        `).join("");
}

function statusBadge(status) {

    const colors = {
        Pending: "warning",
        Confirmed: "info",
        Processing: "primary",
        Shipped: "secondary",
        Delivered: "success",
        Cancelled: "danger"
    };

    return `
        <span class="badge text-bg-${colors[status] || "secondary"}">
            ${escapeHTML(status)}
        </span>
    `;
}


function renderOrders() {

    const orders = getData(KEYS.orders);

    const search = document.getElementById("orderSearch")
        .value.trim().toLowerCase();

    const selectedStatus = document.getElementById("statusFilter").value;

    const filteredOrders = orders.filter(order => {

        const matchesSearch =
            order.id.toLowerCase().includes(search) ||
            order.customer.toLowerCase().includes(search);

        const matchesStatus =
            selectedStatus === "all" ||
            order.status === selectedStatus;

        return matchesSearch && matchesStatus;

    }).reverse();

    document.getElementById("noOrders").classList.toggle(
        "d-none",
        filteredOrders.length > 0
    );

    document.getElementById("ordersTable").innerHTML =
        filteredOrders.map(order => {

            const availableStatuses = currentRole === "admin"
                ? STATUSES
                : ["Shipped", "Delivered"];

            const statusOptions = availableStatuses.map(status => `
                <option value="${status}"
                    ${order.status === status ? "selected" : ""}>
                    ${status}
                </option>
            `).join("");

            return `
                <tr>
                    <td>
                        <strong>${escapeHTML(order.id)}</strong>
                    </td>

                    <td>
                        <strong>${escapeHTML(order.customer)}</strong>
                        <small class="d-block text-muted">
                            ${escapeHTML(order.email)}
                        </small>
                    </td>

                    <td>
                        ${escapeHTML(order.bookTitle)}
                        <small class="d-block text-muted">
                            Quantity: ${order.quantity}
                        </small>
                    </td>

                    <td>
                        <small>${escapeHTML(order.address)}</small>
                    </td>

                    <td>${statusBadge(order.status)}</td>

                    <td>
                        <select class="form-select form-select-sm status-select"
                                data-order-id="${escapeHTML(order.id)}"
                                ${order.status === "Cancelled" ||
                                  order.status === "Delivered"
                                  ? "disabled" : ""}>
                            ${statusOptions}
                        </select>
                    </td>
                </tr>
            `;
        }).join("");
}

document.getElementById("orderSearch").addEventListener(
    "input",
    renderOrders
);

document.getElementById("statusFilter").addEventListener(
    "change",
    renderOrders
);

document.getElementById("ordersTable").addEventListener(
    "change",
    function(event) {

        if (!event.target.classList.contains("status-select")) return;

        const orderId = event.target.dataset.orderId;
        const newStatus = event.target.value;

        if (!STATUSES.includes(newStatus)) return;

        if (currentRole === "shipping" &&
            !["Shipped", "Delivered"].includes(newStatus)) {
            notify("Shipping can only update shipping progress.");
            return;
        }

        const orders = getData(KEYS.orders);
        const order = orders.find(item => item.id === orderId);

        if (!order) return;

        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        saveData(KEYS.orders, orders);

        renderOrders();
        renderDashboard();

        notify(`Order ${orderId} updated to ${newStatus}.`);
    }
);



const orderFormCard = document.getElementById("orderFormCard");

document.getElementById("showOrderForm").addEventListener("click", () => {
    orderFormCard.classList.toggle("d-none");
});

document.getElementById("cancelOrderForm").addEventListener("click", () => {
    orderFormCard.classList.add("d-none");
    document.getElementById("orderForm").reset();
});

function populateBookSelect() {

    const inventory = getData(KEYS.inventory);

    document.getElementById("orderBook").innerHTML =
        inventory.map(book => `
            <option value="${escapeHTML(book.bookId)}"
                    ${book.stock <= 0 ? "disabled" : ""}>
                ${escapeHTML(book.title)} (${book.stock} available)
            </option>
        `).join("");
}

document.getElementById("orderForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        if (currentRole !== "admin") return;

        const inventory = getData(KEYS.inventory);
        const bookId = document.getElementById("orderBook").value;
        const quantity = Number(
            document.getElementById("orderQuantity").value
        );

        const book = inventory.find(
            item => String(item.bookId) === bookId
        );

        if (!book || quantity < 1 || quantity > book.stock) {
            notify("Not enough stock available.");
            return;
        }

        const newOrder = {
            id: "ORD-" + Date.now(),
            customer: document.getElementById("customerName").value.trim(),
            email: document.getElementById("customerEmail").value.trim(),
            bookId: book.bookId,
            bookTitle: book.title,
            quantity: quantity,
            address: document.getElementById("customerAddress").value.trim(),
            status: "Pending",
            createdAt: new Date().toISOString()
        };

        book.stock -= quantity;

        const orders = getData(KEYS.orders);
        orders.push(newOrder);

        saveData(KEYS.orders, orders);
        saveData(KEYS.inventory, inventory);

        this.reset();
        orderFormCard.classList.add("d-none");

        populateBookSelect();
        renderDashboard();
        renderOrders();
        renderInventory();

        notify("New order created successfully.");
    }
);


function renderInventory() {

    const inventory = getData(KEYS.inventory);

    document.getElementById("inventoryTable").innerHTML =
        inventory.map(book => {

            const stockStatus = book.stock === 0
                ? '<span class="badge text-bg-danger">Out of Stock</span>'
                : book.stock <= 5
                ? '<span class="badge text-bg-warning">Low Stock</span>'
                : '<span class="badge text-bg-success">Available</span>';

            return `
                <tr>
                    <td><strong>${escapeHTML(book.title)}</strong></td>
                    <td>${escapeHTML(categoryLabel(book.category))}</td>
                    <td>${book.stock}</td>
                    <td>${stockStatus}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <input type="number" min="0"
                                   class="form-control form-control-sm stock-input"
                                   value="${book.stock}"
                                   data-book-id="${escapeHTML(book.bookId)}"
                                   style="max-width:90px">

                            <button class="btn btn-sm btn-dark update-stock"
                                    data-book-id="${escapeHTML(book.bookId)}">
                                Save
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
}

document.getElementById("inventoryTable").addEventListener(
    "click",
    function(event) {

        const button = event.target.closest(".update-stock");

        if (!button) return;

        const bookId = button.dataset.bookId;

        const input = document.querySelector(
            `.stock-input[data-book-id="${CSS.escape(bookId)}"]`
        );

        const newStock = Number(input.value);

        if (!Number.isInteger(newStock) || newStock < 0) {
            notify("Enter a valid stock quantity.");
            return;
        }

        const inventory = getData(KEYS.inventory);

        const book = inventory.find(
            item => String(item.bookId) === bookId
        );

        if (!book) return;

        book.stock = newStock;

        saveData(KEYS.inventory, inventory);

        renderInventory();
        renderDashboard();
        populateBookSelect();

        notify("Inventory updated successfully.");
    }
);


function renderPromotions() {

    const promotions = getData(KEYS.promotions);

    document.getElementById("noPromotions").classList.toggle(
        "d-none",
        promotions.length > 0
    );

    document.getElementById("promotionsTable").innerHTML =
        promotions.map(promo => `
            <tr>
                <td><strong>${escapeHTML(promo.code)}</strong></td>
                <td>${promo.discount}%</td>
                <td>${escapeHTML(promo.expiry)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger delete-promo"
                            data-promo-id="${promo.id}">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join("");
}

document.getElementById("promotionForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const code = document.getElementById("promoCode")
            .value.trim().toUpperCase();

        const discount = Number(
            document.getElementById("promoDiscount").value
        );

        const expiry = document.getElementById("promoExpiry").value;

        const today = new Date().toISOString().slice(0, 10);

        if (discount < 1 || discount > 100 || expiry < today) {
            notify("Enter a valid discount and future expiry date.");
            return;
        }

        const promotions = getData(KEYS.promotions);

        if (promotions.some(promo => promo.code === code)) {
            notify("This discount code already exists.");
            return;
        }

        promotions.push({
            id: Date.now(),
            code,
            discount,
            expiry
        });

        saveData(KEYS.promotions, promotions);

        this.reset();

        renderPromotions();

        notify("Promotion created successfully.");
    }
);

document.getElementById("promotionsTable").addEventListener(
    "click",
    function(event) {

        const button = event.target.closest(".delete-promo");

        if (!button) return;

        const promotions = getData(KEYS.promotions).filter(
            promo => String(promo.id) !== button.dataset.promoId
        );

        saveData(KEYS.promotions, promotions);

        renderPromotions();

        notify("Promotion deleted.");
    }
);


function renderAll() {
    renderDashboard();
    renderOrders();
    renderInventory();
    renderPromotions();
    populateBookSelect();
}

initializeDashboard();
renderAll();
updateRole();
