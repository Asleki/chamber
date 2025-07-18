// js/awards.js

document.addEventListener('DOMContentLoaded', () => {
    const awardsContainer = document.getElementById('awards-container');
    const loadMoreBtn = document.getElementById('load-more-awards-btn');
    const loadingMessage = document.getElementById('awards-loading-message');
    const errorMessage = document.getElementById('awards-error-message');
    const yearFilter = document.getElementById('year-filter');
    const memberFilter = document.getElementById('member-filter');
    const sortAwards = document.getElementById('sort-awards');
    const awardSearchInput = document.getElementById('award-search');
    const searchSuggestionsAwards = document.getElementById('search-suggestions-awards');

    let allAwards = []; // Stores all fetched awards (flattened)
    let filteredAndSortedAwards = []; // Awards currently being displayed after filters/sort
    let currentIndex = 0;
    const AWARDS_PER_LOAD = 9;

    /**
     * Creates and returns an award card element.
     * @param {object} awardItem - Object containing member and award details.
     * @returns {HTMLElement} The created award card div element.
     */
    function createAwardCard(awardItem) {
        const awardCard = document.createElement('div');
        awardCard.classList.add('award-card');

        awardCard.innerHTML = `
            <img src="${awardItem.member.imgSrc}" alt="${awardItem.member.name} Logo" class="member-logo-award">
            <h3>${awardItem.member.name}</h3>
            <div class="award-icon"><i class="fas fa-trophy"></i></div> <div class="award-details">
                <p class="award-name">${awardItem.award.name}</p>
                <p class="award-year"><i class="fas fa-calendar-alt"></i> ${awardItem.award.year}</p>
                <p class="award-issuer"><i class="fas fa-handshake"></i> ${awardItem.award.issuer}</p>
            </div>
        `;
        return awardCard;
    }

    /**
     * Displays a batch of filtered and sorted awards on the page.
     */
    function displayAwards() {
        const awardsToDisplay = filteredAndSortedAwards.slice(currentIndex, currentIndex + AWARDS_PER_LOAD);

        awardsToDisplay.forEach(item => {
            const awardCard = createAwardCard(item);
            awardsContainer.appendChild(awardCard);
        });

        currentIndex += awardsToDisplay.length;

        // Show/hide load more button
        if (currentIndex < filteredAndSortedAwards.length) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }

        if (filteredAndSortedAwards.length === 0) {
            errorMessage.textContent = 'No awards match your current filters.';
            errorMessage.classList.remove('hidden');
            awardsContainer.classList.add('hidden');
        } else {
            errorMessage.classList.add('hidden');
            awardsContainer.classList.remove('hidden');
        }
    }

    /**
     * Applies filters and sorts to the allAwards array.
     */
    function applyFiltersAndSort() {
        let tempAwards = [...allAwards];

        // 1. Search Filter (new)
        const searchTerm = awardSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            tempAwards = tempAwards.filter(item =>
                item.member.name.toLowerCase().includes(searchTerm) ||
                item.award.name.toLowerCase().includes(searchTerm) ||
                item.award.issuer.toLowerCase().includes(searchTerm)
            );
        }

        // 2. Year Filter
        const selectedYear = yearFilter.value;
        if (selectedYear !== 'all') {
            tempAwards = tempAwards.filter(item => item.award.year.toString() === selectedYear);
        }

        // 3. Member Filter
        const selectedMemberId = memberFilter.value;
        if (selectedMemberId !== 'all') {
            tempAwards = tempAwards.filter(item => item.member.id === selectedMemberId);
        }

        // 4. Sort
        const sortBy = sortAwards.value;
        switch (sortBy) {
            case 'year-desc':
                tempAwards.sort((a, b) => b.award.year - a.award.year);
                break;
            case 'year-asc':
                tempAwards.sort((a, b) => a.award.year - b.award.year);
                break;
            case 'member-asc':
                tempAwards.sort((a, b) => a.member.name.localeCompare(b.member.name));
                break;
            case 'award-asc':
                tempAwards.sort((a, b) => a.award.name.localeCompare(b.award.name));
                break;
        }

        filteredAndSortedAwards = tempAwards;
        currentIndex = 0;
        awardsContainer.innerHTML = '';
        displayAwards();
    }

    /**
     * Populates the year and member filter dropdowns.
     */
    function populateFilters() {
        const years = new Set();
        const membersMap = new Map();

        allAwards.forEach(item => {
            years.add(item.award.year);
            membersMap.set(item.member.id, item.member.name);
        });

        // Populate Year Filter
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        yearFilter.innerHTML = '<option value="all">All</option>';
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Populate Member Filter
        const sortedMembers = Array.from(membersMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
        memberFilter.innerHTML = '<option value="all">All</option>';
        sortedMembers.forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            memberFilter.appendChild(option);
        });
    }

    // --- Search Suggestions Logic ---
    let searchTimeout;
    function handleSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = awardSearchInput.value.toLowerCase().trim();
            searchSuggestionsAwards.innerHTML = ''; // Clear previous suggestions

            if (searchTerm.length > 1) { // Only show suggestions if 2+ characters
                const uniqueSuggestions = new Set();
                allAwards.forEach(item => {
                    if (item.member.name.toLowerCase().includes(searchTerm)) {
                        uniqueSuggestions.add(item.member.name);
                    }
                    if (item.award.name.toLowerCase().includes(searchTerm)) {
                        uniqueSuggestions.add(item.award.name);
                    }
                });

                if (uniqueSuggestions.size > 0) {
                    Array.from(uniqueSuggestions).slice(0, 5).forEach(suggestionText => { // Limit to 5 suggestions
                        const suggestionDiv = document.createElement('div');
                        suggestionDiv.textContent = suggestionText;
                        suggestionDiv.addEventListener('click', () => {
                            awardSearchInput.value = suggestionText;
                            searchSuggestionsAwards.classList.add('hidden');
                            applyFiltersAndSort(); // Apply filters immediately when a suggestion is clicked
                        });
                        searchSuggestionsAwards.appendChild(suggestionDiv);
                    });
                    searchSuggestionsAwards.classList.remove('hidden');
                } else {
                    searchSuggestionsAwards.classList.add('hidden');
                }
            } else {
                searchSuggestionsAwards.classList.add('hidden');
            }
            applyFiltersAndSort(); // Apply filters for any input change
        }, 300); // Debounce search input for 300ms
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!awardSearchInput.contains(event.target) && !searchSuggestionsAwards.contains(event.target)) {
            searchSuggestionsAwards.classList.add('hidden');
        }
    });
    // --- End Search Suggestions Logic ---


    /**
     * Fetches members data, extracts all awards, and initializes the page.
     */
    async function fetchAndInitializeAwards() {
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        awardsContainer.innerHTML = '';

        try {
            const response = await fetch('data/members.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const members = await response.json();

            allAwards = members.flatMap(member =>
                member.awards ? member.awards.map(award => ({ member: member, award: award })) : []
            );

            if (allAwards.length === 0) {
                loadingMessage.classList.add('hidden');
                errorMessage.textContent = 'No awards found at this time.';
                errorMessage.classList.remove('hidden');
                loadMoreBtn.classList.add('hidden');
                awardsContainer.classList.add('hidden');
                return;
            }

            loadingMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            awardsContainer.classList.remove('hidden');

            populateFilters();
            applyFiltersAndSort(); // Initial display after data load

        } catch (error) {
            console.error('Error fetching members or awards:', error);
            loadingMessage.classList.add('hidden');
            errorMessage.textContent = 'Failed to load awards. Please try again later.';
            errorMessage.classList.remove('hidden');
            loadMoreBtn.classList.add('hidden');
            awardsContainer.classList.add('hidden');
        }
    }

    // Event Listeners
    yearFilter.addEventListener('change', applyFiltersAndSort);
    memberFilter.addEventListener('change', applyFiltersAndSort);
    sortAwards.addEventListener('change', applyFiltersAndSort);
    awardSearchInput.addEventListener('input', handleSearchInput); // For real-time suggestions and filtering
    loadMoreBtn.addEventListener('click', displayAwards);

    // Initial fetch and display
    fetchAndInitializeAwards();
});