document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Basic validation for email and password
    if (!email.includes('@') || email.length < 5) {
        errorMessage.textContent = 'Please enter a valid email address.';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    // Clear any previous error messages
    errorMessage.textContent = '';

    try {
        const response = await fetch(`${config.API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Added this line
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store the email in localStorage for later use
            localStorage.setItem('userEmail', email);

            // Store the token for authentication (optional)
            localStorage.setItem('token', data.token);

            // Redirect to the homepage or dashboard
            window.location.href = '../index.html';
        } else {
            // Display an error message if login fails
            errorMessage.textContent = data.message || 'Login failed. Please try again.';
        }
    } catch (error) {
        // Handle any connection errors
        errorMessage.textContent = 'Error: Unable to connect to server.';
    }
});