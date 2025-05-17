"use strict";

// DOM Elements
const screens = {
  mainMenu: document.getElementById("mainMenu"),
  levelSelect: document.getElementById("levelSelect"),
  gameScreen: document.getElementById("gameScreen"),
  levelEditor: document.getElementById("levelEditor"),
};
const playBtn = document.getElementById("playBtn");
const levelSelectBtn = document.getElementById("levelSelectBtn");
const editorBtn = document.getElementById("editorBtn");
const backBtns = document.querySelectorAll(".backBtn");

const levelsGrid = document.getElementById("levelsGrid");
const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");

const editorCanvas = document.getElementById("editorCanvas");
const editorCtx = editorCanvas.getContext("2d");
const speedRange = document.getElementById("speedRange");
const tileTypeBtn = document.getElementById("tileTypeBtn");
const deleteTileBtn = document.getElementById("deleteTileBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// Constants
const TILE_TYPES = [
  "Straight",       // 0
  "CurveCW",        // 1
  "CurveCCW",       // 2
  "Reverse",        // 3
  "Teleport",       // 4
  "Hold",           // 5
];
const TILE_TYPE_NAMES = {
  Straight: "Straight",
  CurveCW: "Curve CW",
  CurveCCW: "Curve CCW",
  Reverse: "Reverse",
  Teleport: "Teleport",
  Hold: "Hold",
};

const TILE_RADIUS = 25; // radius for drawing tiles in editor
const GRID_ROWS = 7;
const GRID_COLS = 7;

// State
let currentScreen = "mainMenu";
let currentLevelIndex = 0;
let levels = [];
let currentLevel = null; // { tiles: [...], speed: number }

let editorState = {
  selectedTileType: 0,
  speed: 1,
  grid: [],
};

let gameplayState = {
  planets: [], // {x, y, color, angle, orbitingAround, orbitRadius}
  rotatingPlanetIndex: 1,
  orbitCenterIndex: 0,
  camera: { x: 0, y: 0, zoom: 1 },
  lastTapTime: 0,
  tapCooldown: 500,
  animationId: null,
};

// UTILITIES

function switchScreen(screenName) {
  for (const key in screens) {
    screens[key].classList.toggle("active", key === screenName);
  }
  currentScreen = screenName;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// ---------------------------
// LEVEL MANAGEMENT

// Sample levels (simple tile arrays and speed)
levels = [
  {
    name: "Level 1",
    speed: 1,
    tiles: [
      { type: "Straight" },
      { type: "CurveCW" },
      { type: "Straight" },
      { type: "CurveCCW" },
      { type: "Reverse" },
      { type: "Hold" },
    ],
  },
  {
    name: "Level 2",
    speed: 1.5,
    tiles: [
      { type: "CurveCCW" },
      { type: "CurveCW" },
      { type: "Straight" },
      { type: "Teleport" },
      { type: "Reverse" },
      { type: "Hold" },
    ],
  },
];

// Render Level Select Buttons
function renderLevelSelect() {
  levelsGrid.innerHTML = "";
  levels.forEach((level, i) => {
    const btn = document.createElement("button");
    btn.textContent = level.name;
    btn.onclick = () => {
      currentLevelIndex = i;
      loadLevel(i);
      switchScreen("gameScreen");
      startGameplay();
    };
    levelsGrid.appendChild(btn);
  });
}

// Load level into gameplayState
function loadLevel(index) {
  currentLevel = JSON.parse(JSON.stringify(levels[index])); // deep clone
  setupGameplay(currentLevel);
}

// ---------------------------
// GAMEPLAY

function setupGameplay(level) {
  gameplayState.planets = [
    { x: 0, y: 0, color: "#00aaff", angle: 0, orbitingAround: null, orbitRadius: 0 }, // center planet
    { x: 150, y: 0, color: "#ff5555", angle: 0, orbitingAround: 0, orbitRadius: 150 },  // orbiting planet
  ];
  gameplayState.rotatingPlanetIndex = 1;
  gameplayState.orbitCenterIndex = 0;
  gameplayState.camera = { x: 0, y: 0, zoom: 1 };
  gameplayState.lastTapTime = 0;
}

function drawPlanet(ctx, x, y, color, radius = 20) {
  // glow effect
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw() {
  const ctx = gameCtx;
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Translate to camera center
  ctx.save();
  ctx.translate(gameCanvas.width / 2, gameCanvas.height / 2);
  ctx.scale(gameplayState.camera.zoom, gameplayState.camera.zoom);
  ctx.translate(-gameplayState.camera.x, -gameplayState.camera.y);

  // Draw orbit path
  let centerPlanet = gameplayState.planets[gameplayState.orbitCenterIndex];
  let orbitingPlanet = gameplayState.planets[gameplayState.rotatingPlanetIndex];
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerPlanet.x, centerPlanet.y, orbitingPlanet.orbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw planets
  gameplayState.planets.forEach(p => {
    drawPlanet(ctx, p.x, p.y, p.color);
  });

  ctx.restore();
}

function update(delta) {
  // Rotate the orbiting planet
  let now = performance.now();
  if (gameplayState.rotatingPlanetIndex === null) return;

  let rotIndex = gameplayState.rotatingPlanetIndex;
  let centerIndex = gameplayState.orbitCenterIndex;

  let pRot = gameplayState.planets[rotIndex];
  let pCenter = gameplayState.planets[centerIndex];
  let speed = (currentLevel?.speed ?? 1) * 0.002;

  pRot.angle += speed * delta;
  if (pRot.angle > Math.PI * 2) pRot.angle -= Math.PI * 2;

  // Update position relative to center
  pRot.x = pCenter.x + Math.cos(pRot.angle) * pRot.orbitRadius;
  pRot.y = pCenter.y + Math.sin(pRot.angle) * pRot.orbitRadius;

  // Smooth camera follow center point between planets
  gameplayState.camera.x += ((pCenter.x + pRot.x) / 2 - gameplayState.camera.x) * 0.1;
  gameplayState.camera.y += ((pCenter.y + pRot.y) / 2 - gameplayState.camera.y) * 0.1;

  // Keep zoom stable for now
  gameplayState.camera.zoom += (1 - gameplayState.camera.zoom) * 0.1;
}

function gameLoop(timestamp) {
  if (!gameplayState.lastFrame) gameplayState.lastFrame = timestamp;
  const delta = timestamp - gameplayState.lastFrame;
  gameplayState.lastFrame = timestamp;

  update(delta);
  draw();

  gameplayState.animationId = requestAnimationFrame(gameLoop);
}

// Tap handler for gameplay (swap rotation)
function onGameTap() {
  const now = performance.now();
  if (now - gameplayState.lastTapTime < gameplayState.tapCooldown) return;
  gameplayState.lastTapTime = now;

  // Swap rotation: rotating planet becomes center, center becomes rotating
  const { rotatingPlanetIndex, orbitCenterIndex, planets } = gameplayState;
  if (rotatingPlanetIndex === null) return;

  // Swap roles
  gameplayState.rotatingPlanetIndex = orbitCenterIndex;
  gameplayState.orbitCenterIndex = rotatingPlanetIndex;

  // Update orbit radius and angles for smooth continuation
  const newRot = planets[gameplayState.rotatingPlanetIndex];
  const newCenter = planets[gameplayState.orbitCenterIndex];
  // Calculate new orbitRadius and adjust angles so planets keep their positions
  const dx = newRot.x - newCenter.x;
  const dy = newRot.y - newCenter.y;
  newRot.orbitRadius = Math.sqrt(dx * dx + dy * dy);
  newRot.angle = Math.atan2(dy, dx);

  // Center planet stops orbiting
  planets[gameplayState.orbitCenterIndex].angle = 0;
  planets[gameplayState.orbitCenterIndex].x
