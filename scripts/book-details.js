
const params = new URLSearchParams(window.location.search);
const selectedSlug = params.get("slug");

const book = books.find(item => item.slug === selectedSlug);

const bookContent = document.getElementById("bookContent");
const bookNotFound = document.getElementById("bookNotFound");

let selectedFormat = null;

const sampleReviews = [
    {
        name: "Sarah M.",
        rating: 5,
        date: "October 2026",
        comment: "A wonderful book! I really enjoyed reading it. Definitely recommended."
    },
    {
        name: "Ahmed K.",
        rating: 4,
        date: "September 2026",
        comment: "Very interesting and well written. I would recommend it to other readers."
    },
    {
        name: "Mariam A.",
        rating: 5,
        date: "August 2026",
        comment: "One of my favorite reads. The content was engaging from beginning to end."
    }
];

function getPrice(format) {
    return Number(String(format.price).replace(/[^0-9.]/g, "")) || 0;
}

function renderStars(rating) {
    const fullStars = Math.round(Number(rating) || 0);

    return Array.from({ length: 5 }, (_, index) =>
        `<i class="fa-${index < fullStars ? "solid" : "regular"} fa-star"></i>`
    ).join("");
}

function displayBook() {
    if (!book) {
        bookContent.classList.add("d-none");
        bookNotFound.classList.remove("d-none");
        return;
    }

    document.title = `${book.title} | BookNest`;

    document.getElementById("bookImage").src = book.img;
    document.getElementById("bookTitle").textContent = book.title;
    document.getElementById("bookAuthor").textContent = `By ${book.author}`;
    document.getElementById("bookCategory").textContent =
        categoryLabel(book.category);

    document.getElementById("bookSummary").textContent = book.summary;

    document.getElementById("bookRating").textContent =
        Number(book.rating).toFixed(1);

    document.getElementById("bookStars").innerHTML =
        renderStars(book.rating);

    document.getElementById("reviewCount").textContent =
        `(${book.reviewCount} reviews)`;

    displayFormats();
    displayReviews();
}

function displayFormats() {
    const container = document.getElementById("formatOptions");

    container.innerHTML = book.formats.map((format, index) => `
        <button type="button"
            class="btn btn-outline-dark format-option"
            data-index="${index}">
            <i class="fa-solid ${
                format.format === "ebook"
                    ? "fa-tablet-screen-button"
                    : "fa-book"
            } me-2"></i>
            ${format.format === "ebook" ? "E-book" : "Paperback"}
            <br>
            <strong>${format.price}</strong>
        </button>
    `).join("");

    container.querySelectorAll(".format-option").forEach(button => {
        button.addEventListener("click", () => {
            selectFormat(Number(button.dataset.index));
        });
    });

    selectFormat(0);
}

function selectFormat(index) {
    selectedFormat = book.formats[index];

    document.querySelectorAll(".format-option").forEach((button, i) => {
        button.classList.toggle("active", i === index);
    });

    document.getElementById("bookPrice").textContent =
        selectedFormat.price;
}

function displayReviews() {
    const rating = Number(book.rating) || 0;
    const count = Number(book.reviewCount) || 0;

    document.getElementById("summaryRating").textContent =
        rating.toFixed(1);

    document.getElementById("summaryStars").innerHTML =
        renderStars(rating);

    document.getElementById("summaryCount").textContent =
        `${count} customer ratings`;

    const ratingBars = document.getElementById("ratingBars");

    ratingBars.innerHTML = [5, 4, 3, 2, 1].map((star, index) => {
        const percentages = [70, 20, 7, 2, 1];

        return `
            <div class="d-flex align-items-center gap-2 mb-2">
                <small>${star} <i class="fa-solid fa-star text-warning"></i></small>
                <div class="progress flex-grow-1" style="height: 8px;">
                    <div class="progress-bar bg-warning"
                         style="width: ${percentages[index]}%"></div>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("reviewsList").innerHTML =
        sampleReviews.map(review => `
            <div class="review-card border-bottom py-3">
                <div class="d-flex justify-content-between">
                    <strong>${review.name}</strong>
                    <small class="text-muted">${review.date}</small>
                </div>
                <div class="text-warning my-2">
                    ${renderStars(review.rating)}
                </div>
                <p class="text-secondary mb-0">${review.comment}</p>
            </div>
        `).join("");
}

function getCart() {
    return JSON.parse(localStorage.getItem("BookNestCart")) || [];
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

    document.getElementById("cartCount").textContent = count;
}

document.getElementById("addToCartBtn").addEventListener("click", () => {
    if (!book || !selectedFormat) return;

    const cart = getCart();

    const existingItem = cart.find(item =>
        String(item.bookId) === String(book.id) &&
        item.format === selectedFormat.format
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            bookId: book.id,
            quantity: 1,
            format: selectedFormat.format
        });
    }

    localStorage.setItem("BookNestCart", JSON.stringify(cart));

    document.getElementById("cartMessage").classList.remove("d-none");
    updateCartCount();
});

if (book) {
    displayBook();
}

updateCartCount();
