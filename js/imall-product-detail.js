// js/imall-product-detail.js

// --- Global Data Stores (Accessed, not redeclared here) ---
// These variables are assumed to be declared globally by imall.js or imall-category.js
// For example, in imall.js:
// let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
// let ALL_PRODUCTS = [];
// If they are not globally declared elsewhere, you will need to add them to a shared script like imall.js
// or declare them using `var` here to make them truly global (less recommended practice).

// --- DOM Element References ---
const PRODUCTS_JSON_PATH = 'data/imall-products.json'; // Path to your JSON file

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
const productDeliveryElem = document.getElementById('product-delivery');
const productMinOrderElem = document.getElementById('product-min-order');
const productMaxOrderElem = document.getElementById('product-max-order');
const selectedColorTextElem = document.getElementById('selected-color-text');
const productQuantityInput = document.getElementById('product-quantity');
const decreaseQuantityBtn = document.getElementById('decrease-quantity');
const increaseQuantityBtn = document.getElementById('increase-quantity');
const addToCartBtn = document.getElementById('add-to-cart-detail-page-btn');
const productTotalPriceElem = document.getElementById('product-total-price');

// Image gallery elements
const productMainImage = document.getElementById('product-main-image');
const productThumbnailsContainer = document.getElementById('product-thumbnails-container');
const productColorSwatchesContainer = document.getElementById('product-color-swatches');

// Notification element (reused from imall.js / imall-category.js)
const notificationMessageDiv = document.getElementById('notification-message');
const cartItemCountSpan = document.getElementById('cart-item-count'); // For updating cart count

// --- Configuration Constants (consistent with imall-category.js) ---
const PLACEHOLDER_IMAGE_PATH = 'https://placehold.co/300x200/FF0000/FFFFFF?text=Image+Error';
const NOTIFICATION_DURATION = 3000; // milliseconds

let currentProduct = null; // This is local to this script, no conflict
let selectedQuantity = 1; // This is local to this script, no conflict
let selectedColor = ''; // This is local to this script, no conflict

// --- Utility Functions (Aligned with imall-category.js) ---

/**
 * Handles image loading errors by replacing the src with a placeholder.
 * @param {HTMLImageElement} imageElement - The image element that failed to load.
 */
function handleImageError(imageElement) {
    imageElement.onerror = null; // Prevent infinite loop
    imageElement.src = PLACEHOLDER_IMAGE_PATH;
    console.warn('Image failed to load, replaced with placeholder:', imageElement.alt);
}

/**
 * Displays a temporary notification message.
 * @param {string} messageText - The message to display.
 * @param {boolean} isSuccess - True for success (green), false for error (red).
 */
function displayNotification(messageText, isSuccess = true) {
    console.log('Displaying notification:', messageText, 'Type:', isSuccess ? 'success' : 'error');
    if (notificationMessageDiv) {
        notificationMessageDiv.textContent = messageText;
        notificationMessageDiv.classList.remove('opacity-0', 'notification-fade-out', 'bg-green-500', 'bg-red-500', 'opacity-100', 'show');

        notificationMessageDiv.classList.add('opacity-100', isSuccess ? 'bg-green-500' : 'bg-red-500');
        
        setTimeout(() => {
            notificationMessageDiv.classList.remove('opacity-100');
            notificationMessageDiv.classList.add('opacity-0');
        }, NOTIFICATION_DURATION);
    } else {
        console.warn('Notification message div not found!');
    }
}

/**
 * Adds a product to the cart or increments its quantity if already present.
 * Updates localStorage and the cart count display.
 * This version is adapted for the detail page's single product context.
 * @param {object} product - The product object to add.
 * @param {number} quantity - The quantity to add.
 */
