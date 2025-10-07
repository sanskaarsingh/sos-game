class Game {
  constructor(id, player1Id, player1Name, gameMode = 'general') {
    this.id = id;
    this.players = [{ id: player1Id, name: player1Name, score: 0 }];
    this.currentPlayerIndex = 0;
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.gameStatus = 'waiting'; // waiting, playing, finished
    this.winner = null;
    this.gameMode = gameMode; // 'simple' or 'general'
    this.lastSOSCells = []; // For animation
    this.rematchRequestedBy = []; // For rematch logic
  }

  addPlayer(playerId, playerName) {
    if (this.players.length < 2) {
      this.players.push({ id: playerId, name: playerName, score: 0 });
      if (this.players.length === 2) {
        this.gameStatus = 'playing';
      }
      return true;
    }
    return false;
  }

  makeMove(playerId, row, col, letter) {
    this.lastSOSCells = []; // Clear previous SOS cells
    if (this.gameStatus !== 'playing' || this.players[this.currentPlayerIndex].id !== playerId || this.board[row][col] !== null) {
      return false;
    }

    this.board[row][col] = { letter, playerId };
    const sosResult = this.checkSOS(row, col);

    if (sosResult.count > 0) {
      this.players[this.currentPlayerIndex].score += sosResult.count;
      this.lastSOSCells = sosResult.cells;

      // Handle 'Simple' game mode win condition
      if (this.gameMode === 'simple') {
        this.endGame();
        return true;
      }
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    if (this.isBoardFull()) {
      this.endGame();
    }
    
    return true;
  }
  
  checkSOS(row, col) {
      let count = 0;
      const sosCells = [];
      const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      const placed = this.board[row][col].letter;

      for (const [dr, dc] of directions) {
          if (placed === 'S') {
              const r1 = row + dr, c1 = col + dc;
              const r2 = row + 2 * dr, c2 = col + 2 * dc;
              if (this.isValid(r1, c1) && this.isValid(r2, c2) && this.board[r1][c1]?.letter === 'O' && this.board[r2][c2]?.letter === 'S') {
                  count++;
                  sosCells.push([row, col], [r1, c1], [r2, c2]);
              }
          } else if (placed === 'O') {
              const r1 = row + dr, c1 = col + dc;
              const r2 = row - dr, c2 = col - dc;
              if (this.isValid(r1, c1) && this.isValid(r2, c2) && this.board[r1][c1]?.letter === 'S' && this.board[r2][c2]?.letter === 'S') {
                  count++;
                  sosCells.push([r1, c1], [row, col], [r2, c2]);
              }
          }
      }

      const finalCount = placed === 'O' ? count / 2 : count;
      return { count: finalCount, cells: sosCells };
  }

  isValid(r, c) {
      return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  isBoardFull() {
    return this.board.every(row => row.every(cell => cell !== null));
  }

  endGame() {
    this.gameStatus = 'finished';

    // If only one player is left, they are the winner.
    if (this.players.length === 1) {
        this.winner = this.players[0];
        return;
    }
    // If no players are left, it's a tie.
    if (this.players.length === 0) {
        this.winner = 'tie';
        return;
    }

    // For simple mode, safely check if the current player exists.
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (this.gameMode === 'simple' && currentPlayer && currentPlayer.score > 0) {
      this.winner = currentPlayer;
      return;
    }

    // General mode scoring
    if (this.players[0].score > this.players[1].score) {
      this.winner = this.players[0];
    } else if (this.players[1].score > this.players[0].score) {
      this.winner = this.players[1];
    } else {
      this.winner = 'tie';
    }
  }

  requestRematch(playerId) {
      if (!this.rematchRequestedBy.includes(playerId)) {
          this.rematchRequestedBy.push(playerId);
      }
  }
}

class GameManager {
  constructor() {
    this.games = new Map();
  }

  createGame(playerId, playerName, gameMode) {
    const gameId = this.generateGameId();
    const game = new Game(gameId, playerId, playerName, gameMode);
    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId, playerId, playerName) {
    const game = this.games.get(gameId);
    if (game && game.addPlayer(playerId, playerName)) {
      return game;
    }
    return null;
  }

  makeMove(gameId, playerId, row, col, letter) {
    const game = this.games.get(gameId);
    if (game && game.makeMove(playerId, row, col, letter)) {
      return game;
    }
    return null;
  }
  
  getGame(gameId) {
    return this.games.get(gameId);
  }

  removePlayer(playerId) {
      const affectedGames = [];
      for (const [gameId, game] of this.games.entries()) {
        const playerIndex = game.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            if (game.gameStatus !== 'finished') {
                game.players.splice(playerIndex, 1);
                game.endGame();
                affectedGames.push({ gameId, game });
            } else {
                this.games.delete(gameId);
            }
        }
      }
      return affectedGames;
  }

  generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

module.exports = { GameManager };