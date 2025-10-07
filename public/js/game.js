class SoundManager {
    constructor() {
        this.sfx = {
            click: document.getElementById('clickSound'),
            place: document.getElementById('placeSound'),
            score: document.getElementById('scoreSound'),
            win: document.getElementById('winSound'),
            lose: document.getElementById('loseSound')
        };
        this.bgm = document.getElementById('bgmSound');
        
        
        if (this.bgm) this.bgm.volume = 0.3; // Set BGM to 30% volume

        this.isMuted = false;
        this.isBGMPlaying = false;
    }

    play(soundName) {
        if (!this.isMuted && this.sfx[soundName]) {
            this.sfx[soundName].currentTime = 0;
            this.sfx[soundName].play().catch(e => console.error(`Could not play sound: ${soundName}`, e));
        }
    }

    startBGM() {
        if (!this.isBGMPlaying && this.bgm) {
            this.bgm.play().catch(e => {
                console.log("Browser prevented BGM from autoplaying. It will start after the first interaction.");
            });
            this.isBGMPlaying = true;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        // Mute/unmute all sound effects
        for (const key in this.sfx) {
            if (this.sfx[key]) this.sfx[key].muted = this.isMuted;
        }
        // Mute/unmute the BGM
        if (this.bgm) this.bgm.muted = this.isMuted;
        
        return this.isMuted;
    }
}


class SOSGame {
    constructor() {
        this.socket = io();
        this.soundManager = new SoundManager();
        this.currentGame = null;
        this.playerId = null;
        this.selectedLetter = 'S';
        this.isMyTurn = false;
        this.selectedGameMode = 'general';
        
        this.initializeEventListeners();
        this.setupSocketListeners();
        this.initializeTheme();
    }

    initializeEventListeners() {
        
        document.body.addEventListener('click', () => {
            this.soundManager.startBGM();
        }, { once: true });

        document.getElementById('createGameBtn').addEventListener('click', () => this.showPlayerSetup('create'));
        document.getElementById('joinGameBtn').addEventListener('click', () => this.showPlayerSetup('join'));
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('backToWelcome').addEventListener('click', () => this.showScreen('welcomeScreen'));
        document.getElementById('copyGameId').addEventListener('click', () => this.copyGameId());
        document.getElementById('leaveLobby').addEventListener('click', () => this.leaveGame());
        document.getElementById('leaveGame').addEventListener('click', () => this.leaveGame());
        document.getElementById('rematchBtn').addEventListener('click', () => this.requestRematch());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showScreen('welcomeScreen'));
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());

        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.soundManager.play('click');
                this.selectedLetter = e.target.dataset.letter;
                document.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.soundManager.play('click');
                this.selectedGameMode = e.target.dataset.mode;
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
        
        document.querySelectorAll('.btn').forEach(btn => {
           btn.addEventListener('click', () => this.soundManager.play('click'));
        });
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
            this.updateGameUI(game);
        });

        this.socket.on('gameUpdated', (game) => {
            if (this.currentGame && game.players[game.currentPlayerIndex].score > this.currentGame.players[game.currentPlayerIndex].score) {
                this.soundManager.play('score');
            }
            this.currentGame = game;
            this.updateGameUI(game);
        });

        this.socket.on('gameOver', (game) => {
            this.currentGame = game;
            if (game.winner !== 'tie' && game.winner.id === this.playerId) {
                this.soundManager.play('win');
            } else if (game.winner !== 'tie') {
                this.soundManager.play('lose');
            }
            this.showGameOver(game);
        });
        
        this.socket.on('rematchOffered', ({ playerName }) => {
            this.showNotification(`${playerName} wants a rematch!`, 'info');
            document.getElementById('rematchStatus').textContent = 'Opponent wants a rematch!';
        });

        this.socket.on('rematchStarting', (newGame) => {
            this.showNotification('Rematch accepted! Starting new game...', 'success');
            this.currentGame = newGame;
            this.playerId = this.socket.id;
            this.updateGameUI(newGame);
        });

        this.socket.on('playerLeft', (game) => {
            this.showNotification('Opponent left the game.', 'warning');
            if (this.currentGame && this.currentGame.gameStatus === 'playing') {
                this.showGameOver(game);
            } else {
                this.showScreen('welcomeScreen');
            }
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
            title.textContent = `Create ${this.selectedGameMode} Game`;
            gameIdInput.style.display = 'none';
        } else {
            title.textContent = 'Join Game';
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
            this.socket.emit('createGame', { playerName, gameMode: this.selectedGameMode });
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
        document.getElementById('lobbyGameMode').textContent = game.gameMode;
        const playersContainer = document.getElementById('playersContainer');
        playersContainer.innerHTML = game.players.map(p => `<div>${p.name}</div>`).join('');
        document.getElementById('waitingMessage').style.display = game.players.length === 2 ? 'none' : 'block';
    }

    updateGameUI(game) {
        if(game.gameStatus !== 'playing') return;
        this.showScreen('gameScreen');
        document.getElementById('displayGameId').textContent = game.id;
        this.updatePlayerCards(game);
        this.renderBoard(game);
        this.updateTurnIndicator(game);
    }

    updatePlayerCards(game) {
        game.players.forEach((player, index) => {
            const playerCard = document.getElementById(`player${index + 1}Card`);
            playerCard.querySelector('.player-name').textContent = player.name;
            playerCard.querySelector('.player-score').textContent = player.score;
        });

        document.getElementById('player2Card').style.display = game.players.length < 2 ? 'none' : 'flex';

        const activePlayerIndex = game.currentPlayerIndex;
        document.querySelectorAll('.player-card').forEach((card, index) => {
             card.classList.toggle('active', index === activePlayerIndex);
        });
    }

    updateTurnIndicator(game) {
        if (game.gameStatus !== 'playing') {
            document.getElementById('turnIndicator').textContent = 'Game Over';
            return;
        }
        const currentPlayer = game.players[game.currentPlayerIndex];
        const turnIndicator = document.getElementById('turnIndicator');
        turnIndicator.textContent = `${currentPlayer.name}'s Turn`;
        turnIndicator.className = `current-turn player${game.currentPlayerIndex + 1}-turn`;
        this.isMyTurn = currentPlayer.id === this.playerId;
    }

    renderBoard(game) {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        const board = game.board;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const cellData = board[row][col];
                if (cellData) {
                    cell.textContent = cellData.letter;
                    const playerIndex = this.currentGame.players.findIndex(p => p.id === cellData.playerId);
                    cell.classList.add('occupied', `player${playerIndex + 1}-move`);
                } else {
                    cell.addEventListener('click', () => this.makeMove(row, col));
                }
                gameBoard.appendChild(cell);
            }
        }
        
        if (game.lastSOSCells && game.lastSOSCells.length > 0) {
            game.lastSOSCells.forEach(([r, c]) => {
                const cell = gameBoard.querySelector(`[data-row='${r}'][data-col='${c}']`);
                if (cell) {
                    cell.classList.add('sos-animation');
                    setTimeout(() => cell.classList.remove('sos-animation'), 800);
                }
            });
        }
    }

    makeMove(row, col) {
        if (!this.isMyTurn) {
            this.showNotification("It's not your turn!", 'warning');
            return;
        }
        this.soundManager.play('place');
        this.socket.emit('makeMove', { gameId: this.currentGame.id, row, col, letter: this.selectedLetter });
    }

    showGameOver(game) {
        this.showScreen('gameOverScreen');
        const winnerMessage = document.getElementById('winnerMessage');
        if (game.winner === 'tie') {
            winnerMessage.textContent = "It's a Tie!";
        } else {
            winnerMessage.textContent = `${game.winner.name} Wins!`;
        }

        game.players.forEach((player, index) => {
            const nameEl = document.getElementById(`finalPlayer${index + 1}Name`);
            const scoreEl = document.getElementById(`finalPlayer${index + 1}Score`);
            if (nameEl && scoreEl) {
                nameEl.textContent = player.name;
                scoreEl.textContent = player.score;
            }
        });
        
        document.getElementById('rematchBtn').disabled = false;
        document.getElementById('rematchStatus').textContent = '';
    }
    
    requestRematch() {
        this.socket.emit('requestRematch', this.currentGame.id);
        document.getElementById('rematchBtn').disabled = true;
        document.getElementById('rematchStatus').textContent = 'Waiting for opponent...';
    }

    leaveGame() {
        window.location.reload();
    }

    copyGameId() {
        const gameId = document.getElementById('lobbyGameId').textContent;
        navigator.clipboard.writeText(gameId).then(() => {
            this.showNotification('Game ID copied!', 'success');
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    toggleMute() {
        const isMuted = this.soundManager.toggleMute();
        document.getElementById('muteBtn').textContent = isMuted ? '[SOUND OFF]' : '[SOUND ON]';
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        document.querySelector('.letter-btn[data-letter="S"]')?.classList.add('selected');
        document.querySelector('.mode-btn[data-mode="general"]')?.classList.add('selected');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SOSGame();
});