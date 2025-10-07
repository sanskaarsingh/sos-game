SOS Multiplayer Game
====================

A modern, real-time multiplayer SOS game built with Node.js, Express, and Socket.io. Play the classic letter-placement strategy game with friends, now with sound effects and multiple game modes!
Live Link: <https://sos-game-43w5.onrender.com/>

Features
--------
* **Real-time Multiplayer**: Play with friends across different networks in a seamless experience.
* **Dual Game Modes**: Choose between **General Mode** (most points win) or **Simple Mode** (first to score wins).
* **Immersive Audio**: Features 8-bit sound effects for game actions and a continuous background music loop, with a mute toggle for control.
* **Rematch System**: Instantly start a new game with the same opponent from the game-over screen.
* **Dynamic Animations**: Celebratory animations highlight newly formed 'S.O.S' sequences.
* **Retro 8-Bit Theme**: A girly, pink-inspired retro theme with both light and dark modes.
* **Game Lobby System**: Create or join games using unique 6-character IDs.
* **Responsive Design**: Works perfectly on both desktop and mobile devices.

Quick Start
-----------

Prerequisites:
- Node.js 14.0 or higher
- npm or yarn

Installation:
1. Clone the repository
   git clone <https://github.com/sanskaarsingh/sos-game>
   cd sos-game

2. Install dependencies
   npm install

3. Start the development server
   npm run dev

4. Open your browser
   Navigate to http://localhost:3000

Production Deployment:
Option 1: Render.com (Recommended - Free Tier)
1. Push your code to GitHub
2. Go to render.com
3. Create a new Web Service
4. Connect your GitHub repository
5. Deploy automatically

Option 2: Railway
npm install -g @railway/cli
railway login
railway init
railway up

Option 3: Vercel
npm install -g vercel
vercel

How to Play
-----------

Game Rules:
* **Players**: 2 players
* **Board**: 8x8 grid
* **Objective**: Create SOS sequences to score points
* **Turns**: Players alternate placing 'S' or 'O' on the board
* **Scoring**: Form SOS sequences (horizontal, vertical, or diagonal)
* **Bonus**: If you form an SOS, you get another turn
* **Winning (General Mode)**: The player with the most 'S.O.S' sequences when the board is full wins.
* **Winning (Simple Mode)**: The first player to form an 'S.O.S' sequence wins instantly.

Game Flow:
1.  **Choose Mode**: Select "General" or "Simple" game mode from the main menu.
2.  **Create Game**: A host creates a new game session.
3.  **Share ID**: The host shares the unique 6-character game ID with a friend.
4.  **Join Game**: The second player uses the game ID to join the lobby.
5.  **Play**: Once both players are in, the game starts automatically.
6.  **Rematch**: After the game ends, players can choose to play a rematch.

Project Structure
-----------------
sos-game/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── images/
│   │   └── (assets)
│   ├── js/
│   │   ├── game.js
│   │   └── ui.js
│   ├── sounds/
│   │   └── (assets)
│   └── index.html
...

Technology Stack
----------------
* Backend: Node.js, Express.js, Socket.io
* Frontend: Vanilla JavaScript, HTML5, CSS3
* Real-time Communication: WebSockets via Socket.io
* Styling: CSS Variables for theming, Flexbox, Grid
* Deployment: Render.com, Railway, or Vercel

Customization
-------------

Changing Colors:
Modify CSS variables in public/css/style.css:
:root {
  --player1-color: #FF4081; /* Change to your preferred color */
  --player2-color: #a388ee;
}

Board Size:
// Edit in server/gameLogic.js:
this.board = Array(8).fill(null).map(() => Array(8).fill(null)); // Change '8' to desired size

Browser Support
---------------
* Chrome 60+
* Firefox 55+
* Safari 12+
* Edge 79+

Troubleshooting
---------------

Common Issues:

Port already in use:
npx kill-port 3000

Socket connection errors:
- Check if firewall is blocking port 3000
- Ensure server is running

Static files not loading:
- Clear browser cache (Ctrl+F5)
- Check browser console for errors

License
-------
This project is licensed under the MIT License.

Acknowledgments
---------------
* Game design inspired by the classic SOS board game.
* Fonts from Google Fonts ('Press Start 2P').
* Sound effects and BGM from [Name of Sound Library/Website, e.g., Pixabay, freesound.org].

Support
-------
If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Open an issue on GitHub
3. Contact <sanskaarprivate@gmail.com>

---

Enjoy playing SOS! 🎮✨
