document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');

    if (username.length < 3) {
        errorMessage.textContent = 'Username must be at least 3 characters long.';
        return;
    }

    if (!email.includes('@') || email.length < 5) {
        errorMessage.textContent = 'Please enter a valid email address.';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        return;
    }

    errorMessage.textContent = '';

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Welcome, ' + username + '!');
            window.location.href = 'login.html';  // Redirect to login page
        } else {
            errorMessage.textContent = data.message || 'Registration failed.';
        }
    } catch (error) {
        errorMessage.textContent = 'Error: Unable to connect to server.';
    }
});
