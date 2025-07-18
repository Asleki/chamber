// js/submit-review.js

document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');
    const memberSelect = document.getElementById('member-select');
    const ratingInputContainer = document.getElementById('rating-input');
    const selectedRatingInput = document.getElementById('selected-rating');
    const formMessage = document.getElementById('form-message');

    let currentRating = 0; // Stores the currently selected star rating

    // --- 1. Populate Member Select Dropdown ---
    async function populateMemberSelect() {
        try {
            // Correct path to members.json
            const response = await fetch('data/members.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const members = await response.json();

            // Clear existing options, keep the disabled placeholder
            memberSelect.innerHTML = '<option value="" disabled selected>-- Select a Member --</option>';

            members.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id; // Assuming each member has a unique ID
                option.textContent = member.name;
                memberSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error fetching members for dropdown:', error);
            // Optionally, disable the select or show an error message in the dropdown area
            memberSelect.innerHTML = '<option value="" disabled selected>Error loading members</option>';
            memberSelect.disabled = true;
        }
    }

    // --- 2. Initialize Interactive Star Rating ---
    function initializeStarRating() {
        // Create 5 empty star icons initially
        ratingInputContainer.innerHTML = ''; // Clear any existing placeholder
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.classList.add('far', 'fa-star'); // Font Awesome Regular (outline) star
            star.dataset.value = i; // Store the star's numerical value
            ratingInputContainer.appendChild(star);
        }

        // Add event listeners for hover and click
        ratingInputContainer.addEventListener('mouseover', handleStarHover);
        ratingInputContainer.addEventListener('mouseout', handleStarOut);
        ratingInputContainer.addEventListener('click', handleStarClick);
    }

    function handleStarHover(event) {
        const hoveredStar = event.target.closest('i.fa-star');
        if (!hoveredStar) return;

        const hoverValue = parseInt(hoveredStar.dataset.value);
        const stars = ratingInputContainer.querySelectorAll('i.fa-star');

        stars.forEach(star => {
            const starValue = parseInt(star.dataset.value);
            if (starValue <= hoverValue) {
                star.classList.remove('far');
                star.classList.add('fas'); // Solid star on hover
            } else {
                star.classList.remove('fas');
                star.classList.add('far'); // Outline star
            }
        });
    }

    function handleStarOut() {
        const stars = ratingInputContainer.querySelectorAll('i.fa-star');
        stars.forEach(star => {
            const starValue = parseInt(star.dataset.value);
            if (starValue <= currentRating) {
                star.classList.remove('far');
                star.classList.add('fas'); // Solid if it's part of the selected rating
            } else {
                star.classList.remove('fas');
                star.classList.add('far'); // Outline if not selected
            }
        });
    }

    function handleStarClick(event) {
        const clickedStar = event.target.closest('i.fa-star');
        if (!clickedStar) return;

        currentRating = parseInt(clickedStar.dataset.value);
        selectedRatingInput.value = currentRating; // Update the hidden input value
        handleStarOut(); // Re-apply styling based on new currentRating
    }


    // --- 3. Handle Form Submission ---
    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Basic form validation
        if (selectedRatingInput.value === '0') {
            displayMessage('Please select a rating for the member.', 'error');
            return;
        }
        if (memberSelect.value === '') {
            displayMessage('Please select a member to review.', 'error');
            return;
        }

        // Gather form data
        const formData = {
            reviewerName: document.getElementById('reviewer-name').value,
            reviewerEmail: document.getElementById('reviewer-email').value,
            memberId: memberSelect.value,
            rating: parseFloat(selectedRatingInput.value),
            reviewText: document.getElementById('review-text').value,
            date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
        };

        console.log('Form Data to Submit:', formData);

        // --- Simulate API submission (replace with actual API call) ---
        // In a real application, you would send this data to a server.
        // For this WDD 231 project, we'll simulate success/failure.

        displayMessage('Submitting review...', 'loading'); // Show loading message

        try {
            // Simulate network request delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate a successful submission
            console.log('Review submitted successfully (simulated)!', formData);
            displayMessage('Thank you for your review! It has been submitted successfully.', 'success');
            reviewForm.reset(); // Clear the form
            currentRating = 0; // Reset star rating
            handleStarOut(); // Reset star visuals
            selectedRatingInput.value = '0'; // Reset hidden input

            // Optionally, redirect to a thank you page or reviews page after a short delay
            // setTimeout(() => {
            //     window.location.href = 'reviews.html';
            // }, 3000);

        } catch (error) {
            console.error('Review submission failed (simulated):', error);
            displayMessage('Failed to submit review. Please try again later.', 'error');
        }
    });

    // --- Utility function to display messages ---
    function displayMessage(message, type) {
        formMessage.textContent = message;
        formMessage.classList.remove('hidden', 'success', 'error', 'loading'); // Remove all states
        formMessage.classList.add(type); // Add the specific type (success, error, loading)
        if (type !== 'loading') { // Hide after a short delay for success/error
             setTimeout(() => {
                formMessage.classList.add('hidden');
             }, 5000); // Message disappears after 5 seconds
        }
    }

    // --- Initializations on page load ---
    populateMemberSelect();
    initializeStarRating();
});