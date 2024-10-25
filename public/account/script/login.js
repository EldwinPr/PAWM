document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!email.includes('@') || email.length < 5) {
        errorMessage.textContent = 'Please enter a valid email address.';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    errorMessage.textContent = '';

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Login successful!');
            localStorage.setItem('token', data.token); // Store token for future use
            window.location.href = '../index.html'; // Redirect to the homepage or dashboard
        } else {
            errorMessage.textContent = data.message || 'Login failed. Please try again.';
        }
    } catch (error) {
        errorMessage.textContent = 'Error: Unable to connect to server.';
    }
});
