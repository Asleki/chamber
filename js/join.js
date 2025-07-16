document.addEventListener('DOMContentLoaded', function() {
    // Set the current date and time for the hidden timestamp field
    const timestampField = document.getElementById('timestamp');
    if (timestampField) {
        const now = new Date();
        timestampField.value = now.toISOString(); // ISO format for easy parsing later
    }

    // Animate membership cards on page load
    const membershipCards = document.querySelectorAll('.membership-card');
    const totalAnimationDuration = 2400; // 2.4 seconds in milliseconds
    const staggerDelay = totalAnimationDuration / membershipCards.length; // Distribute delay evenly

    membershipCards.forEach((card, index) => {
        // Add a delay for staggered animation
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * staggerDelay); // Stagger by calculated delay per card
    });

    // Modal functionality
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-button');

    learnMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const level = this.dataset.level;
            const targetModalId = `modal-${level.toLowerCase().replace(/\s/g, '-')}`;
            const targetModal = document.getElementById(targetModalId);
            if (targetModal) {
                targetModal.style.display = 'flex'; // Use flex to center the modal content
            }
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside of it
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});