// Quiz questions and configuration
const quizData = [
    {
        "question": "Apa cara yang benar untuk mendeklarasikan variabel di Python?",
        "options": ["var x = 5", "let x = 5", "x = 5", "int x = 5"],
        "correctAnswer": 2
    },
    {
        "question": "Manakah dari berikut ini yang digunakan untuk memberikan komentar satu baris di Python?",
        "options": ["//", "/* */", "#", "--"],
        "correctAnswer": 2
    },
    {
        "question": "Apa output dari print(2 ** 3)?",
        "options": ["6", "8", "5", "Error"],
        "correctAnswer": 1
    },
    {
        "question": "Manakah dari berikut ini yang BUKAN tipe data yang valid di Python?",
        "options": ["int", "float", "boolean", "char"],
        "correctAnswer": 3
    },
    {
        "question": "Apa cara yang benar untuk membuat fungsi di Python?",
        "options": ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"],
        "correctAnswer": 1
    },
    {
        "question": "Manakah dari berikut ini yang digunakan untuk menangani pengecualian di Python?",
        "options": ["if-else", "for-in", "try-except", "switch-case"],
        "correctAnswer": 2
    },
    {
        "question": "Apa output dari print(len('Python'))?",
        "options": ["5", "6", "7", "Error"],
        "correctAnswer": 1
    },
    {
        "question": "Metode mana yang digunakan untuk menambahkan elemen ke akhir list di Python?",
        "options": ["append()", "add()", "insert()", "extend()"],
        "correctAnswer": 0
    },
    {
        "question": "Apa cara yang benar untuk mengimpor modul bernama 'math' di Python?",
        "options": ["import math", "include math", "using math", "#include <math>"],
        "correctAnswer": 0
    },
    {
        "question": "Manakah dari berikut ini yang digunakan untuk mendefinisikan kelas di Python?",
        "options": ["def", "class", "struct", "object"],
        "correctAnswer": 1
    }
];

// Clear any existing content and render the quiz
function renderQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    // Clear existing content except the submit button
    while (quizContainer.firstChild) {
        if (quizContainer.firstChild.id === 'submit-btn') {
            break;
        }
        quizContainer.removeChild(quizContainer.firstChild);
    }

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Multiple Choice Quiz';
    quizContainer.insertBefore(title, document.getElementById('submit-btn'));

    // Add questions
    quizData.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <p>${index + 1}. ${question.question}</p>
            <div class="options">
                ${question.options.map((option, optionIndex) => `
                    <div class="option" onclick="selectOption(this, ${index}, ${optionIndex})">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
        quizContainer.insertBefore(questionElement, document.getElementById('submit-btn'));
    });
}

// Handle option selection
function selectOption(element, questionIndex, optionIndex) {
    const options = element.parentElement.children;
    for (let option of options) {
        option.classList.remove('selected');
    }
    element.classList.add('selected');
    quizData[questionIndex].userAnswer = optionIndex;
}

// Check answers and display results
function checkAnswers() {
    let score = 0;
    let unansweredQuestions = false;
    const resultElement = document.getElementById('result');
    const resultContainer = document.getElementById('result-container');
    
    // Check if all questions are answered
    quizData.forEach((question) => {
        if (question.userAnswer === undefined) {
            unansweredQuestions = true;
        }
        // Calculate score as we go
        if (question.userAnswer === question.correctAnswer) {
            score += 10; // Each question is worth 10 points
        }
    });

    if (unansweredQuestions) {
        alert('Please answer all questions before submitting!');
        return;
    }

    // Update progress
    updateProgress('mult', score).then(() => {
        // Add score to the result element
        resultElement.textContent = `You scored ${score} out of 100 points!`;
        
        // Create a breakdown of answers
        const answersDiv = document.getElementById('answers');
        answersDiv.innerHTML = '<h3>Answer Breakdown:</h3>';
        
        quizData.forEach((question, index) => {
            const isCorrect = question.userAnswer === question.correctAnswer;
            answersDiv.innerHTML += `
                <div class="answer-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                    <p>Your answer: ${question.options[question.userAnswer]}</p>
                    <p>Correct answer: ${question.options[question.correctAnswer]}</p>
                </div>
            `;
        });

        // Hide quiz container and show result container
        document.getElementById('quiz-container').style.display = 'none';
        resultContainer.style.display = 'block';
    });
}

// Restart the quiz
function restartQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    
    // Reset quiz state
    quizData.forEach(question => delete question.userAnswer);
    
    // Clear selected options
    document.querySelectorAll('.option').forEach(option => 
        option.classList.remove('selected', 'correct', 'incorrect')
    );
    
    // Hide results and show quiz
    resultContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    
    // Re-render the quiz
    renderQuiz();
}

// Show results container
function showResults() {
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    quizContainer.style.opacity = 0;
    setTimeout(() => {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        setTimeout(() => {
            resultContainer.style.opacity = 1;
        }, 50);
    }, 300);
}

// Initialize the quiz when the page loads
window.onload = function() {
    renderQuiz();
};

async function updateProgress(exerciseType, newScore) {
    try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        // First, get current progress
        const response = await fetch(`${config.API_URL}/progress?email=${encodeURIComponent(userEmail)}`);
        const currentProgress = await response.json();
        
        // Create update object based on exercise type
        const updateData = {
            user_email: userEmail,
            score: newScore
        };

        // Set the specific exercise flag
        switch(exerciseType) {
            case 'drag':
                updateData.drag = true;
                break;
            case 'fill':
                updateData.fill = true;
                break;
            case 'mult':
                updateData.mult = true;
                break;
        }

        // Don't update if score is lower than existing score
        if (currentProgress && currentProgress.score >= newScore) {
            return;
        }

        // Send update to server
        const updateResponse = await fetch(`${config.API_URL}/progress/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update progress');
        }

    } catch (error) {
        console.error('Error updating progress:', error);
    }
}