// js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('event-registration-form');
    const eventIdInput = document.getElementById('event-id');
    const eventNameDisplay = document.getElementById('event-name-display');
    const formEventName = document.getElementById('form-event-name');
    const formEventDate = document.getElementById('form-event-date');
    const formEventTime = document.getElementById('form-event-time');
    const formEventLocation = document.getElementById('form-event-location');
    const eventDescriptionSummary = document.getElementById('event-description-summary');

    const registrationTypeOptions = document.getElementById('registration-type-options');
    const transportFieldset = document.getElementById('transport-fieldset');
    const transportOptions = document.getElementById('transport-options');
    const snacksFieldset = document.getElementById('snacks-fieldset');
    const snacksOptions = document.getElementById('snacks-options');
    const totalCostSpan = document.getElementById('total-cost');

    const loadingMessage = document.getElementById('registration-loading-message');
    const errorMessage = document.getElementById('registration-error-message');
    const registrationSuccessMessage = document.getElementById('registration-success-message'); // New: Success message element

    let currentEvent = null;
    let selectedRegistrationType = null;
    let selectedTransport = null;
    let selectedSnacks = [];

    const toggleVisibility = (element, show) => {
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    };

    // Function to parse URL parameters
    const getUrlParameter = (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const fetchEventDetails = async (eventId) => {
        toggleVisibility(loadingMessage, true);
        toggleVisibility(errorMessage, false);
        toggleVisibility(registrationForm, false);
        toggleVisibility(registrationSuccessMessage, false); // Hide success message on load

        try {
            const response = await fetch('./data/events.json'); // Adjust path as needed
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const events = await response.json();
            currentEvent = events.find(event => event.id === eventId);

            if (currentEvent) {
                renderEventDetails();
                toggleVisibility(registrationForm, true);
            } else {
                toggleVisibility(errorMessage, true);
                errorMessage.innerHTML = 'Event not found. Please return to the <a href="events.html">Events Calendar</a>.';
            }
        } catch (error) {
            console.error('Failed to load event details:', error);
            toggleVisibility(errorMessage, true);
        } finally {
            toggleVisibility(loadingMessage, false);
        }
    };

    const renderEventDetails = () => {
        if (!currentEvent) return;

        eventNameDisplay.textContent = currentEvent.name;
        eventIdInput.value = currentEvent.id;
        formEventName.textContent = currentEvent.name;
        formEventDate.textContent = currentEvent.date;
        formEventTime.textContent = currentEvent.time;
        formEventLocation.textContent = currentEvent.location;
        eventDescriptionSummary.textContent = currentEvent.fullDescription;

        // Render registration types
        registrationTypeOptions.innerHTML = '';
        const memberTypes = Object.keys(currentEvent.pricing);
        memberTypes.forEach(type => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'registration_type';
            radio.value = type;
            radio.required = true;

            const price = currentEvent.pricing[type] === 0 ? 'Free' : `KES ${currentEvent.pricing[type].toFixed(2)}`;
            label.innerHTML = `${radio.outerHTML} ${type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} (${price})`;
            registrationTypeOptions.appendChild(label);
        });

        // Render transport options if available
        if (currentEvent.transportOptions && currentEvent.transportOptions.length > 0) {
            toggleVisibility(transportFieldset, true);
            transportOptions.innerHTML = '';
            currentEvent.transportOptions.forEach(option => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'transport_option';
                radio.value = option.type;
                radio.setAttribute('data-fee', option.fee); // Store fee in data attribute

                const feeText = option.fee === 0 ? 'Free' : `KES ${option.fee.toFixed(2)}`;
                let pickupPoints = '';
                if (option.pickupPoints && option.pickupPoints.length > 0) {
                    pickupPoints = ` (Pickup: ${option.pickupPoints.join(', ')})`;
                }
                label.innerHTML = `${radio.outerHTML} ${option.type} (${feeText})${pickupPoints}`;
                transportOptions.appendChild(label);
            });
            // Select "None" by default if available
            const noneTransport = transportOptions.querySelector('input[value="None"]');
            if (noneTransport) {
                noneTransport.checked = true;
                selectedTransport = { type: 'None', fee: 0 };
            }
        } else {
            toggleVisibility(transportFieldset, false);
        }

        // Render snacks options if available
        if (currentEvent.snacksAvailable && currentEvent.snacksAvailable.length > 0) {
            toggleVisibility(snacksFieldset, true);
            snacksOptions.innerHTML = '';
            currentEvent.snacksAvailable.forEach(snack => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'selected_snacks';
                checkbox.value = snack.name;
                checkbox.setAttribute('data-price', snack.price);

                label.innerHTML = `${checkbox.outerHTML} ${snack.name} (KES ${snack.price.toFixed(2)})`;
                snacksOptions.appendChild(label);
            });
        } else {
            toggleVisibility(snacksFieldset, false);
        }

        // Add event listeners for dynamic calculation
        registrationTypeOptions.addEventListener('change', updateCost);
        transportOptions.addEventListener('change', updateCost);
        snacksOptions.addEventListener('change', updateCost);

        // Initial cost calculation
        updateCost();
    };

    const updateCost = () => {
        let totalCost = 0;

        // Calculate registration fee
        const selectedRegTypeRadio = registrationTypeOptions.querySelector('input[name="registration_type"]:checked');
        if (selectedRegTypeRadio) {
            selectedRegistrationType = selectedRegTypeRadio.value;
            totalCost += currentEvent.pricing[selectedRegistrationType];
        }

        // Calculate transport fee
        const selectedTransportRadio = transportOptions.querySelector('input[name="transport_option"]:checked');
        if (selectedTransportRadio) {
            selectedTransport = {
                type: selectedTransportRadio.value,
                fee: parseFloat(selectedTransportRadio.dataset.fee)
            };
            totalCost += selectedTransport.fee;
        }

        // Calculate snacks fee
        selectedSnacks = [];
        const checkedSnacks = snacksOptions.querySelectorAll('input[name="selected_snacks"]:checked');
        checkedSnacks.forEach(checkbox => {
            const snackPrice = parseFloat(checkbox.dataset.price);
            selectedSnacks.push({ name: checkbox.value, price: snackPrice });
            totalCost += snackPrice;
        });

        totalCostSpan.textContent = totalCost.toFixed(2);
    };

    // Function to display the success message
    const displaySuccessMessage = () => {
        if (registrationSuccessMessage) {
            registrationSuccessMessage.innerHTML = `
                <i class="fas fa-check-circle success-icon"></i>
                <h3>Registration Successful!</h3>
                <p>Thank you for registering for <strong>${currentEvent.name}</strong>!</p>
                <p>A confirmation email with event details will be sent to your registered email address shortly.</p>
                <p>We look forward to seeing you there!</p>
                <div class="success-actions">
                    <a href="events.html" class="cta-button primary-cta">Back to Events Calendar</a>
                    <button class="cta-button secondary-cta" onclick="location.reload()">Register for Another Event</button>
                </div>
            `;
            toggleVisibility(registrationSuccessMessage, true);
            toggleVisibility(registrationForm, false); // Hide the form
        }
    };

    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        // Collect form data
        const formData = {
            eventId: eventIdInput.value,
            eventName: formEventName.textContent,
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            organization: document.getElementById('organization').value,
            registrationType: selectedRegistrationType,
            transportOption: selectedTransport,
            selectedSnacks: selectedSnacks,
            totalCost: parseFloat(totalCostSpan.textContent)
        };

        console.log('Registration Data Submitted:', formData);
        // alert('Thank you for registering! Your details have been submitted. (Check console for data)'); // Removed

        // Simulate API call (replace with actual fetch to backend if needed)
        setTimeout(() => {
            displaySuccessMessage(); // Show the styled success message
            registrationForm.reset(); // Optionally reset the form after success
            updateCost(); // Reset cost display
        }, 500); // Simulate a small delay for server response

        // Here you would typically send this data to a server
        // e.g., fetch('/api/register', { method: 'POST', body: JSON.stringify(formData) });

    });

    // Get event ID from URL and fetch details
    const eventId = getUrlParameter('id');
    if (eventId) {
        fetchEventDetails(eventId);
    } else {
        toggleVisibility(loadingMessage, false);
        toggleVisibility(errorMessage, true);
        errorMessage.innerHTML = 'No event specified. Please select an event from the <a href="events.html">Events Calendar</a>.';
    }
});