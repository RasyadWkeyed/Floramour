
// 1. INITIALIZE SMART CART

let cart = JSON.parse(localStorage.getItem('floramour_cart')) || [];
let total = parseFloat(localStorage.getItem('floramour_total')) || 0;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('floramour_cart') === null) {
        cart = [];
        total = 0;
    }
    
    updateCartUI();
    initContactForm();
    initCheckoutLogic();
    initReceiptLogic(); 
    updateNavbarOnScroll();
});

function syncStorage() {
    localStorage.setItem('floramour_cart', JSON.stringify(cart));
    localStorage.setItem('floramour_total', total.toFixed(2));
}

// 2. SMOOTH SCROLL & SLIDER

function scrollToShop() {
    const shopSection = document.getElementById('shop');
    if(shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
}

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
if(slides.length > 0) {
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}


// 3. LOGIC (CART SYSTEM)

const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartList = document.getElementById('cart-items-list');
const totalDisplay = document.getElementById('total-amount');
const cartBtn = document.getElementById('cart-icon-btn');
const closeCart = document.querySelector('.close-sidebar');
const overlay = document.getElementById('overlay');
const addButtons = document.querySelectorAll('.add-btn');

addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const productCard = btn.closest('.card');
        const name = productCard.querySelector('.card-info h3').innerText;
        const priceText = productCard.querySelector('.card-info p').innerText;
        const price = parseFloat(priceText.replace('RM ', ''));

        cart.push({ name, price });
        total += price;

        updateCartUI();
        syncStorage();

        const originalText = btn.innerText;
        btn.innerText = "Added! ✓";
        btn.style.background = "#d4a373";
        btn.style.color = "white";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "transparent";
            btn.style.color = "#d4a373";
        }, 1000);
    });
});

