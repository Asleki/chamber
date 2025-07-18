// js/news.js

document.addEventListener('DOMContentLoaded', () => {
    const isHomepage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const isNewsPage = window.location.pathname.includes('news.html');

    // DOM elements for general news display (primarily for news.html)
    let newsContainer;
    let loadingMessage;
    let errorMessage;

    // DOM elements specific to homepage carousel
    let homepageCarouselSlides;
    let homepageCarouselPagination;
    let homepageLoadingMessage;
    let homepageErrorMessage;


    // Modal elements (only relevant for news.html)
    const newsModal = document.getElementById('news-modal');
    const modalTitle = document.getElementById('news-modal-title');
    const modalContent = document.getElementById('news-modal-content');
    const modalCloseButton = document.getElementById('news-modal-close');

    // Carousel specific variables
    let featuredNewsArticles = [];
    let currentSlideIndex = 0;
    let carouselInterval; // To hold the interval ID for auto-play

    if (isHomepage) {
        homepageCarouselSlides = document.getElementById('homepage-news-carousel-slides');
        homepageCarouselPagination = document.getElementById('homepage-news-carousel-pagination');
        homepageLoadingMessage = document.getElementById('homepage-news-loading-message');
        homepageErrorMessage = document.getElementById('homepage-news-error-message');
    } else if (isNewsPage) {
        newsContainer = document.getElementById('all-news-container');
        loadingMessage = document.getElementById('all-news-loading-message');
        errorMessage = document.getElementById('all-news-error-message');
    }

    // Function to show/hide elements
    const toggleVisibility = (element, show) => {
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    };

    /**
     * Renders a single news article into a carousel slide element.
     * @param {object} article - The news article object.
     * @returns {HTMLElement} The created carousel slide element.
     */
    const createCarouselSlide = (article) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        slide.innerHTML = `
            ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
            <h4>${article.title}</h4>
            <p>${article.summary}</p>
            <p class="news-item-date">${article.date}</p>
            <a href="${article.link || '#'}" class="cta-button secondary-cta read-more-button">Read More</a>
        `;
        return slide;
    };

    /**
     * Displays the specified slide in the carousel.
     * @param {number} index - The index of the slide to display.
     */
    const showSlide = (index) => {
        if (!homepageCarouselSlides || featuredNewsArticles.length === 0) return;

        // Hide all slides
        const slides = homepageCarouselSlides.querySelectorAll('.carousel-slide');
        slides.forEach(slide => slide.classList.remove('active'));

        // Deactivate all dots
        const dots = homepageCarouselPagination.querySelectorAll('.pagination-dot');
        dots.forEach(dot => dot.classList.remove('active'));

        // Show the current slide and activate its dot
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        currentSlideIndex = index;
    };

    /**
     * Moves the carousel to the next slide.
     */
    const nextSlide = () => {
        if (featuredNewsArticles.length === 0) return;
        currentSlideIndex = (currentSlideIndex + 1) % featuredNewsArticles.length;
        showSlide(currentSlideIndex);
    };

    /**
     * Starts the automatic carousel rotation.
     */
    const startCarousel = () => {
        stopCarousel(); // Clear any existing interval before starting a new one
        if (featuredNewsArticles.length > 1) {
            carouselInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }
    };

    /**
     * Stops the automatic carousel rotation.
     */
    const stopCarousel = () => {
        clearInterval(carouselInterval);
    };

    // Fetch news data
    const fetchNews = async () => {
        if (isHomepage) {
            toggleVisibility(homepageLoadingMessage, true);
            toggleVisibility(homepageErrorMessage, false);
        } else if (isNewsPage) {
            toggleVisibility(loadingMessage, true);
            toggleVisibility(errorMessage, false);
        }

        try {
            const response = await fetch('/data/news.json'); // Adjust path if your news.json is elsewhere
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allNewsData = await response.json();

            if (isHomepage) {
                featuredNewsArticles = allNewsData.filter(article => article.isFeaturedOnHomepage);
                displayHomepageCarousel(featuredNewsArticles);
            } else if (isNewsPage) {
                displayNewsList(allNewsData); // Display all news for the news page
            }

        } catch (error) {
            console.error('Failed to load news:', error);
            if (isHomepage) {
                toggleVisibility(homepageLoadingMessage, false);
                toggleVisibility(homepageErrorMessage, true);
                if (homepageErrorMessage) {
                    homepageErrorMessage.textContent = 'Failed to load news. Please try again later. 😟';
                }
            } else if (isNewsPage) {
                toggleVisibility(loadingMessage, false);
                toggleVisibility(errorMessage, true);
                if (errorMessage) {
                    errorMessage.textContent = 'Failed to load news. Please try again later. 😟';
                }
            }
        } finally {
            if (isHomepage) {
                toggleVisibility(homepageLoadingMessage, false);
            } else if (isNewsPage) {
                toggleVisibility(loadingMessage, false);
            }
        }
    };

    /**
     * Displays news articles in a list format (for news.html).
     * @param {Array<object>} newsArticles - Array of news article objects.
     */
    const displayNewsList = (newsArticles) => {
        if (!newsContainer) return;

        newsContainer.innerHTML = ''; // Clear previous content

        if (newsArticles.length === 0) {
            newsContainer.innerHTML = '<p class="loading-message">No news articles to display at the moment.</p>';
            return;
        }

        newsArticles.forEach(article => {
            const newsItem = document.createElement('article');
            newsItem.classList.add('news-item');

            const imageHtml = article.image ? `<img src="${article.image}" alt="${article.title}" class="news-item-image">` : '';
            let titleHtml;
            let readMoreButtonHtml = '';

            if (!article.hasDedicatedPage) { // For news page articles without dedicated pages: clickable title/summary opens modal
                titleHtml = `<h4 class="news-item-title"><span class="news-modal-trigger">${article.title}</span></h4>`;
                readMoreButtonHtml = `<button class="cta-button secondary-cta read-more-button news-modal-trigger">Read More</button>`;
                newsItem.dataset.articleId = article.id; // Store ID for modal lookup
            } else { // For news page articles with dedicated pages: link to dedicated page
                const link = article.link || '#';
                titleHtml = `<h4 class="news-item-title"><a href="${link}">${article.title}</a></h4>`;
                readMoreButtonHtml = `<a href="${link}" class="cta-button secondary-cta read-more-button">Read More</a>`;
            }

            // Updated structure for news.html layout
            newsItem.innerHTML = `
                ${imageHtml}
                <div class="news-item-text-content">
                    ${titleHtml}
                    <p class="news-item-summary">${article.summary}</p>
                    <p class="news-item-date">${article.date}</p>
                    ${readMoreButtonHtml}
                </div>
            `;
            newsContainer.appendChild(newsItem);
        });

        // Add event listeners for modals ONLY if on news page
        if (isNewsPage) {
            document.querySelectorAll('.news-modal-trigger').forEach(trigger => {
                trigger.addEventListener('click', (event) => {
                    const articleElement = event.target.closest('.news-item');
                    if (articleElement && newsModal && modalTitle && modalContent) {
                        const articleId = articleElement.dataset.articleId;
                        const article = newsArticles.find(a => a.id === articleId);

                        if (article) {
                            modalTitle.textContent = article.title;
                            modalContent.innerHTML = `<p>${article.fullText}</p><p class="modal-article-date">Published: ${article.date}</p>`;
                            toggleVisibility(newsModal, true);
                            document.body.classList.add('modal-open');
                        }
                    }
                });
            });

            if (modalCloseButton) {
                modalCloseButton.addEventListener('click', () => {
                    toggleVisibility(newsModal, false);
                    document.body.classList.remove('modal-open');
                });
            }

            if (newsModal) {
                newsModal.addEventListener('click', (event) => {
                    if (event.target === newsModal) {
                        toggleVisibility(newsModal, false);
                        document.body.classList.remove('modal-open');
                    }
                });
            }
        }
    };

    /**
     * Displays news articles in a carousel format (for index.html).
     * @param {Array<object>} articles - Array of featured news article objects.
     */
    const displayHomepageCarousel = (articles) => {
        if (!homepageCarouselSlides || !homepageCarouselPagination) return;

        homepageCarouselSlides.innerHTML = ''; // Clear loading message
        homepageCarouselPagination.innerHTML = ''; // Clear previous dots

        if (articles.length === 0) {
            homepageCarouselSlides.innerHTML = '<p class="loading-message">No featured news to display at the moment.</p>';
            return;
        }

        articles.forEach((article, index) => {
            const slide = createCarouselSlide(article);
            homepageCarouselSlides.appendChild(slide);

            const dot = document.createElement('span');
            dot.classList.add('pagination-dot');
            dot.dataset.slideIndex = index;
            dot.addEventListener('click', () => {
                stopCarousel(); // Stop auto-play on manual navigation
                showSlide(index);
                startCarousel(); // Restart auto-play
            });
            homepageCarouselPagination.appendChild(dot);
        });

        showSlide(currentSlideIndex); // Show the first slide
        startCarousel(); // Start auto-play
    };


    // Initial load of news when the page loads
    // Determine which display function to call based on the page
    if (isHomepage || isNewsPage) {
        fetchNews();
    } else {
        console.warn('News container not found for this page. News fetching aborted.');
    }
});