function addToCart(product, quantity) {
    // Ensure cartItems is accessible globally. If not, this function will fail.
    if (typeof cartItems === 'undefined') {
        console.error("Error: 'cartItems' is not defined globally. Please ensure it's declared in a shared script like imall.js.");
        displayNotification("Cart not available. Please try again later.", false);
        return;
    }

    console.log('Attempting to add to cart:', product.name, 'Quantity:', quantity);
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
        if (product.maxOrder && potentialNewQuantity > product.maxOrder) {
            displayNotification(`Cannot add more ${product.name}. Maximum order quantity is ${product.maxOrder}.`, false);
            return;
        }

        cartItems[existingItemIndex].quantity = potentialNewQuantity;
        displayNotification(`${quantity}x ${product.name} added to cart!`);
    } else {
        if (quantity < (product.minOrder || 1)) {
            displayNotification(`Minimum order quantity for ${product.name} is ${product.minOrder || 1}.`, false);
            return;
        }
        if (quantity > (product.maxOrder || 9999)) {
            displayNotification(`Maximum order quantity for ${product.name} is ${product.maxOrder || 9999}.`, false);
            return;
        }
        if (quantity > product.inStock) {
            displayNotification(`Only ${product.inStock} of ${product.name} are available.`, false);
            return;
        }
        cartItems.push({ ...product, quantity: quantity, selectedColor: selectedColor });
        displayNotification(`${quantity}x ${product.name} added to cart!`);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    console.log('Cart items after add:', cartItems);
}

/**
 * Updates the displayed count of items in the shopping cart icon.
 */
function updateCartCount() {
    if (cartItemCountSpan) {
        const totalItems = (typeof cartItems !== 'undefined' && cartItems) ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
        cartItemCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartItemCountSpan.classList.remove('hidden');
        } else {
            cartItemCountSpan.classList.add('hidden');
        }
        console.log('Cart count updated:', totalItems);
    } else {
        console.warn('Cart item count span not found!');
    }
}


/**
 * Extracts the product ID from the URL query parameters.
 * @returns {string|null} The product ID or null if not found.
 */
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('productId');
    console.log('Product ID from URL:', productId);
    return productId;
}

/**
 * Fetches all products from the JSON file.
 * @returns {Promise<Array>} A promise that resolves to an array of product objects.
 */
