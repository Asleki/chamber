// js/advertise.js

// --- Ad Pricing Data ---
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
const adPricingGrid = document.getElementById('ad-pricing-grid');
const loadingMessage = document.getElementById('loading-message');

// Modal Elements
const adModal = document.getElementById('ad-modal');
const closeAdModalBtn = document.getElementById('close-ad-modal-btn');
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
const adRuntimeConfirm = document.getElementById('ad-runtime-confirm');
const adDetailsLevelConfirm = document.getElementById('ad-details-level-confirm');
const adPriceConfirm = document.getElementById('ad-price-confirm');
const confirmAdDetailsBtn = document.getElementById('confirm-ad-details-btn');

// Step 1 User Input Fields
const adTitleInput = document.getElementById('ad-title');
const adDescriptionInput = document.getElementById('ad-description');
const adTargetUrlInput = document.getElementById('ad-target-url');
const adImageUrlInput = document.getElementById('ad-image-url');
const prevAdSubstep2Btn = document.getElementById('prev-ad-substep-2-btn'); // New button for going back from input to confirm
const nextAdStep1Btn = document.getElementById('next-ad-step-1-btn'); // This button now moves from input to Step 2

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


// --- State Variables ---
let currentAdStep = 1;
let currentAdSubStep = 1; // 1 for confirm, 2 for input
let selectedAdPackage = null;
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
 * @param {string} messageText - The message to display.
 * @param {boolean} isSuccess - True for success (green), false for error (red).
 */
function displayNotification(messageText, isSuccess = true) {
    if (notificationMessageDiv) {
        notificationMessageDiv.textContent = messageText;
        notificationMessageDiv.classList.remove('opacity-0', 'notification-fade-out', 'bg-green-500', 'bg-red-500', 'opacity-100', 'show');
        
        notificationMessageDiv.classList.add('opacity-100', isSuccess ? 'bg-green-500' : 'bg-red-500');

        setTimeout(() => {
            notificationMessageDiv.classList.remove('opacity-100');
            notificationMessageDiv.classList.add('opacity-0', 'notification-fade-out');
        }, 3000);
    }
}

/**
 * Calculates the price of an ad package.
 * @param {object} adTypeData - The base ad type data.
 * @param {string} runtimeDuration - The selected runtime duration string.
 * @param {string} detailsLevel - The selected details level string.
 * @returns {number} The calculated price.
 */
function calculateAdPrice(adTypeData, runtimeDuration, detailsLevel) {
    const runtime = adTypeData.runtime.find(r => r.duration === runtimeDuration);
    const detail = adTypeData.details.find(d => d.level === detailsLevel);

    if (!runtime || !detail) {
        console.error("Invalid runtime or detail level selected.");
        return 0;
    }

    return adTypeData.basePrice * runtime.multiplier * detail.priceFactor;
}

/**
 * Renders the advertising pricing cards on the page.
 */
function renderAdPricing() {
    if (!adPricingGrid) return;

    adPricingGrid.innerHTML = '';
    if (loadingMessage) {
        loadingMessage.classList.add('hidden');
    }

    adPricingData.forEach(adPackage => {
        const cardHtml = `
            <div class="ad-card bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <div class="ad-card-header mb-4">
                    <h3 class="text-3xl font-bold text-gray-900 mb-2">${adPackage.type}</h3>
                    <p class="text-gray-600 text-sm">${adPackage.description}</p>
                </div>
                <div class="mb-6">
                    <h4 class="text-xl font-semibold text-gray-800 mb-3">Details & Features:</h4>
                    <div class="space-y-4">
                        ${adPackage.details.map(detail => `
                            <div class="border border-gray-200 rounded-lg p-3">
                                <h5 class="font-bold text-lg text-blue-600">${detail.level}</h5>
                                <ul class="list-disc list-inside text-gray-700 text-sm ad-card-features mt-1">
                                    ${detail.features.map(f => `<li>${f}</li>`).join('')}
                                </ul>
                                <p class="mt-2 text-gray-800 font-semibold">Base Price Factor: ${detail.priceFactor.toFixed(1)}x</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="mb-6">
                    <h4 class="text-xl font-semibold text-gray-800 mb-3">Runtime Options:</h4>
                    <div class="space-y-2">
                        ${adPackage.runtime.map(runtime => `
                            <div class="flex justify-between items-center text-gray-700">
                                <span>${runtime.duration}</span>
                                <span>${runtime.multiplier.toFixed(1)}x</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="text-center mt-auto">
                    <p class="text-xl font-bold text-gray-800 mb-4">Starting from: <span class="text-blue-600 text-3xl">$${adPackage.basePrice.toFixed(2)}</span></p>
                    <button
                        class="select-ad-package-btn bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                        data-ad-type="${adPackage.type}"
                    >
                        Select This Package
                    </button>
                </div>
            </div>
        `;
        adPricingGrid.insertAdjacentHTML('beforeend', cardHtml);
    });

    document.querySelectorAll('.select-ad-package-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const adType = event.currentTarget.dataset.adType;
            const selectedPackageData = adPricingData.find(p => p.type === adType);
            if (selectedPackageData) {
                openAdModal(selectedPackageData);
            }
        });
    });
}

