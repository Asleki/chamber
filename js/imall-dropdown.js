// js/imall-dropdown.js

let ALL_CATEGORIES_FOR_DROPDOWN = [];
let ALL_BRANDS_FOR_DROPDOWN = [];

document.addEventListener('DOMContentLoaded', () => {
    const categoriesNavLink = document.getElementById('categories-nav-link');
    const categoriesDropdown = document.getElementById('categories-dropdown');
    const brandsNavLink = document.getElementById('brands-nav-link'); // New
    const brandsDropdown = document.getElementById('brands-dropdown'); // New

    if (!categoriesNavLink || !categoriesDropdown || !brandsNavLink || !brandsDropdown) {
        console.error('One or more dropdown elements not found. Cannot initialize imall-dropdown.js');
        return;
    }

    // --- Data Fetching and Processing ---
    async function fetchDropdownData() {
        try {
            const productsResponse = await fetch('data/imall-products.json');
            if (!productsResponse.ok) {
                throw new Error(`HTTP error! status: ${productsResponse.status}`);
            }
            const allProducts = await productsResponse.json();

            // Process Categories
            const uniqueCategoriesMap = {};
            allProducts.forEach(p => {
                if (p.category) {
                    if (!uniqueCategoriesMap[p.category]) {
                        uniqueCategoriesMap[p.category] = { name: p.category, subCategories: new Set() };
                    }
                    if (p.subCategory) {
                        uniqueCategoriesMap[p.category].subCategories.add(p.subCategory);
                    }
                }
            });
            ALL_CATEGORIES_FOR_DROPDOWN = Object.values(uniqueCategoriesMap).map(cat => ({
                ...cat,
                subCategories: Array.from(cat.subCategories).sort()
            })).sort((a, b) => a.name.localeCompare(b.name));

            // Process Brands
            const uniqueBrandsSet = new Set();
            allProducts.forEach(p => {
                if (p.brand) {
                    uniqueBrandsSet.add(p.brand);
                }
            });
            ALL_BRANDS_FOR_DROPDOWN = Array.from(uniqueBrandsSet).sort((a, b) => a.localeCompare(b));

            populateDropdowns(); // Populate both dropdowns after data is fetched
        } catch (error) {
            console.error('Failed to load iMall dropdown data:', error);
            categoriesDropdown.innerHTML += '<p class="p-2 text-red-600">Failed to load categories.</p>';
            brandsDropdown.innerHTML += '<p class="p-2 text-red-600">Failed to load brands.</p>';
        }
    }

    // --- Populate Dropdowns ---
    function populateDropdowns() {
        // Populate Categories
        categoriesDropdown.innerHTML = '<a href="./imall-category.html?category=all" class="font-bold">All Categories</a>';
        ALL_CATEGORIES_FOR_DROPDOWN.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = `./imall-category.html?category=${encodeURIComponent(category.name)}`;
            categoryLink.textContent = category.name;
            categoriesDropdown.appendChild(categoryLink);

            if (category.subCategories && category.subCategories.length > 0) {
                category.subCategories.forEach(sub => {
                    const subCategoryLink = document.createElement('a');
                    subCategoryLink.href = `./imall-category.html?category=${encodeURIComponent(category.name)}&subCategory=${encodeURIComponent(sub)}`;
                    subCategoryLink.textContent = ` -- ${sub}`;
                    subCategoryLink.classList.add('text-sm', 'pl-4');
                    categoriesDropdown.appendChild(subCategoryLink);
                });
            }
        });

        // Populate Brands
        brandsDropdown.innerHTML = '<a href="./imall-category.html?section=brands" class="font-bold">All Brands</a>';
        ALL_BRANDS_FOR_DROPDOWN.forEach(brandName => {
            const brandLink = document.createElement('a');
            brandLink.href = `./imall-category.html?brand=${encodeURIComponent(brandName)}`;
            brandLink.textContent = brandName;
            brandsDropdown.appendChild(brandLink);
        });
    }

    // --- Dropdown Toggle Logic ---
    let activeDropdown = null; // To keep track of the currently open dropdown

    function toggleDropdown(dropdownElement, navLinkElement) {
        // Close other open dropdowns if any
        if (activeDropdown && activeDropdown !== dropdownElement) {
            activeDropdown.classList.remove('active');
        }

        dropdownElement.classList.toggle('active');
        if (dropdownElement.classList.contains('active')) {
            activeDropdown = dropdownElement;
        } else {
            activeDropdown = null;
        }
    }

    // Event listeners for click
    categoriesNavLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        toggleDropdown(categoriesDropdown, categoriesNavLink);
    });

    brandsNavLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        toggleDropdown(brandsDropdown, brandsNavLink);
    });

    // Hide dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        if (activeDropdown &&
            !categoriesNavLink.contains(event.target) && !categoriesDropdown.contains(event.target) &&
            !brandsNavLink.contains(event.target) && !brandsDropdown.contains(event.target)
        ) {
            activeDropdown.classList.remove('active');
            activeDropdown = null;
        }
    });

    // --- Initial Data Load ---
    fetchDropdownData();
});