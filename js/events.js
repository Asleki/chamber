// js/events.js

document.addEventListener('DOMContentLoaded', () => {
    const eventsContainer = document.getElementById('events-container');
    const loadingMessage = document.getElementById('events-loading-message');
    const errorMessage = document.getElementById('events-error-message');
    const eventSearch = document.getElementById('event-search');
    const eventTypeFilter = document.getElementById('event-type-filter');
    const noEventsMessage = document.getElementById('no-events-message');

    let allEvents = []; // To store all fetched events

    const toggleVisibility = (element, show) => {
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    };

    const fetchEvents = async () => {
        toggleVisibility(loadingMessage, true);
        toggleVisibility(errorMessage, false);
        toggleVisibility(noEventsMessage, false);

        try {
            // Assuming events.json is in a 'data' folder at the root level.
            // Adjust this path if your events.json is located elsewhere.
            const response = await fetch('/data/events.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allEvents = await response.json();
            displayEvents(allEvents); // Display all events initially

        } catch (error) {
            console.error('Failed to load events:', error);
            toggleVisibility(loadingMessage, false);
            toggleVisibility(errorMessage, true);
            if (errorMessage) {
                errorMessage.textContent = 'Failed to load events. Please try again later. 😟';
            }
        } finally {
            toggleVisibility(loadingMessage, false);
        }
    };

    const displayEvents = (events) => {
        if (eventsContainer) {
            eventsContainer.innerHTML = ''; // Clear previous events
        }

        if (events.length === 0) {
            toggleVisibility(noEventsMessage, true);
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('event-card');

            const eventImageHtml = event.image ? `<img src="${event.image}" alt="${event.name}" class="event-image">` : '';

            eventCard.innerHTML = `
                ${eventImageHtml}
                <div class="event-details">
                    <h2 class="event-title">${event.name}</h2>
                    <p class="event-date-time"><i class="fas fa-calendar-alt"></i> ${event.date} | ${event.time}</p>
                    <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-actions">
                        <a href="register.html?id=${event.id}" class="cta-button primary-cta register-button">Register Now</a>
                    </div>
                </div>
            `;
            if (eventsContainer) {
                eventsContainer.appendChild(eventCard);
            }
        });
    };

    const filterEvents = () => {
        const searchTerm = eventSearch.value.toLowerCase();
        const selectedType = eventTypeFilter.value.toLowerCase();

        const filtered = allEvents.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm) ||
                                  event.description.toLowerCase().includes(searchTerm) ||
                                  event.location.toLowerCase().includes(searchTerm);

            const matchesType = selectedType === '' || (event.name && event.name.toLowerCase().includes(selectedType));
            // A more robust way to categorize by type might be to add a "type" field to your JSON.
            // For now, we'll check if the event name contains the selected type keyword.

            return matchesSearch && matchesType;
        });

        displayEvents(filtered);
    };

    // Add event listeners for search and filter
    if (eventSearch) {
        eventSearch.addEventListener('keyup', filterEvents);
    }
    if (eventTypeFilter) {
        eventTypeFilter.addEventListener('change', filterEvents);
    }

    // Initial fetch when the page loads
    fetchEvents();
});