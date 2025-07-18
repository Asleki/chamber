// js/clubs.js

document.addEventListener('DOMContentLoaded', () => {
    const clubsContainer = document.getElementById('clubs-container');
    const loadMoreBtn = document.getElementById('load-more-clubs-btn');
    const loadingMessage = document.getElementById('clubs-loading-message');
    const errorMessage = document.getElementById('clubs-error-message');
    const clubSearchInput = document.getElementById('club-search');
    const searchSuggestionsClubs = document.getElementById('search-suggestions-clubs');
    const sortClubs = document.getElementById('sort-clubs');

    let allClubs = []; // Stores all fetched clubs
    let filteredAndSortedClubs = []; // Clubs currently being displayed after filters/sort
    let currentIndex = 0;
    const CLUBS_PER_LOAD = 6; // Number of clubs to load at a time

    /**
     * Creates and returns a club card element.
     * @param {object} club - Club data from clubs.json.
     * @returns {HTMLElement} The created club card div element.
     */
    function createClubCard(club) {
        const clubCard = document.createElement('div');
        clubCard.classList.add('club-card');

        clubCard.innerHTML = `
            <img src="${club.image}" alt="${club.name} Logo">
            <h3>${club.name}</h3>
            <p class="club-description">${club.description}</p>
            <div class="club-meta">
                <div><i class="fas fa-users"></i> Members: ${club.details.membersCount}</div>
                <div><i class="fas fa-calendar-alt"></i> ${club.details.frequency}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${club.details.location}</div>
            </div>
            <a href="join-club.html?clubId=${club.id}" class="cta-button">Learn More & Join</a>
        `;
        return clubCard;
    }

    /**
     * Displays a batch of filtered and sorted clubs on the page.
     */
    function displayClubs() {
        const clubsToDisplay = filteredAndSortedClubs.slice(currentIndex, currentIndex + CLUBS_PER_LOAD);

        clubsToDisplay.forEach(club => {
            const clubCard = createClubCard(club);
            clubsContainer.appendChild(clubCard);
        });

        currentIndex += clubsToDisplay.length;

        // Show/hide load more button
        if (currentIndex < filteredAndSortedClubs.length) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }

        if (filteredAndSortedClubs.length === 0 && currentIndex === 0) {
            errorMessage.textContent = 'No clubs match your current search.';
            errorMessage.classList.remove('hidden');
            clubsContainer.classList.add('hidden');
        } else {
            errorMessage.classList.add('hidden');
            clubsContainer.classList.remove('hidden');
        }
    }

    /**
     * Applies filters and sorts to the allClubs array.
     */
    function applyFiltersAndSort() {
        let tempClubs = [...allClubs];

        // 1. Search Filter
        const searchTerm = clubSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            tempClubs = tempClubs.filter(club =>
                club.name.toLowerCase().includes(searchTerm) ||
                club.description.toLowerCase().includes(searchTerm)
            );
        }

        // 2. Sort
        const sortBy = sortClubs.value;
        switch (sortBy) {
            case 'name-asc':
                tempClubs.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                tempClubs.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'members-desc':
                tempClubs.sort((a, b) => b.details.membersCount - a.details.membersCount);
                break;
            case 'members-asc':
                tempClubs.sort((a, b) => a.details.membersCount - b.details.membersCount);
                break;
        }

        filteredAndSortedClubs = tempClubs;
        currentIndex = 0; // Reset index for new filter/sort
        clubsContainer.innerHTML = ''; // Clear current display
        displayClubs(); // Display new batch
    }

    // --- Search Suggestions Logic ---
    let searchTimeout;
    function handleSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = clubSearchInput.value.toLowerCase().trim();
            searchSuggestionsClubs.innerHTML = ''; // Clear previous suggestions

            if (searchTerm.length > 1) {
                const uniqueSuggestions = new Set();
                allClubs.forEach(club => {
                    if (club.name.toLowerCase().includes(searchTerm)) {
                        uniqueSuggestions.add(club.name);
                    }
                });

                if (uniqueSuggestions.size > 0) {
                    Array.from(uniqueSuggestions).slice(0, 5).forEach(suggestionText => {
                        const suggestionDiv = document.createElement('div');
                        suggestionDiv.textContent = suggestionText;
                        suggestionDiv.addEventListener('click', () => {
                            clubSearchInput.value = suggestionText;
                            searchSuggestionsClubs.classList.add('hidden');
                            applyFiltersAndSort();
                        });
                        searchSuggestionsClubs.appendChild(suggestionDiv);
                    });
                    searchSuggestionsClubs.classList.remove('hidden');
                } else {
                    searchSuggestionsClubs.classList.add('hidden');
                }
            } else {
                searchSuggestionsClubs.classList.add('hidden');
            }
            applyFiltersAndSort(); // Apply filters for any input change
        }, 300); // Debounce search input for 300ms
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!clubSearchInput.contains(event.target) && !searchSuggestionsClubs.contains(event.target)) {
            searchSuggestionsClubs.classList.add('hidden');
        }
    });
    // --- End Search Suggestions Logic ---

    /**
     * Fetches clubs data and initializes the page.
     */
    async function fetchAndInitializeClubs() {
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        clubsContainer.innerHTML = '';

        try {
            const response = await fetch('data/clubs.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allClubs = await response.json();

            if (allClubs.length === 0) {
                loadingMessage.classList.add('hidden');
                errorMessage.textContent = 'No clubs found at this time.';
                errorMessage.classList.remove('hidden');
                loadMoreBtn.classList.add('hidden');
                clubsContainer.classList.add('hidden');
                return;
            }

            loadingMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            clubsContainer.classList.remove('hidden');

            applyFiltersAndSort(); // Initial display after data load

        } catch (error) {
            console.error('Error fetching clubs:', error);
            loadingMessage.classList.add('hidden');
            errorMessage.textContent = 'Failed to load clubs. Please try again later.';
            errorMessage.classList.remove('hidden');
            loadMoreBtn.classList.add('hidden');
            clubsContainer.classList.add('hidden');
        }
    }

    // Event Listeners
    sortClubs.addEventListener('change', applyFiltersAndSort);
    clubSearchInput.addEventListener('input', handleSearchInput);
    loadMoreBtn.addEventListener('click', displayClubs);

    // Initial fetch and display
    fetchAndInitializeClubs();
});