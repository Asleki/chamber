// js/imageSlider.js

document.addEventListener('DOMContentLoaded', () => {
    // Function to handle image sliding for a given container
    function setupImageSlider(containerSelector, imageSelector, activeClass, intervalTime = 5000) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Error: Container not found for selector: ${containerSelector}. Slider cannot be initialized.`);
            return;
        }

        const images = container.querySelectorAll(imageSelector);
        if (images.length === 0) {
            console.warn(`Warning: No images found for selector: ${imageSelector} within container: ${containerSelector}. Slider will not function.`);
            return;
        }

        let currentIndex = 0;

        function showImage(index) {
            // Ensure the index is within bounds
            if (index < 0 || index >= images.length) {
                console.error(`Invalid image index: ${index} for container: ${containerSelector}.`);
                return;
            }

            // Remove active class from all images first
            images.forEach(img => {
                img.classList.remove(activeClass);
            });

            // Add active class to the current image
            images[index].classList.add(activeClass);
            console.log(`Displaying image ${index} in ${containerSelector}`); // For debugging
        }

        function nextImage() {
            // Hide the current image
            images[currentIndex].classList.remove(activeClass);

            // Move to the next index, or loop back to 0 if at the end
            currentIndex = (currentIndex + 1) % images.length;

            // Show the new current image
            images[currentIndex].classList.add(activeClass);
            console.log(`Moved to image ${currentIndex} in ${containerSelector}`); // For debugging
        }

        // --- Initialization Logic ---
        // Check if any image is already marked as active in HTML
        const initialActiveImage = container.querySelector(`.${activeClass}`);
        if (initialActiveImage) {
            // If an image is already active, set the currentIndex to its position
            currentIndex = Array.from(images).indexOf(initialActiveImage);
            console.log(`Initial active image found in HTML for ${containerSelector} at index: ${currentIndex}`);
        } else {
            // If no image is active in HTML, default to the first one
            showImage(0);
            console.log(`No initial active image found for ${containerSelector}. Displaying first image.`);
        }

        // Start the automatic rotation
        if (images.length > 1) { // Only start interval if there's more than one image to slide
            setInterval(nextImage, intervalTime);
            console.log(`Image slider started for ${containerSelector} with interval ${intervalTime / 1000} seconds.`);
        } else if (images.length === 1) {
            console.log(`Only one image found for ${containerSelector}. No sliding needed.`);
            showImage(0); // Ensure the single image is visible
        } else {
             console.warn(`No images to slide in ${containerSelector}.`);
        }
    }

    // --- Setup for Hero Section ---
    // Make sure 'active-slide' is passed as the class to toggle
    setupImageSlider('.hero-image-slider', '.hero-image', 'active-slide', 5000); // 5 seconds interval

    // --- Setup for Ad Space ---
    // Make sure 'active-ad' is passed as the class to toggle
    setupImageSlider('.ad-container', '.ad-image', 'active-ad', 7000); // 7 seconds interval
});