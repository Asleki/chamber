// directory.js

document.addEventListener('DOMContentLoaded', () => {
    const membersDisplay = document.getElementById('members-display');
    const totalMembersCount = document.getElementById('total-members-count');
    const uniqueIndustriesCount = document.getElementById('unique-industries-count');
    const memberDetailModal = document.getElementById('member-detail-modal');
    const modalBody = memberDetailModal ? memberDetailModal.querySelector('#member-detail-body') : null;

    // Directory Controls
    const directorySearchInput = document.getElementById('directory-site-search');
    const directoryFilterCategory = document.getElementById('directory-filter-category');
    const directoryFilterLocation = document.getElementById('directory-filter-location');
    const directoryFilterSize = document.getElementById('directory-filter-size');
    const directorySortBy = document.getElementById('directory-sort-by');
    const directoryResetFiltersBtn = document.getElementById('directory-reset-filters');
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');

    // Load More Elements and Variables
    const loadMoreBtn = document.getElementById('load-more-members'); // Corrected ID to 'load-more-members'
    const initialLoadCount = 6;
    const loadIncrement = 3;
    const maxLoadCount = 18;
    let currentLoadedCount = 0;

    let allMembers = []; // Stores all fetched members
    let currentMembers = []; // Members currently displayed after filtering/sorting
    let currentView = 'grid'; // Default view for directory display

    // 1. Fetch Member Data
    async function fetchMembers() {
        try {
            const response = await fetch('data/members.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allMembers = await response.json();
            // Assigns unique IDs if not already present in JSON
            allMembers = allMembers.map((member, index) => ({ ...member, id: member.id || index + 1 }));

            // Populates filter options dynamically from data
            populateFilterOptions();

            // Sets initial load count
            currentLoadedCount = initialLoadCount;

            applyFiltersAndSort(); // Applies initial filters/sort and displays members
            updateDirectoryInsights();

        } catch (error) {
            console.error('Error fetching members:', error);
            if (membersDisplay) {
                membersDisplay.innerHTML = '<p class="error-message">Failed to load member data. Please try again later.</p>';
            }
        }
    }

    // Populates filter dropdowns based on fetched data
    function populateFilterOptions() {
        if (directoryFilterCategory) {
            const industries = [...new Set(allMembers.map(member => member.category))].sort(); // Uses 'category'
            industries.forEach(industry => {
                const option = document.createElement('option');
                option.value = industry;
                option.textContent = industry;
                directoryFilterCategory.appendChild(option);
            });
        }
        if (directoryFilterLocation) {
            const locations = [...new Set(allMembers.map(member => member.location))].sort();
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                directoryFilterLocation.appendChild(option);
            });
        }
        if (directoryFilterSize) {
            const sizes = [...new Set(allMembers.map(member => member.size))].sort(); // Uses 'size'
            sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                directoryFilterSize.appendChild(option);
            });
        }
    }

    // 2. Displays members by rendering cards or list items
    function displayMembers(membersToDisplay) {
        if (!membersDisplay) return;

        membersDisplay.innerHTML = ''; // Clears previous members

        membersDisplay.classList.remove('member-grid', 'member-list');
        membersDisplay.classList.add(currentView === 'grid' ? 'member-grid' : 'member-list');

        const membersToShow = membersToDisplay.slice(0, currentLoadedCount);

        if (membersToShow.length === 0) {
            membersDisplay.innerHTML = '<p class="no-results">No members found matching your criteria.</p>';
            const memberCountSpan = document.getElementById('member-count');
            if (memberCountSpan) memberCountSpan.textContent = '(Showing 0 Members)';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        membersToShow.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.classList.add('member-card');
            memberCard.classList.add(`membership-${member.membershipLevel.toLowerCase().replace(/\s/g, '-')}`);
            memberCard.setAttribute('data-id', member.id);

            memberCard.innerHTML = `
                <div class="card-header">
                    <img src="${member.imgSrc}" alt="${member.imgAlt}" class="member-logo">
                    <h3>${member.name}</h3>
                </div>
                <div class="card-body">
                    <p><strong>Category:</strong> ${member.category}</p>
                    <p><strong>Location:</strong> ${member.location}</p>
                    <p><strong>Address:</strong> ${member.address || 'N/A'}</p>
                    <p><strong>Membership Level:</strong> ${member.membershipLevel}</p>
                </div>
                <button class="btn btn-primary view-details-btn">View More Details</button>
            `;
            membersDisplay.appendChild(memberCard);
        });

        const memberCountSpan = document.getElementById('member-count');
        if (memberCountSpan) memberCountSpan.textContent = `(Showing ${membersToShow.length} of ${membersToDisplay.length} Members)`;

        // Manages Load More button visibility
        if (loadMoreBtn) {
            if (currentLoadedCount < membersToDisplay.length && currentLoadedCount < maxLoadCount) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
    }

    // 3. Updates directory insights (total members, unique industries)
    function updateDirectoryInsights() {
        if (totalMembersCount) {
            totalMembersCount.textContent = allMembers.length;
        }

        if (uniqueIndustriesCount) {
            const industries = new Set(allMembers.map(member => member.category));
            uniqueIndustriesCount.textContent = industries.size;
        }
    }

    // 4. Handles Member Detail Modal Functionality
    if (membersDisplay) {
        membersDisplay.addEventListener('click', (event) => {
            const viewDetailsBtn = event.target.closest('.view-details-btn');
            if (viewDetailsBtn) {
                const memberCard = viewDetailsBtn.closest('.member-card');
                const memberId = memberCard.getAttribute('data-id');
                const member = allMembers.find(m => m.id == memberId);

                if (member && memberDetailModal && modalBody) {
                    // Populates modal with concise member data and a "Visit Website" button
                    modalBody.innerHTML = `
                        <span class="close-button">&times;</span>
                        <img src="${member.imgSrc}" alt="${member.imgAlt}" class="modal-logo">
                        <h2>${member.name}</h2>
                        <p class="modal-slogan">${member.description || 'No slogan provided.'}</p>
                        <div class="modal-details">
                            <p><strong>Category:</strong> ${member.category}</p>
                            <p><strong>Location:</strong> ${member.location}</p>
                            <p><strong>Address:</strong> ${member.address || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${member.phone || 'N/A'}</p>
                            <p><strong>Website:</strong> <a href="http://${member.website}" target="_blank" rel="noopener noreferrer">${member.website}</a></p>
                            <p><strong>Membership Level:</strong> ${member.membershipLevel}</p>
                            ${member.foundingYear ? `<p><strong>Founded:</strong> ${member.foundingYear}</p>` : ''}
                            <p><strong>Description:</strong> ${member.fullDescription || 'No detailed description available.'}</p>
                        </div>
                        <div class="modal-buttons">
                            <a href="${member.link}" target="_blank" class="btn btn-primary">Visit Website</a>
                            <button class="btn btn-secondary close-button-bottom">Close</button>
                        </div>
                    `;
                    memberDetailModal.classList.add('active'); // Shows the modal

                    // Attaches close button listeners to buttons within the modal
                    const modalCloseButtons = modalBody.querySelectorAll('.close-button, .close-button-bottom');
                    modalCloseButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            memberDetailModal.classList.remove('active');
                        });
                    });
                }
            }
        });
    }

    // Closes Modal by clicking outside
    if (memberDetailModal) {
        memberDetailModal.addEventListener('click', (event) => {
            if (event.target === memberDetailModal) {
                memberDetailModal.classList.remove('active');
            }
        });
    }

    // Closes modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && memberDetailModal && memberDetailModal.classList.contains('active')) {
            memberDetailModal.classList.remove('active');
        }
    });

    // 5. Handles View Toggle (Grid/List)
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            currentView = 'grid';
            gridViewBtn.classList.add('active');
            if (listViewBtn) listViewBtn.classList.remove('active');
            displayMembers(currentMembers);
        });
    }

    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => {
            currentView = 'list';
            listViewBtn.classList.add('active');
            if (gridViewBtn) gridViewBtn.classList.remove('active');
            displayMembers(currentMembers);
        });
    }

    // 6. Handles Search, Filter, and Sort Controls
    function applyFiltersAndSort() {
        let filteredMembers = [...allMembers];

        // Applies search filter
        const searchTerm = directorySearchInput ? directorySearchInput.value.toLowerCase().trim() : '';
        if (searchTerm) {
            filteredMembers = filteredMembers.filter(member =>
                member.name.toLowerCase().includes(searchTerm) ||
                (member.description && member.description.toLowerCase().includes(searchTerm)) ||
                (member.category && member.category.toLowerCase().includes(searchTerm)) ||
                (member.location && member.location.toLowerCase().includes(searchTerm)) ||
                (member.fullDescription && member.fullDescription.toLowerCase().includes(searchTerm))
            );
        }

        // Applies category filter
        const categoryFilter = directoryFilterCategory ? directoryFilterCategory.value : '';
        if (categoryFilter && categoryFilter !== '') {
            filteredMembers = filteredMembers.filter(member =>
                member.category && member.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        // Applies location filter
        const locationFilter = directoryFilterLocation ? directoryFilterLocation.value : '';
        if (locationFilter && locationFilter !== '') {
            filteredMembers = filteredMembers.filter(member =>
                member.location && member.location.toLowerCase() === locationFilter.toLowerCase()
            );
        }

        // Applies business size filter
        const sizeFilter = directoryFilterSize ? directoryFilterSize.value : '';
        if (sizeFilter && sizeFilter !== '') {
            filteredMembers = filteredMembers.filter(member =>
                member.size && member.size.toLowerCase() === sizeFilter.toLowerCase()
            );
        }

        // Applies sorting
        const sortBy = directorySortBy ? directorySortBy.value : '';
        filteredMembers.sort((a, b) => {
            switch (sortBy) {
                case 'popularity-asc':
                    const popularityOrderAsc = { 'low': 1, 'medium': 2, 'high': 3 };
                    return (popularityOrderAsc[a.popularity?.toLowerCase()] || 0) - (popularityOrderAsc[b.popularity?.toLowerCase()] || 0);
                case 'popularity-desc':
                    const popularityOrderDesc = { 'low': 1, 'medium': 2, 'high': 3 };
                    return (popularityOrderDesc[b.popularity?.toLowerCase()] || 0) - (popularityOrderDesc[a.popularity?.toLowerCase()] || 0);
                case 'alphabetical-asc':
                    return a.name.localeCompare(b.name);
                case 'alphabetical-desc':
                    return b.name.localeCompare(a.name);
                case 'newest':
                    return (b.foundingYear || 0) - (a.foundingYear || 0);
                case 'membership-asc':
                    const levelOrderAsc = { 'member': 1, 'bronze': 1, 'silver': 2, 'gold': 3 };
                    return (levelOrderAsc[a.membershipLevel.toLowerCase()] || 0) - (levelOrderAsc[b.membershipLevel.toLowerCase()] || 0);
                case 'membership-desc':
                    const levelOrderDesc = { 'member': 1, 'bronze': 1, 'silver': 2, 'gold': 3 };
                    return (levelOrderDesc[b.membershipLevel.toLowerCase()] || 0) - (levelOrderDesc[a.membershipLevel.toLowerCase()] || 0);
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        currentMembers = filteredMembers;
        currentLoadedCount = initialLoadCount; // Resets loaded count when filters/sort change
        displayMembers(currentMembers);
    }

    // Attaches event listeners to filter/sort controls
    if (directorySearchInput) directorySearchInput.addEventListener('input', applyFiltersAndSort);
    if (directoryFilterCategory) directoryFilterCategory.addEventListener('change', applyFiltersAndSort);
    if (directoryFilterLocation) directoryFilterLocation.addEventListener('change', applyFiltersAndSort);
    if (directoryFilterSize) directoryFilterSize.addEventListener('change', applyFiltersAndSort);
    if (directorySortBy) directorySortBy.addEventListener('change', applyFiltersAndSort);

    // Resets Filters Button functionality
    if (directoryResetFiltersBtn) {
        directoryResetFiltersBtn.addEventListener('click', () => {
            if (directorySearchInput) directorySearchInput.value = '';
            if (directoryFilterCategory) directoryFilterCategory.value = '';
            if (directoryFilterLocation) directoryFilterLocation.value = '';
            if (directoryFilterSize) directoryFilterSize.value = '';
            if (directorySortBy) directorySortBy.value = 'alphabetical-asc';
            applyFiltersAndSort();
        });
    }

    // Load More Button Event Listener
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentLoadedCount += loadIncrement;
            currentLoadedCount = Math.min(currentLoadedCount, currentMembers.length, maxLoadCount);
            displayMembers(currentMembers);
        });
    }

    // Initial Load for Directory Features
    if (membersDisplay) {
        fetchMembers();
    }
});