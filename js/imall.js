// js/imall.js

// --- Global Data Stores ---
let ALL_PRODUCTS = []; // Stores all products once fetched from JSON
let ALL_BRANDS = []; // Will store processed brand data, derived from ALL_PRODUCTS
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || []; // Cart items from localStorage
let wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || []; // Wishlist items from localStorage (currently placeholder)
let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || []; // Order history from localStorage

// --- DOM Element References (Unified for all pages) ---
// Homepage Elements
const carouselContainer = document.getElementById('carousel-container');
const carouselDots = document.getElementById('carousel-dots');
const topBrandsGrid = document.getElementById('top-brands-grid');
const hotPicksGrid = document.getElementById('hot-picks-grid');
const featuredProductsGrid = document.getElementById('featured-products-grid');

// Subheader/Global Elements
const imallSearchInput = document.getElementById('imall-search-input');
const imallSearchButton = document.getElementById('imall-search-button');
const imallSearchSuggestions = document.getElementById('imall-search-suggestions');
const cartItemCountSpan = document.getElementById('cart-item-count');
const notificationMessageDiv = document.getElementById('notification-message');

// Product Detail Page Elements
const productDetailPageMainContent = document.getElementById('imall-product-detail-main-content');

const productNameElem = document.getElementById('product-name');
const productDescriptionElem = document.getElementById('product-description');
const productCurrentPriceElem = document.getElementById('product-current-price');
const productOriginalPriceElem = document.getElementById('product-original-price');
const productCategoryElem = document.getElementById('product-category');
const productBrandElem = document.getElementById('product-brand');
const productFeaturesElem = document.getElementById('product-features');
const productRatingStarsElem = document.getElementById('product-rating-stars');
const productRatingValueElem = document.getElementById('product-rating-value');
const productReviewsCountElem = document.getElementById('product-reviews-count');
const productInStockElem = document.getElementById('product-in-stock');
const productSkuElem = document.getElementById('product-sku');
const productShippingElem = document.getElementById('product-shipping');
const productDeliveryElem = document.getElementById('product-delivery'); // Maps to 'waitingPeriod'
const productMinOrderElem = document.getElementById('product-min-order'); // Maps to 'minOrderQuantity'
const productMaxOrderElem = document.getElementById('product-max-order'); // Maps to 'maxOrderQuantity'
const selectedColorTextElem = document.getElementById('selected-color-text');
const productQuantityInput = document.getElementById('product-quantity');
const decreaseQuantityBtn = document.getElementById('decrease-quantity');
const increaseQuantityBtn = document.getElementById('increase-quantity');
const addToCartBtn = document.getElementById('add-to-cart-detail-page-btn');
const productTotalPriceElem = document.getElementById('product-total-price');

const productMainImage = document.getElementById('product-main-image');
const productThumbnailsContainer = document.getElementById('product-thumbnails-container');
const productColorSwatchesContainer = document.getElementById('product-color-swatches');

// My Activity Page Elements
const showCartBtn = document.getElementById('show-cart-btn');
const showWishlistBtn = document.getElementById('show-wishlist-btn');
const showOrdersBtn = document.getElementById('show-orders-btn');

const cartSection = document.getElementById('cart-section');
const wishlistSection = document.getElementById('wishlist-section');
const ordersSection = document.getElementById('orders-section');

const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart-message');
const cartTotalAmount = document.getElementById('cart-total-amount');
const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');

const wishlistItemsContainer = document.getElementById('wishlist-items-container');
const emptyWishlistMessage = document.getElementById('empty-wishlist-message');

const orderHistoryContainer = document.getElementById('order-history-container');
const emptyOrdersMessage = document.getElementById('empty-orders-message');

// Checkout Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModalBtn = document.getElementById('close-checkout-modal-btn');
const checkoutForm = document.getElementById('checkout-form');

const stepDetails = document.getElementById('step-details');
const stepShipping = document.getElementById('step-shipping');
const stepPayment = document.getElementById('step-payment');

const checkoutStep1 = document.getElementById('checkout-step-1');
const fullNameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const shippingAddressInput = document.getElementById('shipping-address');
const nextStep1Btn = document.getElementById('next-step-1-btn');

const checkoutStep2 = document.getElementById('checkout-step-2');
const shippingMethodRadios = document.querySelectorAll('input[name="shippingMethod"]');
const deliveryOptionsDiv = document.getElementById('delivery-options');
const shippingCompanySelect = document.getElementById('shipping-company');
const checkoutOrderTotal = document.getElementById('checkout-order-total');
const prevStep2Btn = document.getElementById('prev-step-2-btn');
const nextStep2Btn = document.getElementById('next-step-2-btn');

const checkoutStep3 = document.getElementById('checkout-step-3');
const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
const checkoutFinalTotal = document.getElementById('checkout-final-total');
const prevStep3Btn = document.getElementById('prev-step-3-btn');
const placeOrderBtn = document.getElementById('place-order-btn');

const orderSuccessModal = document.getElementById('order-success-modal');
const closeOrderSuccessModalBtn = document.getElementById('close-order-success-modal-btn');
const orderNumberDisplay = document.getElementById('order-number-display');
const continueShoppingBtn = document.getElementById('continue-shopping-btn');

// Category Page Elements
const categoryProductsGrid = document.getElementById('category-products-grid');
const categoryTitle = document.getElementById('category-title');
const filterCategorySelect = document.getElementById('filter-category');
const filterBrandSelect = document.getElementById('filter-brand');
const sortSelect = document.getElementById('sort-select');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const paginationContainer = document.getElementById('pagination-container');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const currentPageSpan = document.getElementById('current-page');


// --- Configuration Constants ---
const PRODUCTS_JSON_PATH = 'data/imall-products.json';
const PRODUCTS_PER_SECTION = 8;
const BRANDS_PER_HOMEPAGE_SECTION = 6;
const HERO_CAROUSEL_INTERVAL = 5000;
const NOTIFICATION_DURATION = 3000;
const PLACEHOLDER_IMAGE_PATH = 'https://placehold.co/300x200/FF0000/FFFFFF?text=Image+Error';
const PLACEHOLDER_LOGO_PATH = 'https://placehold.co/80x80/CCCCCC/FFFFFF?text=Brand';

const SHIPPING_FEES = {
    'UPS': 15.00,
    'G4S': 10.00,
    'DHL': 25.00,
    'Wells Fargo': 20.00
};

// --- State Variables (for page-specific contexts) ---
let currentProduct = null; // For product detail page
let selectedQuantity = 1; // For product detail page
let selectedColor = ''; // For product detail page
let currentSlideIndex = 0; // For homepage carousel
let carouselInterval; // For homepage carousel

