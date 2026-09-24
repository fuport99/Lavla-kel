const urlApi = 'https://6ab100ff9751d2b03e6cb959.mockapi.io/point/Lavka-kel';
const cart = [];

const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const overlay = document.getElementById('overlay');
const cartPanel = document.getElementById('cartPanel');
const cartItemsEl = document.getElementById('cartItems');
const cartEmptyEl = document.getElementById('cartEmpty');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');

const productOverlay = document.getElementById('productOverlay');
const productModal = document.getElementById('productModal');
const closeProductBtn = document.getElementById('closeProductBtn');
const productModalBody = document.getElementById('productModalBody');

function starsHtml(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function renderProductModal(product) {
    const reviews = Array.isArray(product.reviews) ? product.reviews.slice(0, 5) : [];
    const videoId = product.videoId;

    productModalBody.innerHTML = `
        <div class="productHead">
            <div class="icon"><img src="${product.avatar}" alt="${product.name}"></div>
            <div>
                <span class="tag">№ ${product.id}</span>
                <h3>${product.name}</h3>
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
        <div class="reviews">
            ${reviews.map(r => `
                <div class="reviewItem">
                    <div class="reviewHead">
                        <span class="reviewName">${r.name}</span>
                        <span class="stars">${starsHtml(r.rating)}</span>
                    </div>
                    <p class="reviewText">${r.text}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function openProductModal(product) {
    renderProductModal(product);
    productOverlay.classList.add('open');
    productModal.classList.add('open');
}

function closeProductModal() {
    productOverlay.classList.remove('open');
    productModal.classList.remove('open');
}

productOverlay.addEventListener('click', closeProductModal);
closeProductBtn.addEventListener('click', closeProductModal);

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
        if (btn.disabled) return;

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
        <p class="desc">${product.description}</p>
        <div class="row">
            <span class="price">${product.price}</span>
            <button class="addBtn" data-name="${product.name}" data-tag="${tag}"
                ${hasPrice ? `data-price="${priceDigits}"` : 'disabled'}>В мешочек</button>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (e.target.closest('.addBtn')) return;
        openProductModal(product);
    });

    return card;
}

async function loadProducts() {
    try {
        const response = await fetch(urlApi);
        const products = await response.json();

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