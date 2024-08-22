import './style.css'

type Game = {
  name: string;
  symbol: string;
  gameId: string; 
}

const pong: Game = {
  name: 'pong',
  symbol: '🎾',
  gameId: 'pong-sketch',
}

const snake: Game = {
  name: 'snake',
  symbol: '🐍',
  gameId: 'snake-sketch',
}

const games = [snake, pong];


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="main-content">
      <h1>dravitzki.com</h1>
      ${games.map((game) => (`
        <button id="${game.name}-button">${game.symbol}</button>
      `)).join('')}
    </div>
    ${games.map((game) => (`
      <div id="${game.name}-game" style="display:none;">
        <button id="exit-${game.name}-button">❌</button>
        <div id="${game.gameId}"></div>
      </div>
    `)).join('')}
  </div>
`;

import('./snake/snake-game');
import('./pong/pong-game');

// Load persisted state from localStorage
const savedGameState = localStorage.getItem('activeGame');

// Restore game displayed based on saved state
if (savedGameState) {
  const mainContent = document.getElementById('main-content')!;
  mainContent.style.display = 'none';
  
  const activeGame = document.getElementById(`${savedGameState}-game`)!;
  activeGame.style.display = 'block';
}


games.forEach((game) => {
  const pongGame = document.getElementById(`${game.name}-game`)!;
  const mainContent = document.getElementById('main-content')!;

  document.getElementById(`${game.name}-button`)?.addEventListener('click', () => {
    pongGame.style.display = 'block';
    mainContent.style.display = 'none';

    // Save the current active game to localStorage
    localStorage.setItem('activeGame', game.name);
  });

  document.getElementById(`exit-${game.name}-button`)?.addEventListener('click', () => {
    pongGame.style.display = 'none';
    mainContent.style.display = 'block';

    // Clear the saved game state
    localStorage.removeItem('activeGame');
  });
})