// Checkout State
let currentCheckoutStep = 1;
let checkoutData = {
    fullName: '',
    email: '',
    shippingAddress: '',
    shippingMethod: 'local-pickup',
    shippingCompany: '',
    shippingFee: 0,
    paymentMethod: 'credit-card',
    cartTotal: 0,
    finalTotal: 0
};

// Category Page State
let currentCategoryFilter = 'all';
let currentBrandFilter = 'all';
let currentSortOrder = 'default';
const productsPerPage = 12; // Adjust as needed for category page
let currentPage = 1;
let currentSearchQuery = ''; // To store the search query from URL


// --- Utility Functions ---

/**
 * Handles image loading errors by replacing the src with a placeholder.
 * @param {HTMLImageElement} imageElement - The image element that failed to load.
 */
function handleImageError(imageElement) {
    imageElement.onerror = null;
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
        notificationMessageDiv.classList.remove('opacity-0', 'notification-fade-out', 'bg-green-500', 'bg-red-500', 'opacity-100', 'show');
        
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
 * @param {string} [color] - The selected color for the product, if applicable.
 */
function addToCart(product, quantity = 1, color = '') {
    if (product.inStock === 0) {
        displayNotification(`${product.name} is out of stock!`, false);
        return;
    }

    const itemColor = color || ''; 
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id && item.selectedColor === itemColor);

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
        displayNotification(`${quantity}x ${product.name} (${itemColor || 'default'}) added to cart!`);
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
        cartItems.push({ ...product, quantity: quantity, selectedColor: itemColor });
        displayNotification(`${quantity}x ${product.name} (${itemColor || 'default'}) added to cart!`);
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
 * Generates HTML for a single product card (used on homepage/category pages).
 * @param {object} product - The product object.
 * @returns {string} HTML string for the product card.
 */
function createProductCardHTML(product) {
    const isDiscountedBadge = product.isDiscounted ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">Sale!</span>` : '';
    const originalPriceDisplay = product.originalPrice && product.originalPrice > product.price ? `<span class="text-gray-400 line-through text-sm ml-2">$${product.originalPrice.toFixed(2).toLocaleString('en-KE')}</span>` : '';
    const inStock = product.inStock > 0;
    const stockClass = inStock ? 'bg-green-500' : 'bg-red-500';
    const stockText = inStock ? `In Stock (${product.inStock})` : 'Out of Stock';

    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl relative product-card" data-product-id="${product.id}">
            ${isDiscountedBadge}
            <span class="absolute top-2 left-2 ${stockClass} text-white text-xs font-bold px-2 py-1 rounded-full">${stockText}</span>
            <a href="./imall-product-detail.html?productId=${product.id}" class="block">
                <img
                    src="${product.images && product.images.length > 0 ? product.images[0] : PLACEHOLDER_IMAGE_PATH}"
                    alt="${product.name}"
                    class="w-full h-48 object-cover rounded-t-xl"
                    onerror="handleImageError(this);"
                />
            </a>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-2 line-clamp-2">${product.description}</p>
                <div class="flex items-center text-yellow-500 text-sm mb-2">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating || 0))}
                    ${(product.rating || 0) % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    <span class="text-gray-600 ml-1">(${product.rating || 'N/A'})</span>
                    <span class="text-gray-500 ml-2">(${product.reviewsCount || 0} reviews)</span>
                </div>
                <div class="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                    <span class="text-2xl font-bold text-blue-600">$${product.price.toFixed(2).toLocaleString('en-KE')}</span>
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

/**
 * Generates HTML for a single brand card.
 * @param {object} brand - The brand object.
 * @returns {string} HTML string for the brand card.
 */
function createBrandCardHTML(brand) {
    return `
        <a href="./imall-category.html?brand=${encodeURIComponent(brand.name)}" class="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl brand-card">
            <img src="${brand.logo || PLACEHOLDER_LOGO_PATH}" alt="${brand.name} Logo" class="h-20 w-20 object-contain mb-3" onerror="handleImageError(this);">
            <h3 class="text-lg font-semibold text-gray-800">${brand.name}</h3>
        </a>
    `;
}

// --- Hero Carousel Functions (Homepage specific) ---
function renderHeroCarousel() {
    if (!carouselContainer || !carouselDots) {
        return;
    }

    carouselContainer.innerHTML = '';
    carouselDots.innerHTML = '';

    const heroBannersData = [
        {
            id: 'hero1',
            image: 'images/hero-images/imallhero.webp',
            title: 'Grand Electronics Sale!',
            subtitle: 'Up to 50% off on Smartphones, Laptops & TVs',
            link: './imall-category.html?category=Electronics&section=deals',
            buttonText: 'Shop Now'
        },
        {
            id: 'hero2',
            image: 'https://placehold.co/1200x400/FF0000/FFFFFF?text=Fashion+Collection',
            title: 'New Fashion Arrivals',
            subtitle: 'Discover the latest trends in apparel and accessories',
            link: './imall-category.html?category=Fashion%20&%20Apparel&section=new-arrivals',
            buttonText: 'Explore Collection'
        },
        {
            id: 'hero3',
            image: 'https://placehold.co/1200x400/008000/FFFFFF?text=Home+Essentials',
            title: 'Home Essentials & Appliances',
            subtitle: 'Upgrade your living space with our premium selection',
            link: './imall-category.html?category=Home%20&%20Kitchen',
            buttonText: 'View Home Goods'
        },
        {
            id: 'hero4',
            image: 'https://placehold.co/1200x400/800080/FFFFFF?text=Gaming+Zone',
            title: 'Level Up Your Gaming!',
            subtitle: 'Latest Consoles & Accessories now available',
            link: './imall-category.html?category=Electronics&subCategory=Gaming',
            buttonText: 'Shop Gaming'
        }
    ];

    heroBannersData.forEach((banner, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item absolute w-full h-full transition-opacity duration-700 ease-in-out ${index === 0 ? 'opacity-100 active' : 'opacity-0'}`;
        carouselItem.innerHTML = `
            <img src="${banner.image}" alt="${banner.title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center p-4">
                <h2 class="text-4xl md:text-5xl font-extrabold mb-3">${banner.title}</h2>
                <p class="text-lg md:text-xl mb-6">${banner.subtitle}</p>
                <a href="${banner.link}" class="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300">
                    ${banner.buttonText} <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        `;
        carouselContainer.appendChild(carouselItem);

        const dot = document.createElement('span');
        dot.className = `carousel-dot w-3 h-3 rounded-full bg-gray-300 cursor-pointer ${index === 0 ? 'bg-blue-500' : ''}`;
        dot.dataset.slideIndex = index;
        dot.addEventListener('click', () => showSlide(index));
        carouselDots.appendChild(dot);
    });

    startCarousel();
}

function showSlide(index) {
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dot');

    items.forEach((item, i) => {
        item.classList.remove('opacity-100', 'active');
        item.classList.add('opacity-0');
        if (i === index) {
            item.classList.add('opacity-100', 'active');
        }
    });

    dots.forEach((dot, i) => {
        dot.classList.remove('bg-blue-500');
        dot.classList.add('bg-gray-300');
        if (i === index) {
            dot.classList.add('bg-blue-500');
        }
    });
    currentSlideIndex = index;
}

function nextSlide() {
    const totalSlides = document.querySelectorAll('.carousel-item').length;
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    showSlide(currentSlideIndex);
}

function startCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, HERO_CAROUSEL_INTERVAL);
}

// --- Data Fetching ---

/**
 * Fetches all products from the JSON file.
 * @returns {Promise<Array>} A promise that resolves to an array of product objects.
 */
async function fetchAllProducts() {
    try {
        const response = await fetch(PRODUCTS_JSON_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${PRODUCTS_JSON_PATH}`);
        }
        const productsData = await response.json();
        return productsData;
    } catch (error) {
        console.error('Error fetching products:', error);
        displayNotification(`Failed to load product data: ${error.message}. Please try again later.`, false);
        return [];
    }
}