function updateCartUI() {
    if(cartCount) cartCount.innerText = cart.length;
    if (cartList) {
        if (cart.length > 0) {
            cartList.innerHTML = ''; 
            cart.forEach((item, index) => {
                cartList.innerHTML += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <span>${item.name}</span>
                            <small style="color: #d4a373; font-weight: 600;">RM ${item.price.toFixed(2)}</small>
                        </div>
                        <span class="remove-btn" onclick="removeItem(${index})">🗑️</span>
                    </div>`;
            });
        } else {
            cartList.innerHTML = '<p class="empty-msg">Your cart is still empty.</p>';
        }
    }
    if(totalDisplay) totalDisplay.innerText = `RM ${total.toFixed(2)}`;
}

window.removeItem = function(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCartUI();
    syncStorage();
};


// 4. LOGIC CHECKOUT / PEMBAYARAN

window.setDelivery = function(val) {
    const hiddenInput = document.getElementById('delivery-option');
    if(hiddenInput) hiddenInput.value = val;

    const cardPickup = document.getElementById('card-pickup');
    const cardDelivery = document.getElementById('card-delivery');

    if(cardPickup && cardDelivery) {
        cardPickup.classList.remove('active');
        cardDelivery.classList.remove('active');
        if(val === 'pickup') { cardPickup.classList.add('active'); } 
        else { cardDelivery.classList.add('active'); }
    }
    toggleAddress();
};

window.toggleAddress = function() {
    const deliveryVal = document.getElementById('delivery-option').value;
    const addressWrapper = document.getElementById('address-wrapper');
    if (addressWrapper) {
        addressWrapper.style.display = (deliveryVal === 'delivery') ? 'block' : 'none';
    }
};

function initCheckoutLogic() {
    const displayTotal = document.getElementById('display-total');
    if (displayTotal) {
        const finalTotal = localStorage.getItem('floramour_total');
        displayTotal.innerText = "RM " + (finalTotal ? finalTotal : "0.00");
    }

    const submitPayBtn = document.getElementById('submit-pay');
    if (submitPayBtn) {
        submitPayBtn.onclick = function() {
            const name = document.getElementById('cust-name').value;
            const ic = document.getElementById('cust-ic').value;
            const phone = document.getElementById('cust-phone').value;
            const option = document.getElementById('delivery-option').value;
            const address = document.getElementById('cust-address').value;
            const fileInput = document.getElementById('evidence-file');

            if (!name || !ic || !phone) {
                alert("Please complete your details!"); return;
            }
            if (option === 'delivery' && !address) {
                alert("Please enter the delivery address!"); return;
            }
            if (fileInput.files.length === 0) {
                alert("Please upload proof of payment!"); return;
            }

            
            localStorage.setItem('customer_name', name);
            localStorage.setItem('customer_ic', ic);
            localStorage.setItem('customer_phone', phone);
            localStorage.setItem('delivery_method', option); 

            alert(`Thank you ${name}! Your payment is being processed.`);
            window.location.href = 'success.html';
        };
    }
}


// 5. RECEIPT LOGIC (DISPLAY INFO + METHOD)

function initReceiptLogic() {
    const listContainer = document.getElementById('items-list');
    const grandTotalDisp = document.getElementById('grand-total');
    
    const resName = document.getElementById('res-name');
    const resIC = document.getElementById('res-ic');
    const resPhone = document.getElementById('res-phone');
    const resMethod = document.getElementById('res-method'); 

    if (listContainer) {
        const receiptCart = JSON.parse(localStorage.getItem('floramour_cart'));
        const receiptTotal = localStorage.getItem('floramour_total');
        
        const savedName = localStorage.getItem('customer_name');
        const savedIC = localStorage.getItem('customer_ic');
        const savedPhone = localStorage.getItem('customer_phone');
        const savedMethod = localStorage.getItem('delivery_method'); 

        if(resName) resName.innerText = savedName || "-";
        if(resIC) resIC.innerText = savedIC || "-";
        if(resPhone) resPhone.innerText = savedPhone || "-";
        
      
        if(resMethod) {
            resMethod.innerText = (savedMethod === 'delivery') ? "🚚 Delivery" : "🛍️ Self Pickup";
        }

        if(receiptCart && receiptCart.length > 0) {
            listContainer.innerHTML = '';
            receiptCart.forEach(item => {
                listContainer.innerHTML += `
                    <div class="item">
                        <span>${item.name}</span> 
                        <span>RM ${parseFloat(item.price).toFixed(2)}</span>
                    </div>`;
            });
            if(grandTotalDisp) grandTotalDisp.innerText = "RM " + (receiptTotal ? parseFloat(receiptTotal).toFixed(2) : "0.00");
        }
    }
}

window.clearCartAndGoBack = function() {
    localStorage.clear();
    window.location.href = 'index.html';
};


// 6. NAVBAR & SIDEBAR

function updateNavbarOnScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.style.padding = "15px 8%";
        nav.style.background = "#ffffff";
        nav.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
    } else {
        nav.style.padding = "25px 8%";
        nav.style.background = "#ffffffe6";
        nav.style.boxShadow = "none";
    }
}

window.addEventListener('scroll', updateNavbarOnScroll);

if(cartBtn) {
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
    });
}
const closeElems = [closeCart, overlay];
closeElems.forEach(el => {
    if(el) el.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
});

const bookingBtn = document.querySelector('.btn-checkout');
if (bookingBtn) {
    bookingBtn.addEventListener('click', () => {
        if (cart.length === 0) { alert("Your cart is empty!"); return; }
        syncStorage();
        window.location.href = 'checkout.html';
    });
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Message sent!');
            this.reset();
        });
    }
}

// 7. audio box

function toggleMusic() {
    var audio = document.getElementById("bgMusic");
    var icon = document.getElementById("music-icon");

    if (audio.paused) {
        audio.play();
        audio.volume = 0.5; 
        icon.innerHTML = "🔊"; 
        document.getElementById("music-control").style.backgroundColor = "#d4a373";
        document.getElementById("music-control").style.color = "white";
    } else {
        audio.pause();
        icon.innerHTML = "🔈"; 
        document.getElementById("music-control").style.backgroundColor = "#f8f4f1";
        document.getElementById("music-control").style.color = "black";
    }
}