// js/advertise.js

// --- Ad Pricing Data (Example data, you can expand this) ---
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
    }
];

// --- DOM Elements ---
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
const adRuntimeSelect = document.getElementById('ad-runtime-select');
const adDetailsLevelSelect = document.getElementById('ad-details-level-select');
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

// Form element itself
const adSubmissionForm = document.getElementById('ad-submission-form');

// Notification element (make sure this div exists in your HTML)
const notificationMessageDiv = document.getElementById('notification-message');

// Success Modal Elements
// These declarations are crucial for the modal to work.
const successModal = document.getElementById('success-modal');
const successMessageContent = document.getElementById('success-message-content');
const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
const goToAdvertisePageBtn = document.getElementById('go-to-advertise-page-btn');


// --- State Variables ---
let currentAdStep = 1;
let currentAdSubStep = 1; // 1 for confirm, 2 for input
let selectedAdPackage = null; // This will hold the selected package data from adPricingData

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
    paymentMethod: 'credit-card' // Default payment method
};

// --- Utility Functions ---

/**
 * Displays a temporary notification message.
 * @param {string} messageText - The message to display.
 * @param {boolean} isSuccess - True for success (green), false for error (red).
 */
function displayNotification(messageText, isSuccess = true) {
    if (notificationMessageDiv) {
        notificationMessageDiv.textContent = messageText;
        notificationMessageDiv.classList.remove('hidden', 'notification-success', 'notification-error');
        notificationMessageDiv.classList.add(isSuccess ? 'notification-success' : 'notification-error', 'visible'); // Using 'visible' for opacity transition

        setTimeout(() => {
            notificationMessageDiv.classList.remove('visible');
            // Hide after transition
            setTimeout(() => {
                notificationMessageDiv.classList.add('hidden');
                notificationMessageDiv.textContent = '';
            }, 500); // Matches CSS transition duration
        }, 3000);
    } else {
        console.warn('Notification message div not found. Message:', messageText);
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
        successModal.classList.add('visible'); // Trigger CSS opacity transition
    }
}

/**
 * Closes the success message modal.
 */