/**
 * Fetches product data from imall-products.json and populates global data stores.
 */
async function fetchiMallProductsData() {
    if (ALL_PRODUCTS.length === 0) {
        ALL_PRODUCTS = await fetchAllProducts();

        const uniqueCategories = new Set();
        const uniqueBrands = new Set();
        ALL_PRODUCTS.forEach(p => {
            if (p.category) uniqueCategories.add(p.category);
            if (p.brand) uniqueBrands.add(p.brand);
        });
        
        // Populate ALL_BRANDS for homepage and filters
        ALL_BRANDS = Array.from(uniqueBrands).map(brandName => {
            const representativeProduct = ALL_PRODUCTS.find(p => p.brand === brandName);
            return {
                id: `brd-${brandName.toLowerCase().replace(/\s/g, '-')}`,
                name: brandName,
                logo: representativeProduct && representativeProduct.images && representativeProduct.images.length > 0
                      ? representativeProduct.images[0]
                      : PLACEHOLDER_LOGO_PATH,
                description: `Products from ${brandName}`
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        // Populate Categories dropdown in subheader (if imall-dropdown.js is present)
        const categoriesDropdown = document.getElementById('categories-dropdown');
        if (categoriesDropdown) {
            // Clear existing options except "All Categories"
            categoriesDropdown.innerHTML = '<a href="./imall-category.html?category=all" class="font-bold">All Categories</a>';
            uniqueCategories.forEach(category => {
                const link = document.createElement('a');
                link.href = `./imall-category.html?category=${encodeURIComponent(category)}`;
                link.textContent = category;
                categoriesDropdown.appendChild(link);
            });
        }
        // Populate Brands dropdown in subheader (if imall-dropdown.js is present)
        const brandsDropdown = document.getElementById('brands-dropdown');
        if (brandsDropdown) {
            // Clear existing options except "All Brands"
            brandsDropdown.innerHTML = '<a href="./imall-category.html?section=brands" class="font-bold">All Brands</a>';
            ALL_BRANDS.forEach(brand => {
                const link = document.createElement('a');
                link.href = `./imall-category.html?brand=${encodeURIComponent(brand.name)}`;
                link.textContent = brand.name;
                brandsDropdown.appendChild(link);
            });
        }
    }
}


// --- Homepage Specific Rendering Functions ---

/**
 * Renders the dynamic sections on the homepage (Top Brands, Hot Picks, Featured Products).
 */
function renderHomepageSections() {
    if (!topBrandsGrid && !hotPicksGrid && !featuredProductsGrid) {
        return;
    }

    if (topBrandsGrid) {
        topBrandsGrid.innerHTML = '';
        const brandsToDisplay = ALL_BRANDS.slice(0, BRANDS_PER_HOMEPAGE_SECTION);
        if (brandsToDisplay.length > 0) {
            brandsToDisplay.forEach(brand => {
                topBrandsGrid.insertAdjacentHTML('beforeend', createBrandCardHTML(brand));
            });
        } else {
            topBrandsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600">No top brands available at the moment.</p>';
        }
    }

    if (hotPicksGrid) {
        hotPicksGrid.innerHTML = '';
        const hotPicks = ALL_PRODUCTS
            .filter(p => p.inStock > 0 && (p.rating || 0) >= 4.0)
            .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
            .slice(0, PRODUCTS_PER_SECTION);

        if (hotPicks.length > 0) {
            hotPicks.forEach(product => {
                hotPicksGrid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
            });
        } else {
            hotPicksGrid.innerHTML = '<p class="col-span-full text-center text-gray-600">No hot picks available right now. Check back later!</p>';
        }
    }

    if (featuredProductsGrid) {
        featuredProductsGrid.innerHTML = '';
        const featuredProducts = ALL_PRODUCTS
            .filter(p => p.isDiscounted && p.inStock > 0)
            .sort(() => 0.5 - Math.random())
            .slice(0, PRODUCTS_PER_SECTION);

        if (featuredProducts.length > 0) {
            featuredProducts.forEach(product => {
                featuredProductsGrid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
            });
        } else {
            const fallbackFeatured = ALL_PRODUCTS
                .filter(p => p.inStock > 0)
                .sort((a, b) => b.id.localeCompare(a.id))
                .slice(0, PRODUCTS_PER_SECTION);
            if (fallbackFeatured.length > 0) {
                fallbackFeatured.forEach(product => {
                    featuredProductsGrid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
                });
            } else {
                featuredProductsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600">No featured products to display at the moment.</p>';
            }
        }
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const product = ALL_PRODUCTS.find(p => p.id === productId);
            if (product) {
                addToCart(product, 1);
            }
        });
    });
}


// --- Product Detail Page Specific Functions ---

/**
 * Extracts the product ID from the URL query parameters.
 * @returns {string|null} The product ID or null if not found.
 */
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('productId');
}

/**
 * Updates the total price displayed based on current quantity and product price.
 */
function updateTotalPrice() {
    if (currentProduct && productTotalPriceElem && productQuantityInput) {
        selectedQuantity = parseInt(productQuantityInput.value, 10);
        
        if (isNaN(selectedQuantity) || selectedQuantity < (currentProduct.minOrderQuantity || 1)) {
            selectedQuantity = currentProduct.minOrderQuantity || 1;
        }
        if (selectedQuantity > (currentProduct.maxOrderQuantity || 10)) {
            selectedQuantity = currentProduct.maxOrderQuantity || 10;
        }
        productQuantityInput.value = selectedQuantity;

        const total = currentProduct.price * selectedQuantity;
        productTotalPriceElem.textContent = `$${total.toFixed(2)}`;
    }
}

