// js/imall-category.js

// --- Global Data Stores ---
let ALL_PRODUCTS = []; // Stores all products once fetched
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || []; // Reuse cart from imall.js

// --- DOM Element References ---
const categoryPageTitle = document.getElementById('category-page-title');
const productListGrid = document.getElementById('product-list-grid');
const noProductsMessage = document.getElementById('no-products-message');
const cartItemCountSpan = document.getElementById('cart-item-count'); // For updating cart count

// Notification element (reused from imall.js)
const notificationMessageDiv = document.getElementById('notification-message');

// --- Configuration Constants (reused from imall.js) ---
const PLACEHOLDER_IMAGE_PATH = 'https://placehold.co/300x200/FF0000/FFFFFF?text=Image+Error';
const NOTIFICATION_DURATION = 3000; // milliseconds

// --- Utility Functions (reused and adapted from imall.js) ---

/**
 * Handles image loading errors by replacing the src with a placeholder.
 * @param {HTMLImageElement} imageElement - The image element that failed to load.
 */
function handleImageError(imageElement) {
    imageElement.onerror = null; // Prevent infinite loop
    imageElement.src = PLACEHOLDER_IMAGE_PATH;
}

/**
 * Displays a temporary notification message.
 * @param {string} messageText - The message to display.
 * @param {boolean} isSuccess - True for success (green), false for error (red).
 */
function displayNotification(messageText, isSuccess = true) {
    if (notificationMessageDiv) {
        notificationMessageDiv.textContent = messageText;
        notificationMessageDiv.classList.remove('opacity-0', 'notification-fade-out', 'bg-green-500', 'bg-red-500');
        notificationMessageDiv.classList.add('opacity-100', isSuccess ? 'bg-green-500' : 'bg-red-500');

        setTimeout(() => {
            notificationMessageDiv.classList.remove('opacity-100');
            notificationMessageDiv.classList.add('opacity-0', 'notification-fade-out');
        }, NOTIFICATION_DURATION);
    }
}

/**
 * Adds a product to the cart or increments its quantity if already present.
 * Updates localStorage and the cart count display.
 * @param {object} product - The product object to add.
 * @param {number} quantity - The quantity to add (defaults to 1).
 */
function addToCart(product, quantity = 1) {
    if (product.inStock === 0) {
        displayNotification(`${product.name} is out of stock!`, false);
        return;
    }

    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        const currentQuantityInCart = cartItems[existingItemIndex].quantity;
        const potentialNewQuantity = currentQuantityInCart + quantity;

        if (potentialNewQuantity > product.inStock) {
            displayNotification(`Cannot add more ${product.name}. Only ${product.inStock} available.`, false);
            return;
        }
        if (product.maxOrderQuantity && potentialNewQuantity > product.maxOrderQuantity) {
            displayNotification(`Cannot add more ${product.name}. Maximum order quantity is ${product.maxOrderQuantity}.`, false);
            return;
        }

        cartItems[existingItemIndex].quantity = potentialNewQuantity;
        displayNotification(`${quantity}x ${product.name} added to cart!`);
    } else {
        if (quantity < (product.minOrderQuantity || 1)) {
            displayNotification(`Minimum order quantity for ${product.name} is ${product.minOrderQuantity || 1}.`, false);
            return;
        }
        if (quantity > (product.maxOrderQuantity || 9999)) {
            displayNotification(`Maximum order quantity for ${product.name} is ${product.maxOrderQuantity || 9999}.`, false);
            return;
        }
        if (quantity > product.inStock) {
            displayNotification(`Only ${product.inStock} of ${product.name} are available.`, false);
            return;
        }
        cartItems.push({ ...product, quantity: quantity });
        displayNotification(`${quantity}x ${product.name} added to cart!`);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
}

/**
 * Updates the displayed count of items in the shopping cart icon.
 */
function updateCartCount() {
    if (cartItemCountSpan) {
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartItemCountSpan.classList.remove('hidden');
        } else {
            cartItemCountSpan.classList.add('hidden');
        }
    }
}

/**
 * Generates HTML for a single product card. (Copied from imall.js)
 * @param {object} product - The product object.
 * @returns {string} HTML string for the product card.
 */
