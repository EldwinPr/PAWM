const express = require('express');
const cors = require('cors');
const { registerUser, loginUser, getUserData, updateUserData } = require('./controllers/userController');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/register', registerUser);
app.post('/login', loginUser);
app.get('/getUserData', getUserData); // Changed to GET request
app.post('/updateAccount', updateUserData);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
