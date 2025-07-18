// js/advertise-order.js

// --- Ad Pricing Data (must be consistent with advertise.html's data) ---
// This data is duplicated here because advertise-order.js runs independently.
// In a production environment, this might come from a shared config or API.
const adPricingData = [
    {
        type: 'Banner Ad',
        description: 'Prominent display banner on category pages. High visibility.',
        details: [
            { level: 'Basic', features: ['Small banner (300x100)', 'Static image'], priceFactor: 1.0 },
            { level: 'Standard', features: ['Medium banner (600x150)', 'Animated GIF/Small video', 'Click tracking'], priceFactor: 1.5 },
            { level: 'Premium', features: ['Large banner (900x200)', 'Interactive elements', 'A/B testing', 'Dedicated support'], priceFactor: 2.0 }
        ],
        runtime: [
            { duration: '1 Week', multiplier: 1.0 },
            { duration: '2 Weeks', multiplier: 1.8 },
            { duration: '1 Month', multiplier: 3.0 },
            { duration: '3 Months', multiplier: 8.0 }
        ],
        basePrice: 50.00 // Base price per week for Basic Banner
    },
    {
        type: 'Featured Product',
        description: 'Showcase your product directly on the La Familia Chambers homepage or top category sections.',
        details: [
            { level: 'Basic', features: ['Single product highlight', 'Standard product card'], priceFactor: 1.2 },
            { level: 'Standard', features: ['Multiple product highlights', 'Enhanced product card', 'Priority placement'], priceFactor: 1.8 },
            { level: 'Premium', features: ['Homepage carousel slot', 'Customizable product display', 'Dedicated landing page'], priceFactor: 2.5 }
        ],
        runtime: [
            { duration: '1 Week', multiplier: 1.0 },
            { duration: '2 Weeks', multiplier: 1.9 },
            { duration: '1 Month', multiplier: 3.5 },
            { duration: '3 Months', multiplier: 9.5 }
        ],
        basePrice: 80.00 // Base price per week for Basic Featured Product
    },
    {
        type: 'Sponsored Content',
        description: 'Integrate your brand story or product review into our blog or guides.',
        details: [
            { level: 'Basic', features: ['Short article (500 words)', '1 image', 'Basic SEO'], priceFactor: 1.5 },
            { level: 'Standard', features: ['Medium article (1000 words)', '3 images/1 video', 'Advanced SEO', 'Social media share'], priceFactor: 2.2 },
            { level: 'Premium', features: ['Long-form article (1500+ words)', 'Rich media integration', 'Full SEO audit', 'Newsletter feature'], priceFactor: 3.0 }
        ],
        runtime: [
            { duration: '1 Month', multiplier: 1.0 },
            { duration: '3 Months', multiplier: 2.8 },
            { duration: '6 Months', multiplier: 5.0 },
            { duration: '1 Year', multiplier: 9.0 }
        ],
        basePrice: 150.00 // Base price per month for Basic Sponsored Content
    }
];

// --- DOM Elements ---
const adSubmissionForm = document.getElementById('ad-submission-form');

// Stepper Navigation Elements
const adStepDetailsNav = document.getElementById('ad-step-details');
const adStepConsentNav = document.getElementById('ad-step-consent');
const adStepPaymentNav = document.getElementById('ad-step-payment');
const adStepSummaryNav = document.getElementById('ad-step-summary');

// Step Content Elements
const adStep1 = document.getElementById('ad-step-1');
const adStep2 = document.getElementById('ad-step-2');
const adStep3 = document.getElementById('ad-step-3');
const adStep4 = document.getElementById('ad-step-4');

// Step 1 Sub-step Elements
const adStep1Confirm = document.getElementById('ad-step-1-confirm');
const adStep1Input = document.getElementById('ad-step-1-input');