/**
 * Renders the product details onto the page.
 * @param {Object} product - The product object to render.
 */
function renderProductDetails(product) {
    if (!product) {
        const mainContent = document.getElementById('imall-product-detail-main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="text-center p-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <p class="text-gray-700">The product you are looking for does not exist or has been removed.</p>
                    <a href="./imall-category.html?category=all" class="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Category Products</a>
                </div>
            `;
        }
        document.title = 'Product Not Found | iMall Kenya';
        return;
    }

    currentProduct = product;
    selectedQuantity = product.minOrderQuantity || 1; 
    selectedColor = (product.availableColors && product.availableColors.length > 0) ? product.availableColors[0] : '';
    
    if (productNameElem) productNameElem.textContent = product.name;
    document.title = `${product.name} | iMall Kenya`;
    if (productDescriptionElem) productDescriptionElem.textContent = product.description;
    if (productCurrentPriceElem) productCurrentPriceElem.textContent = `$${product.price.toFixed(2)}`;
    if (productCategoryElem) productCategoryElem.textContent = product.category;
    if (productBrandElem) productBrandElem.textContent = product.brand;
    if (productFeaturesElem) productFeaturesElem.textContent = (product.features && product.features.join(', ')) || 'N/A';
    if (productSkuElem) productSkuElem.textContent = product.sku;
    if (productShippingElem) productShippingElem.textContent = product.shipping;
    if (productDeliveryElem) productDeliveryElem.textContent = product.waitingPeriod || 'N/A';
    if (productMinOrderElem) productMinOrderElem.textContent = product.minOrderQuantity || 'N/A';
    if (productMaxOrderElem) productMaxOrderElem.textContent = product.maxOrderQuantity || 'N/A';

    if (productOriginalPriceElem) {
        if (product.originalPrice && product.originalPrice > product.price) {
            productOriginalPriceElem.textContent = `$${product.originalPrice.toFixed(2)}`;
            productOriginalPriceElem.style.display = 'inline';
        } else {
            productOriginalPriceElem.textContent = '';
            productOriginalPriceElem.style.display = 'none';
        }
    }

    if (productRatingStarsElem && productRatingValueElem && productReviewsCountElem) {
        if (product.rating) {
            let starsHtml = '';
            const fullStars = Math.floor(product.rating);
            const hasHalfStar = product.rating % 1 !== 0;

            for (let i = 0; i < fullStars; i++) {
                starsHtml += '<i class="fas fa-star"></i>';
            }
            if (hasHalfStar) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            }
            productRatingStarsElem.innerHTML = starsHtml;
            productRatingValueElem.textContent = `(${product.rating.toFixed(1)})`;
            productReviewsCountElem.textContent = `(${product.reviewsCount} reviews)`;
        } else {
            productRatingStarsElem.innerHTML = '';
            productRatingValueElem.textContent = '(No rating)';
            productReviewsCountElem.textContent = '(0 reviews)';
        }
    }

    if (productInStockElem && addToCartBtn) {
        if (product.inStock > 0) {
            productInStockElem.textContent = `${product.inStock}`;
            productInStockElem.classList.remove('text-red-600');
            productInStockElem.classList.add('text-green-600');
            addToCartBtn.disabled = false;
            addToCartBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            productInStockElem.textContent = 'Out of Stock';
            productInStockElem.classList.remove('text-green-600');
            productInStockElem.classList.add('text-red-600');
            addToCartBtn.disabled = true;
            addToCartBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    if (productQuantityInput) {
        productQuantityInput.min = product.minOrderQuantity || 1;
        productQuantityInput.max = product.maxOrderQuantity || 10;
        productQuantityInput.value = selectedQuantity;
    }

    if (productMainImage) {
        productMainImage.src = (product.images && product.images.length > 0) ? product.images[0] : PLACEHOLDER_IMAGE_PATH;
        productMainImage.alt = `${product.name} Main Image`;
        productMainImage.onerror = () => { handleImageError(productMainImage); };
    }

    if (productThumbnailsContainer) {
        productThumbnailsContainer.innerHTML = '';
        const imagesToRender = product.images || []; 
        imagesToRender.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `${product.name} Thumbnail ${index + 1}`;
            img.className = `w-20 h-14 object-cover rounded-md border-2 border-transparent cursor-pointer hover:border-blue-700`;
            img.dataset.imageSrc = imageSrc;
            img.onerror = (e) => { handleImageError(e.target); };

            if (index === 0) {
                img.classList.add('border-blue-500', 'active-thumbnail');
            }

            img.addEventListener('click', () => {
                productMainImage.src = img.dataset.imageSrc;
                document.querySelectorAll('#product-thumbnails-container .active-thumbnail').forEach(thumb => {
                    thumb.classList.remove('border-blue-500', 'active-thumbnail');
                    thumb.classList.add('border-transparent');
                });
                img.classList.add('border-blue-500', 'active-thumbnail');
                img.classList.remove('border-transparent');
            });
            productThumbnailsContainer.appendChild(img);
        });
    }

    if (productColorSwatchesContainer && selectedColorTextElem) {
        productColorSwatchesContainer.innerHTML = '';
        selectedColorTextElem.textContent = selectedColor;

        const colorsToRender = product.availableColors || []; 
        colorsToRender.forEach((color, index) => {
            const swatch = document.createElement('span');
            swatch.className = `w-8 h-8 rounded-full border-2 cursor-pointer shadow-md`;
            swatch.style.backgroundColor = color.toLowerCase();
            swatch.dataset.color = color;
            swatch.title = color;

            if (color === selectedColor) {
                swatch.classList.add('border-blue-500');
                swatch.classList.remove('border-gray-300');
            } else {
                swatch.classList.add('border-gray-300');
            }

            swatch.addEventListener('click', () => {
                document.querySelectorAll('#product-color-swatches span').forEach(s => {
                    s.classList.remove('border-blue-500');
                    s.classList.add('border-gray-300');
                });
                swatch.classList.add('border-blue-500');
                swatch.classList.remove('border-gray-300');
                selectedColor = color;
                selectedColorTextElem.textContent = color;
            });
            productColorSwatchesContainer.appendChild(swatch);
        });
    }

    updateTotalPrice();
}

/**
 * Initializes the product detail page by fetching data and rendering.
 */
async function initializeProductDetailPage() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        renderProductDetails(null);
        return;
    }

    await fetchiMallProductsData();
    
    const product = ALL_PRODUCTS.find(p => p.id === productId);
    
    if (!product) {
        console.error(`Product with ID '${productId}' not found in ALL_PRODUCTS. Displaying 'Product Not Found' message.`);
    }
    renderProductDetails(product);

    if (decreaseQuantityBtn) {
        decreaseQuantityBtn.addEventListener('click', () => {
            let currentVal = parseInt(productQuantityInput.value, 10);
            if (!isNaN(currentVal) && currentVal > (currentProduct.minOrderQuantity || 1)) {
                productQuantityInput.value = currentVal - 1;
                updateTotalPrice();
            }
        });
    }
    if (increaseQuantityBtn) {
        increaseQuantityBtn.addEventListener('click', () => {
            let currentVal = parseInt(productQuantityInput.value, 10);
            if (!isNaN(currentVal) && currentVal < (currentProduct.maxOrderQuantity || 10)) {
                productQuantityInput.value = currentVal + 1;
                updateTotalPrice();
            }
        });
    }
    if (productQuantityInput) {
        productQuantityInput.addEventListener('input', () => {
            let currentVal = parseInt(productQuantityInput.value, 10);
            if (isNaN(currentVal) || currentVal < (currentProduct.minOrderQuantity || 1)) {
                productQuantityInput.value = (currentProduct.minOrderQuantity || 1);
            } else if (currentVal > (currentProduct.maxOrderQuantity || 10)) {
                productQuantityInput.value = (currentProduct.maxOrderQuantity || 10);
            }
            updateTotalPrice();
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (currentProduct && currentProduct.inStock > 0) {
                addToCart(currentProduct, selectedQuantity, selectedColor);
            } else {
                displayNotification('This item is out of stock!', false);
            }
        });
    }
}

// --- My Activity Page Specific Functions ---

/**
 * Switches between different sections (Cart, Wishlist, Orders) on the My Activity page.
 * @param {string} sectionId - The ID of the section to show ('cart-section', 'wishlist-section', 'orders-section').
 */
function showActivitySection(sectionId) {
    const sections = [cartSection, wishlistSection, ordersSection];
    const buttons = [showCartBtn, showWishlistBtn, showOrdersBtn];

    sections.forEach(section => {
        if (section) section.classList.add('hidden');
    });
    buttons.forEach(button => {
        if (button) {
            button.classList.remove('bg-blue-500', 'text-white');
            button.classList.add('text-gray-700', 'hover:bg-gray-200');
        }
    });

    const targetSection = document.getElementById(sectionId);
    const targetButton = document.getElementById(`show-${sectionId.replace('-section', '')}-btn`);

    if (targetSection) targetSection.classList.remove('hidden');
    if (targetButton) {
        targetButton.classList.add('bg-blue-500', 'text-white');
        targetButton.classList.remove('text-gray-700', 'hover:bg-gray-200');
    }

    if (sectionId === 'cart-section') {
        renderCartItems();
    } else if (sectionId === 'wishlist-section') {
        renderWishlistItems();
    } else if (sectionId === 'orders-section') {
        renderOrderHistory();
    }
}

/**
 * Generates HTML for a single item in the shopping cart.
 * @param {object} item - The cart item object.
 * @returns {string} HTML string for the cart item.
 */
function createCartItemHTML(item) {
    const itemTotal = item.price * item.quantity;
    const colorDisplay = item.selectedColor ? `<span class="text-sm text-gray-600">Color: ${item.selectedColor}</span>` : '';
    return `
        <div class="flex items-center justify-between border-b border-gray-200 py-4 cart-item" data-product-id="${item.id}" data-product-color="${item.selectedColor || ''}">
            <div class="flex items-center space-x-4">
                <img src="${item.images && item.images.length > 0 ? item.images[0] : PLACEHOLDER_IMAGE_PATH}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md" onerror="handleImageError(this);">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
                    <p class="text-gray-600">Quantity: ${item.quantity}</p>
                    ${colorDisplay}
                    <p class="text-blue-600 font-bold">$${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="text-lg font-bold text-gray-900">$${itemTotal.toFixed(2)}</span>
                <button class="remove-from-cart-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors duration-200" data-product-id="${item.id}" data-product-color="${item.selectedColor || ''}">Remove</button>
            </div>
        </div>
    `;
}

/**
 * Renders all items currently in the cart.
 */
function renderCartItems() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let currentCartTotal = 0;

    if (cartItems.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
        if (cartTotalAmount) cartTotalAmount.textContent = '$0.00';
        if (proceedToCheckoutBtn) {
            proceedToCheckoutBtn.disabled = true;
            proceedToCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
        cartItems.forEach(item => {
            cartItemsContainer.insertAdjacentHTML('beforeend', createCartItemHTML(item));
            currentCartTotal += item.price * item.quantity;
        });
        if (cartTotalAmount) cartTotalAmount.textContent = `$${currentCartTotal.toFixed(2)}`;
        if (proceedToCheckoutBtn) {
            proceedToCheckoutBtn.disabled = false;
            proceedToCheckoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const productColor = event.target.dataset.productColor;
                removeFromCart(productId, productColor);
            });
        });
    }
    checkoutData.cartTotal = currentCartTotal;
    updateCheckoutTotal();
}

/**
 * Removes an item from the cart.
 * @param {string} productId - The ID of the product to remove.
 * @param {string} productColor - The color of the product to remove.
 */
function removeFromCart(productId, productColor) {
    const initialLength = cartItems.length;
    cartItems = cartItems.filter(item => !(item.id === productId && (item.selectedColor || '') === productColor));
    if (cartItems.length < initialLength) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        displayNotification('Item removed from cart.', true);
        updateCartCount();
        renderCartItems();
    }
}

/**
 * Renders all items currently in the wishlist. (Placeholder)
 */
function renderWishlistItems() {
    if (!wishlistItemsContainer) return;

    wishlistItemsContainer.innerHTML = '';
    if (wishlistItems.length === 0) {
        if (emptyWishlistMessage) emptyWishlistMessage.classList.remove('hidden');
    } else {
        if (emptyWishlistMessage) emptyWishlistMessage.classList.add('hidden');
        wishlistItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center justify-between border-b border-gray-200 py-4';
            itemDiv.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${item.images && item.images.length > 0 ? item.images[0] : PLACEHOLDER_IMAGE_PATH}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md" onerror="handleImageError(this);">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
                        <p class="text-gray-600">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">Remove from Wishlist</button>
            `;
            wishlistItemsContainer.appendChild(itemDiv);
        });
    }
}

