let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let isListView = false;
let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
let currentPage = 1;
const productsPerPage = 10;

// Ensure DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Load products from JSON
// script.js (modified)
async function loadProducts() {
    showSpinner();
    try {
        // Replace with backend API endpoint
        const response = await fetch('/api/products'); // <-- MODIFIED LINE
        if (!response.ok) throw new Error('Failed to load products');
        products = await response.json();
        renderProducts(products);
        renderRecentlyViewed();
    } catch (error) {
        console.error('Error loading products:', error);
    } finally {
        hideSpinner();
    }
}
// Render products with pagination
function renderProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    
    products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" 
                 onclick="openModal('${product._id}')">
            <h4>${product.name}</h4>
            ${product.description ? `<h5>${product.description}</h5>` : ''}
            <div class="quantity-control">
                <button class="quantity-button" 
                        data-product-id="${product._id}" 
                        onclick="updateQuantity('${product._id}', false)">-</button>
                <input class="quantity-input" 
                      type="number" 
                      id="qty-${product._id}" 
                      value="1" min="1">
                <button class="quantity-button" 
                        data-product-id="${product._id}" 
                        onclick="updateQuantity('${product._id}', true)">+</button>
            </div>
            <button onclick="addToCart('${product._id}')">Add to Cart</button>
        `;
        productList.appendChild(productDiv);
    });
}

// Update pagination
function updatePagination() {
    const pageIndicator = document.getElementById('page-indicator');
    if (pageIndicator) pageIndicator.innerText = `Page ${currentPage}`;
}

// Next page
function nextPage() {
    const totalPages = Math.ceil(products.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts(products);
    }
}

// Previous page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProducts(products);
    }
}

// Filter by category
function filterByCategory(category) {
    const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    renderProducts(filteredProducts);
}

// Toggle between grid and list views
function toggleView() {
    isListView = !isListView;
    const productList = document.getElementById('product-list');
    const viewToggleButton = document.getElementById('view-toggle');
    if (isListView) {
        productList.classList.remove('grid-view');
        productList.classList.add('list-view');
        viewToggleButton.innerText = 'Switch to Grid View';
    } else {
        productList.classList.remove('list-view');
        productList.classList.add('grid-view');
        viewToggleButton.innerText = 'Switch to List View';
    }
}

// Update view based on current state
function updateView() {
    const productList = document.getElementById('product-list');
    const viewToggleButton = document.getElementById('view-toggle');
    if (isListView) {
        productList.classList.remove('grid-view');
        productList.classList.add('list-view');
        viewToggleButton.innerText = 'Switch to Grid View';
    } else {
        productList.classList.remove('list-view');
        productList.classList.add('grid-view');
        viewToggleButton.innerText = 'Switch to List View';
    }
}

// Filter products by search term
function filterProducts() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sort-by').value;
    let sortedProducts = [...products];

    switch (sortBy) {
        case 'name-asc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating-asc':
            sortedProducts.sort((a, b) => a.rating - b.rating);
            break;
        case 'rating-desc':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
    }

    renderProducts(sortedProducts);
}

// Open product details modal
function openModal(productName) {
    const product = products.find(p => p.name === productName);
    if (product) {
        const modalImage = document.getElementById('modal-image');
        if (modalImage) modalImage.src = product.image;
        const modalName = document.getElementById('modal-name');
        if (modalName) modalName.innerText = product.name;
        const modalDescription = document.getElementById('modal-description');
        if (modalDescription) modalDescription.innerText = product.description || '';
        const modal = document.getElementById('product-modal');
        if (modal) modal.style.display = 'flex';
        addToRecentlyViewed(product);
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
}

// Add product to recently viewed
function addToRecentlyViewed(product) {
    if (!recentlyViewed.some(p => p.id === product.id)) {
        recentlyViewed.unshift(product);
        if (recentlyViewed.length > 5) {
            recentlyViewed.pop();
        }
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        renderRecentlyViewed();
    }
}

// Render recently viewed products
function renderRecentlyViewed() {
    const recentlyViewedList = document.getElementById('recently-viewed-list');
    if (!recentlyViewedList) return; // Check if element exists
    recentlyViewedList.innerHTML = '';
    recentlyViewed.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="openModal('${product.name}')">
            <h4>${product.name}</h4>
        `;
        recentlyViewedList.appendChild(productDiv);
    });
}

// Add to cart
// Add to cart using product ID
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    updateCartPreview();
    saveCart();
}

// Update quantity using product ID
function updateQuantity(productId, increment) {
    const input = document.getElementById(`qty-${productId}`);
    let value = parseInt(input.value) || 1;
    
    if (increment) {
        value++;
    } else {
        value = Math.max(1, value - 1);
    }
    
    input.value = value;
}

// Update cart preview
function updateCartPreview() {
    const cartList = document.getElementById('cart-list');
    if (!cartList) return; // Check if element exists
    cartList.innerHTML = '';
    cart.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${item.name} - ${formatPrice(item.price)} x ${item.quantity}
        <button onclick="removeFromCart(${index})">Delete</button>`;
        cartList.appendChild(listItem);
    });
    calculateTotalPrice();
}

// Calculate total price
function calculateTotalPrice() {
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) totalPriceElement.innerText = `Total Price: ${formatPrice(totalPrice)}`;
}

// Format price
function formatPrice(price) {
    if (!price) return "0.00";
    return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartPreview();
    saveCart();
}

// Clear cart
function clearCart() {
    cart = [];
    updateCartPreview();
    saveCart();
}

// Save cart to local storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Send WhatsApp message
function sendWhatsApp() {
    let cartItems = cart.map(item => `${item.name} - ${formatPrice(item.price)} x ${item.quantity}`).join('\n');
    let totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    let message = encodeURIComponent(
        `Selected products:\n\n${cartItems}\n\nTotal Price: ${formatPrice(totalPrice)}`
    );

    // Replace with your WhatsApp number (in international format)
    let whatsappNumber = '+9647518132420'; // Example: +1234567890

    // Create the WhatsApp link
    let whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

    // Open the link in a new tab
    window.open(whatsappLink, '_blank');
}

// Show loading spinner
function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'block';
}

// Hide loading spinner
function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Go to Top/Bottom button
const goToTopBottomBtn = document.getElementById('go-to-top-bottom-btn');
let isAtTop = true; // Track whether the page is at the top

function scrollToTopOrBottom() {
    if (isAtTop) {
        // Scroll to the bottom
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        goToTopBottomBtn.innerText = '↑'; // Change button text to indicate "Go to Top"
    } else {
        // Scroll to the top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        goToTopBottomBtn.innerText = '↓'; // Change button text to indicate "Go to Bottom"
    }
    isAtTop = !isAtTop; // Toggle the state
}

// Show/hide button based on scroll position
window.onscroll = function () {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        goToTopBottomBtn.style.display = 'block';
    } else {
        goToTopBottomBtn.style.display = 'none';
    }
};

// Add event listener to the button
goToTopBottomBtn.addEventListener('click', scrollToTopOrBottom);

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnTwitter() {
    const text = encodeURIComponent('Check out this product!');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}