// js/blog.js

document.addEventListener('DOMContentLoaded', () => {
    const blogPostsContainer = document.getElementById('blog-posts-container');
    const loadingMessage = document.getElementById('blog-loading-message');
    const errorMessage = document.getElementById('blog-error-message');
    const blogSearch = document.getElementById('blog-search');
    const blogCategoryFilter = document.getElementById('blog-category-filter');
    const noBlogPostsMessage = document.getElementById('no-blog-posts-message');

    let allBlogPosts = []; // To store all fetched blog posts

    const toggleVisibility = (element, show) => {
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    };

    const fetchBlogPosts = async () => {
        toggleVisibility(loadingMessage, true);
        toggleVisibility(errorMessage, false);
        toggleVisibility(noBlogPostsMessage, false);

        try {
            // Assuming blog-posts.json is in a 'data' folder.
            // You would create a similar JSON file for your blog posts.
            // For now, it will load an empty array if file not found, or use placeholders if you remove the fetch.
            const response = await fetch('./data/blog-posts.json');
            if (!response.ok) {
                // If file doesn't exist, log error but don't stop execution
                console.warn('blog-posts.json not found or could not be loaded. Displaying placeholders if any.');
                // Simulate empty data, or handle error
                allBlogPosts = [];
            } else {
                allBlogPosts = await response.json();
            }
            displayBlogPosts(allBlogPosts);

        } catch (error) {
            console.error('Failed to load blog posts:', error);
            toggleVisibility(loadingMessage, false);
            toggleVisibility(errorMessage, true);
            if (errorMessage) {
                errorMessage.textContent = 'Failed to load blog posts. Please try again later. 😟';
            }
            // Ensure placeholders are shown if data fetch fails entirely
            if (blogPostsContainer) {
                // If there are existing placeholders in HTML, ensure they remain if JS fails to fetch
                // If you want to strictly only show dynamic content, you'd clear this.
                // For this example, if JS fails, the static HTML placeholders remain.
            }
        } finally {
            toggleVisibility(loadingMessage, false);
        }
    };

    const displayBlogPosts = (posts) => {
        if (blogPostsContainer) {
            // Clear existing posts before displaying new ones
            blogPostsContainer.innerHTML = '';
        }

        if (posts.length === 0) {
            toggleVisibility(noBlogPostsMessage, true);
            return;
        } else {
            toggleVisibility(noBlogPostsMessage, false);
        }

        posts.forEach(post => {
            const postCard = document.createElement('article');
            postCard.classList.add('blog-post-card');

            const postImageHtml = post.image ? `<img src="${post.image}" alt="${post.title}" class="blog-post-image">` : '';
            const postCategoryHtml = post.category ? `<span class="blog-post-category">${post.category}</span>` : '';

            postCard.innerHTML = `
                ${postImageHtml}
                <div class="blog-post-content">
                    ${postCategoryHtml}
                    <h2 class="blog-post-title">${post.title}</h2>
                    <p class="blog-post-meta">By ${post.author} | <time datetime="${post.date}">${post.date}</time></p>
                    <p class="blog-post-excerpt">${post.excerpt}</p>
                    <a href="blog-post-detail.html?id=${post.id}" class="read-more-button">Read More</a>
                </div>
            `;
            if (blogPostsContainer) {
                blogPostsContainer.appendChild(postCard);
            }
        });
    };

    const filterBlogPosts = () => {
        const searchTerm = blogSearch.value.toLowerCase();
        const selectedCategory = blogCategoryFilter.value.toLowerCase();

        const filtered = allBlogPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
                                  post.excerpt.toLowerCase().includes(searchTerm) ||
                                  post.author.toLowerCase().includes(searchTerm);

            const matchesCategory = selectedCategory === '' || (post.category && post.category.toLowerCase() === selectedCategory);
            
            return matchesSearch && matchesCategory;
        });

        displayBlogPosts(filtered);
    };

    // Add event listeners for search and filter
    if (blogSearch) {
        blogSearch.addEventListener('keyup', filterBlogPosts);
    }
    if (blogCategoryFilter) {
        blogCategoryFilter.addEventListener('change', filterBlogPosts);
    }

    // Initial fetch when the page loads
    fetchBlogPosts();
});