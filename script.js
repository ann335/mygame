// --- UI elementi ---
const rulesSection = document.getElementById('rulesSection');
const rulesNextBtn = document.getElementById('rulesNextBtn');

const nameInputSection = document.getElementById('nameInputSection');
const playerNameInput = document.getElementById('playerName');
const confirmNameBtn = document.getElementById('confirmNameBtn');

const gameScreen = document.getElementById('gameScreen');
const startGameBtn = document.getElementById('startGameBtn');

const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

const gameOverModal = document.getElementById('gameOverModal');
const finalPlayerNameSpan = document.getElementById('finalPlayerName');
const finalScoreSpan = document.getElementById('finalScore');
const restartGameBtn = document.getElementById('restartGameBtn');
const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');

const leaderboardModal = document.getElementById('leaderboardModal');
const closeLeaderboardBtn = document.getElementById('closeLeaderboard');
const leaderboardList = document.getElementById('leaderboardList');

// --- Spēles mainīgie ---
let playerName = '';
let score = 0;
let lives = 3;
let gameInterval;
let gameStarted = false;
let itemsFallIntervals = [];

// --- Pārejas starp sadaļām ---
rulesNextBtn.onclick = () => {
  rulesSection.style.display = 'none';
  nameInputSection.style.display = 'block';
};

confirmNameBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Lūdzu, ievadiet vārdu!');
    return;
  }
  playerName = name;
  nameInputSection.style.display = 'none';
  gameScreen.style.display = 'block';
  startGameBtn.style.display = 'inline-block';
};

startGameBtn.onclick = () => {
  startGameBtn.style.display = 'none';
  startGame();
};

// --- Spēles uzsākšana ---
function startGame() {
  score = 0;
  lives = 3;
  updateHUD();
  clearItems();
  player.style.left = `${(game.clientWidth - player.clientWidth) / 2}px`;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(dropItem, 1000);
  gameStarted = true;
}

// --- Atjaunot punktus un dzīvības ---
function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

// --- Noņemt visus priekšmetus ---
function clearItems() {
  itemsFallIntervals.forEach(i => clearInterval(i));
  itemsFallIntervals = [];
  document.querySelectorAll('.item').forEach(i => i.remove());
}

// --- Radīt krītošu objektu ---
function dropItem() {
  const item = document.createElement('div');
  const isKabanos = Math.random() < 0.7;
  item.classList.add('item', isKabanos ? 'kabanos' : 'brokoli');
  item.style.left = `${Math.random() * (game.clientWidth - 30)}px`;
  game.appendChild(item);

  let top = 0;
  const fall = setInterval(() => {
    top += 5;
    item.style.top = `${top}px`;

    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      itemRect.bottom >= playerRect.top &&
      itemRect.left < playerRect.right &&
      itemRect.right > playerRect.left
    ) {
      clearInterval(fall);
      item.remove();
      if (item.classList.contains('kabanos')) {
        score++;
      } else {
        lives--;
      }
      updateHUD();
      if (lives <= 0) endGame();
    } else if (top > game.clientHeight) {
      clearInterval(fall);
      item.remove();
      if (item.classList.contains('kabanos')) {
        lives--;
        updateHUD();
        if (lives <= 0) endGame();
      }
    }
  }, 30);

  itemsFallIntervals.push(fall);
}

// --- Spēles beigas ---
function endGame() {
  gameStarted = false;
  clearInterval(gameInterval);
  clearItems();
  saveScore(playerName, score);
  finalPlayerNameSpan.textContent = playerName;
  finalScoreSpan.textContent = score;
  gameOverModal.style.display = 'block';
}

restartGameBtn.onclick = () => {
  gameOverModal.style.display = 'none';
  startGameBtn.style.display = 'inline-block';
};

showLeaderboardBtn.onclick = () => {
  gameOverModal.style.display = 'none';
  showLeaderboardModal();
};

// --- Saglabāt rezultātus ---
function saveScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// --- Rādīt rezultātu sarakstu ---
function showLeaderboardModal() {
  leaderboardList.innerHTML = '';
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<li>Nav ierakstu</li>';
  } else {
    leaderboard.forEach((entry, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${entry.name} - ${entry.score}`;
      leaderboardList.appendChild(li);
    });
  }
  leaderboardModal.style.display = 'block';
}

closeLeaderboardBtn.onclick = () => {
  leaderboardModal.style.display = 'none';
};

// --- Klaviatūras vadība ---
let moveLeft = false;
let moveRight = false;

document.addEventListener('keydown', (e) => {
  if (!gameStarted) return;
  if (e.key === 'ArrowLeft') moveLeft = true;
  if (e.key === 'ArrowRight') moveRight = true;
});

document.addEventListener('keyup', (e) => {
  if (!gameStarted) return;
  if (e.key === 'ArrowLeft') moveLeft = false;
  if (e.key === 'ArrowRight') moveRight = false;
});

// --- Spēlētāja kustība ---
function movePlayer() {
  if (gameStarted) {
    const left = parseInt(player.style.left || '0');
    if (moveLeft && left > 0) {
      player.style.left = `${left - 5}px`;
    }
    if (moveRight && left < game.clientWidth - player.clientWidth) {
      player.style.left = `${left + 5}px`;
    }
  }
  requestAnimationFrame(movePlayer);
}
movePlayer();

// --- Pieskārienu vadība ---
game.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touchX = e.touches[0].clientX;
  movePlayerTo(touchX);
});

game.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touchX = e.touches[0].clientX;
  movePlayerTo(touchX);
});

function movePlayerTo(clientX) {
  const gameRect = game.getBoundingClientRect();
  let newLeft = clientX - gameRect.left - player.clientWidth / 2;
  if (newLeft < 0) newLeft = 0;
  if (newLeft > game.clientWidth - player.clientWidth) {
    newLeft = game.clientWidth - player.clientWidth;
  }
  player.style.left = `${newLeft}px`;
}
