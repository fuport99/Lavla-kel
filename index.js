const urlApi = 'https://6ab100ff9751d2b03e6cb959.mockapi.io/point/Lavka-kel';
const urlReviews = 'https://6ab100ff9751d2b03e6cb959.mockapi.io/point/reviews';
const cart = [];
const cards = new Map();
let currentProduct = null;

const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const overlay = document.getElementById('overlay');
const cartPanel = document.getElementById('cartPanel');
const cartItemsEl = document.getElementById('cartItems');
const cartEmptyEl = document.getElementById('cartEmpty');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');

const productOverlay = document.getElementById('productOverlay');
const closeProductBtn = document.getElementById('closeProductBtn');
const productModalBody = document.getElementById('productModalBody');

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function safeRating(value) {
    return Math.min(5, Math.max(1, Math.round(Number(value)) || 1));
}

function starsHtml(rating) {
    const r = safeRating(rating);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
}

function averageRating(product) {
    if (!Array.isArray(product.reviews) || product.reviews.length === 0) return null;
    const sum = product.reviews.reduce((s, r) => s + safeRating(r.rating), 0);
    return sum / product.reviews.length;
}

function ratingBadgeHtml(product) {
    const avg = averageRating(product);
    if (avg === null) return '';
    return `<span class="ratingBadge">★ ${avg.toFixed(1)} <span class="ratingCount">(${product.reviews.length})</span></span>`;
}

function updateRatingBadge(root, product) {
    const html = ratingBadgeHtml(product);
    const old = root.querySelector('.ratingBadge');
    if (old) {
        old.outerHTML = html;
    } else {
        root.querySelector('h3').insertAdjacentHTML('afterend', html);
    }
}

function reviewItemHtml(r) {
    return `
                <div class="reviewItem">
                    <div class="reviewHead">
                        <span class="reviewName">${escapeHtml(r.name)}</span>
                        <span class="stars">${starsHtml(r.rating)}</span>
                    </div>
                    <p class="reviewText">${escapeHtml(r.text)}</p>
                </div>`;
}

function renderProductModal(product) {
    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const videoId = product.videoId;

    productModalBody.innerHTML = `
        <div class="productHead">
            <div class="icon"><img src="${product.avatar}" alt="${product.name}"></div>
            <div>
                <span class="tag">№ ${product.id}</span>
                <h3>${product.name}</h3>
                ${ratingBadgeHtml(product)}
                <span class="price">${product.price}</span>
            </div>
        </div>
        <p class="desc">${product.description}</p>
        ${videoId ? `
        <div class="productVideo">
            <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="Видео о товаре"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
        </div>` : ''}
        <h4 class="reviewsTitle">Отзывы искателей приключений</h4>
        <div class="reviews">${reviews.map(reviewItemHtml).join('')}</div>
        <form class="reviewForm">
            <h4 class="reviewsTitle">Оставить отзыв</h4>
            <input name="name" type="text" placeholder="Ваше имя" maxlength="40" required>
            <select name="rating" aria-label="Оценка">
                <option value="5">★★★★★ — 5</option>
                <option value="4">★★★★☆ — 4</option>
                <option value="3">★★★☆☆ — 3</option>
                <option value="2">★★☆☆☆ — 2</option>
                <option value="1">★☆☆☆☆ — 1</option>
            </select>
            <textarea name="text" rows="3" placeholder="Что скажете о товаре?" maxlength="300" required></textarea>
            <button type="submit" class="cartCheckout">Отправить отзыв</button>
            <p class="reviewStatus"></p>
        </form>
    `;
}

function openProductModal(product, scrollToForm = false) {
    currentProduct = product;
    renderProductModal(product);
    productOverlay.classList.add('open');

    if (scrollToForm) {
        productModalBody.querySelector('.reviewForm').scrollIntoView({ block: 'start' });
    }
}

function closeProductModal() {
    productOverlay.classList.remove('open');
}

productOverlay.addEventListener('click', (e) => {
    if (e.target === productOverlay) closeProductModal();
});
closeProductBtn.addEventListener('click', closeProductModal);

