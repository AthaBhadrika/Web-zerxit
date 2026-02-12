// LANGSUNG JALAN SAAT HALAMAN DIBUKA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 SCRIPT DIMULAI');
    
    // ===== DATA PRODUK - HARUS MUNCUL! =====
    const products = [
        {
            id: 'p1',
            name: 'HOLO ALL CHAR FFM',
            oldPrice: 22000,
            newPrice: 15400, // DISKON 30%
            discount: 30,
            timerEnd: new Date(Date.now() + 103000), // +1 menit 43 detik
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
        console.log('🎨 RENDER PRODUK');
        
        const grid = document.getElementById('productGrid');
        
        // CEK GRID!
        if (!grid) {
            console.error('❌ ERROR: #productGrid TIDAK DITEMUKAN!');
            return;
        }
        
        console.log('✅ Grid ditemukan, merender...');
        grid.innerHTML = '';
        
        products.forEach(product => {
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
                <button class="order-btn" data-product-id="${product.id}">${product.buttonText}</button>
            `;
            
            grid.appendChild(card);
        });
        
        console.log('✅ Render selesai!', products.length, 'produk');
    }

    // ===== UPDATE TIMER SETIAP DETIK =====
    function startTimers() {
        setInterval(() => {
            const now = new Date();
            
            products.forEach(product => {
                if (product.timerEnd) {
                    const timeLeft = product.timerEnd - now;
                    const timerEl = document.querySelector(`#product-${product.id} .timer-badge`);
                    
                    if (timerEl) {
                        if (timeLeft <= 0) {
                            timerEl.remove();
                            // RESET HARGA
                            product.newPrice = product.oldPrice;
                            product.discount = 0;
                            product.timerEnd = null;
                            
                            // UPDATE TAMPILAN HARGA
                            const priceEl = document.querySelector(`#product-${product.id} .new-price`);
                            if (priceEl) {
                                priceEl.innerText = `Rp ${product.oldPrice.toLocaleString()}`;
                            }
                            // HAPUS BADGE DISKON
                            const discEl = document.querySelector(`#product-${product.id} .discount-badge`);
                            if (discEl) discEl.remove();
                        } else {
                            timerEl.innerText = `⏱️ ${formatTimeLeft(timeLeft)}`;
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
            `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        document.getElementById('date').innerText = 
            now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ===== ORDER WA =====
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('order-btn')) {
            const productId = e.target.dataset.productId;
            const product = products.find(p => p.id === productId);
            if (product) {
                const msg = encodeURIComponent(`Halo kak saya mau order ${product.name} (Rp ${product.newPrice.toLocaleString()})`);
                window.open(`https://wa.me/6289653938936?text=${msg}`, '_blank');
            }
        }
    });

    // ===== MODAL LOGIN SIMPLE =====
    const modal = document.getElementById('loginModal');
    const profileBtn = document.getElementById('adminProfileBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // ===== RENDER PERTAMA =====
    renderProducts();
    startTimers();
    
    console.log('✅ SEMUA SIAP!');
});