function createProductCardHTML(product) {
    const isDiscountedBadge = product.isDiscounted ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">Sale!</span>` : '';
    const originalPriceDisplay = product.originalPrice ? `<span class="text-gray-400 line-through text-sm ml-2">Ksh ${product.originalPrice.toFixed(2).toLocaleString('en-KE')}</span>` : '';
    const inStock = product.inStock > 0;
    const stockClass = inStock ? 'bg-green-500' : 'bg-red-500';
    const stockText = inStock ? `In Stock (${product.inStock})` : 'Out of Stock';

    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl relative product-card" data-product-id="${product.id}">
            ${isDiscountedBadge}
            <span class="absolute top-2 left-2 ${stockClass} text-white text-xs font-bold px-2 py-1 rounded-full">${stockText}</span>
            <a href="./imall-product-detail.html?productId=${product.id}" class="block">
                <img
                    src="${product.images[0] || PLACEHOLDER_IMAGE_PATH}"
                    alt="${product.name}"
                    class="w-full h-48 object-cover rounded-t-xl"
                    onerror="handleImageError(this);"
                />
            </a>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-2 line-clamp-2">${product.description}</p>
                <div class="flex items-center text-yellow-500 text-sm mb-2">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                    ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    <span class="text-gray-600 ml-1">(${product.rating})</span>
                    <span class="text-gray-500 ml-2">(${product.reviewsCount} reviews)</span>
                </div>
                <div class="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                    <span class="text-2xl font-bold text-blue-600">Ksh ${product.price.toFixed(2).toLocaleString('en-KE')}</span>
                    ${originalPriceDisplay}
                    <button
                        class="add-to-cart-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}"
                        data-product-id="${product.id}"
                        ${!inStock ? 'disabled' : ''}
                    >
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Main Page Logic ---

/**
 * Parses URL parameters to determine product filtering criteria.
 * @returns {object} An object containing filter criteria.
 */
function getFilterCriteriaFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const filters = {};

    if (params.has('category')) {
        filters.category = decodeURIComponent(params.get('category'));
    }
    if (params.has('subCategory')) {
        filters.subCategory = decodeURIComponent(params.get('subCategory'));
    }
    if (params.has('brand')) {
        filters.brand = decodeURIComponent(params.get('brand'));
    }
    if (params.has('search')) {
        filters.search = decodeURIComponent(params.get('search'));
    }
    if (params.has('section')) { // For "deals", "new-arrivals", "brands" pages
        filters.section = decodeURIComponent(params.get('section'));
    }

    return filters;
}

/**
 * Filters the ALL_PRODUCTS array based on the given criteria.
 * @param {Array} products - The array of all products.
 * @param {object} filters - The filter criteria from URL.
 * @returns {Array} The filtered array of products.
 */
function filterProducts(products, filters) {
    let filtered = [...products]; // Start with a copy of all products

    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(p => p.category && p.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.subCategory) {
        filtered = filtered.filter(p => p.subCategory && p.subCategory.toLowerCase() === filters.subCategory.toLowerCase());
    }
    if (filters.brand) {
        filtered = filtered.filter(p => p.brand && p.brand.toLowerCase() === filters.brand.toLowerCase());
    }
    if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery)) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery)) ||
            (p.category && p.category.toLowerCase().includes(searchQuery)) ||
            (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery))
        );
    }
    if (filters.section) {
        if (filters.section === 'deals') {
            filtered = filtered.filter(p => p.isDiscounted && p.inStock > 0).sort((a,b) => b.originalPrice - a.price); // Show discounted, best deals first
        } else if (filters.section === 'new-arrivals') {
            // Assuming new arrivals can be identified by higher IDs or a 'dateAdded' field
            filtered = filtered.sort((a, b) => b.id.localeCompare(a.id)); // Simple sorting by ID for 'newness'
        } else if (filters.section === 'brands') {
             // If navigating directly to all brands page, show all products, perhaps sorted by brand
             filtered = filtered.sort((a,b) => (a.brand || '').localeCompare(b.brand || ''));
        }
    }
    // Only show in-stock items by default, unless searching specifically for out-of-stock
    filtered = filtered.filter(p => p.inStock > 0);

    return filtered;
}

/**
 * Renders the filtered products onto the page.
 * @param {Array} productsToDisplay - The array of products to render.
 * @param {object} filters - The active filter criteria.
 */
function renderProducts(productsToDisplay, filters) {
    productListGrid.innerHTML = ''; // Clear previous content

    let title = "All Products";
    if (filters.category && filters.category !== 'all') {
        title = filters.category;
        if (filters.subCategory) {
            title += ` - ${filters.subCategory}`;
        }
        title += " Products";
    } else if (filters.brand) {
        title = `${filters.brand} Products`;
    } else if (filters.search) {
        title = `Search Results for "${filters.search}"`;
    } else if (filters.section) {
        if (filters.section === 'deals') {
            title = "Amazing Deals!";
        } else if (filters.section === 'new-arrivals') {
            title = "New Arrivals";
        } else if (filters.section === 'brands') {
            title = "All Brands"; // This might change if you want to show brand logos
        }
    }
    categoryPageTitle.textContent = title;
    document.title = `iMall - ${title}`; // Update browser tab title

    if (productsToDisplay.length > 0) {
        productsToDisplay.forEach(product => {
            productListGrid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
        });
        noProductsMessage.classList.add('hidden'); // Hide "No products found" message
    } else {
        noProductsMessage.classList.remove('hidden'); // Show "No products found" message
    }

    // Attach event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const product = ALL_PRODUCTS.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
}

/**
 * Fetches all products and then initiates filtering and rendering.
 */
async function initializeCategoryPage() {
    try {
        const productsResponse = await fetch('data/imall-products.json');
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        ALL_PRODUCTS = await productsResponse.json();

        const filters = getFilterCriteriaFromUrl();
        const filteredProducts = filterProducts(ALL_PRODUCTS, filters);
        renderProducts(filteredProducts, filters);
        updateCartCount(); // Ensure cart count is updated on page load
    } catch (error) {
        console.error('Failed to load products for category page:', error);
        categoryPageTitle.textContent = 'Error Loading Products';
        productListGrid.innerHTML = '<p class="col-span-full text-center text-red-600">Failed to load products. Please try again later.</p>';
        noProductsMessage.classList.add('hidden'); // Hide the default message if an error occurs
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', initializeCategoryPage);

// Handle browser's back/forward buttons (if URL changes without full reload)
window.addEventListener('popstate', initializeCategoryPage);