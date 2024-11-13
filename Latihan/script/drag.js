const draggables = document.querySelectorAll('.draggable');
const dropzones = document.querySelectorAll('.dropzone');
let score = 0;

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
        checkAnswers();
    });

    // Touch events for mobile compatibility
    draggable.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        draggable.style.position = 'absolute';
        draggable.style.zIndex = 1000;
        document.body.appendChild(draggable);

        moveAt(touch.pageX, touch.pageY);

        function moveAt(pageX, pageY) {
            draggable.style.left = pageX - draggable.offsetWidth / 2 + 'px';
            draggable.style.top = pageY - draggable.offsetHeight / 2 + 'px';
        }

        function onTouchMove(event) {
            const touch = event.touches[0];
            moveAt(touch.pageX, touch.pageY);
        }

        document.addEventListener('touchmove', onTouchMove);

        draggable.addEventListener('touchend', () => {
            document.removeEventListener('touchmove', onTouchMove);
            draggable.classList.remove('dragging');

            dropzones.forEach(dropzone => {
                const dropzoneRect = dropzone.getBoundingClientRect();
                const draggableRect = draggable.getBoundingClientRect();

                if (
                    draggableRect.left >= dropzoneRect.left &&
                    draggableRect.right <= dropzoneRect.right &&
                    draggableRect.top >= dropzoneRect.top &&
                    draggableRect.bottom <= dropzoneRect.bottom
                ) {
                    dropzone.appendChild(draggable);
                }
            });
            checkAnswers();
        }, { once: true });
    });
});

dropzones.forEach(dropzone => {
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('hovered');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('hovered');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            dropzone.classList.remove('hovered');
            if (!dropzone.querySelector('.draggable')) {
                dropzone.appendChild(draggable);
            }
        }
    });
});

function checkAnswers() {
    const correctAnswers = ['print', '("Hello World")'];
    let allFilled = true;
    let correctCount = 0;

    dropzones.forEach((dropzone, index) => {
        const draggable = dropzone.querySelector('.draggable');
        if (!draggable) {
            allFilled = false;
            return;
        }
        if (draggable.textContent === correctAnswers[index]) {
            dropzone.classList.add('correct');
            dropzone.classList.remove('incorrect');
            correctCount++;
        } else {
            dropzone.classList.add('incorrect');
            dropzone.classList.remove('correct');
        }
    });

    if (allFilled) {
        const score = correctCount * 50; // 50 points per correct answer
        if (correctCount === 2) {
            setTimeout(() => {
                updateProgress('drag', score).then(() => {
                    alert(`Perfect! You scored ${score} points!`);
                });
            }, 500);
        }
    }
}

document.getElementById('resetButton').addEventListener('click', () => {
    window.location.reload();
});

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