const express = require('express');
const cors = require('cors');
const { registerUser, loginUser, getUserData, updateUserData, getAllUsers, updateUserRole, checkAdminRole, deleteUser } = require('./controllers/userController')
const { 
    updateProgress, 
    getProgress, 
    getLeaderboard, 
    resetProgress, 
    getCompletionStatus 
} = require('./controllers/userProgressController');

const app = express();

app.use(express.json());
app.use(cors());

// User routes
app.post('/register', registerUser);
app.post('/login', loginUser);
app.get('/getUserData', getUserData);
app.post('/updateAccount', updateUserData);
app.get('/getAllUsers', getAllUsers);
app.post('/updateUserRole', updateUserRole);
app.get('/checkAdminRole', checkAdminRole);
app.delete('/deleteUser', deleteUser);

// Progress routes
app.post('/progress/update', updateProgress);
app.get('/progress', getProgress);
app.post('/progress/reset', resetProgress);
app.get('/progress/completion', getCompletionStatus);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});