/**
 * Renders all past orders from order history.
 */
function renderOrderHistory() {
    if (!orderHistoryContainer) return;

    orderHistoryContainer.innerHTML = '';
    if (orderHistory.length === 0) {
        if (emptyOrdersMessage) emptyOrdersMessage.classList.remove('hidden');
    } else {
        if (emptyOrdersMessage) emptyOrdersMessage.classList.add('hidden');
        orderHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        orderHistory.forEach(order => {
            orderHistoryContainer.insertAdjacentHTML('beforeend', createOrderItemHTML(order));
        });
    }
}

/**
 * Generates HTML for a single order in the order history.
 * @param {object} order - The order object.
 * @returns {string} HTML string for the order.
 */
function createOrderItemHTML(order) {
    const itemsListHtml = order.items.map(item => `
        <li class="text-gray-700 text-sm">- ${item.name} (${item.selectedColor || 'N/A'}) x ${item.quantity} @ $${item.price.toFixed(2)}</li>
    `).join('');

    return `
        <div class="border border-gray-200 rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-800">Order #${order.orderId}</h3>
                <span class="text-gray-600 text-sm">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <p class="text-gray-700 mb-2"><strong>Total:</strong> $${order.finalTotal.toFixed(2)}</p>
            <p class="text-gray-700 mb-2"><strong>Shipping:</strong> ${order.shippingMethod === 'local-pickup' ? 'Local Pickup (Free)' : `${order.shippingCompany} ($${order.shippingFee.toFixed(2)})`}</p>
            <p class="text-gray-700 mb-2"><strong>Payment:</strong> ${order.paymentMethod.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
            <p class="text-gray-700 mb-2"><strong>Items:</strong></p>
            <ul class="list-disc list-inside ml-4">
                ${itemsListHtml}
            </ul>
        </div>
    `;
}


