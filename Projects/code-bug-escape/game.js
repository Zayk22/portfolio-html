const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const endGameBtn = document.getElementById('endGameBtn');


const playerImg = new Image();
playerImg.src = 'assets/player.png';
const bugImg = new Image();
bugImg.src = 'assets/bug.png';
const coffeeImg = new Image();
coffeeImg.src = 'assets/coffee.png';


const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height / 2 - 25,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
  dy: 0
};


const bugs = [];
const powerUps = [];
const bugSpeed = 2;
let score = 0;
let gameOver = false;
let animationId;
let imagesLoaded = 0;
let powerUpActive = false;
let powerUpEndTime = 0;
const POWER_UP_DURATION = 5000;


function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    startBtn.disabled = false;
    startBtn.textContent = "Start Game";
  }
}

playerImg.onload = checkImagesLoaded;
bugImg.onload = checkImagesLoaded;
coffeeImg.onload = checkImagesLoaded;


function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawBugs() {
  bugs.forEach(bug => {
    ctx.drawImage(bugImg, bug.x, bug.y, bug.width, bug.height);
  });
}

function drawPowerUps() {
  powerUps.forEach(powerUp => {
    ctx.drawImage(coffeeImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
  });
}


function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  
  player.x += player.dx;
  player.y += player.dy;
  
 
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

 
  if (Math.random() < 0.02) {
    spawnBug();
  }
  if (Math.random() < 0.005) {
    spawnPowerUp();
  }

 
  for (let i = bugs.length - 1; i >= 0; i--) {
    const bug = bugs[i];
    const currentSpeed = powerUpActive ? bug.speed * 0.5 : bug.speed;
    bug.y += currentSpeed;

    if (checkCollision(player, bug)) {
      gameOver = true;
    }

    if (bug.y > canvas.height) {
      bugs.splice(i, 1);
      score++;
      scoreElement.textContent = score;
    }
  }

 
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.y += 2;

    if (checkCollision(player, powerUp)) {
      powerUps.splice(i, 1);
      activatePowerUp();
    }

    if (powerUp.y > canvas.height) {
      powerUps.splice(i, 1);
    }
  }

 
  if (powerUpActive && Date.now() > powerUpEndTime) {
    powerUpActive = false;
  }

 
  drawPowerUps();
  drawPlayer();
  drawBugs();

  
  if (powerUpActive) {
    const remainingTime = ((powerUpEndTime - Date.now()) / 1000).toFixed(1);
    ctx.fillStyle = '#4cc9f0';
    ctx.font = '16px Courier New';
    ctx.fillText(`Power: ${remainingTime}s`, 10, 30);
  }

  if (!gameOver) {
    animationId = requestAnimationFrame(update);
  } else {
    endGame();
  }
}

function spawnBug() {
  bugs.push({
    x: Math.random() * (canvas.width - 30),
    y: -30,
    width: 30,
    height: 30,
    speed: bugSpeed + Math.random() * 2
  });
}

function spawnPowerUp() {
  powerUps.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    width: 20,
    height: 20
  });
}

function activatePowerUp() {
  powerUpActive = true;
  powerUpEndTime = Date.now() + POWER_UP_DURATION;
}

function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}


document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') player.dx = -player.speed;
  if (e.key === 'ArrowRight') player.dx = player.speed;
  if (e.key === 'ArrowUp') player.dy = -player.speed;
  if (e.key === 'ArrowDown') player.dy = player.speed;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
});


function resetGame() {
  bugs.length = 0;
  powerUps.length = 0;
  score = 0;
  scoreElement.textContent = score;
  gameOver = false;
  powerUpActive = false;
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height / 2 - 25;
  player.dx = 0;
  player.dy = 0;
  cancelAnimationFrame(animationId);
  

  backBtn.style.display = 'block';
  endGameBtn.style.display = 'none';
}

function endGame() {
  cancelAnimationFrame(animationId);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '30px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
  ctx.font = '20px Courier New';
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
  
 
  backBtn.style.display = 'block';
  endGameBtn.style.display = 'none';
}


startBtn.addEventListener('click', () => {
  resetGame();
  update();
  backBtn.style.display = 'none';
  endGameBtn.style.display = 'block';
});

backBtn.addEventListener('click', () => {
  if (gameOver || confirm('Leave game? Your current progress will be lost.')) {
    cancelAnimationFrame(animationId);
    window.location.href = '../projects.html';
  }
});

endGameBtn.addEventListener('click', () => {
  if (!gameOver && confirm('End current game?')) {
    gameOver = true;
    endGame();
  }
});


startBtn.disabled = true;
startBtn.textContent = "Loading Sprites...";
backBtn.style.display = 'block';
endGameBtn.style.display = 'none';