// Step 1 Confirmation Inputs
const adTypeConfirm = document.getElementById('ad-type-confirm');
const adRuntimeSelect = document.getElementById('ad-runtime-select'); // Changed from input to select
const adDetailsLevelSelect = document.getElementById('ad-details-level-select'); // Changed from input to select
const adPriceConfirm = document.getElementById('ad-price-confirm');
const confirmAdDetailsBtn = document.getElementById('confirm-ad-details-btn');

// Step 1 User Input Fields
const adTitleInput = document.getElementById('ad-title');
const adDescriptionInput = document.getElementById('ad-description');
const adTargetUrlInput = document.getElementById('ad-target-url');
const adImageUrlInput = document.getElementById('ad-image-url');
const prevAdSubstep2Btn = document.getElementById('prev-ad-substep-2-btn');
const nextAdStep1Btn = document.getElementById('next-ad-step-1-btn');

// Step 2 Inputs (Consent)
const consentAgreementCheckbox = document.getElementById('consent-agreement');
const prevAdStep2Btn = document.getElementById('prev-ad-step-2-btn');
const nextAdStep2Btn = document.getElementById('next-ad-step-2-btn');

// Step 3 Inputs (Payment)
const adPaymentMethodRadios = document.querySelectorAll('input[name="adPaymentMethod"]');
const adFinalTotalSpan = document.getElementById('ad-final-total');
const prevAdStep3Btn = document.getElementById('prev-ad-step-3-btn');
const nextAdStep3Btn = document.getElementById('next-ad-step-3-btn');

// Step 4 Elements (Summary & Submit)
const adSummaryContent = document.getElementById('ad-summary-content');
const prevAdStep4Btn = document.getElementById('prev-ad-step-4-btn');
const submitAdBtn = document.getElementById('submit-ad-btn');

// Notification element (assuming main.js provides this, or it's a global element)
const notificationMessageDiv = document.getElementById('notification-message');

// Success Modal Elements
const successModal = document.getElementById('success-modal');
const successMessageContent = document.getElementById('success-message-content');
const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
const goToAdvertisePageBtn = document.getElementById('go-to-advertise-page-btn');


// --- State Variables ---
let currentAdStep = 1;
let currentAdSubStep = 1; // 1 for confirm, 2 for input
let selectedAdPackage = null; // This will be populated from URL params
let adFormData = {
    adType: '',
    adRuntime: '',
    adDetailsLevel: '',
    calculatedPrice: 0,
    adTitle: '',
    adDescription: '',
    adTargetUrl: '',
    adImageUrl: '',
    consentAgreed: false,
    paymentMethod: 'credit-card'
};

// --- Utility Functions ---

/**
 * Displays a temporary notification message.
 * Assumes a global 'notificationMessageDiv' element is available.
 * @param {string} messageText - The message to display.
 * @param {boolean} isSuccess - True for success (green), false for error (red).
 */
function displayNotification(messageText, isSuccess = true) {
    if (notificationMessageDiv) {
        notificationMessageDiv.textContent = messageText;
        // Remove previous classes to ensure correct display
        notificationMessageDiv.classList.remove('opacity-0', 'notification-fade-out', 'bg-green-500', 'bg-red-500');
        
        notificationMessageDiv.classList.add('opacity-100', isSuccess ? 'bg-green-500' : 'bg-red-500', 'show'); // 'show' for immediate visibility

        // Add a fade-out effect after a delay
        setTimeout(() => {
            notificationMessageDiv.classList.remove('opacity-100', 'show');
            notificationMessageDiv.classList.add('opacity-0', 'notification-fade-out');
        }, 3000);
    }
}

/**
 * Opens the success message modal.
 * @param {string} message - The message to display in the modal.
 */
function openSuccessModal(message) {
    if (successModal && successMessageContent) {
        successMessageContent.textContent = message;
        successModal.classList.remove('hidden');
    }
}

/**
 * Closes the success message modal.
 */
function closeSuccessModal() {
    if (successModal) {
        successModal.classList.add('hidden');
    }
}

