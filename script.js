document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const board = document.getElementById('board');
    const movesDisplay = document.getElementById('moves'); // Fixed variable name
    const timerDisplay = document.getElementById('timer');
    const restartBtn = document.getElementById('restartBtn');
    const difficultySelect = document.getElementById('difficulty');
    const winnerContainer = document.getElementById('winnerContainer');
    const winnerStats = document.getElementById('winnerStats');

    // Emoji sets for different difficulties
    const emojiSets = {
        easy: ['❤️', '😂', '🔥', '👍', '😍', '🙏', '🎉', '🤔'], // 8 pairs (4x4)
        medium: ['❤️', '😂', '🔥', '👍', '😍', '🙏', '🎉', '🤔', '😎', '🍕'], // 10 pairs (4x5)
        hard: ['❤️', '😂', '🔥', '👍', '😍', '🙏', '🎉', '🤔', '😎', '🍕',
            '🐶', '🐱', '🌞', '🌙', '⭐', '🌈', '⚡', '🎮'] // 18 pairs (6x6)
    };

    // Game state variables
    let currentDifficulty = 'easy';
    let emojis = [];
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let seconds = 0;
    let timer;
    let matchedPairs = 0;

    // Card creation function
    // Card creation function - fixed typo
    function createCard(emoji) {  // Changed parameter name from emoj to emoji
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.emoji = emoji;
        card.innerHTML = `
        <div class="card-face card-front">${emoji}</div>
        <div class="card-face card-back">?</div>
    `;
        card.addEventListener('click', flipCard);
        return card;
    }


    // Initialize game
    function initGame() {
        // Clear existing game
        board.innerHTML = '';
        moves = 0;
        seconds = 0;
        matchedPairs = 0;
        movesDisplay.textContent = moves;
        timerDisplay.textContent = `${seconds}s`;
        clearInterval(timer);

        // Set emojis based on difficulty
        currentDifficulty = difficultySelect.value;
        emojis = emojiSets[currentDifficulty];
        cards = [...emojis, ...emojis];

        // Set grid layout based on difficulty
        setGridLayout();

        // Shuffle and create cards
        shuffleCards().forEach(emoji => {
            board.appendChild(createCard(emoji));
        });

        // Start timer
        timer = setInterval(() => {
            seconds++;
            timerDisplay.textContent = `${seconds}s`;
        }, 1000);
    }

    function setGridLayout() {
        // Reset board styling
        board.style.gridTemplateColumns = '';
        board.style.height = '';

        switch (currentDifficulty) {
            case 'easy':
                board.style.gridTemplateColumns = 'repeat(4, 1fr)';
                break;
            case 'medium':
                board.style.gridTemplateColumns = 'repeat(5, 1fr)';
                break;
            case 'hard':
                board.style.gridTemplateColumns = 'repeat(6, 1fr)';
                board.style.height = '600px';
                break;
        }
    }

    // Fisher-Yates shuffle
    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }

    // Card flip logic
    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        movesDisplay.textContent = moves;
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedPairs++;

        if (matchedPairs === emojis.length) {
            clearInterval(timer);
            showWinner();
            triggerFireworks();
        }

        resetBoard();
    }

    // Modified showWinner function
function showWinner() {
    // Clear any existing confetti
    document.querySelectorAll('.confetti').forEach(el => el.remove());
    
    winnerStats.textContent = `Completed in ${moves} moves and ${seconds} seconds!`;
    winnerContainer.classList.add('show');
    
    createConfetti();
    
    setTimeout(() => {
        winnerContainer.classList.remove('show');
    }, 5000);
}

// Modified createConfetti function
function createConfetti() {
    const colors = ['#7F5AF0', '#2CB67D', '#FF6E6E', '#FFFFFE'];
    const emojis = ['🎉', '🎊', '🌟', '✨', '🥳', '🎈'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti'; // Added class for easy removal
            confetti.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-50px';
            confetti.style.fontSize = `${Math.random() * 20 + 10}px`;
            confetti.style.opacity = '1';
            confetti.style.zIndex = '1001'; // Above winner container
            confetti.style.animation = `confetti ${Math.random() * 3 + 2}s linear forwards`;
            confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 100);
    }
}

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Fireworks celebration
    function triggerFireworks() {
        for (let i = 0; i < 15; i++) {
            setTimeout(createFirework, i * 200);
        }
    }

    // Event listeners
    restartBtn.addEventListener('click', () => {
        document.getElementById('fireworks').innerHTML = '';
        document.querySelectorAll('.confetti').forEach(el => el.remove());
        winnerContainer.classList.remove('show');
        initGame();
    });

    difficultySelect.addEventListener('change', () => {
        currentDifficulty = difficultySelect.value;
        initGame();
    });

    // Initialize first game
    initGame();
});