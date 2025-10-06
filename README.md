SOS Multiplayer Game
====================

A modern, real-time multiplayer SOS game built with Node.js, Express, and Socket.io. Play the classic letter-placement strategy game with friends across different networks!
Live Link: <https://sos-game-43w5.onrender.com/>

Features
--------
* Real-time Multiplayer: Play with friends across different networks
* Modern Dark UI: Sleek dark gray and orange color scheme
* Responsive Design: Works perfectly on desktop and mobile devices
* Smooth Animations: Beautiful transitions and hover effects
* Game Lobby System: Create or join games with unique IDs
* Score Tracking: Automatic SOS detection and scoring
* Theme Toggle: Switch between dark and light modes

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
* Players: 2 players
* Board: 8x8 grid
* Objective: Create SOS sequences to score points
* Turns: Players alternate placing 'S' or 'O' on the board
* Scoring: Form SOS sequences (horizontal, vertical, or diagonal)
* Bonus: If you form an SOS, you get another turn
* Winning: Player with most SOS sequences when board is full wins

Game Flow:
1. Create Game: Host creates a new game session
2. Share ID: Host shares the 6-character game ID
3. Join Game: Second player joins using the game ID
4. Play: Take turns placing letters and forming SOS sequences
5. Win: Complete the game when board is full

Project Structure
-----------------
sos-game/
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Styles and animations
│   └── js/
│       ├── game.js         # Game logic and Socket.io handlers
│       └── ui.js           # UI interactions and animations
├── server/
│   ├── server.js           # Express server and Socket.io setup
│   └── gameLogic.js        # Game state management
├── package.json            # Dependencies and scripts
└── README.md              # This file

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
  --accent-primary: #ff6b35; /* Change to your preferred color */
  --accent-secondary: #ff8c5a;
}

Board Size:
Edit in server/server.js:
this.board = Array(10).fill().map(() => Array(10).fill(null)); // Change to 10x10

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
* Game design inspired by classic SOS board game
* Icons from Twemoji
* Fonts from Google Fonts (Inter)
* Deployment platforms: Render, Railway, Vercel

Support
-------
If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Open an issue on GitHub
3. Contact <sanskaarprivate@gmail.com>

---

Enjoy playing SOS! 🎮✨
