// ===== ZERMODZ - FIX TIMER SYNC ALL BROWSER =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 ZerModz - TIMER SYNC VERSION');
    
    // ===== DATA PRODUK DEFAULT (DENGAN TIMER) =====
    const DEFAULT_PRODUCTS = [
        {
            id: 'p1',
            name: 'HOLO ALL CHAR FFM',
            oldPrice: 22000,
            newPrice: 15400,
            discount: 30,
            timerEnd: new Date(Date.now() + 103000).toISOString(), // 1 menit 43 detik
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

    // ===== INITIALIZE LOCALSTORAGE =====
    function initializeLocalStorage() {
        // CEK APAKAH SUDAH ADA DATA DI LOCALSTORAGE
        const saved = localStorage.getItem('zerModzProducts');
        
        if (!saved) {
            // JIKA BELUM ADA, SIMPAN DATA DEFAULT
            console.log('📦 First time - saving default products');
            localStorage.setItem('zerModzProducts', JSON.stringify(DEFAULT_PRODUCTS));
            return DEFAULT_PRODUCTS.map(p => ({
                ...p,
                timerEnd: p.timerEnd ? new Date(p.timerEnd) : null
            }));
        } else {
            try {
                const parsed = JSON.parse(saved);
                // KONVERSI TIMEREND KE DATE OBJECT
                const products = parsed.map(p => ({
                    ...p,
                    timerEnd: p.timerEnd ? new Date(p.timerEnd) : null
                }));
                console.log('✅ Loaded from localStorage:', products.length, 'products');
                return products;
            } catch (e) {
                console.error('❌ Error parsing localStorage, using default');
                localStorage.setItem('zerModzProducts', JSON.stringify(DEFAULT_PRODUCTS));
                return DEFAULT_PRODUCTS.map(p => ({
                    ...p,
                    timerEnd: p.timerEnd ? new Date(p.timerEnd) : null
                }));
            }
        }
    }

    // ===== GLOBAL VARIABLES =====
    let products = initializeLocalStorage();
    let timerInterval = null;

    // ===== SAVE PRODUCTS TO LOCALSTORAGE =====
    function saveProducts() {
        const toSave = products.map(p => ({
            ...p,
            timerEnd: p.timerEnd ? p.timerEnd.toISOString() : null
        }));
        localStorage.setItem('zerModzProducts', JSON.stringify(toSave));
        console.log('💾 Products saved');
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

    // ===== RENDER PRODUCTS =====
    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        products.forEach(product => {
            // CEK TIMER EXPIRED
            if (product.timerEnd && new Date() > product.timerEnd) {
                product.newPrice = product.oldPrice;
                product.discount = 0;
                product.timerEnd = null;
                saveProducts();
            }
            
            const card = document.createElement('div');
            card.className = 'product';
            card.id = `product-${product.id}`;
            
            // DISKON BADGE
            let discountHtml = '';
            if (product.discount > 0) {
                discountHtml = `<div class="discount-badge">DISKON ${product.discount}%</div>`;
            }
            
            // TIMER BADGE
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
                ${discountHtml}
                ${timerHtml}
                <button class="order-btn" data-product-id="${product.id}">${product.buttonText || '[ ORDER ]'}</button>
            `;
            
            grid.appendChild(card);
        });
        
        // ORDER BUTTON EVENT
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                const product = products.find(p => p.id === productId);
                if (product) {
                    const message = encodeURIComponent(`Halo kak saya mau order ${product.name} (Rp ${product.newPrice.toLocaleString()})`);
                    window.open(`https://wa.me/6289653938936?text=${message}`, '_blank');
                }
            });
        });
    }

    // ===== UPDATE TIMER EVERY SECOND =====
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            const now = new Date();
            let needRender = false;
            let needSave = false;
            
            products.forEach(product => {
                if (product.timerEnd) {
                    const timeLeft = product.timerEnd - now;
                    const timerElement = document.querySelector(`#product-${product.id} .timer-badge`);
                    
                    if (timerElement) {
                        if (timeLeft <= 0) {
                            // TIMER HABIS
                            timerElement.remove();
                            product.newPrice = product.oldPrice;
                            product.discount = 0;
                            product.timerEnd = null;
                            needRender = true;
                            needSave = true;
                            
                            // UPDATE HARGA DI CARD
                            const priceElement = document.querySelector(`#product-${product.id} .new-price`);
                            if (priceElement) {
                                priceElement.innerText = `Rp ${product.oldPrice.toLocaleString()}`;
                            }
                            
                            // HAPUS DISKON BADGE
                            const discElement = document.querySelector(`#product-${product.id} .discount-badge`);
                            if (discElement) discElement.remove();
                            
                            console.log(`⏰ Timer expired: ${product.name}`);
                        } else {
                            // UPDATE TIMER
                            timerElement.innerText = `⏱️ ${formatTimeLeft(timeLeft)}`;
                        }
                    }
                }
            });
            
            if (needSave) saveProducts();
            if (needRender) renderProducts();
            
        }, 1000);
    }

    // ===== CLOCK =====
    function updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        const dateEl = document.getElementById('date');
        
        if (clockEl) {
            clockEl.innerText = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        }
        
        if (dateEl) {
            dateEl.innerText = now.toLocaleDateString('id-ID', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== MODAL LOGIN =====
    const modal = document.getElementById('loginModal');
    const profileBtn = document.getElementById('adminProfileBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const loginBtn = document.getElementById('loginBtn');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');
    const adminPanelContainer = document.getElementById('adminPanelContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    // BUKA MODAL
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            modal.classList.remove('hidden');
            username.value = '';
            password.value = '';
            loginMessage.innerText = '';
        });
    }

    // TUTUP MODAL
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.add('hidden');
        });
    }

    // KLIK DI LUAR MODAL
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // LOGIN
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const user = username.value;
            const pass = password.value;
            
            if (user === 'ZeroXitAndro' && pass === 'ROBB15') {
                console.log('✅ Login successful');
                modal.classList.add('hidden');
                adminPanelContainer.classList.remove('hidden');
                loginMessage.innerText = '';
                loadAdminPanel();
            } else {
                console.log('❌ Login failed');
                loginMessage.innerText = '✗ Username/password salah';
            }
        });
    }

    // LOGOUT
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            adminPanelContainer.classList.add('hidden');
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
            
            <!-- RESET DATA -->
            <div class="admin-section">
                <div class="admin-section-title">⚠️ RESET DATA</div>
                <button id="resetToDefaultBtn" class="admin-btn warn" style="width:100%; padding:0.8rem;">RESET KE AWAL</button>
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
        document.getElementById('addProductBtn')?.addEventListener('click', function() {
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

        document.getElementById('resetToDefaultBtn')?.addEventListener('click', function() {
            if (confirm('Reset ke data awal? Semua perubahan akan hilang!')) {
                products = DEFAULT_PRODUCTS.map(p => ({
                    ...p,
                    timerEnd: p.timerEnd ? new Date(p.timerEnd) : null
                }));
                saveProducts();
                renderProducts();
                loadAdminPanel();
            }
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

    // ===== GLOBAL FUNCTIONS =====
    window.deleteProduct = function(id) {
        if (confirm('Hapus produk ini?')) {
            products = products.filter(p => p.id !== id);
            saveProducts();
            renderProducts();
            if (!adminPanelContainer.classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    window.applyDiscTimer = function(id) {
        const discInput = document.getElementById(`disc_${id}`);
        const timerInput = document.getElementById(`timer_${id}`);
        const detikInput = document.getElementById(`detik_${id}`);
        
        const disc = discInput ? discInput.value : 0;
        const menit = timerInput ? parseInt(timerInput.value) || 0 : 0;
        const detik = detikInput ? parseInt(detikInput.value) || 0 : 0;
        
        const product = products.find(p => p.id === id);
        if (!product) return;
        
        const discPercent = parseFloat(disc);
        if (!isNaN(discPercent) && discPercent >= 0) {
            product.discount = discPercent;
            product.newPrice = discPercent >= 100 ? 0 : Math.round(product.oldPrice - (product.oldPrice * discPercent / 100));
            
            if (menit > 0 || detik > 0) {
                const totalDetik = (menit * 60) + detik;
                product.timerEnd = new Date(Date.now() + (totalDetik * 1000));
                console.log(`⏰ Timer set: ${menit}m ${detik}s (${totalDetik}s) -> ${product.timerEnd}`);
            } else {
                product.timerEnd = null;
            }
            
            saveProducts();
            renderProducts();
            
            if (!adminPanelContainer.classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    window.updatePrice = function(id) {
        const priceInput = document.getElementById(`price_${id}`);
        if (priceInput) {
            const newPrice = parseInt(priceInput.value);
            if (!isNaN(newPrice) && newPrice > 0) {
                const product = products.find(p => p.id === id);
                if (product) {
                    product.oldPrice = newPrice;
                    if (!product.timerEnd) {
                        product.newPrice = newPrice;
                        product.discount = 0;
                    }
                    saveProducts();
                    renderProducts();
                    if (!adminPanelContainer.classList.contains('hidden')) {
                        loadAdminPanel();
                    }
                }
            }
        }
    };

    window.updateProductName = function(id) {
        const nameInput = document.getElementById(`name_${id}`);
        if (nameInput) {
            const newName = nameInput.value.trim();
            if (newName) {
                const product = products.find(p => p.id === id);
                if (product) {
                    product.name = newName;
                    saveProducts();
                    renderProducts();
                    if (!adminPanelContainer.classList.contains('hidden')) {
                        loadAdminPanel();
                    }
                }
            }
        }
    };

    window.updateButtonText = function(id) {
        const btnInput = document.getElementById(`btn_${id}`);
        if (btnInput) {
            const newText = btnInput.value.trim() || '[ ORDER ]';
            const product = products.find(p => p.id === id);
            if (product) {
                product.buttonText = newText;
                saveProducts();
                renderProducts();
                if (!adminPanelContainer.classList.contains('hidden')) {
                    loadAdminPanel();
                }
            }
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
            buttonText: buttonText || '[ ORDER ]'
        });
        saveProducts();
        renderProducts();
    }

    // ===== START =====
    startTimer();
    renderProducts();
    console.log('✅ TIMER SYNC VERSION READY');
});
