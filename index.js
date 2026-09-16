        const cart = [];
 
        const openCartBtn = document.getElementById('openCartBtn');
        const closeCartBtn = document.getElementById('closeCartBtn');
        const overlay = document.getElementById('overlay');
        const cartPanel = document.getElementById('cartPanel');
        const cartItemsEl = document.getElementById('cartItems');
        const cartEmptyEl = document.getElementById('cartEmpty');
        const cartTotalEl = document.getElementById('cartTotal');
        const cartCountEl = document.getElementById('cartCount');
 
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
 
        cartItemsEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('removeBtn')) {
                const index = Number(e.target.dataset.index);
                cart.splice(index, 1);
                renderCart();
            }
        });
 
        renderCart();