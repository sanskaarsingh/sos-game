class SOSGame {
    constructor() {
        this.socket = io();
        this.currentGame = null;
        this.playerId = null;
        this.selectedLetter = 'S';
        this.isMyTurn = false;
        
        this.initializeEventListeners();
        this.setupSocketListeners();
    }

    initializeEventListeners() {
        // Welcome screen
        document.getElementById('createGameBtn').addEventListener('click', () => this.showPlayerSetup('create'));
        document.getElementById('joinGameBtn').addEventListener('click', () => this.showPlayerSetup('join'));

        // Player setup
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('backToWelcome').addEventListener('click', () => this.showScreen('welcomeScreen'));

        // Lobby
        document.getElementById('copyGameId').addEventListener('click', () => this.copyGameId());
        document.getElementById('leaveLobby').addEventListener('click', () => this.leaveGame());

        // Game screen
        document.getElementById('leaveGame').addEventListener('click', () => this.leaveGame());
        
        // Letter selection
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedLetter = e.target.dataset.letter;
                document.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Game over screen
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showScreen('welcomeScreen'));

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    setupSocketListeners() {
        this.socket.on('gameCreated', (game) => {
            this.currentGame = game;
            this.playerId = this.socket.id;
            this.showLobby(game);
        });

        this.socket.on('gameJoined', (game) => {
            this.currentGame = game;
            this.playerId = this.socket.id;
            this.showLobby(game);
        });

        this.socket.on('gameUpdated', (game) => {
            this.currentGame = game;
            this.updateGameUI(game);
        });

        this.socket.on('gameOver', (game) => {
            this.currentGame = game;
            this.showGameOver(game);
        });

        this.socket.on('playerLeft', () => {
            this.showNotification('Other player left the game', 'warning');
            this.showScreen('welcomeScreen');
        });

        this.socket.on('error', (message) => {
            this.showNotification(message, 'error');
        });
    }

    showPlayerSetup(mode) {
        this.gameMode = mode;
        const title = document.getElementById('setupTitle');
        const gameIdInput = document.getElementById('gameIdInput');

        if (mode === 'create') {
            title.textContent = 'Create New Game';
            gameIdInput.style.display = 'none';
        } else {
            title.textContent = 'Join Existing Game';
            gameIdInput.style.display = 'block';
        }

        this.showScreen('playerSetup');
    }

    startGame() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }

        if (this.gameMode === 'create') {
            this.socket.emit('createGame', playerName);
        } else {
            const gameId = document.getElementById('joinGameId').value.trim().toUpperCase();
            if (!gameId) {
                this.showNotification('Please enter a game ID', 'error');
                return;
            }
            this.socket.emit('joinGame', { gameId, playerName });
        }
    }

    showLobby(game) {
        this.showScreen('lobbyScreen');
        
        document.getElementById('lobbyGameId').textContent = game.id;
        
        this.updatePlayersList(game.players);
        
        if (game.players.length === 2) {
            document.getElementById('waitingMessage').style.display = 'none';
            // Game will start automatically when both players are present
        } else {
            document.getElementById('waitingMessage').style.display = 'block';
        }
    }

    updatePlayersList(players) {
        const container = document.getElementById('playersContainer');
        container.innerHTML = '';

        players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.innerHTML = `
                <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-status">${index === 0 ? 'Creator' : 'Player'}</div>
                </div>
            `;
            container.appendChild(playerElement);
        });
    }

    updateGameUI(game) {
        this.showScreen('gameScreen');
        
        // Update game ID display
        document.getElementById('displayGameId').textContent = game.id;
        
        // Update player info
        this.updatePlayerCards(game);
        
        // Update board
        this.renderBoard(game.board);
        
        // Update turn indicator
        this.updateTurnIndicator(game);
    }

    updatePlayerCards(game) {
        const player1 = game.players[0];
        const player2 = game.players[1];
        
        const player1Card = document.getElementById('player1Card');
        const player2Card = document.getElementById('player2Card');
        
        player1Card.querySelector('.player-name').textContent = player1.name;
        player1Card.querySelector('.player-score').textContent = player1.score;
        
        if (player2) {
            player2Card.querySelector('.player-name').textContent = player2.name;
            player2Card.querySelector('.player-score').textContent = player2.score;
            player2Card.style.display = 'block';
        } else {
            player2Card.style.display = 'none';
        }

        // Highlight active player
        player1Card.classList.toggle('active', game.currentPlayerIndex === 0);
        player2Card.classList.toggle('active', game.currentPlayerIndex === 1);
    }

    updateTurnIndicator(game) {
        const currentPlayer = game.players[game.currentPlayerIndex];
        document.getElementById('currentPlayerText').textContent = currentPlayer.name;
        
        this.isMyTurn = currentPlayer.id === this.playerId;
        
        // Enable/disable letter buttons based on turn
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.disabled = !this.isMyTurn;
        });
    }

    renderBoard(board) {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const cellData = board[row][col];
                if (cellData) {
                    cell.textContent = cellData.letter;
                    cell.classList.add('occupied', cellData.letter.toLowerCase());
                    
                    // Highlight if this cell belongs to current player
                    if (cellData.playerId === this.playerId) {
                        cell.style.background = 'var(--accent-glow)';
                    }
                } else {
                    cell.addEventListener('click', () => this.makeMove(row, col));
                }

                gameBoard.appendChild(cell);
            }
        }
    }

    makeMove(row, col) {
        if (!this.isMyTurn) {
            this.showNotification("It's not your turn!", 'warning');
            return;
        }

        if (this.selectedLetter) {
            this.socket.emit('makeMove', {
                gameId: this.currentGame.id,
                row,
                col,
                letter: this.selectedLetter
            });
        } else {
            this.showNotification('Please select a letter (S or O)', 'warning');
        }
    }

    showGameOver(game) {
        this.showScreen('gameOverScreen');
        
        const winnerMessage = document.getElementById('winnerMessage');
        const finalPlayer1Name = document.getElementById('finalPlayer1Name');
        const finalPlayer1Score = document.getElementById('finalPlayer1Score');
        const finalPlayer2Name = document.getElementById('finalPlayer2Name');
        const finalPlayer2Score = document.getElementById('finalPlayer2Score');

        if (game.winner === 'tie') {
            winnerMessage.textContent = "It's a Tie!";
        } else if (game.winner.id === this.playerId) {
            winnerMessage.textContent = 'You Win! 🎉';
        } else {
            winnerMessage.textContent = `${game.winner.name} Wins!`;
        }

        finalPlayer1Name.textContent = game.players[0].name;
        finalPlayer1Score.textContent = game.players[0].score;
        
        if (game.players[1]) {
            finalPlayer2Name.textContent = game.players[1].name;
            finalPlayer2Score.textContent = game.players[1].score;
        }
    }

    playAgain() {
        if (this.currentGame) {
            this.socket.emit('createGame', this.currentGame.players.find(p => p.id === this.playerId).name);
        }
    }

    leaveGame() {
        this.socket.disconnect();
        this.socket.connect();
        this.currentGame = null;
        this.showScreen('welcomeScreen');
    }

    copyGameId() {
        const gameId = document.getElementById('lobbyGameId').textContent;
        navigator.clipboard.writeText(gameId).then(() => {
            this.showNotification('Game ID copied to clipboard!');
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification';
        
        // Set color based on type
        if (type === 'error') {
            notification.style.borderLeftColor = 'var(--error)';
        } else if (type === 'warning') {
            notification.style.borderLeftColor = 'var(--warning)';
        } else if (type === 'success') {
            notification.style.borderLeftColor = 'var(--success)';
        } else {
            notification.style.borderLeftColor = 'var(--accent-primary)';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SOSGame();
    game.initializeTheme();
    
    // Auto-select first letter button
    document.querySelector('.letter-btn').classList.add('selected');
});