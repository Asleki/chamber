document.addEventListener('DOMContentLoaded', function() {
    const displayInfoDiv = document.getElementById('display-info');
    const urlParams = new URLSearchParams(window.location.search);

    // Explicitly define the required fields to display
    const requiredFields = {
        'fname': "First Name",
        'lname': "Last Name",
        'email': "Email Address",
        'phone': "Mobile Phone",
        'bizname': "Business/Organization Name",
        'timestamp': "Application Date/Time"
    };

    if (displayInfoDiv) {
        let content = '';
        for (const key in requiredFields) {
            if (urlParams.has(key)) {
                let value = urlParams.get(key);
                // Format timestamp for better readability
                if (key === 'timestamp') {
                    try {
                        const date = new Date(value);
                        value = date.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        });
                    } catch (e) {
                        // Keep original value if date parsing fails
                        console.error("Error parsing timestamp:", e);
                    }
                }
                content += `<p><strong>${requiredFields[key]}:</strong> <span>${value}</span></p>`;
            }
        }

        // Also display the membership level, as it's important context
        if (urlParams.has('membershipLevel')) {
            content += `<p><strong>Selected Membership Level:</strong> <span>${urlParams.get('membershipLevel')}</span></p>`;
        }


        if (content === '') {
            content = '<p>No application information was found. This might happen if the form was not submitted correctly.</p>';
        }
        displayInfoDiv.innerHTML = content;
    }
});