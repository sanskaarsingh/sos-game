const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const { GameManager } = require('./gameLogic');
const gameManager = new GameManager();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/index.html'));
});

io.on('connection', (socket) => {
  socket.on('createGame', ({ playerName, gameMode }) => {
    const game = gameManager.createGame(socket.id, playerName, gameMode);
    socket.join(game.id);
    socket.emit('gameCreated', game);
  });

  socket.on('joinGame', (data) => {
    const { gameId, playerName } = data;
    const game = gameManager.joinGame(gameId, socket.id, playerName);
    if (game) {
      socket.join(gameId);
      socket.emit('gameJoined', game); 
      io.to(gameId).emit('gameUpdated', game); 
    } else {
      socket.emit('error', 'Game not found or is full.');
    }
  });

  socket.on('makeMove', (data) => {
    const { gameId, row, col, letter } = data;
    const game = gameManager.makeMove(gameId, socket.id, row, col, letter);
    if (game) {
      io.to(gameId).emit('gameUpdated', game);
      if (game.gameStatus === 'finished') {
        io.to(gameId).emit('gameOver', game);
      }
    }
  });

  socket.on('requestRematch', (gameId) => {
    const game = gameManager.getGame(gameId);
    if (game && game.players.length === 2) {
        game.requestRematch(socket.id);

        if (game.rematchRequestedBy.length === 2) {
            const player1 = game.players[0];
            const player2 = game.players[1];
            
            // Create the new game
            const newGame = gameManager.createGame(player1.id, player1.name, game.gameMode);
            newGame.addPlayer(player2.id, player2.name);

            // --- FIX STARTS HERE: Manually move players to the new room ---
            const oldGameId = game.id;
            const newGameId = newGame.id;

            // Get the actual socket instances for each player
            const player1Socket = io.sockets.sockets.get(player1.id);
            const player2Socket = io.sockets.sockets.get(player2.id);

            // If the sockets still exist, move them from the old room to the new one
            if (player1Socket) {
                player1Socket.leave(oldGameId);
                player1Socket.join(newGameId);
            }
            if (player2Socket) {
                player2Socket.leave(oldGameId);
                player2Socket.join(newGameId);
            }
            
            // Now, emit the start event to the NEW room where the players now are
            io.to(newGameId).emit('rematchStarting', newGame);
            // --- FIX ENDS HERE ---

            // Clean up the old game from the manager
            gameManager.games.delete(oldGameId);

        } else {
            // Notify the other player of the request
            socket.to(gameId).emit('rematchOffered', { playerName: game.players.find(p => p.id === socket.id).name });
        }
    }
  });


  socket.on('disconnect', () => {
    const affectedGames = gameManager.removePlayer(socket.id);
    affectedGames.forEach(({ gameId, game }) => {
      io.to(gameId).emit('playerLeft', game);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));