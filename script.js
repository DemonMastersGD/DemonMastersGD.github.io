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

  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let radius = 80;
  let angle = 0;
  let rotatingPlanet = 2; // 1=blue rotates, 2=red rotates
  let cooldown = false;

  const bluePlanet = new Image();
  bluePlanet.src = 'assets/planet-blue.png';

  const redPlanet = new Image();
  redPlanet.src = 'assets/planet-red.png';

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let orbitX = centerX + Math.cos(angle) * radius;
    let orbitY = centerY + Math.sin(angle) * radius;

    if (rotatingPlanet === 1) {
      ctx.drawImage(redPlanet, centerX - 20, centerY - 20, 40, 40);
      ctx.drawImage(bluePlanet, orbitX - 20, orbitY - 20, 40, 40);
    } else {
      ctx.drawImage(bluePlanet, centerX - 20, centerY - 20, 40, 40);
      ctx.drawImage(redPlanet, orbitX - 20, orbitY - 20, 40, 40);
    }

    angle += 0.02;
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('pointerdown', () => {
    if (cooldown) return;
    cooldown = true;
    rotatingPlanet = rotatingPlanet === 1 ? 2 : 1;
    setTimeout(() => {
      cooldown = false;
    }, 500);
  });

  bluePlanet.onload = redPlanet.onload = () => {
    draw();
  };
}
