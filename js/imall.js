// js/imall.js

document.addEventListener('DOMContentLoaded', async () => {
    // Path to your product data JSON file
    const jsonFilePath = 'data/imall-products.json';
    let allProducts = []; // Global array to hold all fetched products

    // --- DOM Element References ---
    const categoriesDropdownMenu = document.getElementById('categories-dropdown-menu');
    const brandsDropdownMenu = document.getElementById('brands-dropdown-menu');
    const categoriesDropdownToggle = document.getElementById('categories-dropdown-toggle');
    const brandsDropdownToggle = document.getElementById('brands-dropdown-toggle');
    const topBrandsContainer = document.getElementById('top-brands-container');
    const hotPicksContainer = document.getElementById('hot-picks-container');
    const featuredProductsContainer = document.getElementById('featured-products-container');
    const imallProductSearchInput = document.getElementById('imall-product-search');
    const imallProductSearchSuggestions = document.getElementById('imall-product-search-suggestions');
    const cartItemCountSpan = document.getElementById('cart-item-count');
    const heroSlides = document.querySelectorAll('.hero-slide');
    const backToTopButton = document.getElementById('back-to-top');

    // --- Constants ---
    const SLIDE_INTERVAL = 5000; // 5 seconds for hero carousel
    const CART_KEY = 'imall_cart_items'; // Key for localStorage cart data

    let currentSlide = 0;
    let searchTimeout;

    // --- Utility Functions ---

    /**
     * Fetches product data from a JSON file. Prices will remain in USD as per the JSON.
     * @returns {Promise<Array>} A promise that resolves to an array of product objects.
     */
    async function fetchProducts() {
        try {
            const response = await fetch(jsonFilePath);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${jsonFilePath}`);
                throw new Error('Failed to load product data.');
            }
            const products = await response.json();
            // IMPORTANT: Prices are now intentionally NOT converted here.
            // They remain in USD as they are fetched from the JSON.
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            // Display user-friendly error messages in relevant sections
            [hotPicksContainer, featuredProductsContainer].forEach(container => {
                if (container) container.innerHTML = '<p class="error-message">Could not load products. Please check your connection or try again later.</p>';
            });
            return []; // Return empty array to prevent further JS errors
        }
    }

    /**
     * Creates an HTML product card element based on product data.
     * Prices will be displayed in USD ($).
     * @param {Object} product - The product data object.
     * @returns {HTMLElement} The created product card div.
     */
    function createProductCard(product) {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Make the whole card clickable to view product details
        productCard.addEventListener('click', () => {
            window.location.href = `imall-product-detail.html?id=${product.id}`;
        });

        // Sale Badge
        if (product.isDiscounted && product.originalPrice > product.price) {
            const saleBadge = document.createElement('span');
            saleBadge.classList.add('sale-badge');
            const discountPercent = ((product.originalPrice - product.price) / product.originalPrice) * 100;
            saleBadge.textContent = `Sale! ${Math.round(discountPercent)}% Off`;
            productCard.appendChild(saleBadge);
        }

        // Product Image
        const productImage = document.createElement('img');
        productImage.src = product.images[0] || 'images/placeholder.webp'; // Use first image or a placeholder
        productImage.alt = product.name;
        productImage.classList.add('product-image');
        productCard.appendChild(productImage);

        const cardContent = document.createElement('div');
        cardContent.classList.add('product-card-content');

        // Brand Logo
        if (product.brandLogo) {
            const brandLogo = document.createElement('img');
            brandLogo.src = product.brandLogo;
            brandLogo.alt = `${product.brand} Logo`;
            brandLogo.classList.add('brand-logo');
            cardContent.appendChild(brandLogo);
        }

        // Product Title
        const productTitle = document.createElement('h4');
        productTitle.classList.add('product-title');
        productTitle.textContent = product.name;
        cardContent.appendChild(productTitle);

        // Product Description (shortened for card view)
        const productDescription = document.createElement('p');
        productDescription.classList.add('product-description');
        productDescription.textContent = product.description;
        cardContent.appendChild(productDescription);

        // Price Info
        const priceInfo = document.createElement('div');
        priceInfo.classList.add('price-info');
        const currentPrice = document.createElement('span');
        currentPrice.classList.add('current-price');
        // Displaying price in USD ($)
        currentPrice.textContent = `$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        priceInfo.appendChild(currentPrice);

        if (product.isDiscounted && product.originalPrice > product.price) {
            const originalPrice = document.createElement('span');
            originalPrice.classList.add('original-price');
            // Displaying original price in USD ($)
            originalPrice.textContent = `$${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            priceInfo.appendChild(originalPrice);
        }
        cardContent.appendChild(priceInfo);

        // Rating and Reviews
        const ratingDiv = document.createElement('div');
        ratingDiv.classList.add('rating');
        const starsDiv = document.createElement('span');
        starsDiv.classList.add('stars');
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.classList.add('fa-star');
            if (i <= Math.round(product.rating)) {
                star.classList.add('fas'); // Solid star
            } else {
                star.classList.add('far'); // Empty star
            }
            starsDiv.appendChild(star);
        }
        ratingDiv.appendChild(starsDiv);
        const reviewsText = document.createElement('span');
        reviewsText.textContent = `(${product.reviewsCount.toLocaleString()} reviews)`;
        ratingDiv.appendChild(reviewsText);
        cardContent.appendChild(ratingDiv);

        // Stock Info
        const stockInfo = document.createElement('p');
        stockInfo.classList.add('stock-info');
        if (product.inStock > 0) {
            stockInfo.textContent = `In Stock (${product.inStock})`;
            stockInfo.style.color = 'var(--success-color)';
        } else {
            stockInfo.textContent = 'Out of Stock';
            stockInfo.style.color = 'var(--sale-badge-color)';
        }
        cardContent.appendChild(stockInfo);

        // Add to Cart Button
        const addToCartBtn = document.createElement('button');
        addToCartBtn.classList.add('add-to-cart-btn');
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.setAttribute('data-product-id', product.id);
        if (product.inStock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Out of Stock';
        }
        addToCartBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the parent card's click event
            addToCart(product);
        });
        cardContent.appendChild(addToCartBtn);

        productCard.appendChild(cardContent);
        return productCard;
    }

    /**
     * Renders an array of product cards into a specified HTML container.
     * @param {Array} products - The array of product objects to render.
     * @param {HTMLElement} container - The DOM element where product cards will be appended.
     * @param {number} [limit=Infinity] - Optional: maximum number of products to render.
     */
    function renderProducts(products, container, limit = Infinity) {
        if (!container) {
            console.warn('Target container for products not found:', container);
            return;
        }
        container.innerHTML = ''; // Clear previous content

        const productsToRender = products.slice(0, limit); // Apply limit

        if (productsToRender.length === 0) {
            container.innerHTML = '<p class="info-message">No products found in this selection.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const card = createProductCard(product);
            container.appendChild(card);
        });
    }

    // --- Navigation & Dropdown Logic (No changes needed here) ---

    /**
     * Sets up a dropdown menu, populating its content and handling its display logic.
     * @param {HTMLElement} toggleElement - The element that triggers the dropdown.
     * @param {HTMLElement} menuElement - The dropdown menu element itself.
     * @param {Function} contentGenerator - A function that populates the menuElement's content.
     */
    function setupDropdown(toggleElement, menuElement, contentGenerator) {
        if (!toggleElement || !menuElement) return;

        // Populate the menu content
        contentGenerator(menuElement);

        // Toggle on click
        toggleElement.addEventListener('click', (event) => {
            event.preventDefault();
            // Close other open dropdowns first
            document.querySelectorAll('.imall-dropdown-menu.active').forEach(openMenu => {
                if (openMenu !== menuElement) {
                    openMenu.classList.remove('active');
                }
            });
            menuElement.classList.toggle('active');
        });

        // Close when clicking outside the dropdown or its toggle
        document.addEventListener('click', (event) => {
            if (!toggleElement.contains(event.target) && !menuElement.contains(event.target)) {
                menuElement.classList.remove('active');
            }
        });
    }

    /**
     * Generates and populates the categories dropdown menu.
     * @param {HTMLElement} menuElement - The ul element for the categories dropdown.
     */
    function generateCategoriesDropdown(menuElement) {
        const categoriesMap = new Map(); // Map: 'Category' -> Set<Subcategories>

        allProducts.forEach(product => {
            if (!categoriesMap.has(product.category)) {
                categoriesMap.set(product.category, new Set());
            }
            if (product.subCategory && product.subCategory !== product.category) { // Ensure subcategory is distinct
                categoriesMap.get(product.category).add(product.subCategory);
            }
        });

        menuElement.innerHTML = ''; // Clear existing items

        for (const [category, subcategories] of categoriesMap.entries()) {
            const categoryItem = document.createElement('li');
            const categoryLink = document.createElement('a');
            categoryLink.href = `imall-category.html?category=${encodeURIComponent(category)}`;
            categoryLink.textContent = category;
            categoryLink.classList.add('category-main'); // Bold via CSS
            categoryItem.appendChild(categoryLink);

            if (subcategories.size > 0) {
                const subcategoryList = document.createElement('ul');
                subcategories.forEach(sub => {
                    const subItem = document.createElement('li');
                    const subLink = document.createElement('a');
                    subLink.href = `imall-category.html?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(sub)}`;
                    subLink.textContent = sub;
                    subLink.classList.add('subcategory-link'); // Indent via CSS
                    subItem.appendChild(subLink);
                    subcategoryList.appendChild(subItem);
                });
                categoryItem.appendChild(subcategoryList);
            }
            menuElement.appendChild(categoryItem);
        }
    }

    /**
     * Generates and populates the brands dropdown menu.
     * @param {HTMLElement} menuElement - The ul element for the brands dropdown.
     */
    function generateBrandsDropdown(menuElement) {
        const brands = new Set(allProducts.map(p => p.brand).filter(Boolean)); // Get unique brands

        menuElement.innerHTML = ''; // Clear existing items

        Array.from(brands).sort().forEach(brand => { // Sort brands alphabetically
            const brandItem = document.createElement('li');
            const brandLink = document.createElement('a');
            brandLink.href = `imall-category.html?brand=${encodeURIComponent(brand)}`;
            brandLink.textContent = brand;
            brandItem.appendChild(brandLink);
            menuElement.appendChild(brandItem);
        });
    }

    // --- Hero Carousel Logic (No changes needed here) ---

    /**
     * Displays a specific slide in the hero carousel.
     * @param {number} index - The index of the slide to show.
     */
    function showSlide(index) {
        heroSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    /** Advances the hero carousel to the next slide. */
    function nextSlide() {
        currentSlide = (currentSlide + 1) % heroSlides.length;
        showSlide(currentSlide);
    }

    // --- Top Brands Section (No changes needed here) ---

    /** Renders the top brands section with unique brand logos and names in cards. */
    function renderTopBrands() {
        if (!topBrandsContainer) return;

        const uniqueBrands = new Map(); // Map: brandName -> {logo, count}

        allProducts.forEach(product => {
            if (product.brand && product.brandLogo) {
                if (!uniqueBrands.has(product.brand)) {
                    uniqueBrands.set(product.brand, { logo: product.brandLogo, count: 0 });
                }
                uniqueBrands.get(product.brand).count++;
            }
        });

        // Convert to array, filter out brands with low count if desired, sort, then pick top N
        const sortedBrands = Array.from(uniqueBrands.entries())
            .sort((a, b) => b[1].count - a[1].count) // Sort by popularity (item count)
            .slice(0, 12); // Display top 12 brands (can be adjusted)

        topBrandsContainer.innerHTML = '';
        sortedBrands.forEach(([brandName, data]) => {
            const brandCard = document.createElement('a');
            brandCard.href = `imall-category.html?brand=${encodeURIComponent(brandName)}`;
            brandCard.classList.add('brand-card');

            const brandImg = document.createElement('img');
            brandImg.src = data.logo;
            brandImg.alt = `${brandName} Logo`;
            brandCard.appendChild(brandImg);

            const brandNameSpan = document.createElement('span');
            brandNameSpan.textContent = brandName;
            brandCard.appendChild(brandNameSpan);

            topBrandsContainer.appendChild(brandCard);
        });
    }

    // --- Search Bar Suggestions Logic (No changes needed here) ---

    imallProductSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = imallProductSearchInput.value.toLowerCase().trim();
        imallProductSearchSuggestions.innerHTML = ''; // Clear previous suggestions

        if (query.length < 2) { // Minimum characters for suggestions
            imallProductSearchSuggestions.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(() => {
            const suggestions = allProducts.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            ).slice(0, 8); // Limit to 8 suggestions for brevity

            if (suggestions.length === 0) {
                imallProductSearchSuggestions.style.display = 'none';
                return;
            }

            suggestions.forEach(product => {
                const item = document.createElement('div');
                item.classList.add('suggestion-item');
                item.innerHTML = `<img src="${product.images[0]}" alt="${product.name}"> ${product.name} <br><span>${product.brand} - $${product.price.toFixed(2)}</span>`; // Show price in USD in suggestions too
                item.addEventListener('click', () => {
                    window.location.href = `imall-product-detail.html?id=${product.id}`;
                    imallProductSearchSuggestions.style.display = 'none';
                    imallProductSearchInput.value = ''; // Clear input after selection
                });
                imallProductSearchSuggestions.appendChild(item);
            });
            imallProductSearchSuggestions.style.display = 'block';

        }, 300); // Debounce search input to prevent too many calls
    });

    // Close suggestions when clicking anywhere outside the search bar/suggestions
    document.addEventListener('click', (event) => {
        if (!imallProductSearchInput.contains(event.target) && !imallProductSearchSuggestions.contains(event.target)) {
            imallProductSearchSuggestions.style.display = 'none';
        }
    });

    // --- Cart Management (Client-Side using localStorage) ---

    /**
     * Retrieves cart items from localStorage.
     * IMPORTANT: Cart items will store price in USD as well for consistency with display.
     * Conversion to KSh for final payment processing should happen at checkout or on detail page.
     * @returns {Array} An array of cart item objects.
     */
    function getCartItems() {
        try {
            const cartItemsJson = localStorage.getItem(CART_KEY);
            return cartItemsJson ? JSON.parse(cartItemsJson) : [];
        } catch (e) {
            console.error("Failed to parse cart items from localStorage:", e);
            return [];
        }
    }

    /**
     * Saves cart items to localStorage and updates the cart count display.
     * @param {Array} cartItems - The array of cart item objects to save.
     */
    function saveCartItems(cartItems) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
            updateCartCount();
        } catch (e) {
            console.error("Failed to save cart items to localStorage:", e);
        }
    }

    /**
     * Adds a product to the cart or updates its quantity if already present.
     * Prices stored in cart will be in USD.
     * @param {Object} product - The product object to add.
     */
    function addToCart(product) {
        let cartItems = getCartItems();
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            // Check if adding exceeds available stock (simple client-side check)
            if (cartItems[existingItemIndex].quantity < product.inStock) {
                cartItems[existingItemIndex].quantity++;
                alert(`Added another "${product.name}" to cart!`);
            } else {
                alert(`Cannot add more "${product.name}". Maximum stock reached!`);
            }
        } else {
            // Only add if product is in stock
            if (product.inStock > 0) {
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    // Store price in USD as it is in the product data
                    price: product.price,
                    image: product.images[0],
                    quantity: 1
                });
                alert(`"${product.name}" added to cart!`);
            } else {
                alert(`"${product.name}" is currently out of stock.`);
            }
        }
        saveCartItems(cartItems);
    }

    /** Updates the displayed count of items in the cart icon. */
    function updateCartCount() {
        const cartItems = getCartItems();
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemCountSpan) {
            cartItemCountSpan.textContent = totalCount;
        }
    }

    // --- Back to Top Button Logic (No changes needed here) ---
    window.addEventListener('scroll', () => {
        if (backToTopButton) {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        }
    });

    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll to top
            });
        });
    }

    // --- Main Initialization Function ---

    async function initImallPage() {
        // 1. Fetch all product data (prices now remain in USD)
        allProducts = await fetchProducts();

        if (allProducts.length > 0) {
            // 2. Setup Navigation Dropdowns
            setupDropdown(categoriesDropdownToggle, categoriesDropdownMenu, generateCategoriesDropdown);
            setupDropdown(brandsDropdownToggle, brandsDropdownMenu, generateBrandsDropdown);

            // 3. Render Product Sections
            const hotPicks = allProducts.filter(p => p.isHotPick);
            renderProducts(hotPicks, hotPicksContainer, 8); // Display up to 8 hot picks

            const featuredProducts = allProducts.filter(p => p.isFeatured);
            renderProducts(featuredProducts, featuredProductsContainer, 8); // Display up to 8 featured products

            renderTopBrands(); // Render the top brands section
        }

        // 4. Start Hero Carousel (if slides exist)
        if (heroSlides.length > 0) {
            showSlide(currentSlide); // Show the first slide immediately
            setInterval(nextSlide, SLIDE_INTERVAL); // Start auto-advance
        }

        // 5. Update Cart Count on page load
        updateCartCount();
    }

    // Run the main initialization function when the DOM is ready
    initImallPage();
});