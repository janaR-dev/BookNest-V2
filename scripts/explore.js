const booksContainer = document.getElementById("booksContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");
const booksCount = document.getElementById("booksCount");
const emptyMessage = document.getElementById("emptyMessage");

let selectedCategory = "all";

// Generate category buttons
function displayCategories() {
    categoryFilters.innerHTML = `
        <button class="category-btn active" data-category="all">
            All Books
        </button>
        ${categories.map(category => `
            <button class="category-btn" data-category="${category.key}">
                ${category.label}
            </button>
        `).join("")}
    `;

    document.querySelectorAll(".category-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelector(".category-btn.active")
                ?.classList.remove("active");

            button.classList.add("active");
            selectedCategory = button.dataset.category;

            filterBooks();
        });
    });
}

// Display book cards
function displayBooks(books) {
    booksContainer.innerHTML = books.map(book => {
        const paperback = book.formats?.find(
            format => format.format === "paperback"
        );

        return `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="book-card">
                    <div class="book-image">
                        <img src="${book.img}" alt="${book.title}">
                    </div>

                    <div class="book-info">
                        <span class="book-category">
                            ${categoryLabel(book.category)}
                        </span>

                        <h5>${book.title}</h5>
                        <p class="book-author">By ${book.author}</p>

                        <div class="book-rating">
                            <i class="fa-solid fa-star"></i>
                            ${book.rating}
                            <span>(${book.reviewCount} reviews)</span>
                        </div>

                        <p class="book-price">
                            ${paperback ? paperback.price : ""}
                        </p>

                        <a href="book-details.html?slug=${encodeURIComponent(book.slug)}"
                           class="btn btn-dark w-100">
                            View Details
                        </a>
                        
                    </div>
                </div>
            </div>
        `;
    }).join("");

    booksCount.textContent = `${books.length} books`;

    emptyMessage.classList.toggle("d-none", books.length !== 0);
}

function filterBooks() {
    const searchValue = searchInput.value.trim().toLowerCase();

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchValue) ||
            book.author.toLowerCase().includes(searchValue);

        const matchesCategory =
            selectedCategory === "all" ||
            book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayBooks(filteredBooks);
}

searchInput.addEventListener("input", filterBooks);

displayCategories();
displayBooks(books);