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

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', (playerName) => {
    const game = gameManager.createGame(socket.id, playerName);
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
      socket.emit('error', 'Game not found or full');
    }
  });

  socket.on('makeMove', (data) => {
    const { gameId, row, col, letter } = data;
    const game = gameManager.makeMove(gameId, socket.id, row, col, letter);
    
    if (game) {
      io.to(gameId).emit('gameUpdated', game);
      
      if (game.winner) {
        io.to(gameId).emit('gameOver', game);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const games = gameManager.removePlayer(socket.id);
    
    games.forEach(gameId => {
      io.to(gameId).emit('playerLeft');
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});