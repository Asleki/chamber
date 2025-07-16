// js/main.js

document.addEventListener('DOMContentLoaded', () => {

    // ==============================================
    // 1. Hamburger Menu & Mobile Navigation Toggle
    // ==============================================
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownToggles = document.querySelectorAll('.nav-dropdown .dropdown-toggle');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            // Assuming you have a Font Awesome icon within the button
            const icon = hamburgerBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
            const isExpanded = mainNav.classList.contains('nav-open');
            hamburgerBtn.setAttribute('aria-expanded', isExpanded);
        });

        navLinks.forEach(link => {
            if (!link.classList.contains('dropdown-toggle')) {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        mainNav.classList.remove('nav-open');
                        const icon = hamburgerBtn.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                        hamburgerBtn.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });
    }

    // Mobile Dropdown / Accordion functionality
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            if (window.innerWidth <= 768) {
                event.preventDefault();
                const parentDropdown = toggle.closest('.nav-dropdown');
                if (parentDropdown) { // Check if parentDropdown exists
                    parentDropdown.classList.toggle('open');
                    const isExpanded = parentDropdown.classList.contains('open');
                    toggle.setAttribute('aria-expanded', isExpanded);

                    dropdownToggles.forEach(otherToggle => {
                        const otherParentDropdown = otherToggle.closest('.nav-dropdown');
                        if (otherParentDropdown && otherParentDropdown !== parentDropdown && otherParentDropdown.classList.contains('open')) {
                            otherParentDropdown.classList.remove('open');
                            otherToggle.setAttribute('aria-expanded', 'false');
                        }
                    });
                }
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mainNav && mainNav.classList.contains('nav-open')) {
            mainNav.classList.remove('nav-open');
            if (hamburgerBtn) {
                const icon = hamburgerBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        }
        dropdownToggles.forEach(toggle => {
            const parentDropdown = toggle.closest('.nav-dropdown');
            if (window.innerWidth > 768 && parentDropdown && parentDropdown.classList.contains('open')) {
                parentDropdown.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ==============================================
    // 2. Dark Mode Toggle
    // ==============================================
    const modeToggleBtn = document.getElementById('mode-toggle');
    const body = document.body;

    if (modeToggleBtn) { // Only run if the dark mode button exists
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            const icon = modeToggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
            modeToggleBtn.setAttribute('aria-label', 'Toggle Light Mode');
        } else {
            body.classList.remove('dark-mode');
            const icon = modeToggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
            modeToggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
        }

        modeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const icon = modeToggleBtn.querySelector('i');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                if (icon) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
                modeToggleBtn.setAttribute('aria-label', 'Toggle Light Mode');
            } else {
                localStorage.setItem('theme', 'light');
                if (icon) {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
                modeToggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
            }
        });
    }

    // ==============================================
    // 3. Global Search Bar Toggle
    // ==============================================
    const searchToggleBtn = document.getElementById('search-toggle');
    const searchBarContainer = document.getElementById('search-bar-container');
    const siteSearchInput = document.getElementById('site-search');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchSubmitBtn = document.getElementById('search-submit-btn'); // For future functionality
    const searchMicBtn = document.getElementById('search-mic-btn'); // For future functionality


    if (searchToggleBtn && searchBarContainer) { // Only run if search elements exist
        searchToggleBtn.addEventListener('click', () => {
            searchBarContainer.classList.toggle('search-bar-visible');
            const isVisible = searchBarContainer.classList.contains('search-bar-visible');
            searchToggleBtn.setAttribute('aria-expanded', isVisible);

            if (isVisible && siteSearchInput) {
                siteSearchInput.focus();
            }
        });
    }

    if (searchClearBtn && siteSearchInput) { // Only run if clear button and input exist
        searchClearBtn.addEventListener('click', () => {
            siteSearchInput.value = '';
            siteSearchInput.focus();
        });
    }

    // ==============================================
    // 4. Dynamic Footer Content (Current Year & Last Modified)
    // ==============================================
    const copyrightYearSpan = document.getElementById('copyright-year');
    const lastModifiedSpan = document.getElementById('last-modified');

    function updateFooterDates() {
        if (copyrightYearSpan) { // Check if copyrightYearSpan exists
            copyrightYearSpan.textContent = new Date().getFullYear();
        }

        if (lastModifiedSpan) { // Check if lastModifiedSpan exists
            lastModifiedSpan.textContent = document.lastModified;
        }
    }
    updateFooterDates();

    // ==============================================
    // 5. Business Dictionary/Quotes Display & Navigation
    // This section is likely specific to index.html
    // ==============================================
    const dictionaryDisplay = document.getElementById('dictionary-display');
    const prevDictBtn = document.getElementById('prev-dict-item');
    const nextDictBtn = document.getElementById('next-dict-item');

    // Only proceed if the dictionary display element is present on the page
    if (dictionaryDisplay) {
        let currentDictData = [];
        let currentDictIndex = 0;
        let isDisplayingQuotes = false;

        function getTodayType() {
            const today = new Date();
            return today.getDate() % 2 === 0 ? 'quotes' : 'dictionary';
        }

        function updateDictionaryDisplay() {
            if (!currentDictData || currentDictData.length === 0) {
                dictionaryDisplay.innerHTML = "<p>Content currently unavailable.</p>";
                return;
            }

            const item = currentDictData[currentDictIndex];
            if (isDisplayingQuotes) {
                dictionaryDisplay.innerHTML = `
                    <p class="quote-text">"${item.quote}"</p>
                    <p class="quote-author">- ${item.author}</p>
                `;
            } else {
                dictionaryDisplay.innerHTML = `
                    <p class="term-text"><strong>${item.term}:</strong></p>
                    <p class="definition-text">${item.definition}</p>
                `;
            }
        }

        function showNextDictItem() {
            currentDictIndex = (currentDictIndex + 1) % currentDictData.length;
            updateDictionaryDisplay();
        }

        function showPrevDictItem() {
            currentDictIndex = (currentDictIndex - 1 + currentDictData.length) % currentDictData.length;
            updateDictionaryDisplay();
        }

        function initializeDictionaryOrQuotes() {
            const todayType = getTodayType();
            if (todayType === 'quotes') {
                if (typeof businessQuotes !== 'undefined' && businessQuotes.length > 0) {
                    currentDictData = businessQuotes;
                    isDisplayingQuotes = true;
                    // console.log("Displaying Business Quotes today."); // Keep for debugging if needed
                } else {
                    console.error("businessQuotes array not found or is empty. Check js/dictquotes.js loading.");
                    dictionaryDisplay.innerHTML = "<p>Quotes data unavailable.</p>";
                    return;
                }
            } else {
                if (typeof businessDictionary !== 'undefined' && businessDictionary.length > 0) {
                    currentDictData = businessDictionary;
                    isDisplayingQuotes = false;
                    // console.log("Displaying Business Dictionary today."); // Keep for debugging if needed
                } else {
                    console.error("businessDictionary array not found or is empty. Check js/dictquotes.js loading.");
                    dictionaryDisplay.innerHTML = "<p>Dictionary data unavailable.</p>";
                    return;
                }
            }
            currentDictIndex = 0;
            updateDictionaryDisplay();
        }

        // Add event listeners for dictionary/quotes navigation buttons only if they exist
        if (nextDictBtn) {
            nextDictBtn.addEventListener('click', showNextDictItem);
        } else {
            console.warn("Next dictionary button (#next-dict-item) not found in HTML. (Expected on homepage)");
        }

        if (prevDictBtn) {
            prevDictBtn.addEventListener('click', showPrevDictItem);
        } else {
            console.warn("Previous dictionary button (#prev-dict-item) not found in HTML. (Expected on homepage)");
        }

        initializeDictionaryOrQuotes(); // Call initialization function only if dictionaryDisplay exists
    } else {
        // console.log("Dictionary display element (#dictionary-display) not found in HTML. (Expected on homepage)"); // Optional: if you want a console message when it's not found
    }


    // ==============================================
    // 6. Weather Data Display (OpenWeatherMap API)
    // This section is likely specific to index.html
    // ==============================================
    const weatherDisplay = document.getElementById('weather-display');

    // Only proceed if the weather display element is present on the page
    if (weatherDisplay) {
        const apiKey = 'c8d5db76fb55df0628b2ea568d5d200b';
        const lat = -1.286389;
        const lon = 36.817223;

        async function fetchCurrentWeather() {
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            try {
                const response = await fetch(currentWeatherUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return {
                    temp: data.main.temp,
                    description: data.weather[0].description,
                    icon: data.weather[0].icon
                };
            } catch (error) {
                console.error('Error fetching current weather:', error);
                return null;
            }
        }

        async function fetchForecast() {
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            try {
                const response = await fetch(forecastUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return parseForecastData(data);
            } catch (error) {
                console.error('Error fetching forecast:', error);
                return null;
            }
        }

        function parseForecastData(data) {
            const dailyForecasts = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const addedDays = new Set();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            let forecastStartIndex = 0;
            if (data.list.length > 0) {
                const firstForecastDate = new Date(data.list[0].dt * 1000);
                firstForecastDate.setHours(0, 0, 0, 0);
                if (firstForecastDate.getTime() === today.getTime()) {
                    for (let i = 0; i < data.list.length; i++) {
                        const itemDate = new Date(data.list[i].dt * 1000);
                        itemDate.setHours(0, 0, 0, 0);
                        if (itemDate.getTime() > today.getTime()) {
                            forecastStartIndex = i;
                            break;
                        }
                    }
                }
            }

            for (let i = forecastStartIndex; i < data.list.length; i++) {
                const item = data.list[i];
                const date = new Date(item.dt * 1000);
                date.setHours(0, 0, 0, 0);

                if (dailyForecasts.length < 3 && !addedDays.has(date.toDateString())) {
                    let tempForDay = item.main.temp;
                    let iconForDay = item.weather[0].icon;

                    const entriesForCurrentDay = data.list.filter(entry => {
                        const entryDate = new Date(entry.dt * 1000);
                        entryDate.setHours(0, 0, 0, 0);
                        return entryDate.getTime() === date.getTime();
                    });

                    const middayEntry = entriesForCurrentDay.find(entry => {
                        const entryHour = new Date(entry.dt * 1000).getHours();
                        return entryHour >= 10 && entryHour <= 16;
                    }) || entriesForCurrentDay[0];

                    if (middayEntry) {
                        tempForDay = middayEntry.main.temp;
                        iconForDay = middayEntry.weather[0].icon;
                    }

                    const dayName = dayNames[date.getDay()];
                    dailyForecasts.push({
                        day: dayName,
                        temp: tempForDay,
                        icon: iconForDay
                    });
                    addedDays.add(date.toDateString());
                }
                if (dailyForecasts.length >= 3) break;
            }
            return dailyForecasts;
        }

        async function displayWeather() {
            weatherDisplay.innerHTML = '<p>Loading weather data...</p>';

            const currentWeather = await fetchCurrentWeather();
            const forecast = await fetchForecast();

            weatherDisplay.innerHTML = '';

            if (currentWeather) {
                const currentTemp = currentWeather.temp.toFixed(0);
                const description = currentWeather.description.charAt(0).toUpperCase() + currentWeather.description.slice(1);

                const currentWeatherCard = document.createElement('div');
                currentWeatherCard.className = 'current-weather-card';
                currentWeatherCard.innerHTML = `
                    <p class="day-name">Today</p>
                    <img src="https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png" alt="${currentWeather.description}" class="weather-icon-lg">
                    <p class="temperature">${currentTemp}°C</p>
                    <p class="description">${description}</p>
                `;
                weatherDisplay.appendChild(currentWeatherCard);
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = '<p>Could not fetch current weather.</p>';
                weatherDisplay.appendChild(errorDiv);
            }

            if (forecast && forecast.length > 0) {
                const forecastWrapper = document.createElement('div');
                forecastWrapper.className = 'forecast-cards-wrapper';

                forecast.forEach(day => {
                    const forecastDayCard = document.createElement('div');
                    forecastDayCard.className = 'forecast-day-card';
                    forecastDayCard.innerHTML = `
                        <p class="day-name">${day.day}</p>
                        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="Weather icon" class="weather-icon-sm">
                        <p class="temperature">${day.temp.toFixed(0)}°C</p>
                    `;
                    forecastWrapper.appendChild(forecastDayCard);
                });
                weatherDisplay.appendChild(forecastWrapper);
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = '<p>Could not fetch forecast data.</p>';
                weatherDisplay.appendChild(errorDiv);
            }
        }

        displayWeather(); // Call displayWeather on page load
    } else {
        // console.log("Weather display element (#weather-display) not found in HTML. (Expected on homepage)"); // Optional: if you want a console message
    }


    // ==============================================
    // 7. Featured Member Spotlights
    // This section is likely specific to index.html
    // ==============================================
    const memberSpotlightsContainer = document.querySelector('.spotlight-carousel');

    // Only proceed if the member spotlights container is present on the page
    if (memberSpotlightsContainer) {
        async function fetchMembers() {
            try {
                const response = await fetch('data/members.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching member data:', error);
                return [];
            }
        }

        function getRandomMembers(allMembers, count) {
            const eligibleMembers = allMembers.filter(member =>
                member.membershipLevel === 'Gold' || member.membershipLevel === 'Silver'
            );

            if (eligibleMembers.length < count) {
                console.warn(`Not enough Gold or Silver members found. Found ${eligibleMembers.length}, need ${count}.`);
                return eligibleMembers;
            }

            for (let i = eligibleMembers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [eligibleMembers[i], eligibleMembers[j]] = [eligibleMembers[j], eligibleMembers[i]];
            }
            return eligibleMembers.slice(0, count);
        }

        function displayMemberSpotlights(membersToDisplay) {
            memberSpotlightsContainer.innerHTML = '';

            if (membersToDisplay.length === 0) {
                memberSpotlightsContainer.innerHTML = '<p>No Gold or Silver members found for spotlight.</p>';
                return;
            }

            membersToDisplay.forEach(member => {
                const memberCard = document.createElement('div');
                memberCard.classList.add('member-spotlight-card');

                const imagePath = member.imgSrc;

                memberCard.innerHTML = `
                    <img src="${imagePath}" alt="${member.imgAlt || member.name + ' Logo'}">
                    <h4>${member.name}</h4>
                    <p><strong>Membership:</strong> ${member.membershipLevel}</p>
                    <p><strong>Phone:</strong> ${member.phone}</p>
                    <p><strong>Address:</strong> ${member.address}</p>
                    <a href="${member.website}" target="_blank" class="website-link" rel="noopener noreferrer">Visit Website</a>
                `;
                memberSpotlightsContainer.appendChild(memberCard);
            });
        }

        async function initializeMemberSpotlights() {
            const allMembers = await fetchMembers();
            if (allMembers.length > 0) {
                const selectedMembers = getRandomMembers(allMembers, 3);
                displayMemberSpotlights(selectedMembers);
            } else {
                console.warn("No member data available to display spotlights or members.json is empty.");
                memberSpotlightsContainer.innerHTML = '<p>Failed to load member data or no eligible members found.</p>';
            }
        }

        initializeMemberSpotlights(); // Initialize member spotlights on page load
    } else {
        // console.log("Member spotlights container (.spotlight-carousel) not found in HTML. (Expected on homepage)"); // Optional: if you want a console message
    }

});