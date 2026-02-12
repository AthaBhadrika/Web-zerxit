document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 ZERMODZ - FINAL FIX VERSION');
    
    // ===== DATA DEFAULT =====
    const DEFAULT_PRODUCTS = [
        {
            id: 'p1',
            name: 'HOLO ALL CHAR FFM',
            oldPrice: 22000,
            newPrice: 15400,
            discount: 30,
            timerEnd: new Date(Date.now() + 103000).toISOString(),
            buttonText: '[ ORDER ]'
        },
        {
            id: 'p2',
            name: 'HOLO SENJATA FFM',
            oldPrice: 18000,
            newPrice: 18000,
            discount: 0,
            timerEnd: null,
            buttonText: '[ ORDER ]'
        },
        {
            id: 'p3',
            name: 'HOLO SENJATA FFB',
            oldPrice: 15000,
            newPrice: 15000,
            discount: 0,
            timerEnd: null,
            buttonText: '[ ORDER ]'
        }
    ];

    // ===== LOAD PRODUK =====
    function loadProducts() {
        try {
            const saved = localStorage.getItem('zerModzProducts');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {}
        
        // FIRST TIME - LANGSUNG SAVE DEFAULT
        localStorage.setItem('zerModzProducts', JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }

    let products = loadProducts();
    
    // KONVERSI TIMEREND KE DATE
    products.forEach(p => {
        if (p.timerEnd) p.timerEnd = new Date(p.timerEnd);
    });

    // ===== SAVE PRODUK =====
    function saveProducts() {
        const toSave = products.map(p => ({
            ...p,
            timerEnd: p.timerEnd ? p.timerEnd.toISOString() : null
        }));
        localStorage.setItem('zerModzProducts', JSON.stringify(toSave));
    }

    // ===== FORMAT TIMER =====
    function formatTimeLeft(ms) {
        if (ms <= 0) return '00:00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ===== RENDER PRODUK =====
    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        products.forEach(product => {
            // CEK TIMER
            if (product.timerEnd && new Date() > product.timerEnd) {
                product.newPrice = product.oldPrice;
                product.discount = 0;
                product.timerEnd = null;
                saveProducts();
            }
            
            const card = document.createElement('div');
            card.className = 'product';
            card.id = `product-${product.id}`;
            
            let timerHtml = '';
            if (product.timerEnd) {
                const timeLeft = product.timerEnd - new Date();
                if (timeLeft > 0) {
                    timerHtml = `<div class="timer-badge">⏱️ ${formatTimeLeft(timeLeft)}</div>`;
                }
            }
            
            let discountHtml = '';
            if (product.discount > 0) {
                discountHtml = `<div class="discount-badge">DISKON ${product.discount}%</div>`;
            }
            
            card.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-price">
                    <span class="old-price">Rp ${product.oldPrice.toLocaleString()}</span>
                    <span class="new-price">Rp ${product.newPrice.toLocaleString()}</span>
                </div>
                ${discountHtml}
                ${timerHtml}
                <button class="order-btn" data-product-id="${product.id}">${product.buttonText || '[ ORDER ]'}</button>
            `;
            
            grid.appendChild(card);
        });
        
        // ORDER WA
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const product = products.find(p => p.id === this.dataset.productId);
                if (product) {
                    const msg = encodeURIComponent(`Halo kak saya mau order ${product.name} (Rp ${product.newPrice.toLocaleString()})`);
                    window.open(`https://wa.me/6289653938936?text=${msg}`, '_blank');
                }
            });
        });
    }

    // ===== UPDATE TIMER =====
    setInterval(() => {
        const now = new Date();
        products.forEach(product => {
            if (product.timerEnd) {
                const timeLeft = product.timerEnd - now;
                const timerEl = document.querySelector(`#product-${product.id} .timer-badge`);
                
                if (timerEl) {
                    if (timeLeft <= 0) {
                        timerEl.remove();
                        product.newPrice = product.oldPrice;
                        product.discount = 0;
                        product.timerEnd = null;
                        saveProducts();
                        
                        const priceEl = document.querySelector(`#product-${product.id} .new-price`);
                        if (priceEl) priceEl.innerText = `Rp ${product.oldPrice.toLocaleString()}`;
                        
                        const discEl = document.querySelector(`#product-${product.id} .discount-badge`);
                        if (discEl) discEl.remove();
                    } else {
                        timerEl.innerText = `⏱️ ${formatTimeLeft(timeLeft)}`;
                    }
                }
            }
        });
    }, 1000);

    // ===== CLOCK =====
    function updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        const dateEl = document.getElementById('date');
        if (clockEl) clockEl.innerText = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
        if (dateEl) dateEl.innerText = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== LOGIN - PASTI JALAN! =====
    const modal = document.getElementById('loginModal');
    const profileBtn = document.getElementById('adminProfileBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const loginBtn = document.getElementById('loginBtn');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');
    const adminPanel = document.getElementById('adminPanelContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    // BUKA MODAL
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            modal.classList.remove('hidden');
        });
    }

    // TUTUP MODAL
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.add('hidden');
        });
    }

    // KLIK LUAR MODAL
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // LOGIN - UDAH DIISI DEFAULT
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const user = username ? username.value : '';
            const pass = password ? password.value : '';
            
            if (user === 'ZeroXitAndro' && pass === 'ROBB15') {
                modal.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                if (loginMessage) loginMessage.innerText = '';
                loadAdminPanel();
            } else {
                if (loginMessage) loginMessage.innerText = '✗ Username/password salah';
            }
        });
    }

    // LOGOUT
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            adminPanel.classList.add('hidden');
        });
    }

    // ===== ADMIN PANEL =====
    function loadAdminPanel() {
        const panelBody = document.getElementById('adminPanelBody');
        if (!panelBody) return;
        
        panelBody.innerHTML = `
            <div class="admin-section">
                <div class="admin-section-title">➕ TAMBAH PRODUK</div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <input type="text" id="newProductName" placeholder="Nama produk" style="flex:2; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <input type="number" id="newProductPrice" placeholder="Harga" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <input type="text" id="newProductButton" placeholder="Teks button" value="[ ORDER ]" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <button id="addProductBtn" class="admin-btn">TAMBAH</button>
                </div>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">⚠️ RESET DATA</div>
                <button id="resetToDefaultBtn" class="admin-btn warn" style="width:100%;">RESET KE AWAL</button>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">📦 DAFTAR PRODUK</div>
                <div id="productListContainer"></div>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">🏷️ DISKON + TIMER</div>
                <div id="discountControlContainer"></div>
            </div>
        `;

        // LIST PRODUK
        const listContainer = document.getElementById('productListContainer');
        listContainer.innerHTML = '';
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <span>${product.name}</span>
                <span>Rp ${product.oldPrice.toLocaleString()}</span>
                <div>
                    <button class="admin-btn small" onclick="window.deleteProduct('${product.id}')">HAPUS</button>
                </div>
            `;
            listContainer.appendChild(item);
        });

        // DISKON CONTROLS
        const discContainer = document.getElementById('discountControlContainer');
        discContainer.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name.substring(0, 10)}</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="number" id="disc_${product.id}" placeholder="%" style="width:60px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <input type="number" id="timer_${product.id}" placeholder="menit" style="width:70px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <input type="number" id="detik_${product.id}" placeholder="detik" style="width:70px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.applyDiscTimer('${product.id}')">TERAP</button>
                </div>
            `;
            discContainer.appendChild(row);
        });

        // EVENT LISTENERS
        document.getElementById('addProductBtn').addEventListener('click', function() {
            const name = document.getElementById('newProductName').value.trim();
            const price = document.getElementById('newProductPrice').value;
            const btnText = document.getElementById('newProductButton').value.trim() || '[ ORDER ]';
            
            if (name && price) {
                const newId = 'p' + Date.now();
                products.push({
                    id: newId,
                    name: name,
                    oldPrice: parseInt(price),
                    newPrice: parseInt(price),
                    discount: 0,
                    timerEnd: null,
                    buttonText: btnText
                });
                saveProducts();
                renderProducts();
                loadAdminPanel();
            }
        });

        document.getElementById('resetToDefaultBtn').addEventListener('click', function() {
            if (confirm('Reset ke data awal?')) {
                localStorage.setItem('zerModzProducts', JSON.stringify(DEFAULT_PRODUCTS));
                products = DEFAULT_PRODUCTS.map(p => ({
                    ...p,
                    timerEnd: p.timerEnd ? new Date(p.timerEnd) : null
                }));
                renderProducts();
                loadAdminPanel();
            }
        });
    }

    // ===== FUNGSI GLOBAL =====
    window.deleteProduct = function(id) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProducts();
        loadAdminPanel();
    };

    window.applyDiscTimer = function(id) {
        const disc = document.getElementById(`disc_${id}`)?.value || 0;
        const menit = parseInt(document.getElementById(`timer_${id}`)?.value) || 0;
        const detik = parseInt(document.getElementById(`detik_${id}`)?.value) || 0;
        
        const product = products.find(p => p.id === id);
        if (!product) return;
        
        const discPercent = parseFloat(disc);
        if (!isNaN(discPercent) && discPercent >= 0) {
            product.discount = discPercent;
            product.newPrice = Math.round(product.oldPrice - (product.oldPrice * discPercent / 100));
            
            if (menit > 0 || detik > 0) {
                product.timerEnd = new Date(Date.now() + ((menit * 60) + detik) * 1000);
            }
            
            saveProducts();
            renderProducts();
            loadAdminPanel();
        }
    };

    // ===== START =====
    renderProducts();
    console.log('✅ FINAL VERSION READY');
});