/**
 * Opens the ad submission modal and pre-fills selected package details.
 * @param {object} packageData - The selected ad package data.
 */
function openAdModal(packageData) {
    if (!adModal) return;

    selectedAdPackage = packageData;
    currentAdStep = 1;
    currentAdSubStep = 1; // Start with the confirmation sub-step

    adSubmissionForm.reset();
    adFormData = {
        adType: selectedAdPackage.type,
        adRuntime: selectedAdPackage.runtime[0].duration,
        adDetailsLevel: selectedAdPackage.details[0].level,
        calculatedPrice: 0,
        adTitle: '',
        adDescription: '',
        adTargetUrl: '',
        adImageUrl: '',
        consentAgreed: false,
        paymentMethod: 'credit-card'
    };

    // Pre-fill confirmation fields
    if (adTypeConfirm) adTypeConfirm.value = adFormData.adType;
    if (adRuntimeConfirm) adRuntimeConfirm.value = adFormData.adRuntime;
    if (adDetailsLevelConfirm) adDetailsLevelConfirm.value = adFormData.adDetailsLevel;
    
    adFormData.calculatedPrice = calculateAdPrice(
        selectedAdPackage,
        adFormData.adRuntime,
        adFormData.adDetailsLevel
    );
    if (adPriceConfirm) adPriceConfirm.value = `$${adFormData.calculatedPrice.toFixed(2)}`;
    if (adFinalTotalSpan) adFinalTotalSpan.textContent = `$${adFormData.calculatedPrice.toFixed(2)}`;

    adModal.classList.remove('hidden');
    showAdStep(currentAdStep); // This will call showAdSubStep(1) internally for step 1

    if (submitAdBtn) {
        submitAdBtn.disabled = false;
        submitAdBtn.textContent = 'Place Ad Order';
        submitAdBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitAdBtn.classList.add('bg-green-600', 'hover:bg-green-700');
    }
}

/**
 * Closes the ad submission modal.
 */
function closeAdModal() {
    if (adModal) adModal.classList.add('hidden');
    adSubmissionForm.reset();
    selectedAdPackage = null;
    adFormData = {};
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
    renderAdPricing();

    if (closeAdModalBtn) {
        closeAdModalBtn.addEventListener('click', closeAdModal);
    }

    if (adModal) {
        adModal.addEventListener('click', (event) => {
            if (event.target === adModal) {
                closeAdModal();
            }
        });
    }

    // New event listener for "Confirm & Continue" button
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
            if (adTitleInput.checkValidity() && adDescriptionInput.checkValidity() && adTargetUrlInput.checkValidity()) {
                showAdStep(2);
            } else {
                adSubmissionForm.reportValidity();
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

            if (!adFormData.consentAgreed) {
                displayNotification('Consent agreement is required.', false);
                showAdStep(2);
                return;
            }

            console.log("Ad Order Submitted:", adFormData);
            displayNotification('Your ad order has been submitted successfully!', true);
            
            if (submitAdBtn) {
                submitAdBtn.disabled = true;
                submitAdBtn.textContent = 'Order Submitted!';
                submitAdBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                submitAdBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            }
        });
    }
});
