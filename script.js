const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");

let isRunning = false;

let centerX, centerY;

let rotationAngle = 0;
const rotationSpeed = 0.0015; // radians per millisecond

let rotatingAroundFire = true;

let lastTimestamp = 0;

const planetRadius = 40;
const orbitRadius = 80; // distance between planets

// Positions of the planets (fixed)
let firePlanetPos = { x: 0, y: 0 };
let icePlanetPos = { x: 0, y: 0 };

function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 600);
  canvas.width = size;
  canvas.height = size;

  centerX = canvas.width / 2;
  centerY = canvas.height / 2;

  // Set the planets initial fixed positions:
  // Let's place them horizontally apart in the middle
  firePlanetPos = { x: centerX - orbitRadius / 2, y: centerY };
  icePlanetPos = { x: centerX + orbitRadius / 2, y: centerY };
}

function drawPlanets(rotAngle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw orbit circle between the two planets for effect (optional)
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, orbitRadius / 2, 0, Math.PI * 2);
  ctx.stroke();

  // Calculate rotating planet position
  // rotatingAroundFire === true means Ice orbits Fire
  // rotatingAroundFire === false means Fire orbits Ice

  let rotatingPlanetPos;

  if (rotatingAroundFire) {
    // Fire is center, ice rotates around firePlanetPos
    rotatingPlanetPos = {
      x: firePlanetPos.x + Math.cos(rotAngle) * orbitRadius,
      y: firePlanetPos.y + Math.sin(rotAngle) * orbitRadius,
    };

    // Draw fire at fixed position
    drawPlanet(firePlanetPos.x, firePlanetPos.y, planetRadius, true);
    // Draw ice at rotating position
    drawPlanet(rotatingPlanetPos.x, rotatingPlanetPos.y, planetRadius, false);
  } else {
    // Ice is center, fire rotates around icePlanetPos
    rotatingPlanetPos = {
      x: icePlanetPos.x + Math.cos(rotAngle) * orbitRadius,
      y: icePlanetPos.y + Math.sin(rotAngle) * orbitRadius,
    };

    // Draw ice at fixed position
    drawPlanet(icePlanetPos.x, icePlanetPos.y, planetRadius, false);
    // Draw fire at rotating position
    drawPlanet(rotatingPlanetPos.x, rotatingPlanetPos.y, planetRadius, true);
  }
}

function drawPlanet(x, y, radius, isFire) {
  const gradient = ctx.createRadialGradient(x - 10, y - 10, 5, x, y, radius);
  if (isFire) {
    gradient.addColorStop(0, "#ff5a36");
    gradient.addColorStop(1, "#a1331f");
    ctx.shadowColor = "#ff6f3d";
  } else {
    gradient.addColorStop(0, "#36c2ff");
    gradient.addColorStop(1, "#1b3c6f");
    ctx.shadowColor = "#4dc7ff";
  }

  ctx.fillStyle = gradient;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function animate(timestamp) {
  if (!isRunning) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  rotationAngle += rotationSpeed * delta;

  drawPlanets(rotationAngle);

  requestAnimationFrame(animate);
}

function startGame() {
  if (!isRunning) {
    isRunning = true;
    startScreen.style.display = "none";
    canvas.style.display = "block";
    resizeCanvas();
    drawPlanets(rotationAngle);
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
    drawPlanets(rotationAngle);
  }
});

window.addEventListener("load", () => {
  resizeCanvas();
  drawPlanets(rotationAngle);
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
