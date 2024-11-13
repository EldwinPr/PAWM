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

document.getElementById('log-out').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '../index.html';
});

document.addEventListener('DOMContentLoaded', function () {
    const akunLink = document.getElementById('akun');
    const logoutBtn = document.getElementById('log-out');

    const token = localStorage.getItem('token');

    if (token) {
        akunLink.style.display = 'block';
        logoutBtn.textContent = 'Log Out';
        logoutBtn.onclick = function () {
            localStorage.removeItem('token');
            window.location.href = '../index.html';
        };
    } else {
        akunLink.style.display = 'none';
        logoutBtn.textContent = 'Login';
        logoutBtn.onclick = function () {
            window.location.href = '../account/login.html';
        };
    }
});