/**
 * Calculates the price of an ad package based on selected type, runtime, and detail level.
 * @param {object} adTypeData - The base ad type data (e.g., from adPricingData).
 * @param {string} runtimeDuration - The selected runtime duration string (e.g., '1 Week').
 * @param {string} detailsLevel - The selected details level string (e.g., 'Basic').
 * @returns {number} The calculated price.
 */
function calculateAdPrice(adTypeData, runtimeDuration, detailsLevel) {
    const runtime = adTypeData.runtime.find(r => r.duration === runtimeDuration);
    const detail = adTypeData.details.find(d => d.level === detailsLevel);

    if (!runtime || !detail) {
        console.error("Invalid runtime or detail level selected for price calculation.");
        return 0;
    }

    return adTypeData.basePrice * runtime.multiplier * detail.priceFactor;
}

/**
 * Populates the runtime and details level dropdowns based on the selected ad package.
 */
function populateDropdowns() {
    if (!selectedAdPackage) return;

    // Populate Runtime dropdown
    if (adRuntimeSelect) {
        adRuntimeSelect.innerHTML = ''; // Clear existing options
        selectedAdPackage.runtime.forEach(r => {
            const option = document.createElement('option');
            option.value = r.duration;
            option.textContent = r.duration;
            adRuntimeSelect.appendChild(option);
        });
        // Set default selected value
        adRuntimeSelect.value = adFormData.adRuntime;
    }

    // Populate Details Level dropdown
    if (adDetailsLevelSelect) {
        adDetailsLevelSelect.innerHTML = ''; // Clear existing options
        selectedAdPackage.details.forEach(d => {
            const option = document.createElement('option');
            option.value = d.level;
            option.textContent = d.level;
            adDetailsLevelSelect.appendChild(option);
        });
        // Set default selected value
        adDetailsLevelSelect.value = adFormData.adDetailsLevel;
    }

    // Add event listeners for changes to update price
    if (adRuntimeSelect) {
        adRuntimeSelect.addEventListener('change', updateCalculatedPrice);
    }
    if (adDetailsLevelSelect) {
        adDetailsLevelSelect.addEventListener('change', updateCalculatedPrice);
    }
}

/**
 * Updates the calculated price based on current dropdown selections.
 */
function updateCalculatedPrice() {
    if (!selectedAdPackage) return;

    adFormData.adRuntime = adRuntimeSelect ? adRuntimeSelect.value : '';
    adFormData.adDetailsLevel = adDetailsLevelSelect ? adDetailsLevelSelect.value : '';

    adFormData.calculatedPrice = calculateAdPrice(
        selectedAdPackage,
        adFormData.adRuntime,
        adFormData.adDetailsLevel
    );

    if (adPriceConfirm) adPriceConfirm.value = `$${adFormData.calculatedPrice.toFixed(2)}`;
    if (adFinalTotalSpan) adFinalTotalSpan.textContent = `$${adFormData.calculatedPrice.toFixed(2)}`;
}


/**
 * Initializes the form with data from the URL parameters.
 */
function initializeFormFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const packageDataString = urlParams.get('package');

    if (packageDataString) {
        try {
            selectedAdPackage = JSON.parse(decodeURIComponent(packageDataString));
            
            // Populate adFormData with initial values from the selected package
            adFormData.adType = selectedAdPackage.type;
            // Default to first runtime and detail level if available
            adFormData.adRuntime = selectedAdPackage.runtime[0] ? selectedAdPackage.runtime[0].duration : '';
            adFormData.adDetailsLevel = selectedAdPackage.details[0] ? selectedAdPackage.details[0].level : '';
            
            // Populate dropdowns and calculate price
            populateDropdowns();
            updateCalculatedPrice();

            // Populate static ad type field
            if (adTypeConfirm) adTypeConfirm.value = adFormData.adType;
            
            // Show the first step (confirm sub-step)
            showAdStep(1);

        } catch (error) {
            console.error("Error parsing ad package data from URL:", error);
            displayNotification("Could not load ad package details. Please select a package from the Advertise page.", false);
            // Optionally redirect back to advertise.html if data is corrupted
            // setTimeout(() => window.location.href = 'advertise.html', 3000);
        }
    } else {
        displayNotification("No ad package selected. Please choose a package from the Advertise page.", false);
        // Optionally redirect back to advertise.html if no package is selected
        // setTimeout(() => window.location.href = 'advertise.html', 3000);
    }
}


