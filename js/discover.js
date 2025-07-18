// js/discover.js

document.addEventListener('DOMContentLoaded', () => {
    const discoverItemsGrid = document.getElementById('discover-items-grid');
    const visitMessageCard = document.getElementById('visit-message-card');
    const visitMessageElement = document.getElementById('visit-message');
    const closeMessageBtn = document.querySelector('.close-message-btn');
    const loadingMessage = discoverItemsGrid.querySelector('.loading-message');
    const errorMessage = discoverItemsGrid.querySelector('.error-message');

    const STORAGE_KEY = 'lastVisitDate'; // Key for localStorage

    // Function to show/hide elements
    const toggleVisibility = (element, show) => {
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    };

    /**
     * Calculates the difference in days between two dates.
     * @param {number} date1 - First date in milliseconds.
     * @param {number} date2 - Second date in milliseconds.
     * @returns {number} Number of full days between the dates.
     */
    const getDaysBetweenDates = (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
        const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
        return diffDays;
    };

    /**
     * Displays the appropriate message about the last visit.
     */
    const displayVisitMessage = () => {
        const lastVisit = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (lastVisit === null) {
            // First visit
            visitMessageElement.textContent = "Welcome! Let us know if you have any questions.";
        } else {
            const lastVisitDate = parseInt(lastVisit, 10);
            const daysDiff = getDaysBetweenDates(now, lastVisitDate);

            if (daysDiff < 1) { // Less than a full day (e.g., same day, or within 24 hours)
                visitMessageElement.textContent = "Back so soon! Awesome!";
            } else if (daysDiff === 1) {
                visitMessageElement.textContent = "You last visited 1 day ago.";
            } else {
                visitMessageElement.textContent = `You last visited ${daysDiff} days ago.`;
            }
        }

        toggleVisibility(visitMessageCard, true); // Show the message card
        localStorage.setItem(STORAGE_KEY, now.toString()); // Update last visit date
    };

    /**
     * Closes the visit message card.
     */
    const closeVisitMessage = () => {
        toggleVisibility(visitMessageCard, false);
    };

    // Add event listener for closing the message
    if (closeMessageBtn) {
        closeMessageBtn.addEventListener('click', closeVisitMessage);
    }

    /**
     * Fetches discover items from JSON and displays them.
     */
    const fetchDiscoverItems = async () => {
        toggleVisibility(loadingMessage, true);
        toggleVisibility(errorMessage, false);
        discoverItemsGrid.innerHTML = ''; // Clear previous content, including loading message

        try {
            const response = await fetch('data/discover.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const items = await response.json();

            if (items.length === 0) {
                discoverItemsGrid.innerHTML = '<p class="loading-message">No discover items to display at the moment.</p>';
                return;
            }

            items.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('discover-item-card');
                card.innerHTML = `
                    <h2>${item.name}</h2>
                    <figure>
                        <img src="${item.image}" alt="${item.name}">
                    </figure>
                    <address>${item.address}</address>
                    <p>${item.description}</p>
                    <a href="${item.learnMoreLink}" class="cta-button secondary-cta learn-more-btn" target="_blank" rel="noopener noreferrer">Learn More</a>
                `;
                discoverItemsGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Failed to load discover items:', error);
            toggleVisibility(errorMessage, true);
            errorMessage.textContent = 'Failed to load discover items. Please try again later. 😟';
        } finally {
            toggleVisibility(loadingMessage, false);
        }
    };

    // Initialize the page
    if (discoverItemsGrid) {
        fetchDiscoverItems();
        displayVisitMessage();
    } else {
        console.warn('Discover items grid not found. Discover page functionality aborted.');
    }
});