// imall-category.js

// This script assumes that 'products' data is available globally or fetched by imall.js
// And that createProductCard function is also available globally (from imall.js)

document.addEventListener('DOMContentLoaded', () => {
    // Ensure allProducts is available from imall.js
    if (typeof allProducts === 'undefined' || !allProducts.length) {
        console.warn('allProducts array not found or is empty. Make sure imall.js fetches and exposes product data.');
        // Optionally, fetch products here if imall.js doesn't provide them
        // fetch('/api/products') .then(res => res.json()) .then(data => { allProducts = data; initializeCategoryPage(); });
        return; 
    }

    const productGrid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('category-title');
    const currentCategoryBreadcrumb = document.getElementById('current-category-breadcrumb');
    const brandFiltersContainer = document.getElementById('brand-filters');
    const sortBySelect = document.getElementById('sort-by');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyPriceFilterBtn = document.getElementById('apply-price-filter');
    const ratingFilters = document.querySelectorAll('#rating-filters input[type="checkbox"]');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const noProductsMessage = document.getElementById('no-products-message');
    const loadMoreBtn = document.getElementById('load-more-btn');

    let currentFilters = {
        category: '',
        subCategory: '',
        brand: [],
        minPrice: null,
        maxPrice: null,
        minRating: null,
        deal: false,
        new: false,
        hotpick: false,
        featured: false
    };

    let currentSort = sortBySelect.value;
    const productsPerPage = 12; // Number of products to show initially and load more
    let currentPage = 1;
    let filteredAndSortedProducts = [];

    /**
     * Extracts URL parameters to set initial filters.
     */
    function parseUrlParameters() {
        const params = new URLSearchParams(window.location.search);
        
        // Handle direct category or subCategory
        if (params.has('category')) {
            currentFilters.category = params.get('category');
        }
        if (params.has('subCategory')) {
            currentFilters.subCategory = params.get('subCategory');
        }
        // Handle brand from URL if it's a single brand link
        if (params.has('brand')) {
            currentFilters.brand = [params.get('brand')];
        }

        // Handle special flags
        currentFilters.deal = params.has('deal') && params.get('deal') === 'true';
        currentFilters.new = params.has('new') && params.get('new') === 'true';
        currentFilters.hotpick = params.has('hotpick') && params.get('hotpick') === 'true';
        currentFilters.featured = params.has('featured') && params.get('featured') === 'true';

        // Set breadcrumb and title based on URL
        let titleText = 'All Products';
        let breadcrumbText = 'All Products';

        if (currentFilters.category) {
            titleText = currentFilters.category;
            breadcrumbText = currentFilters.category;
        }
        if (currentFilters.subCategory) {
            titleText = currentFilters.subCategory;
            breadcrumbText = `${currentFilters.category || 'Category'} / ${currentFilters.subCategory}`;
        }
        if (currentFilters.brand.length > 0) {
            titleText = currentFilters.brand[0];
            breadcrumbText = `${breadcrumbText ? breadcrumbText + ' / ' : ''}${currentFilters.brand[0]}`;
        }
        if (currentFilters.deal) {
            titleText = 'Today\'s Deals';
            breadcrumbText = `${breadcrumbText ? breadcrumbText + ' / ' : ''}Deals`;
        }
        if (currentFilters.new) {
            titleText = 'New Arrivals';
            breadcrumbText = `${breadcrumbText ? breadcrumbText + ' / ' : ''}New Arrivals`;
        }
        if (currentFilters.hotpick) {
            titleText = 'Hot Picks';
            breadcrumbText = `${breadcrumbText ? breadcrumbText + ' / ' : ''}Hot Picks`;
        }
        if (currentFilters.featured) {
            titleText = 'Featured Products';
            breadcrumbText = `${breadcrumbText ? breadcrumbText + ' / ' : ''}Featured Products`;
        }

        categoryTitle.textContent = `Products in ${titleText}`;
        currentCategoryBreadcrumb.textContent = breadcrumbText;
    }

    /**
     * Filters products based on currentFilters state.
     * @returns {Array} The filtered array of products.
     */
    function filterProducts() {
        return allProducts.filter(product => {
            let matchesCategory = true;
            let matchesSubCategory = true;
            let matchesBrand = true;
            let matchesPrice = true;
            let matchesRating = true;
            let matchesSpecialFlag = true;

            // Category filter
            if (currentFilters.category && product.category !== currentFilters.category) {
                matchesCategory = false;
            }
            // Sub-category filter
            if (currentFilters.subCategory && product.subCategory !== currentFilters.subCategory) {
                matchesSubCategory = false;
            }
            // Brand filter
            if (currentFilters.brand.length > 0 && !currentFilters.brand.includes(product.brand)) {
                matchesBrand = false;
            }
            // Price filter
            if (currentFilters.minPrice !== null && product.price < currentFilters.minPrice) {
                matchesPrice = false;
            }
            if (currentFilters.maxPrice !== null && product.price > currentFilters.maxPrice) {
                matchesPrice = false;
            }
            // Rating filter
            if (currentFilters.minRating !== null && product.rating < currentFilters.minRating) {
                matchesRating = false;
            }
            // Special flags
            if (currentFilters.deal && !product.isDeal) {
                matchesSpecialFlag = false;
            }
            if (currentFilters.new && !product.isNew) {
                matchesSpecialFlag = false;
            }
            if (currentFilters.hotpick && !product.isHotPick) {
                matchesSpecialFlag = false;
            }
            if (currentFilters.featured && !product.isFeatured) {
                matchesSpecialFlag = false;
            }


            return matchesCategory && matchesSubCategory && matchesBrand && matchesPrice && matchesRating && matchesSpecialFlag;
        });
    }

    /**
     * Sorts products based on currentSort state.
     * @param {Array} productsToSort - The array of products to sort.
     * @returns {Array} The sorted array of products.
     */
    function sortProducts(productsToSort) {
        return [...productsToSort].sort((a, b) => {
            switch (currentSort) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                default:
                    return 0; // No specific sort
            }
        });
    }

    /**
     * Renders products to the grid.
     * @param {Array} productsToRender - The products to display.
     * @param {boolean} append - If true, appends products; otherwise, replaces.
     */
    function renderProducts(productsToRender, append = false) {
        if (!append) {
            productGrid.innerHTML = '';
            currentPage = 1;
        }

        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToDisplay = productsToRender.slice(startIndex, endIndex);

        if (productsToDisplay.length === 0 && !append) {
            noProductsMessage.style.display = 'block';
            loadMoreBtn.style.display = 'none';
            return;
        } else {
            noProductsMessage.style.display = 'none';
        }

        productsToDisplay.forEach(product => {
            const productCard = createProductCard(product); // Use createProductCard from imall.js
            productGrid.appendChild(productCard);
        });

        // Show/hide load more button
        if (endIndex < productsToRender.length) {
            loadMoreBtn.style.display = 'block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    /**
     * Updates and re-renders the product grid based on current filters and sort.
     */
    function updateProductDisplay() {
        filteredAndSortedProducts = sortProducts(filterProducts());
        renderProducts(filteredAndSortedProducts);
    }

    /**
     * Populates the brand filter checkboxes dynamically.
     */
    function populateBrandFilters() {
        const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
        brandFiltersContainer.innerHTML = ''; // Clear existing filters

        uniqueBrands.forEach(brand => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `brand-${brand.replace(/\s/g, '-')}`;
            checkbox.value = brand;
            if (currentFilters.brand.includes(brand)) {
                checkbox.checked = true;
            }
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = brand;

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    currentFilters.brand.push(brand);
                } else {
                    currentFilters.brand = currentFilters.brand.filter(b => b !== brand);
                }
                updateProductDisplay();
            });

            li.appendChild(checkbox);
            li.appendChild(label);
            brandFiltersContainer.appendChild(li);
        });
    }

    /**
     * Sets up all event listeners for filters and sorting.
     */
    function setupEventListeners() {
        // Sort by dropdown
        sortBySelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            updateProductDisplay();
        });

        // Price range filter
        applyPriceFilterBtn.addEventListener('click', () => {
            currentFilters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
            currentFilters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
            updateProductDisplay();
        });

        // Rating filters
        ratingFilters.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Get all checked ratings and find the minimum
                const checkedRatings = Array.from(ratingFilters)
                                            .filter(cb => cb.checked)
                                            .map(cb => parseInt(cb.value));
                currentFilters.minRating = checkedRatings.length > 0 ? Math.min(...checkedRatings) : null;
                updateProductDisplay();
            });
        });

        // Clear all filters
        clearFiltersBtn.addEventListener('click', () => {
            // Reset currentFilters
            currentFilters = {
                category: currentFilters.category, // Keep initial category from URL
                subCategory: currentFilters.subCategory, // Keep initial subCategory from URL
                brand: [],
                minPrice: null,
                maxPrice: null,
                minRating: null,
                deal: currentFilters.deal, // Keep initial deal from URL
                new: currentFilters.new,   // Keep initial new from URL
                hotpick: currentFilters.hotpick, // Keep initial hotpick from URL
                featured: currentFilters.featured // Keep initial featured from URL
            };

            // Reset UI elements
            minPriceInput.value = '';
            maxPriceInput.value = '';
            ratingFilters.forEach(cb => cb.checked = false);
            // Re-populate brands to uncheck them
            populateBrandFilters(); 
            
            updateProductDisplay();
        });

        // Load More button
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderProducts(filteredAndSortedProducts, true); // Append products
        });
    }

    /**
     * Initializes the category page by parsing URL, populating filters, and rendering products.
     */
    function initializeCategoryPage() {
        parseUrlParameters();
        populateBrandFilters();
        setupEventListeners();
        updateProductDisplay(); // Initial render
    }

    // Call the initialization function
    initializeCategoryPage();
});