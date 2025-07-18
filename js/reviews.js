// js/reviews.js

document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.getElementById('reviews-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadingMessage = document.getElementById('reviews-loading-message');
    const errorMessage = document.getElementById('reviews-error-message');

    let allReviews = [];
    let currentIndex = 0;
    const REVIEWS_PER_LOAD = 6;

    function generateStars(rating) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }

        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }
        return starsHtml;
    }

    function createReviewCard(member, review) {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('review-card');

        reviewCard.innerHTML = `
            <div class="member-info">
                <img src="${member.imgSrc}" alt="${member.name} Logo" class="member-logo">
                <h3>${member.name}</h3>
            </div>
            <div class="review-content">
                <p class="review-text">"${review.text}"</p>
                <div class="review-meta">
                    <span class="review-author">- ${review.author}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="review-rating">
                    ${generateStars(review.rating)}
                </div>
            </div>
        `;
        return reviewCard;
    }

    function displayReviews() {
        const reviewsToDisplay = allReviews.slice(currentIndex, currentIndex + REVIEWS_PER_LOAD);

        reviewsToDisplay.forEach(item => {
            const reviewCard = createReviewCard(item.member, item.review);
            reviewsContainer.appendChild(reviewCard);
        });

        currentIndex += reviewsToDisplay.length;

        if (currentIndex < allReviews.length) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }

    async function fetchAndDisplayReviews() {
        // Always hide both messages at the start of a fetch attempt
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        reviewsContainer.innerHTML = ''; // Clear previous reviews before loading new ones if fetch is retried

        try {
            const response = await fetch('data/members.json'); // Corrected path
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const members = await response.json();

            allReviews = members.flatMap(member =>
                member.reviews ? member.reviews.map(review => ({ member: member, review: review })) : []
            );

            allReviews.sort((a, b) => new Date(b.review.date) - new Date(a.review.date));

            // *** Crucial part: Hide both messages definitively on success ***
            loadingMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            // ************************************************************

            if (allReviews.length > 0) {
                reviewsContainer.classList.remove('hidden'); // Ensure container is visible if it was hidden on error
                displayReviews();
            } else {
                // If no reviews found in JSON, display a message (optional)
                loadingMessage.classList.add('hidden'); // Hide loading message
                errorMessage.textContent = 'No reviews available at this time.';
                errorMessage.classList.remove('hidden');
            }


        } catch (error) {
            console.error('Error fetching members or reviews:', error);
            loadingMessage.classList.add('hidden'); // Hide loading message
            errorMessage.textContent = 'Failed to load reviews. Please try again later.'; // Set specific error text
            errorMessage.classList.remove('hidden'); // Show error message
            loadMoreBtn.classList.add('hidden'); // Hide load more button
            reviewsContainer.classList.add('hidden'); // Hide the reviews container on error
        }
    }

    loadMoreBtn.addEventListener('click', displayReviews);
    fetchAndDisplayReviews();
});