const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const instructions = document.getElementById("instructions");

let angle = 0;
let radius;
let centerX, centerY;
let currentBeat = 0;
let isRunning = false;

const beatInterval = 600; // ms (100 BPM)
const level = [0, 90, -90, 0, 90, -90, 180]; // directions in degrees

function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 600);
  canvas.width = size;
  canvas.height = size;

  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  radius = size / 3;
}

function drawPlanets() {
  // Fire planet on left-bottom
  const fireX = canvas.width * 0.2;
  const fireY = canvas.height * 0.75;
  const fireRadius = 40;

  // Ice planet on right-bottom
  const iceX = canvas.width * 0.8;
  const iceY = canvas.height * 0.75;
  const iceRadius = 40;

  // Fire planet gradient
  const fireGradient = ctx.createRadialGradient(fireX - 10, fireY - 10, 5, fireX, fireY, fireRadius);
  fireGradient.addColorStop(0, '#ff5a36');
  fireGradient.addColorStop(1, '#a1331f');

  // Ice planet gradient
  const iceGradient = ctx.createRadialGradient(iceX - 10, iceY - 10, 5, iceX, iceY, iceRadius);
  iceGradient.addColorStop(0, '#36c2ff');
  iceGradient.addColorStop(1, '#1b3c6f');

  // Draw Fire planet
  ctx.fillStyle = fireGradient;
  ctx.shadowColor = '#ff6f3d';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(fireX, fireY, fireRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw Ice planet
  ctx.fillStyle = iceGradient;
  ctx.shadowColor = '#4dc7ff';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(iceX, iceY, iceRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0; // Reset shadow
}

function drawTrack() {
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 10;

  let x = centerX, y = centerY;

  for (let i = 0; i < currentBeat + 3; i++) {
    const rad = (level[i % level.length] * Math.PI) / 180;
    const x2 = x + Math.cos(rad) * 60;
    const y2 = y + Math.sin(rad) * 60;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    x = x2;
    y = y2;
  }
}

function drawPlayer() {
  const angleRad = (angle * Math.PI) / 180;
  const x = centerX + Math.cos(angleRad) * radius;
  const y = centerY + Math.sin(angleRad) * radius;

  ctx.fillStyle = "#ff4444"; // Fire
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();

  const oppositeAngle = angle + 180;
  const oppRad = (oppositeAngle * Math.PI) / 180;
  const ox = centerX + Math.cos(oppRad) * radius;
  const oy = centerY + Math.sin(oppRad) * radius;

  ctx.fillStyle = "#44ccff"; // Ice
  ctx.beginPath();
  ctx.arc(ox, oy, 10, 0, Math.PI * 2);
  ctx.fill();
}

function updateBeat() {
  const direction = level[currentBeat % level.length];
  angle += direction;
  currentBeat++;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlanets();  // Planets in the background
  drawTrack();
  drawPlayer();
}

function startGame() {
  if (!isRunning) {
    isRunning = true;
    startScreen.style.display = "none";
    canvas.style.display = "block";
    instructions.style.display = "block";
    resizeCanvas();
    gameLoop();
  }
}

setInterval(() => {
  if (isRunning) {
    updateBeat();
    gameLoop();
  }
}, beatInterval);

window.addEventListener("resize", () => {
  if (isRunning) {
    resizeCanvas();
    gameLoop();
  }
});

window.addEventListener("load", () => {
  resizeCanvas();
  gameLoop();
});

startScreen.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startGame();
});

startScreen.addEventListener("mousedown", startGame);