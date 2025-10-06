class Game {
  constructor(id, player1Id, player1Name) {
    this.id = id;
    this.players = [
      { id: player1Id, name: player1Name, score: 0 }
    ];
    this.currentPlayerIndex = 0;
    this.board = Array(8).fill().map(() => Array(8).fill(null));
    this.gameStatus = 'waiting'; // waiting, playing, finished
    this.winner = null;
    this.createdAt = new Date();
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
    if (this.gameStatus !== 'playing') return false;
    if (this.players[this.currentPlayerIndex].id !== playerId) return false;
    if (this.board[row][col] !== null) return false;

    this.board[row][col] = { letter, playerId };
    
    // Check for SOS sequences
    const newSOS = this.checkSOS(row, col, letter);
    if (newSOS.length > 0) {
      this.players[this.currentPlayerIndex].score += newSOS.length;
      
      // If SOS formed, same player continues
      return true;
    }
    
    // Switch player if no SOS formed
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    return true;
  }

  checkSOS(row, col, letter) {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1], // horizontal, vertical, diagonal down-right, diagonal down-left
      [0, -1], [-1, 0], [-1, -1], [-1, 1] // opposite directions
    ];
    
    const sosSequences = [];
    
    if (letter === 'O') {
      // For 'O' in the middle, check for S-O-S patterns
      directions.forEach(([dr, dc]) => {
        const r1 = row - dr, c1 = col - dc;
        const r2 = row + dr, c2 = col + dc;
        
        if (this.isValidCell(r1, c1) && this.isValidCell(r2, c2)) {
          const cell1 = this.board[r1][c1];
          const cell2 = this.board[r2][c2];
          
          if (cell1 && cell2 && cell1.letter === 'S' && cell2.letter === 'S') {
            sosSequences.push([[r1, c1], [row, col], [r2, c2]]);
          }
        }
      });
    } else if (letter === 'S') {
      // For 'S', check if it completes an SOS with existing cells
      directions.forEach(([dr, dc]) => {
        // Check if this S is the first S in S-O-S
        const oRow = row + dr, oCol = col + dc;
        const s2Row = oRow + dr, s2Col = oCol + dc;
        
        if (this.isValidCell(oRow, oCol) && this.isValidCell(s2Row, s2Col)) {
          const oCell = this.board[oRow][oCol];
          const s2Cell = this.board[s2Row][s2Col];
          
          if (oCell && s2Cell && oCell.letter === 'O' && s2Cell.letter === 'S') {
            sosSequences.push([[row, col], [oRow, oCol], [s2Row, s2Col]]);
          }
        }
        
        // Check if this S is the second S in S-O-S
        const oRow2 = row - dr, oCol2 = col - dc;
        const s1Row = oRow2 - dr, s1Col = oCol2 - dc;
        
        if (this.isValidCell(oRow2, oCol2) && this.isValidCell(s1Row, s1Col)) {
          const oCell2 = this.board[oRow2][oCol2];
          const s1Cell = this.board[s1Row][s1Col];
          
          if (oCell2 && s1Cell && oCell2.letter === 'O' && s1Cell.letter === 'S') {
            sosSequences.push([[s1Row, s1Col], [oRow2, oCol2], [row, col]]);
          }
        }
      });
    }
    
    return sosSequences;
  }

  isValidCell(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  isBoardFull() {
    return this.board.every(row => row.every(cell => cell !== null));
  }

  checkGameOver() {
    if (this.isBoardFull()) {
      this.gameStatus = 'finished';
      if (this.players[0].score > this.players[1].score) {
        this.winner = this.players[0];
      } else if (this.players[1].score > this.players[0].score) {
        this.winner = this.players[1];
      } else {
        this.winner = 'tie';
      }
      return true;
    }
    return false;
  }
}

class GameManager {
  constructor() {
    this.games = new Map();
  }

  createGame(playerId, playerName) {
    const gameId = this.generateGameId();
    const game = new Game(gameId, playerId, playerName);
    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId, playerId, playerName) {
    const game = this.games.get(gameId);
    if (game && game.players.length < 2) {
      game.addPlayer(playerId, playerName);
      return game;
    }
    return null;
  }

  makeMove(gameId, playerId, row, col, letter) {
    const game = this.games.get(gameId);
    if (game) {
      const moveSuccess = game.makeMove(playerId, row, col, letter);
      if (moveSuccess) {
        game.checkGameOver();
        return game;
      }
    }
    return null;
  }

  removePlayer(playerId) {
    const affectedGames = [];
    
    this.games.forEach((game, gameId) => {
      const playerIndex = game.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        game.gameStatus = 'finished';
        affectedGames.push(gameId);
      }
    });
    
    // Clean up empty games
    affectedGames.forEach(gameId => {
      this.games.delete(gameId);
    });
    
    return affectedGames;
  }

  generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

module.exports = { Game, GameManager };