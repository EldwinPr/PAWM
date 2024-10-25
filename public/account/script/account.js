document.getElementById('saveChanges').addEventListener('click', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

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
        const response = await fetch('http://localhost:3000/updateAccount', {
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
    }
});

// Simulating pre-filled data
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('username').value = 'JohnDoe';
    document.getElementById('email').value = 'johndoe@example.com';
});

// Navbar script
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.navbar')) {
        navLinks.classList.remove('active');
    }
});