/**
 * Displays a specific step in the ad submission process.
 * @param {number} stepNumber - The main step number to display (1, 2, 3, or 4).
 */
function showAdStep(stepNumber) {
    const steps = [adStep1, adStep2, adStep3, adStep4];
    const stepNavs = [adStepDetailsNav, adStepConsentNav, adStepPaymentNav, adStepSummaryNav];

    steps.forEach((step, index) => {
        if (step) step.classList.add('hidden');
        if (stepNavs[index]) {
            stepNavs[index].classList.remove('active', 'completed');
            stepNavs[index].classList.add('text-gray-500');
        }
    });

    for (let i = 0; i < stepNumber - 1; i++) {
        if (stepNavs[i]) {
            stepNavs[i].classList.add('completed');
            stepNavs[i].classList.remove('text-gray-500');
        }
    }
    if (stepNavs[stepNumber - 1]) {
        stepNavs[stepNumber - 1].classList.add('active');
        stepNavs[stepNumber - 1].classList.remove('text-gray-500');
    }

    if (steps[stepNumber - 1]) steps[stepNumber - 1].classList.remove('hidden');
    currentAdStep = stepNumber;

    // Special handling for Step 1's sub-steps
    if (currentAdStep === 1) {
        showAdSubStep(currentAdSubStep);
    }

    if (currentAdStep === 4) {
        updateAdSummary();
    }
}

/**
 * Displays a specific sub-step within Step 1.
 * @param {number} subStepNumber - The sub-step number (1 for confirm, 2 for input).
 */
function showAdSubStep(subStepNumber) {
    if (adStep1Confirm && adStep1Input) {
        if (subStepNumber === 1) {
            adStep1Confirm.classList.remove('hidden');
            adStep1Input.classList.add('hidden');
        } else if (subStepNumber === 2) {
            adStep1Confirm.classList.add('hidden');
            adStep1Input.classList.remove('hidden');
        }
    }
    currentAdSubStep = subStepNumber;
}

/**
 * Collects all current form data and updates the summary display.
 */
