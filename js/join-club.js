// js/join-club.js

document.addEventListener('DOMContentLoaded', () => {
    const clubDetailHeading = document.getElementById('club-detail-heading');
    const selectedClubNameSpan = document.getElementById('selected-club-name');
    const clubImage = document.getElementById('club-image');
    const clubDescriptionFull = document.querySelector('.club-description-full');
    const clubMembersCount = document.getElementById('club-members-count');
    const clubFrequency = document.getElementById('club-frequency');
    const clubLocation = document.getElementById('club-location');
    const feeNonMember = document.getElementById('fee-non-member');
    const feeClubMember = document.getElementById('fee-club-member');
    const feeDirectoryMember = document.getElementById('fee-directory-member');
    const feeBoardDirector = document.getElementById('fee-board-director');
    const clubDetailsDisplay = document.getElementById('club-details-display');

    const clubLoadingMessage = document.getElementById('club-loading-message');
    const clubErrorMessage = document.getElementById('club-error-message');
    const joinClubForm = document.getElementById('join-club-form');
    const chamberMembershipSelect = document.getElementById('chamber-membership');
    const estimatedFeeDisplay = document.getElementById('estimated-fee-display');
    const estimatedFeeSpan = document.getElementById('estimated-fee');
    const formMessage = document.getElementById('form-message');

    let currentClubData = null; // Stores the data of the loaded club

    /**
     * Fetches club data based on ID from URL.
     */
    async function fetchClubDetails() {
        clubLoadingMessage.classList.remove('hidden');
        clubErrorMessage.classList.add('hidden');
        clubDetailsDisplay.classList.add('hidden');
        joinClubForm.classList.add('hidden');

        const urlParams = new URLSearchParams(window.location.search);
        const clubId = urlParams.get('clubId');

        if (!clubId) {
            clubLoadingMessage.classList.add('hidden');
            clubErrorMessage.textContent = 'No club selected. Please return to the Clubs list.';
            clubErrorMessage.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('data/clubs.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const clubs = await response.json();
            const club = clubs.find(c => c.id === clubId);

            if (club) {
                currentClubData = club; // Store the fetched club data
                displayClubDetails(club);
                clubLoadingMessage.classList.add('hidden');
                clubDetailsDisplay.classList.remove('hidden');
                joinClubForm.classList.remove('hidden');
            } else {
                clubLoadingMessage.classList.add('hidden');
                clubErrorMessage.textContent = `Club with ID "${clubId}" not found.`;
                clubErrorMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error fetching club details:', error);
            clubLoadingMessage.classList.add('hidden');
            clubErrorMessage.textContent = 'Failed to load club details. Please try again later.';
            clubErrorMessage.classList.remove('hidden');
        }
    }

    /**
     * Populates the HTML with the fetched club details.
     * @param {object} club - The club data object.
     */
    function displayClubDetails(club) {
        clubDetailHeading.textContent = `Join ${club.name}`;
        selectedClubNameSpan.textContent = club.name;
        clubImage.src = club.image;
        clubImage.alt = `${club.name} Image`;
        clubDescriptionFull.textContent = club.description; // Using description as fullDescription for now
        clubMembersCount.textContent = club.details.membersCount;
        clubFrequency.textContent = club.details.frequency;
        clubLocation.textContent = club.details.location;

        // Display joining fees
        feeNonMember.textContent = club.joiningFees['non-member'].toLocaleString();
        feeClubMember.textContent = club.joiningFees['club-member'].toLocaleString();
        feeDirectoryMember.textContent = club.joiningFees['directory-member'].toLocaleString();
        feeBoardDirector.textContent = club.joiningFees['board-director'].toLocaleString();

        // Trigger fee calculation on load
        updateEstimatedFee();
    }

    /**
     * Calculates and displays the estimated joining fee based on selected membership.
     */
    function updateEstimatedFee() {
        const selectedLevel = chamberMembershipSelect.value;
        let fee = 0;

        if (currentClubData && selectedLevel && currentClubData.joiningFees[selectedLevel]) {
            fee = currentClubData.joiningFees[selectedLevel];
            estimatedFeeSpan.textContent = fee.toLocaleString();
            estimatedFeeDisplay.classList.remove('hidden');
        } else {
            estimatedFeeSpan.textContent = '0';
            estimatedFeeDisplay.classList.add('hidden');
        }
    }

    /**
     * Displays a message to the user (success/error/loading).
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', or 'loading'.
     */
    function displayMessage(message, type) {
        formMessage.textContent = message;
        formMessage.classList.remove('hidden', 'success', 'error', 'loading');
        formMessage.classList.add(type);
        if (type !== 'loading') {
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        }
    }

    // --- Event Listeners ---
    chamberMembershipSelect.addEventListener('change', updateEstimatedFee);

    joinClubForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        displayMessage('Submitting interest...', 'loading');

        // Gather form data
        const formData = {
            clubId: currentClubData ? currentClubData.id : 'unknown',
            clubName: currentClubData ? currentClubData.name : 'Unknown Club',
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            chamberMembership: chamberMembershipSelect.value,
            estimatedFee: estimatedFeeSpan.textContent.replace(/,/g, ''), // Remove commas for numerical value
            comments: document.getElementById('comments').value,
            submissionDate: new Date().toISOString()
        };

        console.log('Join Club Form Data:', formData);

        // Simulate API submission
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            // Simulate a successful submission
            console.log('Interest submitted successfully (simulated)!', formData);
            displayMessage('Thank you for your interest! We will contact you shortly.', 'success');
            joinClubForm.reset(); // Clear the form
            currentClubData = null; // Clear club data
            updateEstimatedFee(); // Reset estimated fee display
            // Optionally, redirect after a short delay
            // setTimeout(() => { window.location.href = 'clubs.html'; }, 3000);

        } catch (error) {
            console.error('Join club submission failed (simulated):', error);
            displayMessage('Failed to submit interest. Please try again later.', 'error');
        }
    });

    // Initial fetch of club details on page load
    fetchClubDetails();
});