async function fetchAllProducts() {
    console.log('Attempting to fetch products from:', PRODUCTS_JSON_PATH);
    try {
        const response = await fetch(PRODUCTS_JSON_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productsData = await response.json();
        console.log('Products fetched successfully:', productsData);
        return productsData;
    } catch (error) {
        console.error('Error fetching products:', error);
        displayNotification('Failed to load product data. Please check console for details.', false);
        return [];
    }
}

/**
 * Updates the total price displayed based on current quantity and product price.
 */
function updateTotalPrice() {
    if (currentProduct && productTotalPriceElem && productQuantityInput) {
        selectedQuantity = parseInt(productQuantityInput.value, 10);
        
        if (isNaN(selectedQuantity) || selectedQuantity < (currentProduct.minOrder || 1)) {
            selectedQuantity = currentProduct.minOrder || 1;
        }
        if (selectedQuantity > (currentProduct.maxOrder || 10)) {
            selectedQuantity = currentProduct.maxOrder || 10;
        }
        productQuantityInput.value = selectedQuantity;

        const total = currentProduct.price * selectedQuantity;
        productTotalPriceElem.textContent = `$${total.toFixed(2)}`;
        console.log('Total price updated:', productTotalPriceElem.textContent);
    } else {
        console.warn('Could not update total price. Missing currentProduct, productTotalPriceElem, or productQuantityInput.');
    }
}

/**
 * Renders the product details onto the page.
 * @param {Object} product - The product object to render.
 */
function renderProductDetails(product) {
    console.log('Attempting to render product details for:', product ? product.name : 'null product');
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
        console.warn('Product object is null, displaying "Product Not Found" message.');
        return;
    }

    currentProduct = product;
    selectedQuantity = product.minOrder || 1;
    selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';

    // Update basic product info
    if (productNameElem) productNameElem.textContent = product.name;
    document.title = `${product.name} | iMall Kenya`;
    if (productDescriptionElem) productDescriptionElem.textContent = product.description;
    if (productCurrentPriceElem) productCurrentPriceElem.textContent = `$${product.price.toFixed(2)}`;
    if (productCategoryElem) productCategoryElem.textContent = product.category;
    if (productBrandElem) productBrandElem.textContent = product.brand;
    if (productFeaturesElem) productFeaturesElem.textContent = product.features.join(', ');
    if (productSkuElem) productSkuElem.textContent = product.sku;
    if (productShippingElem) productShippingElem.textContent = product.shipping;
    if (productDeliveryElem) productDeliveryElem.textContent = product.delivery;
    if (productMinOrderElem) productMinOrderElem.textContent = product.minOrder;
    if (productMaxOrderElem) productMaxOrderElem.textContent = product.maxOrder;

    if (productOriginalPriceElem) {
        if (product.originalPrice && product.originalPrice > product.price) {
            productOriginalPriceElem.textContent = `$${product.originalPrice.toFixed(2)}`;
            productOriginalPriceElem.style.display = 'inline';
        } else {
            productOriginalPriceElem.textContent = '';
            productOriginalPriceElem.style.display = 'none';
        }
    }

    // Rating
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
    } else {
        console.warn('One or more rating elements not found.');
    }


    // Stock
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
    } else {
        console.warn('Product stock or add to cart button element not found.');
    }


    // Quantity Input min/max
    if (productQuantityInput) {
        productQuantityInput.min = product.minOrder || 1;
        productQuantityInput.max = product.maxOrder || 10;
        productQuantityInput.value = selectedQuantity;
    } else {
        console.warn('Product quantity input not found.');
    }


    // Render Images
    if (productMainImage) {
        productMainImage.src = product.images[0] || PLACEHOLDER_IMAGE_PATH;
        productMainImage.alt = `${product.name} Main Image`;
        productMainImage.onerror = () => { handleImageError(productMainImage); };
    } else {
        console.warn('Product main image element not found.');
    }


    if (productThumbnailsContainer) {
        productThumbnailsContainer.innerHTML = '';
        product.images.forEach((imageSrc, index) => {
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
    } else {
        console.warn('Product thumbnails container not found.');
    }


    // Render Colors
    if (productColorSwatchesContainer && selectedColorTextElem) {
        productColorSwatchesContainer.innerHTML = '';
        selectedColorTextElem.textContent = selectedColor;

        product.colors.forEach((color, index) => {
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
    } else {
        console.warn('Product color swatches container or selected color text element not found.');
    }


    // Initial total price calculation
    updateTotalPrice();
}

// --- Main Execution Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded. Initializing product detail page...');
    updateCartCount(); // Ensure cart count is updated on page load

    const productId = getProductIdFromUrl();
    if (!productId) {
        console.error('No productId found in URL. Cannot load product details.');
        renderProductDetails(null); // Show product not found if no ID in URL
        return;
    }

    // Check if ALL_PRODUCTS is already defined (e.g., by imall.js or imall-category.js)
    if (typeof ALL_PRODUCTS === 'undefined' || ALL_PRODUCTS.length === 0) {
        console.log('ALL_PRODUCTS not found or empty, fetching from JSON.');
        ALL_PRODUCTS = await fetchAllProducts(); // Populate ALL_PRODUCTS from JSON
    } else {
        console.log('ALL_PRODUCTS already populated, skipping fetch.');
    }
    
    const product = ALL_PRODUCTS.find(p => p.id === productId);
    
    if (!product) {
        console.error(`Product with ID '${productId}' not found in ALL_PRODUCTS.`);
    }
    renderProductDetails(product);

    // Quantity controls event listeners
    if (decreaseQuantityBtn) {
        decreaseQuantityBtn.addEventListener('click', () => {
            let currentVal = parseInt(productQuantityInput.value, 10);
            if (!isNaN(currentVal) && currentVal > (currentProduct.minOrder || 1)) {
                productQuantityInput.value = currentVal - 1;
                updateTotalPrice();
            }
        });
    } else {
        console.warn('Decrease quantity button not found.');
    }

    if (increaseQuantityBtn) {
        increaseQuantityBtn.addEventListener('click', () => {
            let currentVal = parseInt(productQuantityInput.value, 10);
            if (!isNaN(currentVal) && currentVal < (currentProduct.maxOrder || 10)) {
                productQuantityInput.value = currentVal + 1;
                updateTotalPrice();
            }
        });
    } else {
        console.warn('Increase quantity button not found.');
    }

    if (productQuantityInput) {
        productQuantityInput.addEventListener('input', () => {
            let currentVal = parseInt(productQuantityInput.value, 10);
            if (isNaN(currentVal) || currentVal < (currentProduct.minOrder || 1)) {
                productQuantityInput.value = (currentProduct.minOrder || 1);
            } else if (currentVal > (currentProduct.maxOrder || 10)) {
                productQuantityInput.value = (currentProduct.maxOrder || 10);
            }
            updateTotalPrice();
        });
    }

    // Add to Cart button listener
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (currentProduct && currentProduct.inStock > 0) {
                addToCart(currentProduct, selectedQuantity);
            } else {
                displayNotification('This item is out of stock!', false);
            }
        });
    } else {
        console.warn('Add to cart button not found.');
    }
});
