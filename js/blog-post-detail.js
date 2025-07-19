// js/blog-post-detail.js

document.addEventListener('DOMContentLoaded', () => {
    const detailLoadingMessage = document.getElementById('detail-loading-message');
    const detailErrorMessage = document.getElementById('detail-error-message');
    const blogPostContentArea = document.getElementById('blog-post-content-area');

    const postTitle = document.getElementById('post-title');
    const postAuthor = document.getElementById('post-author');
    const postDate = document.getElementById('post-date');
    const postCategory = document.getElementById('post-category');
    const postImage = document.getElementById('post-image');
    const postFullContent = document.getElementById('post-full-content');

    const shareButton = document.getElementById('share-button');
    const shareOptions = document.getElementById('share-options');
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const ogImage = document.getElementById('og-image');
    const ogUrl = document.getElementById('og-url');
    const pageTitle = document.getElementById('blog-detail-title');
    const metaDescription = document.getElementById('blog-detail-description');
    const metaAuthor = document.getElementById('blog-detail-author');

    let currentPost = null;

    const toggleVisibility = (element, show) => {
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    };

    // Function to parse URL parameters
    const getUrlParameter = (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const fetchBlogPost = async (postId) => {
        toggleVisibility(detailLoadingMessage, true);
        toggleVisibility(detailErrorMessage, false);
        toggleVisibility(blogPostContentArea, false);

        try {
            const response = await fetch('./data/blog-posts.json'); // Adjust path as needed
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const posts = await response.json();
            currentPost = posts.find(post => post.id === postId);

            if (currentPost) {
                renderBlogPost(currentPost);
                toggleVisibility(blogPostContentArea, true);
            } else {
                toggleVisibility(detailErrorMessage, true);
                detailErrorMessage.querySelector('p:first-child').textContent = 'Blog post not found.';
            }
        } catch (error) {
            console.error('Failed to load blog post:', error);
            toggleVisibility(detailErrorMessage, true);
        } finally {
            toggleVisibility(detailLoadingMessage, false);
        }
    };

    const renderBlogPost = (post) => {
        if (!post) return;

        // Update page title and meta tags for SEO
        pageTitle.textContent = `${post.title} | La Familia Chamber of Commerce Blog`;
        metaDescription.setAttribute('content', post.excerpt);
        metaAuthor.setAttribute('content', post.author);
        ogTitle.setAttribute('content', post.title);
        ogDescription.setAttribute('content', post.excerpt);
        if (post.image) {
            ogImage.setAttribute('content', window.location.origin + '/' + post.image); // Absolute URL for OG image
        }
        ogUrl.setAttribute('content', window.location.href);

        // Update content elements
        postTitle.textContent = post.title;
        postAuthor.textContent = post.author;
        postDate.textContent = post.date;
        postDate.setAttribute('datetime', post.date); // For semantic date
        postCategory.textContent = post.category;
        
        if (post.image) {
            postImage.src = post.image;
            postImage.alt = post.title;
        } else {
            postImage.style.display = 'none'; // Hide image if none provided
        }

        // Check if fullContentArray exists, otherwise fall back to fullContent 
        if (post.fullContentArray && Array.isArray(post.fullContentArray)) {
            postFullContent.innerHTML = post.fullContentArray.join('\n'); // Join with newlines for subtle spacing in source, or just ''
        } else if (post.fullContent) {
            postFullContent.innerHTML = post.fullContent;
        } else {
            postFullContent.innerHTML = '<p>Content coming soon!</p>';
        }

        // Set up social share links
        const currentUrl = encodeURIComponent(window.location.href);
        const currentTitle = encodeURIComponent(post.title);

        document.querySelector('.share-icon.facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
        document.querySelector('.share-icon.twitter').href = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${currentTitle}`;
        document.querySelector('.share-icon.linkedin').href = `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${currentTitle}&summary=${encodeURIComponent(post.excerpt)}&source=${encodeURIComponent('La Familia Chamber of Commerce')}`;
        document.querySelector('.share-icon.whatsapp').href = `https://api.whatsapp.com/send?text=${currentTitle}%20${currentUrl}`;
    };

    // Toggle share options visibility
    if (shareButton) {
        shareButton.addEventListener('click', (e) => {
            e.preventDefault();
            toggleVisibility(shareOptions, !shareOptions.classList.contains('hidden'));
        });
    }

    // Get blog post ID from URL and fetch details
    const postId = getUrlParameter('id');
    if (postId) {
        fetchBlogPost(postId);
    } else {
        toggleVisibility(detailLoadingMessage, false);
        toggleVisibility(detailErrorMessage, true);
        detailErrorMessage.querySelector('p:first-child').textContent = 'No blog post ID specified.';
    }
});