function updateAdSummary() {
    adFormData.adTitle = adTitleInput ? adTitleInput.value : '';
    adFormData.adDescription = adDescriptionInput ? adDescriptionInput.value : '';
    adFormData.adTargetUrl = adTargetUrlInput ? adTargetUrlInput.value : '';
    adFormData.adImageUrl = adImageUrlInput ? adImageUrlInput.value : '';

    adFormData.consentAgreed = consentAgreementCheckbox ? consentAgreementCheckbox.checked : false;

    const selectedPaymentMethod = document.querySelector('input[name="adPaymentMethod"]:checked');
    adFormData.paymentMethod = selectedPaymentMethod ? selectedPaymentMethod.value : 'credit-card';

    let summaryHtml = `
        <h4 class="font-bold text-lg mb-2">Ad Package:</h4>
        <p><strong>Type:</strong> ${adFormData.adType}</p>
        <p><strong>Runtime:</strong> ${adFormData.adRuntime}</p>
        <p><strong>Details Level:</strong> ${adFormData.adDetailsLevel}</p>
        <p class="mb-4"><strong>Calculated Price:</strong> <span class="text-blue-600 font-bold text-xl">$${adFormData.calculatedPrice.toFixed(2)}</span></p>

        <h4 class="font-bold text-lg mb-2">Ad Content:</h4>
        <p><strong>Title:</strong> ${adFormData.adTitle || 'N/A'}</p>
        <p><strong>Description:</strong> ${adFormData.adDescription || 'N/A'}</p>
        <p><strong>Target URL:</strong> <a href="${adFormData.adTargetUrl}" target="_blank" class="text-blue-600 hover:underline">${adFormData.adTargetUrl || 'N/A'}</a></p>
        <p class="mb-4"><strong>Image URL:</strong> ${adFormData.adImageUrl || 'N/A'}</p>

        <h4 class="font-bold text-lg mb-2">Agreement & Payment:</h4>
        <p><strong>Consent Agreed:</strong> ${adFormData.consentAgreed ? 'Yes' : '<span class="text-red-500">No</span>'}</p>
        <p><strong>Payment Method:</strong> ${adFormData.paymentMethod.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
    `;

    if (adSummaryContent) {
        adSummaryContent.innerHTML = summaryHtml;
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initializeFormFromUrl(); // Call this to populate initial data

    // Event listener for "Confirm & Continue" button
    if (confirmAdDetailsBtn) {
        confirmAdDetailsBtn.addEventListener('click', () => {
            showAdSubStep(2); // Move to the input sub-step
        });
    }

    // Event listener for "Previous" button in the input sub-step (to go back to confirm)
    if (prevAdSubstep2Btn) {
        prevAdSubstep2Btn.addEventListener('click', () => {
            showAdSubStep(1); // Go back to the confirmation sub-step
        });
    }

    // Original nextAdStep1Btn now moves from input sub-step to Step 2
    if (nextAdStep1Btn) {
        nextAdStep1Btn.addEventListener('click', () => {
            // Basic client-side validation for required fields in Step 1 Input
            if (adTitleInput.checkValidity() && adDescriptionInput.checkValidity() && adTargetUrlInput.checkValidity()) {
                showAdStep(2);
            } else {
                adSubmissionForm.reportValidity(); // Show browser validation messages
                displayNotification('Please fill in all required ad details.', false);
            }
        });
    }

    if (prevAdStep2Btn) {
        prevAdStep2Btn.addEventListener('click', () => {
            // When going back from Step 2, return to the input sub-step of Step 1
            currentAdSubStep = 2; // Ensure we go back to the input part of step 1
            showAdStep(1);
        });
    }
    if (nextAdStep2Btn) {
        nextAdStep2Btn.addEventListener('click', () => {
            if (consentAgreementCheckbox && consentAgreementCheckbox.checked) {
                showAdStep(3);
            } else {
                displayNotification('You must agree to the terms and conditions to proceed.', false);
            }
        });
    }

    if (prevAdStep3Btn) {
        prevAdStep3Btn.addEventListener('click', () => showAdStep(2));
    }
    if (nextAdStep3Btn) {
        nextAdStep3Btn.addEventListener('click', () => showAdStep(4));
    }

    if (prevAdStep4Btn) {
        prevAdStep4Btn.addEventListener('click', () => showAdStep(3));
    }

    if (adSubmissionForm) {
        adSubmissionForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // Final validation before submission
            if (!adFormData.consentAgreed) {
                displayNotification('Consent agreement is required.', false);
                showAdStep(2); // Go back to consent step
                return;
            }

            console.log("Ad Order Submitted:", adFormData);
            // Display custom success modal instead of temporary notification
            openSuccessModal('Your ad order has been submitted successfully!');
            
            if (submitAdBtn) {
                submitAdBtn.disabled = true;
                submitAdBtn.textContent = 'Order Submitted!';
                submitAdBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                submitAdBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            }
        });
    }

    // Event listeners for the success modal buttons
    if (closeSuccessModalBtn) {
        closeSuccessModalBtn.addEventListener('click', closeSuccessModal);
    }
    if (goToAdvertisePageBtn) {
        goToAdvertisePageBtn.addEventListener('click', () => {
            window.location.href = 'advertise.html'; // Redirect back to the advertise page
        });
    }
});
