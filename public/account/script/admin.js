// Global variables
let users = [];
let currentUserEmail = null;

// Fetch and display users
async function fetchUsers() {
    try {
        // Get email from localStorage for authentication
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            window.location.href = '../login/login.html';
            return;
        }

        // Fetch single user data first to check admin status
        const userResponse = await fetch(`http://localhost:3000/getUserData?email=${encodeURIComponent(userEmail)}`);
        if (!userResponse.ok) {
            throw new Error('Failed to authenticate');
        }
        
        // Now fetch all users
        const response = await fetch('http://localhost:3000/getAllUsers');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        users = Array.isArray(data) ? data : [];
        displayUsers(users);
        updateStats();
    } catch (error) {
        console.error('Error fetching users:', error);
        showNotification('Error loading users. Please try again.', 'error');
    }
}

// Display users in table
function displayUsers(usersToDisplay) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    if (!usersToDisplay || usersToDisplay.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 1rem;">
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    usersToDisplay.forEach(user => {
        // Get progress data if it exists
        let progressScore = 0;
        if (user.progress) {
            const completedExercises = ['Drag', 'Fill', 'Mult'].filter(type => user.progress[type]).length;
            progressScore = Math.round((completedExercises / 3) * 100);
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(user.username || '')}</td>
            <td>${escapeHtml(user.email || '')}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressScore}%"></div>
                    <span>${progressScore}%</span>
                </div>
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editUser('${user.email}')">
                    Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.email}')">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Update statistics
function updateStats() {
    document.getElementById('totalUsers').textContent = users.length;
    
    // Calculate active users (users with progress)
    const activeUsers = users.filter(user => user.progress && 
        (user.progress.Drag || user.progress.Fill || user.progress.Mult)).length;
    document.getElementById('activeUsers').textContent = activeUsers;
    
    // Calculate new users (registered today)
    const today = new Date().toISOString().split('T')[0];
    const newUsers = users.filter(user => 
        user.createdAt && user.createdAt.split('T')[0] === today).length;
    document.getElementById('newUsers').textContent = newUsers || 0;
}

// Search functionality with debounce
let searchTimeout;
function searchUsers(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const filteredUsers = users.filter(user => 
            (user.username && user.username.toLowerCase().includes(query.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
        );
        displayUsers(filteredUsers);
    }, 300);
}

// User management functions
async function editUser(email) {
    try {
        const userResponse = await fetch(`http://localhost:3000/getUserData?email=${encodeURIComponent(email)}`);
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        currentUserEmail = email;
        
        document.getElementById('editUsername').value = userData.username || '';
        document.getElementById('editEmail').value = userData.email || '';
        document.getElementById('editPassword').value = '';
        
        openModal('editModal');
    } catch (error) {
        console.error('Error preparing edit:', error);
        showNotification('Error preparing edit form', 'error');
    }
}

async function deleteUser(email) {
    if (!confirm('Apakah anda yakin ingin menghapus pengguna ini?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/deleteUser?email=${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        showNotification('Pengguna berhasil dihapus', 'success');
        await fetchUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Gagal menghapus pengguna', 'error');
    }
}

// Form handlers
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const password = document.getElementById('newPassword').value;

    if (!username || !email || !password) {
        showNotification('Semua field harus diisi', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to add user');
        }

        closeModal('addModal');
        showNotification('Pengguna berhasil ditambahkan', 'success');
        await fetchUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        showNotification(error.message || 'Gagal menambahkan pengguna', 'error');
    }
});

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('editUsername').value.trim();
    const newPassword = document.getElementById('editPassword').value;

    if (!username) {
        showNotification('Username tidak boleh kosong', 'error');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/updateAccount?email=${encodeURIComponent(currentUserEmail)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                newPassword: newPassword || undefined
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update user');
        }

        closeModal('editModal');
        showNotification('Pengguna berhasil diperbarui', 'success');
        await fetchUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification(error.message || 'Gagal memperbarui pengguna', 'error');
    }
});

// Utility functions remain the same...
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    if (modalId === 'addModal') {
        document.getElementById('addUserForm').reset();
    } else if (modalId === 'editModal') {
        document.getElementById('editUserForm').reset();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchUsers);

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};