function closeSuccessModal() {
    if (successModal) {
        successModal.classList.remove('visible');
        setTimeout(() => {
            successModal.classList.add('hidden');
        }, 300); // Matches CSS transition duration
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
        // Set value based on current form data or first option
        adRuntimeSelect.value = adFormData.adRuntime || (selectedAdPackage.runtime[0] ? selectedAdPackage.runtime[0].duration : '');
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
        // Set value based on current form data or first option
        adDetailsLevelSelect.value = adFormData.adDetailsLevel || (selectedAdPackage.details[0] ? selectedAdPackage.details[0].level : '');
    }

    // Remove old listeners to prevent multiple triggers (important for dynamic updates)
    adRuntimeSelect.removeEventListener('change', updateCalculatedPrice);
    adDetailsLevelSelect.removeEventListener('change', updateCalculatedPrice);

    // Add new event listeners for changes to update price
    adRuntimeSelect.addEventListener('change', updateCalculatedPrice);
    adDetailsLevelSelect.addEventListener('change', updateCalculatedPrice);
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
 * Initializes the form. Sets a default ad package and initial step visibility.
 */
function initializeForm() {
    selectedAdPackage = adPricingData[0]; // Set a default ad package (e.g., Banner Ad)

    if (selectedAdPackage) {
        adFormData.adType = selectedAdPackage.type;
        adFormData.adRuntime = selectedAdPackage.runtime[0] ? selectedAdPackage.runtime[0].duration : '';
        adFormData.adDetailsLevel = selectedAdPackage.details[0] ? selectedAdPackage.details[0].level : '';

        populateDropdowns();
        updateCalculatedPrice();

        if (adTypeConfirm) adTypeConfirm.value = adFormData.adType;

        // Ensure only the first step and its first sub-step are visible
        showAdStep(1); // Explicitly show step 1 and its confirm sub-step
    } else {
        displayNotification("No ad packages configured. Please check pricing data.", false);
        // Hide all steps if no package is available to prevent them from showing
        [adStep1, adStep2, adStep3, adStep4].forEach(step => {
            if (step) step.hidden = true; // Use 'hidden' attribute
        });
    }

    // Add a div for notifications if it doesn't exist
    if (!notificationMessageDiv) {
        const notificationDiv = document.createElement('div');
        notificationDiv.id = 'notification-message';
        notificationDiv.classList.add('hidden'); // Initially hidden
        // This line attempts to insert it before the form. Ensure adSubmissionForm exists.
        // If adSubmissionForm is null here, it won't add the notification div.
        if (adSubmissionForm && adSubmissionForm.parentNode) {
            adSubmissionForm.parentNode.insertBefore(notificationDiv, adSubmissionForm);
        } else {
            document.body.appendChild(notificationDiv); // Fallback to appending to body
            console.warn("Could not insert notification div before form; appended to body instead.");
        }
    }
}


/**
 * Displays a specific step in the ad submission process.
 * Manages visibility of step content using the 'hidden' attribute and styling of stepper navigation.
 * @param {number} stepNumber - The main step number to display (1, 2, 3, or 4).
 */
function showAdStep(stepNumber) {
    const steps = [adStep1, adStep2, adStep3, adStep4];
    const stepNavs = [adStepDetailsNav, adStepConsentNav, adStepPaymentNav, adStepSummaryNav];

    // 1. Hide all step content initially using the 'hidden' attribute
    steps.forEach(step => {
        if (step) step.hidden = true;
    });

    // 2. Reset all stepper navs to their default inactive state
    stepNavs.forEach(nav => {
        if (nav) {
            nav.classList.remove('active');
        }
    });

    // 3. Mark current step as 'active'
    if (stepNavs[stepNumber - 1]) {
        stepNavs[stepNumber - 1].classList.add('active');
    }

    // 4. Show the current step content by removing the 'hidden' attribute
    if (steps[stepNumber - 1]) steps[stepNumber - 1].hidden = false;
    currentAdStep = stepNumber;

    // Special handling for Step 1's sub-steps
    if (currentAdStep === 1) {
        showAdSubStep(currentAdSubStep); // Ensure the correct sub-step of Step 1 is shown
    }

    // Update summary when reaching the summary step
    if (currentAdStep === 4) {
        updateAdSummary();
    }
}

/**
 * Displays a specific sub-step within Step 1 using the 'hidden' attribute.
 * @param {number} subStepNumber - The sub-step number (1 for confirm, 2 for input).
 */
function showAdSubStep(subStepNumber) {
    if (adStep1Confirm && adStep1Input) {
        if (subStepNumber === 1) {
            adStep1Confirm.hidden = false;
            adStep1Input.hidden = true;
        } else if (subStepNumber === 2) {
            adStep1Confirm.hidden = true;
            adStep1Input.hidden = false;
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
        <h4>Ad Package:</h4>
        <p><strong>Type:</strong> ${adFormData.adType}</p>
        <p><strong>Runtime:</strong> ${adFormData.adRuntime}</p>
        <p><strong>Details Level:</strong> ${adFormData.adDetailsLevel}</p>
        <p class="mb-4"><strong>Calculated Price:</strong> <span class="total-amount-display">$${adFormData.calculatedPrice.toFixed(2)}</span></p>

        <h4>Ad Content:</h4>
        <p><strong>Title:</strong> ${adFormData.adTitle || 'N/A'}</p>
        <p><strong>Description:</strong> ${adFormData.adDescription || 'N/A'}</p>
        <p><strong>Target URL:</strong> <a href="${adFormData.adTargetUrl}" target="_blank">${adFormData.adTargetUrl || 'N/A'}</a></p>
        <p class="mb-4"><strong>Image URL:</strong> ${adFormData.adImageUrl || 'N/A'}</p>

        <h4>Agreement & Payment:</h4>
        <p><strong>Consent Agreed:</strong> ${adFormData.consentAgreed ? '<span class="success-text">Yes</span>' : '<span class="error-text">No</span>'}</p>
        <p><strong>Payment Method:</strong> ${adFormData.paymentMethod.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
    `;

    if (adSummaryContent) {
        adSummaryContent.innerHTML = summaryHtml;
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial call to set up the form and show the first step
    initializeForm();

    // Event listener for "Confirm & Continue" button (Step 1.1 to Step 1.2)
    if (confirmAdDetailsBtn) {
        confirmAdDetailsBtn.addEventListener('click', () => {
            showAdSubStep(2); // Move to the input sub-step
        });
    }

    // Event listener for "Previous" button in the input sub-step (Step 1.2 to Step 1.1)
    if (prevAdSubstep2Btn) {
        prevAdSubstep2Btn.addEventListener('click', () => {
            showAdSubStep(1); // Go back to the confirmation sub-step
        });
    }

    // "Next" button from Step 1.2 to Step 2
    if (nextAdStep1Btn) {
        nextAdStep1Btn.addEventListener('click', () => {
            // Basic client-side validation for required fields in Step 1 Input
            const formElements = [adTitleInput, adDescriptionInput, adTargetUrlInput];
            let allValid = true;
            for (const el of formElements) {
                if (el && !el.value.trim()) { // Check if element exists AND value is empty
                    el.reportValidity(); // Show browser's built-in validation message
                    allValid = false;
                    break;
                }
            }

            if (allValid) {
                showAdStep(2);
            } else {
                displayNotification('Please fill in all required ad details.', false);
            }
        });
    }

    // Navigation buttons for Step 2
    if (prevAdStep2Btn) {
        prevAdStep2Btn.addEventListener('click', () => {
            currentAdSubStep = 2; // Ensure we return to the input part of step 1
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

    // Navigation buttons for Step 3
    if (prevAdStep3Btn) {
        prevAdStep3Btn.addEventListener('click', () => showAdStep(2));
    }
    if (nextAdStep3Btn) {
        nextAdStep3Btn.addEventListener('click', () => showAdStep(4));
    }

    // Navigation buttons for Step 4
    if (prevAdStep4Btn) {
        prevAdStep4Btn.addEventListener('click', () => showAdStep(3));
    }

    // Form submission
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
            openSuccessModal('Your ad order has been submitted successfully!');

            // Disable submit button after successful submission
            if (submitAdBtn) {
                submitAdBtn.disabled = true;
                submitAdBtn.textContent = 'Order Submitted!';
                // Remove existing button classes and add disabled ones
                submitAdBtn.classList.remove('primary', 'success');
                // Make sure 'disabled-button' class is defined in your CSS if you use it for styling
                submitAdBtn.classList.add('disabled-button'); 
            }
        });
    }

    // Event listeners for the success modal buttons
    if (closeSuccessModalBtn) {
        closeSuccessModalBtn.addEventListener('click', closeSuccessModal);
    }
    if (goToAdvertisePageBtn) {
        goToAdvertisePageBtn.addEventListener('click', () => {
            // Redirect to a hypothetical 'advertise.html' or similar page
            window.location.href = 'advertise.html';
        });
    }

    // Event listeners for payment method radios to update adFormData
    adPaymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            adFormData.paymentMethod = event.target.value;
        });
    });
});