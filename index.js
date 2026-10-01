const urlApi = 'https://6ab100ff9751d2b03e6cb959.mockapi.io/point/Lavka-kel';
const urlReviews = 'https://6ab100ff9751d2b03e6cb959.mockapi.io/point/reviews';
const cart = [];
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

function getStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '★';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

function showRating(el, product) {
    if (!product.reviews || product.reviews.length === 0) {
        el.textContent = 'Нет отзывов';
        return;
    }

    let sum = 0;
    for (let i = 0; i < product.reviews.length; i++) {
        sum += Number(product.reviews[i].rating);
    }
    const average = sum / product.reviews.length;

    el.innerHTML = '★ ' + average.toFixed(1) + ' <span class="ratingCount">(' + product.reviews.length + ')</span>';
}

function addReview(review) {
    const item = document.createElement('div');
    item.className = 'reviewItem';
    item.innerHTML = `
        <div class="reviewHead">
            <span class="reviewName"></span>
            <span class="stars">${getStars(review.rating)}</span>
        </div>
        <p class="reviewText"></p>
    `;

    item.querySelector('.reviewName').textContent = review.name;
    item.querySelector('.reviewText').textContent = review.text;

    document.getElementById('reviewsList').appendChild(item);
}

function renderProductModal(product) {
    let video = '';
    if (product.videoId) {
        video = `
        <div class="productVideo">
            <iframe src="https://www.youtube-nocookie.com/embed/${product.videoId}" title="Видео о товаре"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
        </div>`;
    }

    productModalBody.innerHTML = `
        <div class="productHead">
            <div class="icon"><img src="${product.avatar}" alt="${product.name}"></div>
            <div>
                <span class="tag">№ ${product.id}</span>
                <h3>${product.name}</h3>
                <span class="ratingBadge"></span>
                <span class="price">${product.price}</span>
            </div>
        </div>
        <p class="desc">${product.description}</p>
        ${video}
        <h4 class="reviewsTitle">Отзывы искателей приключений</h4>
        <div class="reviews" id="reviewsList"></div>
        <form class="reviewForm" id="reviewForm">
            <h4 class="reviewsTitle">Оставить отзыв</h4>
            <input id="reviewName" type="text" placeholder="Ваше имя" maxlength="40" required>
            <select id="reviewRating">
                <option value="5">★★★★★ — 5</option>
                <option value="4">★★★★☆ — 4</option>
                <option value="3">★★★☆☆ — 3</option>
                <option value="2">★★☆☆☆ — 2</option>
                <option value="1">★☆☆☆☆ — 1</option>
            </select>
            <textarea id="reviewText" rows="3" placeholder="Что скажете о товаре?" maxlength="300" required></textarea>
            <button type="submit" class="cartCheckout" id="reviewSend">Отправить отзыв</button>
            <p class="reviewStatus" id="reviewStatus"></p>
        </form>
    `;

    showRating(productModalBody.querySelector('.ratingBadge'), product);

    if (product.reviews) {
        for (let i = 0; i < product.reviews.length; i++) {
            addReview(product.reviews[i]);
        }
    }

    document.getElementById('reviewForm').addEventListener('submit', sendReview);
}

function openProductModal(product, goToForm) {
    currentProduct = product;
    renderProductModal(product);
    productOverlay.classList.add('open');

    if (goToForm) {
        document.getElementById('reviewForm').scrollIntoView();
    }
}

function closeProductModal() {
    productOverlay.classList.remove('open');
}

productOverlay.addEventListener('click', (e) => {
    if (e.target === productOverlay) {
        closeProductModal();
    }
});
closeProductBtn.addEventListener('click', closeProductModal);