// --- Checkout Modal Functions ---

/**
 * Opens the checkout modal and initializes the first step.
 */
function openCheckoutModal() {
    if (!checkoutModal) return;

    checkoutModal.classList.remove('hidden');
    currentCheckoutStep = 1;
    showCheckoutStep(currentCheckoutStep);
    
    checkoutData.cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    checkoutData.shippingFee = 0;
    checkoutData.shippingMethod = 'local-pickup';
    checkoutData.shippingCompany = '';
    if (shippingCompanySelect) shippingCompanySelect.value = '';
    const localPickupRadio = document.querySelector('input[name="shippingMethod"][value="local-pickup"]');
    if (localPickupRadio) localPickupRadio.checked = true;
    if (deliveryOptionsDiv) deliveryOptionsDiv.classList.add('hidden');

    updateCheckoutTotal();
}

/**
 * Closes the checkout modal.
 */
function closeCheckoutModal() {
    if (checkoutModal) checkoutModal.classList.add('hidden');
    if (orderSuccessModal) orderSuccessModal.classList.add('hidden');
    if (checkoutForm) checkoutForm.reset();
}

/**
 * Displays a specific step in the checkout process.
 * @param {number} stepNumber - The step number to display (1, 2, or 3).
 */
function showCheckoutStep(stepNumber) {
    const steps = [checkoutStep1, checkoutStep2, checkoutStep3];
    const stepNavs = [stepDetails, stepShipping, stepPayment];

    steps.forEach((step, index) => {
        if (step) step.classList.add('hidden');
        if (stepNavs[index]) {
            stepNavs[index].classList.remove('text-blue-600', 'font-bold');
            stepNavs[index].classList.add('text-gray-500');
        }
    });

    if (steps[stepNumber - 1]) steps[stepNumber - 1].classList.remove('hidden');
    if (stepNavs[stepNumber - 1]) {
        stepNavs[stepNumber - 1].classList.add('text-blue-600', 'font-bold');
        stepNavs[stepNumber - 1].classList.remove('text-gray-500');
    }
    currentCheckoutStep = stepNumber;
    updateCheckoutTotal();
}

/**
 * Updates the total amount displayed in the checkout modal based on cart and shipping.
 */
function updateCheckoutTotal() {
    let total = checkoutData.cartTotal + checkoutData.shippingFee;
    checkoutData.finalTotal = total;

    if (checkoutOrderTotal) checkoutOrderTotal.textContent = `$${total.toFixed(2)}`;
    if (checkoutFinalTotal) checkoutFinalTotal.textContent = `$${total.toFixed(2)}`;
}

/**
 * Generates a unique order number.
 * @returns {string} A unique order ID.
 */
function generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `IMALL-${timestamp}-${random}`;
}

/**
 * Saves the current cart as a new order in order history and clears the cart.
 */
function saveOrder() {
    const orderId = generateOrderNumber();
    const newOrder = {
        orderId: orderId,
        date: new Date().toISOString(),
        items: [...cartItems],
        customerDetails: {
            fullName: fullNameInput.value,
            email: emailInput.value,
            shippingAddress: shippingAddressInput.value
        },
        shippingMethod: checkoutData.shippingMethod,
        shippingCompany: checkoutData.shippingCompany,
        shippingFee: checkoutData.shippingFee,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        cartTotal: checkoutData.cartTotal,
        finalTotal: checkoutData.finalTotal
    };

    orderHistory.push(newOrder);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    displayNotification(`Order #${orderId} placed successfully!`, true);
    
    clearCart();
    
    if (orderNumberDisplay) orderNumberDisplay.textContent = `#${orderId}`;
    if (orderSuccessModal) orderSuccessModal.classList.remove('hidden');
    if (checkoutModal) checkoutModal.classList.add('hidden');
}

/**
 * Clears all items from the cart.
 */
function clearCart() {
    cartItems = [];
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
}


/**
 * Initializes the My Activity page by setting up event listeners and rendering content.
 */
