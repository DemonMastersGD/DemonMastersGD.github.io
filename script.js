const menu = document.getElementById('menu');
const canvas = document.getElementById('gameCanvas');
const playButton = document.getElementById('playButton');

playButton.addEventListener('click', () => {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  startGame();
});

function startGame() {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let planet1 = { img: new Image(), x: 0, y: 0 }; // Blue
  let planet2 = { img: new Image(), x: 0, y: 0 }; // Red
  planet1.img.src = 'assets/planet-blue.png';
  planet2.img.src = 'assets/planet-red.png';

  let orbiting = 2; // Start with planet 2 orbiting planet 1
  let angle = 0;
  let radius = 100;
  let cooldown = false;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let center, rotating;

    if (orbiting === 2) {
      center = planet1;
      rotating = planet2;
    } else {
      center = planet2;
      rotating = planet1;
    }

    center.x = canvas.width / 2;
    center.y = canvas.height / 2;
    rotating.x = center.x + Math.cos(angle) * radius;
    rotating.y = center.y + Math.sin(angle) * radius;

    // Draw
    ctx.drawImage(planet1.img, planet1.x - 20, planet1.y - 20, 40, 40);
    ctx.drawImage(planet2.img, planet2.x - 20, planet2.y - 20, 40, 40);

    angle += 0.02;
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('pointerdown', () => {
    if (cooldown) return;
    cooldown = true;
    orbiting = orbiting === 1 ? 2 : 1;
    setTimeout(() => cooldown = false, 500);
  });

  planet1.img.onload = planet2.img.onload = () => draw();
}