async function sendReview(e) {
    e.preventDefault();

    const product = currentProduct;
    const nameInput = document.getElementById('reviewName');
    const ratingSelect = document.getElementById('reviewRating');
    const textInput = document.getElementById('reviewText');
    const sendBtn = document.getElementById('reviewSend');
    const statusEl = document.getElementById('reviewStatus');

    const review = {
        productId: product.id,
        name: nameInput.value.trim(),
        rating: Number(ratingSelect.value),
        text: textInput.value.trim()
    };

    if (review.name === '' || review.text === '') {
        return;
    }

    sendBtn.disabled = true;
    statusEl.textContent = 'Отправляем...';

    try {
        const response = await fetch(urlReviews, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });

        if (!response.ok) {
            throw new Error('Ошибка ' + response.status);
        }

        if (!product.reviews) {
            product.reviews = [];
        }
        product.reviews.push(review);
        showRating(product.card.querySelector('.ratingBadge'), product);

        if (currentProduct === product) {
            addReview(review);
            showRating(productModalBody.querySelector('.ratingBadge'), product);
            nameInput.value = '';
            textInput.value = '';
            statusEl.textContent = 'Спасибо за отзыв!';
        }
    } catch (error) {
        console.log('Не удалось отправить отзыв:', error);
        statusEl.textContent = 'Не удалось отправить отзыв. Попробуйте позже.';
    }

    sendBtn.disabled = false;
}

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

        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            const row = document.createElement('div');
            row.className = 'cartItem';
            row.innerHTML = `
                <div class="info">
                    <span class="tag">${item.tag}</span>
                    <h4>${item.name}</h4>
                    <span class="price">${item.price} з.</span>
                </div>
                <button class="removeBtn" data-index="${i}">✕</button>
            `;
            cartItemsEl.appendChild(row);
        }
    }

    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price;
    }
    cartTotalEl.textContent = total + ' з.';
    cartCountEl.textContent = '(' + cart.length + ')';
}

function bindAddButtons() {
    const buttons = document.querySelectorAll('.addBtn');

    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        btn.addEventListener('click', () => {
            cart.push({
                name: btn.dataset.name,
                tag: btn.dataset.tag,
                price: Number(btn.dataset.price)
            });
            renderCart();
            openCart();
        });
    }
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

    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price;
    }
    alert('Заказ оформлен! Списано ' + total + ' з. за ' + cart.length + ' шт.');

    cart.length = 0;
    renderCart();
    closeCart();
});

function createCard(product) {
    const card = document.createElement('div');
    card.className = 'card';

    const tag = '№ ' + product.id;
    const price = parseInt(product.price);
    let priceAttr = 'disabled';
    if (!isNaN(price)) {
        priceAttr = 'data-price="' + price + '"';
    }

    card.innerHTML = `
        <span class="tag">${tag}</span>
        <div class="icon">
            <img src="${product.avatar}" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <span class="ratingBadge"></span>
        <p class="desc">${product.description}</p>
        <button class="reviewBtn" type="button">Оставить отзыв</button>
        <div class="row">
            <span class="price">${product.price}</span>
            <button class="addBtn" data-name="${product.name}" data-tag="${tag}" ${priceAttr}>В мешочек</button>
        </div>
    `;

    showRating(card.querySelector('.ratingBadge'), product);

    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('addBtn')) {
            return;
        }
        openProductModal(product, e.target.classList.contains('reviewBtn'));
    });

    product.card = card;
    return card;
}

async function loadUserReviews() {
    try {
        const response = await fetch(urlReviews);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('Отзывы не загрузились:', error);
    }
    return [];
}

async function loadProducts() {
    try {
        const response = await fetch(urlApi);
        const products = await response.json();
        const userReviews = await loadUserReviews();

        for (let i = 0; i < userReviews.length; i++) {
            const review = userReviews[i];
            for (let j = 0; j < products.length; j++) {
                const product = products[j];
                if (product.id === review.productId) {
                    if (!product.reviews) {
                        product.reviews = [];
                    }
                    product.reviews.push(review);
                }
            }
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const grid = document.querySelector('.category[data-category="' + product.category + '"] .grid');
            if (grid) {
                grid.appendChild(createCard(product));
            }
        }

        bindAddButtons();
    } catch (error) {
        console.log('Не удалось загрузить товары:', error);
    }
}

renderCart();
loadProducts();