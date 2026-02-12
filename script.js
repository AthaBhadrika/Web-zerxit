// ===== ZERMODZ - FORCE SAME TIMER ALL BROWSERS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 FORCE SYNC VERSION - PAKSA TIMER SAMA!');
    
    // ===== DATA PRODUK DEFAULT - PASTI SAMA! =====
    const DEFAULT_PRODUCTS = [
        {
            id: 'p1',
            name: 'HOLO ALL CHAR FFM',
            oldPrice: 22000,
            newPrice: 15400,     // DISKON 30%
            discount: 30,
            timerDuration: 103000, // 1 menit 43 detik dalam ms
            timerEnd: null,       // AKAN DIISI PAKSA!
            buttonText: '[ ORDER ]'
        },
        {
            id: 'p2',
            name: 'HOLO SENJATA FFM',
            oldPrice: 18000,
            newPrice: 18000,
            discount: 0,
            timerDuration: 0,
            timerEnd: null,
            buttonText: '[ ORDER ]'
        },
        {
            id: 'p3',
            name: 'HOLO SENJATA FFB',
            oldPrice: 15000,
            newPrice: 15000,
            discount: 0,
            timerDuration: 0,
            timerEnd: null,
            buttonText: '[ ORDER ]'
        }
    ];

    // ===== GLOBAL VARIABLES =====
    let products = [];
    let timerInterval = null;
    let SERVER_START_TIME = null;

    // ===== INITIALIZE - PAKSA TIMER SAMA! =====
    function initializeProducts() {
        // CEK APAKAH ADA "SERVER TIME" DI LOCALSTORAGE
        const savedServerTime = localStorage.getItem('zerModzServerTime');
        const savedProducts = localStorage.getItem('zerModzProducts');
        
        if (!savedServerTime) {
            // FIRST TIME - SET SERVER TIME SEKARANG!
            SERVER_START_TIME = Date.now();
            localStorage.setItem('zerModzServerTime', SERVER_START_TIME);
            console.log('🕐 First time - Server time set:', new Date(SERVER_START_TIME).toLocaleTimeString());
        } else {
            // PAKSA PAKAI SERVER TIME YANG SAMA!
            SERVER_START_TIME = parseInt(savedServerTime);
            console.log('🕐 Using server time:', new Date(SERVER_START_TIME).toLocaleTimeString());
        }
        
        if (!savedProducts) {
            // FIRST TIME - BUAT PRODUK BARU
            products = DEFAULT_PRODUCTS.map(p => {
                const newP = {...p};
                if (newP.timerDuration > 0) {
                    // TIMER MULAI DARI SERVER_START_TIME + timerDuration
                    newP.timerEnd = new Date(SERVER_START_TIME + newP.timerDuration);
                }
                return newP;
            });
            saveProducts();
        } else {
            try {
                // LOAD PRODUK TAPI PAKSA TIMER END!
                const parsed = JSON.parse(savedProducts);
                products = parsed.map(p => {
                    if (p.id === 'p1' && p.timerDuration) {
                        // PAKSA TIMER PAKAI SERVER_START_TIME + duration
                        return {
                            ...p,
                            timerEnd: new Date(SERVER_START_TIME + p.timerDuration)
                        };
                    }
                    return {
                        ...p,
                        timerEnd: p.timerEnd ? new Date(p.timerEnd) : null
                    };
                });
                console.log('✅ Loaded products, timer dipaksa sama!');
            } catch (e) {
                console.error('❌ Error, recreate products');
                products = DEFAULT_PRODUCTS.map(p => {
                    const newP = {...p};
                    if (newP.timerDuration > 0) {
                        newP.timerEnd = new Date(SERVER_START_TIME + newP.timerDuration);
                    }
                    return newP;
                });
            }
        }
    }

    // ===== SAVE PRODUCTS =====
    function saveProducts() {
        const toSave = products.map(p => ({
            ...p,
            timerEnd: p.timerEnd ? p.timerEnd.toISOString() : null,
            timerDuration: p.timerDuration || 0
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

    // ===== RENDER PRODUCTS =====
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
        
        // ORDER BUTTON
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                const product = products.find(p => p.id === productId);
                if (product) {
                    const msg = encodeURIComponent(`Halo kak saya mau order ${product.name} (Rp ${product.newPrice.toLocaleString()})`);
                    window.open(`https://wa.me/6289653938936?text=${msg}`, '_blank');
                }
            });
        });
    }

    // ===== UPDATE TIMER =====
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            const now = new Date();
            
            products.forEach(product => {
                if (product.timerEnd) {
                    const timeLeft = product.timerEnd - now;
                    const timerElement = document.querySelector(`#product-${product.id} .timer-badge`);
                    
                    if (timerElement) {
                        if (timeLeft <= 0) {
                            timerElement.remove();
                            product.newPrice = product.oldPrice;
                            product.discount = 0;
                            product.timerEnd = null;
                            saveProducts();
                            
                            const priceEl = document.querySelector(`#product-${product.id} .new-price`);
                            if (priceEl) priceEl.innerText = `Rp ${product.oldPrice.toLocaleString()}`;
                            
                            const discEl = document.querySelector(`#product-${product.id} .discount-badge`);
                            if (discEl) discEl.remove();
                        } else {
                            timerElement.innerText = `⏱️ ${formatTimeLeft(timeLeft)}`;
                        }
                    }
                }
            });
        }, 1000);
    }

    // ===== CLOCK =====
    function updateClock() {
        const now = new Date();
        document.getElementById('clock').innerText = 
            `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
        document.getElementById('date').innerText = 
            now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== APPLY DISKON & TIMER =====
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
                const totalDetik = (menit * 60) + detik;
                product.timerDuration = totalDetik * 1000;
                // PAKSA PAKAI SERVER_START_TIME + DURATION
                product.timerEnd = new Date(SERVER_START_TIME + product.timerDuration);
            } else {
                product.timerDuration = 0;
                product.timerEnd = null;
            }
            
            saveProducts();
            renderProducts();
            if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    // ===== RESET KE DEFAULT =====
    window.resetToDefault = function() {
        if (confirm('Reset ke data awal?')) {
            // RESET SERVER TIME JUGA!
            SERVER_START_TIME = Date.now();
            localStorage.setItem('zerModzServerTime', SERVER_START_TIME);
            
            products = DEFAULT_PRODUCTS.map(p => {
                const newP = {...p};
                if (newP.timerDuration > 0) {
                    newP.timerEnd = new Date(SERVER_START_TIME + newP.timerDuration);
                }
                return newP;
            });
            saveProducts();
            renderProducts();
            if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    // ===== FUNGSI LAINNYA =====
    window.deleteProduct = function(id) {
        if (confirm('Hapus produk?')) {
            products = products.filter(p => p.id !== id);
            saveProducts();
            renderProducts();
            if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    window.updatePrice = function(id) {
        const price = parseInt(document.getElementById(`price_${id}`)?.value);
        const product = products.find(p => p.id === id);
        if (product && !isNaN(price) && price > 0) {
            product.oldPrice = price;
            if (!product.timerEnd) {
                product.newPrice = price;
                product.discount = 0;
            }
            saveProducts();
            renderProducts();
            if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    window.updateProductName = function(id) {
        const name = document.getElementById(`name_${id}`)?.value.trim();
        const product = products.find(p => p.id === id);
        if (product && name) {
            product.name = name;
            saveProducts();
            renderProducts();
            if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    window.updateButtonText = function(id) {
        const text = document.getElementById(`btn_${id}`)?.value.trim() || '[ ORDER ]';
        const product = products.find(p => p.id === id);
        if (product) {
            product.buttonText = text;
            saveProducts();
            renderProducts();
            if (!document.getElementById('adminPanelContainer').classList.contains('hidden')) {
                loadAdminPanel();
            }
        }
    };

    function addProduct(name, price, buttonText) {
        const newId = 'p' + Date.now();
        products.push({
            id: newId,
            name: name,
            oldPrice: parseInt(price),
            newPrice: parseInt(price),
            discount: 0,
            timerDuration: 0,
            timerEnd: null,
            buttonText: buttonText || '[ ORDER ]'
        });
        saveProducts();
        renderProducts();
    }

    // ===== LOAD ADMIN PANEL =====
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
                    <button id="addProductBtn" class="admin-btn" style="padding:0.5rem 1.2rem;">TAMBAH</button>
                </div>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">⚠️ RESET DATA</div>
                <button id="resetToDefaultBtn" class="admin-btn warn" style="width:100%; padding:0.8rem;">RESET KE AWAL</button>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">📦 DAFTAR PRODUK</div>
                <div id="productListContainer" style="max-height:300px; overflow-y:auto;"></div>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">🏷️ DISKON + TIMER</div>
                <div id="discountControlContainer"></div>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">💰 EDIT HARGA</div>
                <div id="priceEditContainer"></div>
            </div>

            <div class="admin-section">
                <div class="admin-section-title">✏️ EDIT NAMA PRODUK</div>
                <div id="productNameEditContainer"></div>
            </div>

            <div class="admin-section">
                <div class="admin-section-title">🔘 EDIT TEKS BUTTON</div>
                <div id="buttonTextContainer"></div>
            </div>
        `;

        // RENDER DAFTAR PRODUK
        const listContainer = document.getElementById('productListContainer');
        listContainer.innerHTML = '';
        products.forEach(p => {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <span style="font-weight:bold;">${p.name}</span>
                <span>Rp ${p.oldPrice.toLocaleString()}</span>
                <span style="color:#ff6b35;">${p.buttonText}</span>
                <div><button class="admin-btn small" onclick="window.deleteProduct('${p.id}')">HAPUS</button></div>
            `;
            listContainer.appendChild(item);
        });

        // RENDER DISKON CONTROLS
        const discContainer = document.getElementById('discountControlContainer');
        discContainer.innerHTML = '';
        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${p.name.substring(0,15)}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="number" id="disc_${p.id}" placeholder="%" style="width:60px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;" value="${p.discount}">
                    <input type="number" id="timer_${p.id}" placeholder="menit" style="width:70px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <input type="number" id="detik_${p.id}" placeholder="detik" style="width:70px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.applyDiscTimer('${p.id}')">TERAP</button>
                </div>
            `;
            discContainer.appendChild(row);
        });

        // RENDER EDIT HARGA
        const priceContainer = document.getElementById('priceEditContainer');
        priceContainer.innerHTML = '';
        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${p.name.substring(0,15)}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="number" id="price_${p.id}" value="${p.oldPrice}" style="width:80px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updatePrice('${p.id}')">UBAH</button>
                </div>
            `;
            priceContainer.appendChild(row);
        });

        // RENDER EDIT NAMA
        const nameContainer = document.getElementById('productNameEditContainer');
        nameContainer.innerHTML = '';
        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${p.id}</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="text" id="name_${p.id}" value="${p.name}" style="width:180px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateProductName('${p.id}')">UBAH</button>
                </div>
            `;
            nameContainer.appendChild(row);
        });

        // RENDER EDIT BUTTON
        const btnContainer = document.getElementById('buttonTextContainer');
        btnContainer.innerHTML = '';
        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.innerHTML = `
                <span class="admin-label">${p.name.substring(0,15)}...</span>
                <div style="display:flex; gap:0.3rem;">
                    <input type="text" id="btn_${p.id}" value="${p.buttonText}" style="width:120px; background:black; border:2px solid white; color:white; padding:0.3rem; border-radius:30px;">
                    <button class="admin-btn small" onclick="window.updateButtonText('${p.id}')">UBAH</button>
                </div>
            `;
            btnContainer.appendChild(row);
        });

        // EVENT LISTENERS
        document.getElementById('addProductBtn').onclick = () => {
            const name = document.getElementById('newProductName').value.trim();
            const price = document.getElementById('newProductPrice').value;
            const btnText = document.getElementById('newProductButton').value.trim() || '[ ORDER ]';
            if (name && price) {
                addProduct(name, price, btnText);
                document.getElementById('newProductName').value = '';
                document.getElementById('newProductPrice').value = '';
                document.getElementById('newProductButton').value = '[ ORDER ]';
                loadAdminPanel();
            }
        };

        document.getElementById('resetToDefaultBtn').onclick = window.resetToDefault;
    }

    // ===== MODAL LOGIN =====
    const modal = document.getElementById('loginModal');
    const profileBtn = document.getElementById('adminProfileBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const loginBtn = document.getElementById('loginBtn');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginMsg = document.getElementById('loginMessage');
    const adminPanel = document.getElementById('adminPanelContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    if (profileBtn) {
        profileBtn.onclick = () => {
            modal.classList.remove('hidden');
            username.value = '';
            password.value = '';
            loginMsg.innerText = '';
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.add('hidden');
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    };

    if (loginBtn) {
        loginBtn.onclick = () => {
            if (username.value === 'ZeroXitAndro' && password.value === 'ROBB15') {
                modal.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                loginMsg.innerText = '';
                loadAdminPanel();
            } else {
                loginMsg.innerText = '✗ Username/password salah';
            }
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => adminPanel.classList.add('hidden');
    }

    // ===== START! =====
    initializeProducts();
    startTimer();
    renderProducts();
    console.log('✅ FORCE SYNC - SEMUA BROWSER TIMER SAMA!');
});
