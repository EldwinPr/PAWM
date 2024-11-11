document.getElementById('saveChanges').addEventListener('click', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Get email from localStorage
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
        errorMessage.textContent = 'Error: No email found. Please log in again.';
        return;
    }

    // Reset messages
    errorMessage.textContent = '';
    successMessage.textContent = '';

    // Simple validation
    if (username.length < 3) {
        errorMessage.textContent = 'Username must be at least 3 characters long.';
        return;
    }

    if (currentPassword.length < 6) {
        errorMessage.textContent = 'Current password must be at least 6 characters long.';
        return;
    }

    if (newPassword) {
        if (newPassword.length < 6) {
            errorMessage.textContent = 'New password must be at least 6 characters long.';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorMessage.textContent = 'New password and confirmation do not match.';
            return;
        }
    }

    try {
        const response = await fetch(`http://localhost:3000/updateAccount?email=${encodeURIComponent(userEmail)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                currentPassword,
                newPassword,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            successMessage.textContent = 'Account updated successfully!';
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            errorMessage.textContent = data.message || 'Failed to update account.';
        }
    } catch (error) {
        errorMessage.textContent = 'Error: Unable to connect to server.';
        console.error('Update error:', error);
    }
});

// Modified DOMContentLoaded event to load both email and username
document.addEventListener('DOMContentLoaded', async function () {
    const email = localStorage.getItem('userEmail');
    const errorMessage = document.getElementById('errorMessage');

    if (!email) {
        errorMessage.textContent = 'Error: No email found. Please log in again.';
        return;
    }

    // Set the email field
    document.getElementById('email').value = email;
    
    try {
        // Fetch user data
        const response = await fetch(`http://localhost:3000/getUserData?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (response.ok && data) {
            // Set the username field
            document.getElementById('username').value = data.username || '';
        } else {
            errorMessage.textContent = data.message || 'Error loading user data.';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        errorMessage.textContent = 'Error: Unable to connect to server.';
    }
});