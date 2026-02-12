document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ZerModz - Full Version');
    
    // ===== DATA PRODUK AWAL (DEFAULT) =====
    const DEFAULT_PRODUCTS = [
        {
            id: 'p1',
            name: 'HOLO ALL CHAR FFM',
            oldPrice: 22000,
            newPrice: 22000,
            discount: 0,
            timerEnd: null,
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

    // ===== VALIDASI PRODUK =====
    function isValidProduct(product) {
        return product && 
               typeof product.id === 'string' &&
               typeof product.name === 'string' &&
               typeof product.oldPrice === 'number' &&
               typeof product.newPrice === 'number' &&
               typeof product.discount === 'number' &&
               product.oldPrice > 0;
    }

    // ===== LOAD DATA DARI LOCALSTORAGE =====
    function loadProducts() {
        try {
            const saved = localStorage.getItem('zerModzProducts');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const validProducts = parsed.filter(isValidProduct);
                    if (validProducts.length > 0) {
                        validProducts.forEach(p => {
                            if (p.timerEnd) {
                                p.timerEnd = new Date(p.timerEnd);
                                if (p.timerEnd <= new Date()) {
                                    p.timerEnd = null;
                                    p.newPrice = p.oldPrice;
                                    p.discount = 0;
                                }
                            }
                        });
                        console.log('✅ Load dari LocalStorage:', validProducts.length, 'produk');
                        return validProducts;
                    }
                }
            }
        } catch (e) {
            console.error('❌ Gagal load LocalStorage:', e);
            localStorage.removeItem('zerModzProducts');
        }
        console.log('📦 Pakai produk default');
        return DEFAULT_PRODUCTS.map(p => ({...p}));
    }

    // ===== SAVE KE LOCALSTORAGE =====
    function saveProducts() {
        try {
            const productsToSave = products.map(p => ({
                ...p,
                timerEnd: p.timerEnd ? p.timerEnd.toISOString() : null
            }));
            localStorage.setItem('zerModzProducts', JSON.stringify(productsToSave));
            console.log('💾 Produk tersimpan');
        } catch (e) {
            console.error('❌ Gagal save:', e);
        }
    }

    // ===== DATA PRODUK GLOBAL =====
    let products = loadProducts();
    let offset = parseInt(localStorage.getItem('zerModzOffset')) || 0;
    let timerInterval = null;

    // ===== FORMAT TIMER JAM:MENIT:DETIK =====
    function formatTimeLeft(ms) {
        if (ms <= 0) return '00:00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ===== REAL TIME CLOCK =====
    function updateClock() {
        const now = new Date();
        const adjusted = new Date(now.getTime() + offset * 60000);
        document.getElementById('clock').innerText = 
            `${adjusted.getHours().toString().padStart(2, '0')}:${adjusted.getMinutes().toString().padStart(2, '0')}:${adjusted.getSeconds().toString().padStart(2, '0')}`;
        document.getElementById('date').innerText = 
            adjusted.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== TIMER PRODUK SETIAP DETIK =====
    function startProductTimers() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            let needRender = false;
            let needSave = false;
            const now = new Date();
            
            products.forEach(product => {
                if (product.timerEnd) {
                    if (product.timerEnd <= now) {
                        product.newPrice = product.oldPrice;
                        product.discount = 0;
                        product.timerEnd = null;
                        needRender = true;
                        needSave = true;
                        console.log(`⏰ Timer habis: ${product.name}`);
                    }
                }
            });
            
            if (needSave) saveProducts();
            if (needRender) renderProducts();
            else updateTimerDisplays();
        }, 1000);
    }

    function updateTimerDisplays() {
        const now = new Date();
        products.forEach(product => {
            if (product.timerEnd) {
                const timeLeft = product.timerEnd - now;
                const timerEl = document.querySelector(`#product-${product.id} .timer-badge`);
                if (timerEl) {
                    if (timeLeft <= 0) timerEl.remove();
                    else timerEl.innerText = `⏱️ ${formatTimeLeft(timeLeft)}`;
                }
            }
        });
    }

    // ===== WA ORDER =====
    function handleOrder(productName, productPrice) {
        const msg = encodeURIComponent(`Halo kak saya mau order ${productName} (Rp ${productPrice.toLocaleString()})`);
        window.open(`https://wa.me/6289653938936?text=${msg}`, '_blank');
    }

    // ===== RENDER PRODUK =====
    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) {
            console.error('❌ productGrid tidak ditemukan!');
            return;
        }
        
        grid.innerHTML = '';
        
        if (!products || products.length === 0) {
            products = DEFAULT_PRODUCTS.map(p => ({...p}));
            saveProducts();
        }
        
        products.forEach(product => {
            if (product.timerEnd && new Date() > product.timerEnd) {
                product.newPrice = product.oldPrice;
                product.discount = 0;
                product.timerEnd = null;
                saveProducts();
            }
            
            const card = document.createElement('div');
            card.className = 'product';
            card.id = `product-${product.id}`;
            
            const discPercent = product.oldPrice > 0 ? 
                Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) : 0;
            
            let timerHtml = '';
            if (product.timerEnd) {
                const timeLeft = product.timerEnd - new Date();
                if (timeLeft > 0) {
                    timerHtml = `<div class="timer-badge">⏱️ ${formatTimeLeft(timeLeft)}</div>`;
                }
            }
            
            card.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-price">
                    <span class="old-price">Rp ${product.oldPrice.toLocaleString()}</span>
                    <span class="new-price">Rp ${product.newPrice.toLocaleString()}</span>
                </div>
                ${discPercent > 0 ? `<div class="discount-badge">DISKON ${discPercent}%</div>` : ''}
                ${timerHtml}
                <button class="order-btn" data-product-id="${product.id}">${product.buttonText || '[ ORDER ]'}</button>
            `;
            
            grid.appendChild(card);
        });
        
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const product = products.find(p => p.id === this.dataset.productId);
                if (product) handleOrder(product.name, product.newPrice);
            });
        });
        
        console.log('🎨 Render produk:', products.length);
    }

    // ===== MODAL LOGIN =====
    const modal = document.getElementById('loginModal');
    const profileBtn = document.getElementById('adminProfileBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const loginBtn = document.getElementById('loginBtn');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');
    const adminPanelContainer = document.getElementById('adminPanelContainer');

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            username.value = '';
            password.value = '';
            loginMessage.innerText = '';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (username.value === 'ZeroXitAndro' && password.value === 'ROBB15') {
                modal.classList.add('hidden');
                adminPanelContainer.classList.remove('hidden');
                loginMessage.innerText = '';
                loadAdminPanel();
            } else {
                loginMessage.innerText = '✗ Username/password salah';
            }
        });
    }

    // ===== LOAD ADMIN PANEL =====
    function loadAdminPanel() {
        const panelBody = document.getElementById('adminPanelBody');
        if (!panelBody) return;
        
        panelBody.innerHTML = `
            <!-- TAMBAH PRODUK -->
            <div class="admin-section">
                <div class="admin-section-title">➕ TAMBAH PRODUK</div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <input type="text" id="newProductName" placeholder="Nama produk" style="flex:2; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <input type="number" id="newProductPrice" placeholder="Harga" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <input type="text" id="newProductButton" placeholder="Teks button" value="[ ORDER ]" style="flex:1; background:black; border:2px solid white; color:white; padding:0.5rem 1rem; border-radius:40px;">
                    <button id="addProductBtn" class="admin-btn" style="padding:0.5rem 1.2rem;">TAMBAH</button>
                </div>
            </div>
            
            <!-- OFFSET WAKTU -->
            <div class="admin-section">
                <div class="admin-section-title">⏱️ OFFSET WAKTU</div>
                <div class="admin-row">
                    <span class="admin-label">MENIT</span>
                    <div class="admin-control">
                        <input type="number" id="offsetInput" value="${offset}" min="-720" max="720">
                        <button id="applyOffsetBtn" class="admin-btn">TERAP</button>
                    </div>
                </div>
            </div>
            
            <!-- RESET DATA -->
            <div class="admin-section">
                <div class="admin-section-title">⚠️ RESET DATA</div>
                <button id="resetToDefaultBtn" class="admin-btn warn" style="width:100%;">RESET KE AWAL</button>
            </div>
            
            <!-- DAFTAR PRODUK -->
            <div class="admin-section">
                <div class="admin-section-title">📦 DAFTAR PRODUK (${products.length})</div>
                <div id="productListContainer" style="max-height:300px; overflow-y:auto;"></div>
            </div>
            
            <!-- DISKON + TIMER -->
            <div class="admin-section">
                <div class="admin-section-title">🏷️ DISKON + TIMER (JAM:MENIT:DETIK)</div>
                <div id="discountControlContainer"></div>
            </div>
            
            <!-- EDIT HARGA -->
            <div class="admin-section">
                <div class="admin-section-title">💰 EDIT HARGA</div>
                <div id="priceEditContainer"></div>
            </div>

            <!-- EDIT NAMA PRODUK -->
            <div class="admin-section">
                <div class="admin-section-title">✏️ EDIT NAMA PRODUK</div>
                <div id="productNameEditContainer"></div>
            </div>

            <!-- EDIT TEKS BUTTON -->
            <div class="admin-section">
                <div class="admin-section-title">🔘 EDIT TEKS BUTTON</div>
                <div id="buttonTextContainer"></div>
            </div>
        `;

        renderProductListForAdmin();
        renderDiscountControls();
        renderPriceControls();
        renderProductNameControls();
        renderButtonTextControls();

        // EVENT LISTENERS
        document.getElementById('applyOffsetBtn')?.addEventListener('click', () => {
            const val = parseInt(document.getElementById('offsetInput').value);
            if (!isNaN(val)) {
                offset = val;
                localStorage.setItem('zerModzOffset', offset);
                updateClock();
            }
        });

        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            const name = document.getElementById('newProductName').value.trim();
            const price = document.getElementById('newProductPrice').value;
            const btnText = document.getElementById('newProductButton').value.trim() || '[ ORDER ]';
            if (name && price && !isNaN(price) && parseInt(price) > 0) {
                addProduct(name, price, btnText);
                document.getElementById('newProductName').value = '';
                document.getElementById('newProductPrice').value = '';
                document.getElementById('newProductButton').value = '[ ORDER ]';
                loadAdminPanel();
            }
        });

        document.getElementById('resetToDefaultBtn')?.addEventListener('click', resetToDefault);
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            adminPanelContainer.classList.add('hidden');
        });
    }

    // ===== RENDER LIST PRODUK ADMIN =====
    function renderProductListForAdmin() {
        const container = document.getElementById('productListContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <span style="font-weight:bold;">${product.name}</span>
                <span>Rp ${product.oldPrice.toLocaleString()}</span>
                <span style="color:#ff6b35;">${product.buttonText || '[ ORDER ]'}</span>
                <div>
                    <button class="admin-btn small" onclick="window.deleteProduct('${product.id}')">HAPUS</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // ===== RENDER KONTROL DISKON =====
    function renderDiscountControls() {
        const container = document.getElementById('discountControlContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name.substring(0, 15)}...</span>
                <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                    <input type="number" id="disc_${product.id}" placeholder="%" min="0" max="100" style="width:60px;" value="${product.discount || ''}">
                    <input type="number" id="timer_${product.id}" placeholder="menit" min="0" style="width:70px;" value="">
                    <input type="number" id="detik_${product.id}" placeholder="detik" min="0" max="59" style="width:70px;" value="">
                    <button class="admin-btn small" onclick="window.applyDiscTimer('${product.id}')">TERAP</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER EDIT HARGA =====
    function renderPriceControls() {
        const container = document.getElementById('priceEditContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name.substring(0, 15)}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="number" id="price_${product.id}" placeholder="Harga" value="${product.oldPrice}" style="width:80px;">
                    <button class="admin-btn small" onclick="window.updatePrice('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER EDIT NAMA =====
    function renderProductNameControls() {
        const container = document.getElementById('productNameEditContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.id}</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="text" id="name_${product.id}" placeholder="Nama produk" value="${product.name}" style="width:180px; background:black; border:2px solid white; color:white; padding:0.3rem 0.6rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateProductName('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== RENDER EDIT BUTTON =====
    function renderButtonTextControls() {
        const container = document.getElementById('buttonTextContainer');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${product.name.substring(0, 15)}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="text" id="btn_${product.id}" placeholder="Teks button" value="${product.buttonText || '[ ORDER ]'}" style="width:120px; background:black; border:2px solid white; color:white; padding:0.3rem 0.6rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateButtonText('${product.id}')">UBAH</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // ===== FUNGSI GLOBAL =====
    window.deleteProduct = function(id) {
        if (confirm('Hapus produk ini?')) {
            products = products.filter(p => p.id !== id);
            saveProducts();
            renderProducts();
            if (!adminPanelContainer.classList.contains('hidden')) loadAdminPanel();
        }
    };

    window.applyDiscTimer = function(id) {
        const disc = document.getElementById(`disc_${id}`)?.value || 0;
        const menit = parseInt(document.getElementById(`timer_${id}`)?.value) || 0;
        const detik = parseInt(document.getElementById(`detik_${id}`)?.value) || 0;
        const product = products.find(p => p.id === id);
        
        if (product) {
            const discPercent = parseFloat(disc);
            if (!isNaN(discPercent) && discPercent >= 0) {
                product.discount = discPercent;
                product.newPrice = discPercent >= 100 ? 0 : 
                    Math.round(product.oldPrice - (product.oldPrice * discPercent / 100));
                
                if (menit > 0 || detik > 0) {
                    product.timerEnd = new Date(Date.now() + (menit * 60 + detik) * 1000);
                }
                
                saveProducts();
                renderProducts();
                if (!adminPanelContainer.classList.contains('hidden')) loadAdminPanel();
            }
        }
    };

    window.updatePrice = function(id) {
        const price = parseInt(document.getElementById(`price_${id}`)?.value);
        const product = products.find(p => p.id === id);
        if (product && !isNaN(price) && price > 0) {
            product.oldPrice = price;
            if (!product.timerEnd) product.newPrice = price;
            saveProducts();
            renderProducts();
            if (!adminPanelContainer.classList.contains('hidden')) loadAdminPanel();
        }
    };

    window.updateProductName = function(id) {
        const name = document.getElementById(`name_${id}`)?.value.trim();
        const product = products.find(p => p.id === id);
        if (product && name) {
            product.name = name;
            saveProducts();
            renderProducts();
            if (!adminPanelContainer.classList.contains('hidden')) loadAdminPanel();
        }
    };

    window.updateButtonText = function(id) {
        const text = document.getElementById(`btn_${id}`)?.value.trim() || '[ ORDER ]';
        const product = products.find(p => p.id === id);
        if (product) {
            product.buttonText = text;
            saveProducts();
            renderProducts();
            if (!adminPanelContainer.classList.contains('hidden')) loadAdminPanel();
        }
    };

    window.resetToDefault = function() {
        if (confirm('Reset ke data awal? Semua perubahan akan hilang!')) {
            products = DEFAULT_PRODUCTS.map(p => ({...p}));
            saveProducts();
            renderProducts();
            if (!adminPanelContainer.classList.contains('hidden')) loadAdminPanel();
        }
    };

    function addProduct(name, price, buttonText) {
        const newId = 'p' + Date.now() + Math.random().toString(36).substr(2, 4);
        products.push({
            id: newId,
            name: name,
            oldPrice: parseInt(price),
            newPrice: parseInt(price),
            discount: 0,
            timerEnd: null,
            buttonText: buttonText
        });
        saveProducts();
        renderProducts();
    }

    // ===== START =====
    startProductTimers();
    renderProducts();
    console.log('✅ Full version siap!');
});