async function initializeMyActivityPage() {
    if (showCartBtn) showCartBtn.addEventListener('click', () => showActivitySection('cart-section'));
    if (showWishlistBtn) showWishlistBtn.addEventListener('click', () => showActivitySection('wishlist-section'));
    if (showOrdersBtn) showOrdersBtn.addEventListener('click', () => showActivitySection('orders-section'));

    renderCartItems();
    renderWishlistItems();
    renderOrderHistory();

    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', openCheckoutModal);
    }
    if (closeCheckoutModalBtn) {
        closeCheckoutModalBtn.addEventListener('click', closeCheckoutModal);
    }
    if (closeOrderSuccessModalBtn) {
        closeOrderSuccessModalBtn.addEventListener('click', closeCheckoutModal);
    }
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            closeCheckoutModal();
            window.location.href = './imall.html';
        });
    }

    if (nextStep1Btn) {
        nextStep1Btn.addEventListener('click', () => {
            if (checkoutForm && fullNameInput && emailInput && shippingAddressInput) {
                if (fullNameInput.checkValidity() && emailInput.checkValidity() && shippingAddressInput.checkValidity()) {
                    checkoutData.fullName = fullNameInput.value;
                    checkoutData.email = emailInput.value;
                    checkoutData.shippingAddress = shippingAddressInput.value;
                    showCheckoutStep(2);
                } else {
                    displayNotification('Please fill in all required details.', false);
                    checkoutForm.reportValidity();
                }
            }
        });
    }
    if (prevStep2Btn) prevStep2Btn.addEventListener('click', () => showCheckoutStep(1));
    if (nextStep2Btn) {
        nextStep2Btn.addEventListener('click', () => {
            if (checkoutData.shippingMethod === 'delivery' && !checkoutData.shippingCompany) {
                displayNotification('Please select a shipping company.', false);
                if (shippingCompanySelect) shippingCompanySelect.focus();
                return;
            }
            showCheckoutStep(3);
        });
    }
    if (prevStep3Btn) prevStep3Btn.addEventListener('click', () => showCheckoutStep(2));
    if (placeOrderBtn) placeOrderBtn.addEventListener('click', saveOrder);

    shippingMethodRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            checkoutData.shippingMethod = event.target.value;
            if (checkoutData.shippingMethod === 'delivery') {
                if (deliveryOptionsDiv) deliveryOptionsDiv.classList.remove('hidden');
                if (shippingCompanySelect && !checkoutData.shippingCompany && shippingCompanySelect.options.length > 1) {
                    shippingCompanySelect.value = shippingCompanySelect.options[1].value;
                    checkoutData.shippingCompany = shippingCompanySelect.options[1].value;
                    checkoutData.shippingFee = SHIPPING_FEES[checkoutData.shippingCompany] || 0;
                } else if (checkoutData.shippingCompany) {
                    checkoutData.shippingFee = SHIPPING_FEES[checkoutData.shippingCompany] || 0;
                } else {
                    checkoutData.shippingFee = 0;
                }
            } else {
                if (deliveryOptionsDiv) deliveryOptionsDiv.classList.add('hidden');
                checkoutData.shippingCompany = '';
                checkoutData.shippingFee = 0;
            }
            updateCheckoutTotal();
        });
    });

    if (shippingCompanySelect) {
        shippingCompanySelect.addEventListener('change', (event) => {
            checkoutData.shippingCompany = event.target.value;
            checkoutData.shippingFee = SHIPPING_FEES[checkoutData.shippingCompany] || 0;
            updateCheckoutTotal();
        });
    }
}

// --- Category Page Specific Functions ---

/**
 * Initializes the category page by parsing URL parameters, populating filters, and rendering products.
 */
async function initializeCategoryPage() {
    // Parse URL parameters for initial filters/search
    const urlParams = new URLSearchParams(window.location.search);
    currentCategoryFilter = urlParams.get('category') || 'all';
    currentBrandFilter = urlParams.get('brand') || 'all';
    currentSearchQuery = urlParams.get('search') || ''; // Store search query
    const sectionQuery = urlParams.get('section'); // For 'deals', 'new-arrivals', 'brands'

    if (categoryTitle) {
        if (currentSearchQuery) {
            categoryTitle.textContent = `Search Results for "${currentSearchQuery}"`;
        } else if (sectionQuery === 'deals') {
            categoryTitle.textContent = 'Today\'s Deals';
        } else if (sectionQuery === 'new-arrivals') {
            categoryTitle.textContent = 'New Arrivals';
        } else if (sectionQuery === 'brands') {
            categoryTitle.textContent = 'All Brands';
        } else if (currentCategoryFilter !== 'all') {
            categoryTitle.textContent = currentCategoryFilter;
        } else if (currentBrandFilter !== 'all') {
            categoryTitle.textContent = currentBrandFilter;
        } else {
            categoryTitle.textContent = 'All Products';
        }
    }

    populateFilters();
    applyFiltersAndRender();

    // Event Listeners for filters and sorting
    if (filterCategorySelect) {
        filterCategorySelect.addEventListener('change', (event) => {
            currentCategoryFilter = event.target.value;
            currentPage = 1; // Reset to first page on filter change
            applyFiltersAndRender();
        });
    }
    if (filterBrandSelect) {
        filterBrandSelect.addEventListener('change', (event) => {
            currentBrandFilter = event.target.value;
            currentPage = 1; // Reset to first page on filter change
            applyFiltersAndRender();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            currentSortOrder = event.target.value;
            currentPage = 1; // Reset to first page on sort change
            applyFiltersAndRender();
        });
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            currentCategoryFilter = 'all';
            currentBrandFilter = 'all';
            currentSortOrder = 'default';
            currentPage = 1;
            currentSearchQuery = ''; // Clear search query
            // Clear URL parameters
            const newUrl = new URL(window.location.href);
            newUrl.search = '';
            window.history.pushState({}, '', newUrl.toString());

            if (filterCategorySelect) filterCategorySelect.value = 'all';
            if (filterBrandSelect) filterBrandSelect.value = 'all';
            if (sortSelect) sortSelect.value = 'default';
            // Clear search input if it exists globally
            if (imallSearchInput) imallSearchInput.value = '';
            applyFiltersAndRender();
        });
    }

    // Pagination event listeners
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            applyFiltersAndRender();
        }
    });
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
        const filteredProducts = getFilteredAndSortedProducts();
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            applyFiltersAndRender();
        }
    });
}

/**
 * Populates the category and brand filter dropdowns.
 */
function populateFilters() {
    if (filterCategorySelect) {
        const uniqueCategories = new Set(ALL_PRODUCTS.map(p => p.category).filter(Boolean));
        filterCategorySelect.innerHTML = '<option value="all">All Categories</option>';
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategorySelect.appendChild(option);
        });
        filterCategorySelect.value = currentCategoryFilter; 
    }

    if (filterBrandSelect) {
        const uniqueBrands = new Set(ALL_PRODUCTS.map(p => p.brand).filter(Boolean));
        filterBrandSelect.innerHTML = '<option value="all">All Brands</option>';
        uniqueBrands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            filterBrandSelect.appendChild(option);
        });
        filterBrandSelect.value = currentBrandFilter;
    }
}

/**
 * Filters and sorts products based on current filter/sort state, then renders them.
 */
function applyFiltersAndRender() {
    const filteredProducts = getFilteredAndSortedProducts();

    renderCategoryProducts(filteredProducts);
    setupPagination(filteredProducts);
    updatePaginationDisplay();
}

/**
 * Gets products filtered by category, brand, search query, and section, then sorted.
 * @returns {Array} The filtered and sorted array of products.
 */
