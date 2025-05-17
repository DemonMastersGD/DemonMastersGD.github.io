const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");

let isRunning = false;

let centerX, centerY;

let rotationAngle = 0;
const rotationSpeed = 0.0015; // radians per millisecond

let rotatingAroundFire = true;

let lastTimestamp = 0;

let firePlanetPos = { x: 0, y: 0 };
let icePlanetPos = { x: 0, y: 0 };

const planetRadius = 40;
const orbitRadius = 80; // closer planets

function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 600);
  canvas.width = size;
  canvas.height = size;

  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
}

function drawPlanets() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (rotatingAroundFire) {
    firePlanetPos = { x: centerX, y: centerY };
    icePlanetPos = {
      x: centerX + Math.cos(rotationAngle) * orbitRadius,
      y: centerY + Math.sin(rotationAngle) * orbitRadius,
    };
  } else {
    icePlanetPos = { x: centerX, y: centerY };
    firePlanetPos = {
      x: centerX + Math.cos(rotationAngle) * orbitRadius,
      y: centerY + Math.sin(rotationAngle) * orbitRadius,
    };
  }

  // Fire planet
  const fireGradient = ctx.createRadialGradient(
    firePlanetPos.x - 10,
    firePlanetPos.y - 10,
    5,
    firePlanetPos.x,
    firePlanetPos.y,
    planetRadius
  );
  fireGradient.addColorStop(0, "#ff5a36");
  fireGradient.addColorStop(1, "#a1331f");

  ctx.fillStyle = fireGradient;
  ctx.shadowColor = "#ff6f3d";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(firePlanetPos.x, firePlanetPos.y, planetRadius, 0, Math.PI * 2);
  ctx.fill();

  // Ice planet
  const iceGradient = ctx.createRadialGradient(
    icePlanetPos.x - 10,
    icePlanetPos.y - 10,
    5,
    icePlanetPos.x,
    icePlanetPos.y,
    planetRadius
  );
  iceGradient.addColorStop(0, "#36c2ff");
  iceGradient.addColorStop(1, "#1b3c6f");

  ctx.fillStyle = iceGradient;
  ctx.shadowColor = "#4dc7ff";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(icePlanetPos.x, icePlanetPos.y, planetRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

function animate(timestamp) {
  if (!isRunning) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  rotationAngle += rotationSpeed * delta;

  drawPlanets();

  requestAnimationFrame(animate);
}

function startGame() {
  if (!isRunning) {
    isRunning = true;
    startScreen.style.display = "none";
    canvas.style.display = "block";
    resizeCanvas();
    drawPlanets();
    requestAnimationFrame(animate);
  }
}

function toggleRotation() {
  if (!isRunning) {
    startGame();
  } else {
    rotatingAroundFire = !rotatingAroundFire;
  }
}

window.addEventListener("resize", () => {
  if (isRunning) {
    resizeCanvas();
    drawPlanets();
  }
});

window.addEventListener("load", () => {
  resizeCanvas();
  drawPlanets();
});

startScreen.addEventListener("touchstart", (e) => {
  e.preventDefault();
  toggleRotation();
});

startScreen.addEventListener("mousedown", toggleRotation);

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  toggleRotation();
});

canvas.addEventListener("mousedown", toggleRotation);
