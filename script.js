const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const instructions = document.getElementById("instructions");

let isRunning = false;

let centerX, centerY;
let radius;

let rotationAngle = 0; // current angle in radians
let rotationSpeed = 0.02; // radians per frame (~60fps)
let rotatingAroundFire = true; // which planet is center

// Planet positions (will update dynamically)
let firePlanetPos = { x: 0, y: 0 };
let icePlanetPos = { x: 0, y: 0 };

// Planet radius
const planetRadius = 40;
const orbitRadius = 120;

function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 600);
  canvas.width = size;
  canvas.height = size;

  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  radius = size / 3;
}

function drawPlanets() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Determine center planet position and orbiting planet position
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

  // Draw Fire planet
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

  // Draw Ice planet
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

  ctx.shadowBlur = 0; // reset shadow
}

function animate() {
  if (!isRunning) return;

  rotationAngle += rotationSpeed;

  drawPlanets();

  requestAnimationFrame(animate);
}

function startGame() {
  if (!isRunning) {
    isRunning = true;
    startScreen.style.display = "none";
    canvas.style.display = "block";
    instructions.style.display = "none";
    resizeCanvas();
    drawPlanets();
    animate();
  }
}

function toggleRotation() {
  if (!isRunning) {
    startGame();
  } else {
    rotatingAroundFire = !rotatingAroundFire;
  }
}

// Event listeners
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

// Use both touch and mouse
startScreen.addEventListener("touchstart", (e) => {
  e.preventDefault();
  toggleRotation();
});

startScreen.addEventListener("mousedown", toggleRotation);

// Also allow toggling while game running (click on canvas)
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  toggleRotation();
});
canvas.addEventListener("mousedown", toggleRotation);
