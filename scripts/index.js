
const popularBooks = books.filter(book => book.featured).slice(0, 4);

const popularContainer = document.getElementById('popular-books');

popularContainer.innerHTML = popularBooks.map(book => {

    const paperback = book.formats.find(format => format.format === 'paperback');

    return `
        <div class="col-12 col-sm-6 col-lg-3">
            <div class="card h-100 border-0 shadow-sm">

                <img src="${book.img}"
                     class="card-img-top p-3"
                     alt="${book.title}"
                     style="height: 260px; object-fit: contain;">

                <div class="card-body d-flex flex-column">

                    <span class="badge bg-secondary align-self-start mb-2">
                        ${categoryLabel(book.category)}
                    </span>

                    <h5 class="card-title fw-bold">
                        ${book.title}
                    </h5>

                    <p class="text-muted small mb-2">
                        By ${book.author}
                    </p>

                    <p class="small mb-2">
                        <i class="fa-solid fa-star text-warning"></i>
                        ${book.rating}
                        <span class="text-muted">
                            (${book.reviewCount} reviews)
                        </span>
                    </p>

                    <p class="card-text small text-muted">
                        ${book.summary}
                    </p>

                    <div class="mt-auto">

                        <div class="fw-bold mb-3">
                            $${paperback ? paperback.price.toFixed(2) : 'N/A'}
                        </div>

                        <a href="book-details.html?slug=${encodeURIComponent(book.slug)}"
   class="btn btn-outline-dark">
    View Details
</a>

                    </div>

                </div>
            </div>
        </div>
    `;
}).join('');