async function submitReview(form) {
    const product = currentProduct;
    const data = new FormData(form);
    const review = {
        productId: product.id,
        name: data.get('name').trim(),
        rating: safeRating(data.get('rating')),
        text: data.get('text').trim()
    };
    if (!review.name || !review.text) return;

    const button = form.querySelector('button');
    const status = form.querySelector('.reviewStatus');
    button.disabled = true;
    status.textContent = 'Отправляем…';

    try {
        const response = await fetch(urlReviews, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);

        product.reviews = [...(product.reviews || []), review];
        updateRatingBadge(cards.get(product.id), product);

        if (currentProduct === product) {
            const list = productModalBody.querySelector('.reviews');
            list.insertAdjacentHTML('beforeend', reviewItemHtml(review));
            list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            updateRatingBadge(productModalBody, product);
            form.reset();
            status.textContent = 'Спасибо за отзыв!';
        }
    } catch (error) {
        console.error('Не удалось отправить отзыв:', error);
        status.textContent = 'Не удалось отправить отзыв. Попробуйте позже.';
    }

    button.disabled = false;
}

productModalBody.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('reviewForm')) submitReview(e.target);
});

function openCart() {
    cartPanel.classList.add('open');
    overlay.classList.add('open');
}

function closeCart() {
    cartPanel.classList.remove('open');
    overlay.classList.remove('open');
}

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

function renderCart() {
    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
        cartEmptyEl.style.display = 'block';
    } else {
        cartEmptyEl.style.display = 'none';

        cart.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'cartItem';
            row.innerHTML = `
                        <div class="info">
                            <span class="tag">${item.tag}</span>
                            <h4>${item.name}</h4>
                            <span class="price">${item.price} з.</span>
                        </div>
                        <button class="removeBtn" data-index="${index}">✕</button>
                    `;
            cartItemsEl.appendChild(row);
        });
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotalEl.textContent = total + ' з.';
    cartCountEl.textContent = '(' + cart.length + ')';
}

function bindAddButtons() {
    document.querySelectorAll('.addBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            cart.push({
                name: btn.dataset.name,
                tag: btn.dataset.tag,
                price: Number(btn.dataset.price)
            });
            renderCart();
            openCart();
        });
    });
}

cartItemsEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('removeBtn')) {
        const index = Number(e.target.dataset.index);
        cart.splice(index, 1);
        renderCart();
    }
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Мешочек пуст — сначала добавьте что-нибудь из лавки.');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    alert(`Заказ оформлен! Списано ${total} з. за ${cart.length} шт. Кель уже заворачивает покупки.`);

    cart.length = 0;
    renderCart();
    closeCart();
});

function createCard(product) {
    const card = document.createElement('div');
    card.className = 'card';

    const tag = '№ ' + product.id;
    const priceDigits = String(product.price).replace(/\D/g, '');
    const hasPrice = priceDigits.length > 0;

    card.innerHTML = `
        <span class="tag">${tag}</span>
        <div class="icon">
            <img src="${product.avatar}" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        ${ratingBadgeHtml(product)}
        <p class="desc">${product.description}</p>
        <button class="reviewBtn" type="button">Оставить отзыв</button>
        <div class="row">
            <span class="price">${product.price}</span>
            <button class="addBtn" data-name="${product.name}" data-tag="${tag}"
                ${hasPrice ? `data-price="${priceDigits}"` : 'disabled'}>В мешочек</button>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (e.target.closest('.addBtn')) return;
        openProductModal(product, Boolean(e.target.closest('.reviewBtn')));
    });

    cards.set(product.id, card);
    return card;
}

async function loadUserReviews() {
    try {
        const response = await fetch(urlReviews);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

async function loadProducts() {
    try {
        const [products, userReviews] = await Promise.all([
            fetch(urlApi).then(response => response.json()),
            loadUserReviews()
        ]);

        userReviews.forEach(review => {
            const product = products.find(p => p.id === review.productId);
            if (product) {
                product.reviews = [...(product.reviews || []), review];
            }
        });

        products.forEach(product => {
            const grid = document.querySelector(`.category[data-category="${product.category}"] .grid`);
            if (grid) {
                grid.appendChild(createCard(product));
            }
        });

        bindAddButtons();
    } catch (error) {
        console.error('Не удалось загрузить товары из API:', error);
    }
}

renderCart();
loadProducts();