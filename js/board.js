// js/board.js

document.addEventListener('DOMContentLoaded', () => {
    const boardContainer = document.getElementById('board-container');
    const executiveContainer = document.getElementById('executive-container');
    const loadingMessage = document.getElementById('overall-board-loading-message');
    const errorMessage = document.getElementById('overall-board-error-message');

    /**
     * Creates an HTML card element for a team member.
     * @param {object} member - The member object from the JSON data.
     * @returns {HTMLElement} - The created card element.
     */
    function createMemberCard(member) {
        const card = document.createElement('div');
        card.classList.add('member-card');
        card.setAttribute('data-id', member.id);

        card.innerHTML = `
            <img src="${member.image}" alt="${member.name}" class="member-image" loading="lazy">
            <h3 class="member-name">${member.name}</h3>
            <p class="member-title">${member.title}</p>
            <p class="member-bio">${member.bio}</p>
            <div class="member-social">
                ${member.social.linkedin ? `<a href="${member.social.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${member.name} on LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
                ${member.social.twitter ? `<a href="${member.social.twitter}" target="_blank" rel="noopener noreferrer" aria-label="${member.name} on Twitter"><i class="fab fa-twitter"></i></a>` : ''}
            </div>
        `;
        return card;
    }

    /**
     * Fetches board data from the JSON file and displays it.
     */
    async function fetchBoardData() {
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        boardContainer.innerHTML = ''; // Clear existing content
        executiveContainer.innerHTML = ''; // Clear existing content

        try {
            const response = await fetch('data/board.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Display Board Members
            if (data.boardMembers && data.boardMembers.length > 0) {
                data.boardMembers.forEach(member => {
                    boardContainer.appendChild(createMemberCard(member));
                });
            } else {
                boardContainer.innerHTML = '<p>No board members to display at this time.</p>';
            }

            // Display Executive Team
            if (data.executiveTeam && data.executiveTeam.length > 0) {
                data.executiveTeam.forEach(member => {
                    executiveContainer.appendChild(createMemberCard(member));
                });
            } else {
                executiveContainer.innerHTML = '<p>No executive team members to display at this time.</p>';
            }

        } catch (error) {
            console.error('Error fetching board data:', error);
            errorMessage.textContent = `Failed to load team data: ${error.message}. Please try again later.`;
            errorMessage.classList.remove('hidden');
            boardContainer.innerHTML = ''; // Ensure containers are empty on error
            executiveContainer.innerHTML = '';
        } finally {
            loadingMessage.classList.add('hidden');
        }
    }

    // Call the function to fetch and display data when the page loads
    fetchBoardData();
});