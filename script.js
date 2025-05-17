// ==== GLOBAL VARIABLES ====

let currentScreen = 'mainMenu';
let currentLevelIndex = 0;
let animationFrameId = null;
let gameRunning = false;

const levels = [
  {
    name: 'Level 1',
    speed: 1,
    blocks: [], // for editor - each block: {x, y}
  },
  {
    name: 'Level 2',
    speed: 1.5,
    blocks: [],
  },
  {
    name: 'Level 3',
    speed: 2,
    blocks: [],
  },
];

// --- Canvas and contexts ---
const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');

const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');

// --- DOM elements ---
const playBtn = document.getElementById('playBtn');
const levelSelectBtn = document.getElementById('levelSelectBtn');
const editorBtn = document.getElementById('editorBtn');
const backBtns = document.querySelectorAll('.backBtn');
const levelsGrid = document.getElementById('levelsGrid');

const speedRange = document.getElementById('speedRange');
const addBlockBtn = document.getElementById('addBlockBtn');
const removeBlockBtn = document.getElementById('removeBlockBtn');
const saveLevelBtn = document.getElementById('saveLevelBtn');
const loadLevelBtn = document.getElementById('loadLevelBtn');

// ==== UTILS ====

function switchScreen(screenName) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.toggle('active', screen.id === screenName);
  });
  currentScreen = screenName;
  if (screenName !== 'gameScreen') stopGameplay();
  if (screenName === 'levelSelect') renderLevelSelect();
  if (screenName === 'levelEditor') loadLevelIntoEditor(currentLevelIndex);
}

// ==== GAMEPLAY STATE ====

let rotationAngle = 0;
let rotatingPlanet = 2; // 1 or 2, which planet rotates around the other
let lastTapTime = 0;
const tapCooldown = 500; // milliseconds

// Particles around rotating planet
const particles = [];
const MAX_PARTICLES = 40;

// Planet positions
const center = { x: gameCanvas.width / 2, y: gameCanvas.height / 2 };
const orbitRadius = 100;

// Speed multiplier from level
let speedMultiplier = 1;

// ==== GAMEPLAY FUNCTIONS ====

function createParticles() {
  particles.length = 0;
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({
      angle: Math.random() * 2 * Math.PI,
      radius: orbitRadius + 15 + Math.random() * 10,
      size: 2 + Math.random() * 2,
      speed: 0.01 + Math.random() * 0.02,
      alpha: 0.5 + Math.random() * 0.5,
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.angle += p.speed * speedMultiplier;
    if (p.angle > 2 * Math.PI) p.angle -= 2 * Math.PI;
  });
}

function drawParticles(ctx, orbitingPos) {
  particles.forEach(p => {
    const x = orbitingPos.x + p.radius * Math.cos(p.angle);
    const y = orbitingPos.y + p.radius * Math.sin(p.angle);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function drawPlanets(ctx, angle) {
  // Positions depend on which rotates:
  // rotatingPlanet is the planet moving around the other.

  let planet1, planet2;
  if (rotatingPlanet === 2) {
    // Planet 1 is center, planet 2 rotates
    planet1 = { x: center.x, y: center.y };
    planet2 = {
      x: center.x + orbitRadius * Math.cos(angle),
      y: center.y + orbitRadius * Math.sin(angle),
    };
  } else {
    // Planet 2 is center, planet 1 rotates
    planet2 = { x: center.x, y: center.y };
    planet1 = {
      x: center.x + orbitRadius * Math.cos(angle),
      y: center.y + orbitRadius * Math.sin(angle),
    };
  }

  // Draw planets
  ctx.fillStyle = '#3498db'; // blue planet 1
  ctx.beginPath();
  ctx.arc(planet1.x, planet1.y, 25, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#e74c3c'; // red planet 2
  ctx.beginPath();
  ctx.arc(planet2.x, planet2.y, 20, 0, 2 * Math.PI);
  ctx.fill();

  // Draw particles around rotating planet
  if (rotatingPlanet === 2) {
    drawParticles(ctx, planet2);
  } else {
    drawParticles(ctx, planet1);
  }
}

function gameLoop() {
  if (!gameRunning) return;
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Update rotation
  rotationAngle += 0.02 * speedMultiplier;
  if (rotationAngle > 2 * Math.PI) rotationAngle -= 2 * Math.PI;

  // Update particles
  updateParticles();

  // Draw orbit circle (for clarity)
  gameCtx.strokeStyle = '#0af';
  gameCtx.lineWidth = 2;
  gameCtx.beginPath();
  gameCtx.arc(center.x, center.y, orbitRadius, 0, 2 * Math.PI);
  gameCtx.stroke();

  // Draw planets + particles
  drawPlanets(gameCtx, rotationAngle);

  animationFrameId = requestAnimationFrame(gameLoop);
}

function startGameplay() {
  if (gameRunning) return;
  gameRunning = true;
  rotationAngle = 0;
  speedMultiplier = levels[currentLevelIndex].speed || 1;
  rotatingPlanet = 2;
  createParticles();
  gameLoop();
}

function stopGameplay() {
  gameRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Tap handler for swapping rotation
gameCanvas.addEventListener('pointerdown', e => {
  if (!gameRunning) return;

  const now = Date.now();
  if (now - lastTapTime < tapCooldown) return; // cooldown check
  lastTapTime = now;

  // Swap rotating planet
  rotatingPlanet = rotatingPlanet === 1 ?