function getFilteredAndSortedProducts() {
    let filtered = [...ALL_PRODUCTS];

    const urlParams = new URLSearchParams(window.location.search);
    const sectionQuery = urlParams.get('section');

    // Apply section-specific filtering first, as these often override general category/brand filters
    if (sectionQuery === 'deals') {
        filtered = filtered.filter(p => p.isDiscounted && p.inStock > 0).sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price)); // Sort by discount amount
    } else if (sectionQuery === 'new-arrivals') {
        // Assuming 'new arrivals' are simply the most recently added or products with higher IDs
        filtered = filtered.sort((a, b) => b.id.localeCompare(a.id)); 
    } else if (sectionQuery === 'brands') {
        // If 'brands' section is chosen, and no specific brand filter is applied, show all products.
        // If a brand filter IS applied (e.g., imall-category.html?section=brands&brand=Samsung),
        // the brand filter logic below will handle it.
    }

    // Apply search query from URL (takes precedence over dropdown filters if present)
    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.brand && p.brand.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.subCategory && p.subCategory.toLowerCase().includes(query))
        );
    } else {
        // Only apply category/brand filters from dropdowns if no search query is active
        if (currentCategoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === currentCategoryFilter);
        }

        if (currentBrandFilter !== 'all') {
            filtered = filtered.filter(p => p.brand === currentBrandFilter);
        }
    }

    // Ensure only in-stock items are shown by default (unless specific logic dictates otherwise)
    filtered = filtered.filter(p => p.inStock > 0);

    // Apply sorting from dropdown
    if (currentSortOrder === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSortOrder === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSortOrder === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortOrder === 'name-desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (currentSortOrder === 'rating-desc') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
}


/**
 * Renders the products for the current page in the category grid.
 * @param {Array} productsToRender - The array of products to display.
 */
function renderCategoryProducts(productsToRender) {
    if (!categoryProductsGrid) return;

    categoryProductsGrid.innerHTML = '';

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsOnPage = productsToRender.slice(startIndex, endIndex);

    if (productsOnPage.length === 0) {
        categoryProductsGrid.innerHTML = '<p class="col-span-full text-center text-gray-600 py-8">No products found matching your criteria.</p>';
    } else {
        productsOnPage.forEach(product => {
            categoryProductsGrid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
        });
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const product = ALL_PRODUCTS.find(p => p.id === productId);
            if (product) {
                addToCart(product, 1);
            }
        });
    });
}

/**
 * Sets up pagination controls based on the filtered products.
 * @param {Array} filteredProducts - The array of products after filtering.
 */
function setupPagination(filteredProducts) {
    if (!paginationContainer || !prevPageBtn || !nextPageBtn || !currentPageSpan) return;

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    if (totalPages <= 1) {
        paginationContainer.classList.add('hidden');
    } else {
        paginationContainer.classList.remove('hidden');
    }

    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
}

/**
 * Updates the current page number display.
 */
function updatePaginationDisplay() {
    if (currentPageSpan) {
        currentPageSpan.textContent = currentPage;
    }
}


// --- Main Execution Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();

    await fetchiMallProductsData();

    // Determine which page we are on and initialize accordingly
    if (productDetailPageMainContent) {
        await initializeProductDetailPage();
    } else if (categoryProductsGrid) {
        // This is the category/search results page
        const urlParams = new URLSearchParams(window.location.search);
        currentCategoryFilter = urlParams.get('category') || 'all';
        currentBrandFilter = urlParams.get('brand') || 'all';
        currentSearchQuery = urlParams.get('search') || '';
        // The 'section' parameter is handled within getFilteredAndSortedProducts

        // Set initial dropdown values based on URL parameters
        if (filterCategorySelect) filterCategorySelect.value = currentCategoryFilter;
        if (filterBrandSelect) filterBrandSelect.value = currentBrandFilter;
        // Search input value is not automatically set by URL param here, if you need that,
        // you'd add: if (imallSearchInput) imallSearchInput.value = currentSearchQuery;

        initializeCategoryPage();
    } else if (cartSection && showCartBtn) {
        // This is the My Activity page
        initializeMyActivityPage();
        showActivitySection('cart-section');
    } else if (carouselContainer && topBrandsGrid && hotPicksGrid && featuredProductsGrid) {
        // This is the homepage
        renderHeroCarousel();
        renderHomepageSections();
    }

    // --- Global Search Bar Functionality (Applies to all iMall pages) ---
    if (imallSearchInput) {
        imallSearchInput.addEventListener('input', async (event) => {
            const query = event.target.value.toLowerCase();
            imallSearchSuggestions.innerHTML = '';
            if (query.length > 2) {
                const matchedProducts = ALL_PRODUCTS.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query)) ||
                    (p.brand && p.brand.toLowerCase().includes(query)) ||
                    (p.category && p.category.toLowerCase().includes(query))
                ).slice(0, 5);

                matchedProducts.forEach(product => {
                    const suggestionItem = document.createElement('a');
                    suggestionItem.href = `./imall-product-detail.html?productId=${product.id}`;
                    suggestionItem.classList.add('search-suggestion-item', 'flex', 'items-center', 'p-3', 'hover:bg-gray-50', 'text-gray-700', 'no-underline', 'border-b', 'border-gray-100');
                    suggestionItem.innerHTML = `
                        <img src="${product.images && product.images.length > 0 ? product.images[0] : PLACEHOLDER_IMAGE_PATH}" alt="${product.name}" class="h-8 w-8 object-cover rounded mr-2" onerror="handleImageError(this);">
                        <span>${product.name}</span>
                        <span class="ml-auto text-gray-500 text-sm">$${product.price.toFixed(2).toLocaleString('en-KE')}</span>
                    `;
                    imallSearchSuggestions.appendChild(suggestionItem);
                });

                if (matchedProducts.length > 0) {
                    imallSearchSuggestions.classList.add('active');
                } else {
                    imallSearchSuggestions.classList.remove('active');
                }
            } else {
                imallSearchSuggestions.classList.remove('active');
            }
        });

        document.addEventListener('click', (event) => {
            if (imallSearchSuggestions && !imallSearchInput.contains(event.target) && !imallSearchSuggestions.contains(event.target)) {
                imallSearchSuggestions.classList.remove('active');
            }
        });

        if (imallSearchButton) {
            imallSearchButton.addEventListener('click', () => {
                const query = imallSearchInput.value.trim();
                if (query) {
                    window.location.href = `./imall-category.html?search=${encodeURIComponent(query)}`;
                }
            });
        }
        imallSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                imallSearchButton.click();
            }
        });
    }
});
