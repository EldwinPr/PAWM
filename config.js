// config.js

const config = {
    // Base API URL - replace with your actual API endpoint
    API_URL: 'https://api.pylearn.com',
    
    // Helper function to validate user session
    checkUserSession: function() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Helper function to handle score updates
    saveScore: async function(exerciseType, score) {
        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) return false;

            const response = await fetch(`${this.API_URL}/progress?email=${encodeURIComponent(userEmail)}`);
            const currentProgress = await response.json();

            // Prepare update data
            const updateData = {
                user_email: userEmail,
                exercise_type: exerciseType,
                score: score,
                timestamp: new Date().toISOString()
            };

            // Only update if new score is higher
            if (currentProgress && currentProgress[exerciseType] >= score) {
                return false;
            }

            const updateResponse = await fetch(`${this.API_URL}/progress/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update progress');
            }

            return true;

        } catch (error) {
            console.error('Error saving score:', error);
            return false;
        }
    }
};

// Prevent modification of config object
Object.freeze(config);