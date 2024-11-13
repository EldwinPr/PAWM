const questions = [
    {
        "question": "Untuk mencetak \"Hello World\" di Python:",
        "blank": "[blank](\"Hello World\")",
        "answer": "print",
        "size": 8  // Increased size
    },
    {
        "question": "Untuk mendeklarasikan variabel bernama 'x' dengan nilai 5:",
        "blank": "x [blank] 5",
        "answer": "=",
        "size": 4  // Increased size
    },
    {
        "question": "Untuk membuat fungsi bernama 'greet':",
        "blank": "[blank] greet():",
        "answer": "def",
        "size": 6  // Increased size
    },
    {
        "question": "Untuk mengimpor modul 'random':",
        "blank": "[blank] random",
        "answer": "import",
        "size": 8  // Increased size
    },
    {
        "question": "Untuk membuat list bernama 'fruits' dengan item 'apple' dan 'banana':",
        "blank": "fruits = [blank]",
        "answer": "[\"apple\", \"banana\"]",
        "size": 25  // Increased size
    }
];

let currentQuestion = 0;
let score = 0;

function renderQuestion() {
    const quizContainer = document.getElementById('quiz-container');
    const question = questions[currentQuestion];
    
    // Clear existing content except the submit button
    while (quizContainer.firstChild) {
        if (quizContainer.firstChild.id === 'submit-btn') {
            break;
        }
        quizContainer.removeChild(quizContainer.firstChild);
    }

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Fill in the Blanks - Python Syntax';
    quizContainer.insertBefore(title, document.getElementById('submit-btn'));

    const questionElement = document.createElement('p');
    questionElement.className = 'question';
    questionElement.innerHTML = `
        ${question.question} <br>
        ${question.blank.replace('[blank]', `<input type="text" class="fill-blank" id="answer" style="width: ${question.size * 12}px; min-width: 60px; padding: 8px 12px;" maxlength="${question.size + 5}">`)}
    `;
    quizContainer.insertBefore(questionElement, document.getElementById('submit-btn'));

    // Focus on the input field
    setTimeout(() => {
        document.getElementById('answer').focus();
    }, 100);

    updateProgressBar();
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function checkAnswer() {
    const userAnswer = document.getElementById('answer').value.trim();
    const correctAnswer = questions[currentQuestion].answer;
    const resultElement = document.getElementById('result');

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        score += 20; // Each correct answer is worth 20 points
        resultElement.innerHTML = '<p class="correct">Correct! +20 points</p>';
    } else {
        resultElement.innerHTML = `<p class="incorrect">Incorrect. The correct answer is "${correctAnswer}".</p>`;
    }

    document.getElementById('submit-btn').textContent = 'Next Question';
    document.getElementById('submit-btn').onclick = nextQuestion;
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        renderQuestion();
        document.getElementById('result').innerHTML = '';
        document.getElementById('submit-btn').textContent = 'Submit Answer';
        document.getElementById('submit-btn').onclick = checkAnswer;
    } else {
        showFinalResult();
    }
}

function showFinalResult() {
    const quizContainer = document.getElementById('quiz-container');
    const submitBtn = document.getElementById('submit-btn');
    
    // Update progress with final score
    updateProgress('fill', score).then(() => {
        // Show final results
        quizContainer.innerHTML = `
            <h2>Quiz Complete!</h2>
            <div class="score-breakdown">
                <p>Your final score: ${score} out of 100 points</p>
                <p>(${score/20} correct answers out of 5 questions)</p>
            </div>
        `;
        submitBtn.textContent = 'Try Again';
        submitBtn.onclick = restartQuiz;
    });
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    document.getElementById('progress-bar').style.width = '20%';
    renderQuestion();
    document.getElementById('result').innerHTML = '';
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = 'Submit Answer';
    submitBtn.onclick = checkAnswer;
}

// Add enter key support for submitting answers
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.click();
    }
});

// Initialize the quiz when the page loads
window.onload = function() {
    renderQuestion();
};

async function updateProgress(exerciseType, newScore) {
    try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        // First, get current progress
        const response = await fetch(`http://localhost:3000/progress?email=${encodeURIComponent(userEmail)}`);
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
        const updateResponse = await fetch('http://localhost:3000/progress/update', {
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