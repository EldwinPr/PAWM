async function getScores() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        window.location.href = '../login/login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/progress?email=${encodeURIComponent(userEmail)}`);
        const progress = await response.json();
        
        const today = new Date().toISOString().split('T')[0];
        
        const scores = [
            {
                exercise: "Drag and Drop",
                score: progress.Drag ? progress.score || 0 : 0,
                date: progress.Drag ? today : '-',
                completed: progress.Drag,
                type: "drag"
            },
            {
                exercise: "Fill in The Blanks",
                score: progress.Fill ? progress.score || 0 : 0,
                date: progress.Fill ? today : '-',
                completed: progress.Fill,
                type: "fill"
            },
            {
                exercise: "Multiple Choice",
                score: progress.Mult ? progress.score || 0 : 0,
                date: progress.Mult ? today : '-',
                completed: progress.Mult,
                type: "mult"
            }
        ];

        return scores;
    } catch (error) {
        console.error('Error fetching scores:', error);
        return [];
    }
}

function getExerciseUrl(type) {
    switch(type) {
        case 'drag':
            return '../Latihan/drag.html';
        case 'fill':
            return '../Latihan/fill.html';
        case 'mult':
            return '../Latihan/mult.html';
        default:
            return '#';
    }
}

async function resetProgress() {
    if (!confirm('Apakah anda yakin ingin reset semua progress? Ini akan menghapus semua skor anda.')) {
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
        const response = await fetch('http://localhost:3000/progress/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail })
        });

        if (!response.ok) {
            throw new Error('Failed to reset progress');
        }

        alert('Progress berhasil reset');
        location.reload();
    } catch (error) {
        console.error('Error resetting progress:', error);
        alert('Gagal reset ulang progress. Silakan coba lagi.');
    }
}

function populateScoreTable(scores) {
    const tableBody = document.getElementById('scoreTableBody');
    tableBody.innerHTML = '';

    const completedExercises = scores.filter(score => score.completed).length;
    const totalScore = scores.reduce((sum, score) => sum + (score.completed ? score.score : 0), 0);
    const averageScore = completedExercises > 0 ? Math.round(totalScore / completedExercises) : 0;
    const progressPercent = Math.round((completedExercises / scores.length) * 100);

    const progressSummary = document.getElementById('progressSummary');
    progressSummary.innerHTML = `
        <div class="progress-card">
            <div class="progress-value">${progressPercent}%</div>
            <div style="margin-top: 0.5rem; font-size: 1.2rem;">
                ${completedExercises}/${scores.length} Latihan Selesai
            </div>
        </div>
    `;

    scores.forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.exercise}</td>
            <td>${score.completed ? score.score : '-'}/100</td>
            <td>${score.date}</td>
            <td>
                ${score.completed 
                    ? `<span class="status completed">Selesai</span>` 
                    : `<a href="${getExerciseUrl(score.type)}" class="btn">Mulai Latihan</a>`}
            </td>
        `;
        tableBody.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    totalRow.classList.add('total-row');
    totalRow.innerHTML = `
        <td><strong>Skor Rata-rata</strong></td>
        <td><strong>${averageScore}/100</strong></td>
        <td colspan="2"><strong>${completedExercises}/${scores.length} Latihan Selesai</strong></td>
    `;
    tableBody.appendChild(totalRow);

    // Add reset button container
    const resetButtonContainer = document.createElement('div');
    resetButtonContainer.className = 'reset-button-container';
    resetButtonContainer.innerHTML = `
        <button onclick="resetProgress()" class="reset-btn" title="Reset semua progress">
            <span class="reset-icon">↺</span> Reset Progress
        </button>
    `;
    document.querySelector('.score-table').after(resetButtonContainer);
}

document.addEventListener('DOMContentLoaded', async function() {
    const scores = await getScores();
    populateScoreTable(scores);
});