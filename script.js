const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");

let centerX, centerY;
let planet1, planet2;
let rotating = true;
let centerPlanet = 1;
let angle = 0;
let lastTimestamp = 0;

const orbitRadius = 80;
const planetRadius = 25;
const speed = 0.002; // radians per ms

let lastTapTime = 0;
const cooldownTime = 500; // ms

function resizeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  canvas.width = size;
  canvas.height = size;
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
}

function initPlanets() {
  planet1 = { x: centerX, y: centerY };
  planet2 = {
    x: centerX + Math.cos(angle) * orbitRadius,
    y: centerY + Math.sin(angle) * orbitRadius
  };
}

function drawPlanet(x, y, color1, color2) {
  const gradient = ctx.createRadialGradient(x - 10, y - 10, 5, x, y, planetRadius);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.shadowColor = color1;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function updatePositions(delta) {
  if (!rotating) return;
  angle += speed * delta;

  let center = centerPlanet === 1 ? planet1 : planet2;
  let orbiting = centerPlanet === 1 ? planet2 : planet1;

  orbiting.x = center.x + Math.cos(angle) * orbitRadius;
  orbiting.y = center.y + Math.sin(angle) * orbitRadius;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlanet(planet1.x, planet1.y, "#36c2ff", "#1b3c6f");
  drawPlanet(planet2.x, planet2.y, "#ff5a36", "#a1331f");
}

function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  updatePositions(delta);
  draw();
  requestAnimationFrame(animate);
}

function startGame() {
  startScreen.style.display = "none";
  canvas.style.display = "block";
  resizeCanvas();
  initPlanets();
  requestAnimationFrame(animate);
}

function handleTap() {
  const now = Date.now();
  if (now - lastTapTime < cooldownTime) return;
  lastTapTime = now;

  rotating = false;
  centerPlanet = centerPlanet === 1 ? 2 : 1;

  let center = centerPlanet === 1 ? planet1 : planet2;
  let orbiting = centerPlanet === 1 ? planet2 : planet1;
  angle = Math.atan2(orbiting.y - center.y, orbiting.x - center.x);

  rotating = true;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  initPlanets();
});

startScreen.addEventListener("click", startGame);

// Handle both touch and mouse, but only register one
let inputLocked = false;
function registerTap(e) {
  if (inputLocked) return;
  inputLocked = true;
  handleTap();
  setTimeout(() => inputLocked = false, cooldownTime);
}
canvas.addEventListener("touchstart", registerTap, { passive: true });
canvas.addEventListener("mousedown", registerTap);
