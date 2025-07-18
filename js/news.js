// js/news.js

document.addEventListener('DOMContentLoaded', () => {
    const isHomepage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const isNewsPage = window.location.pathname.includes('news.html');

    let newsContainer;
    let loadingMessage;
    let errorMessage;

    if (isHomepage) {
        newsContainer = document.getElementById('homepage-news-container');
        loadingMessage = document.getElementById('homepage-news-loading-message');
        errorMessage = document.getElementById('homepage-news-error-message');
    } else if (isNewsPage) {
        newsContainer = document.getElementById('all-news-container');
        loadingMessage = document.getElementById('all-news-loading-message');
        errorMessage = document.getElementById('all-news-error-message');
    }

    // Modal elements (only relevant for news.html)
    const newsModal = document.getElementById('news-modal');
    const modalTitle = document.getElementById('news-modal-title');
    const modalContent = document.getElementById('news-modal-content');
    const modalCloseButton = document.getElementById('news-modal-close');

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

    // Fetch news data
    const fetchNews = async () => {
        toggleVisibility(loadingMessage, true);
        toggleVisibility(errorMessage, false);

        try {
            // Assuming news.json is in a 'data' folder at the root level.
            // Adjust this path if your news.json is located elsewhere.
            const response = await fetch('/data/news.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allNewsData = await response.json();

            let newsToDisplay = [];
            if (isHomepage) {
                newsToDisplay = allNewsData.filter(article => article.isFeaturedOnHomepage);
            } else if (isNewsPage) {
                newsToDisplay = allNewsData;
            }

            displayNews(newsToDisplay);

        } catch (error) {
            console.error('Failed to load news:', error);
            toggleVisibility(loadingMessage, false);
            toggleVisibility(errorMessage, true);
            if (errorMessage) {
                errorMessage.textContent = 'Failed to load news. Please try again later. 😟';
            }
        } finally {
            toggleVisibility(loadingMessage, false);
        }
    };

    // Function to display news articles
    const displayNews = (newsArticles) => {
        toggleVisibility(loadingMessage, false);

        if (newsContainer) {
            newsContainer.innerHTML = '';
        }

        if (newsArticles.length === 0) {
            if (newsContainer) {
                newsContainer.innerHTML = '<p class="loading-message">No news articles to display at the moment.</p>';
            }
            return;
        }

        newsArticles.forEach(article => {
            const newsItem = document.createElement('article');
            newsItem.classList.add('news-item');

            const imageHtml = article.image ? `<img src="${article.image}" alt="${article.title}" class="news-item-image">` : '';
            let titleHtml;
            let readMoreButtonHtml = ''; // For the "Read More" button

            if (isNewsPage && !article.hasDedicatedPage) {
                // For news page articles without dedicated pages: clickable title/summary opens modal
                titleHtml = `<h4 class="news-item-title"><span class="news-modal-trigger">${article.title}</span></h4>`;
                readMoreButtonHtml = `<button class="cta-button secondary-cta read-more-button news-modal-trigger">Read More</button>`;
                newsItem.dataset.articleId = article.id; // Store ID for modal lookup
            } else {
                // For homepage articles AND news page articles with dedicated pages: link to dedicated page
                const link = article.link || '#'; // Fallback link if no dedicated link exists but somehow passed filter
                titleHtml = `<h4 class="news-item-title"><a href="${link}">${article.title}</a></h4>`;
                readMoreButtonHtml = `<a href="${link}" class="cta-button secondary-cta read-more-button">Read More</a>`;
            }

            newsItem.innerHTML = `
                ${imageHtml}
                ${titleHtml}
                <p class="news-item-summary">${article.summary}</p>
                <p class="news-item-date">${article.date}</p>
                ${readMoreButtonHtml}
            `;
            if (newsContainer) {
                newsContainer.appendChild(newsItem);
            }
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
                            modalContent.innerHTML = `<p>${article.fullText}</p><p class="modal-article-date">Published: ${article.date}</p>`; // Display full text
                            toggleVisibility(newsModal, true);
                            document.body.classList.add('modal-open'); // To prevent body scroll
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

            // Close modal when clicking outside
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

    // Initial load of news when the page loads
    if (newsContainer) {
        fetchNews();
    } else {
        console.warn('News container not found for this page. News fetching aborted.');
    }
});