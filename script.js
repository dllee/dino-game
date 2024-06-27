const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 150;
const GROUND_HEIGHT = 20;
const GROUND_Y = CANVAS_HEIGHT - GROUND_HEIGHT;
const MAX_GAME_SPEED = 20;
const MIN_GAME_SPEED = 1;

const dino = {
    x: 50,
    y: GROUND_Y - 40,
    width: 40,
    height: 40,
    jumping: false,
    jumpVelocity: 0,
    ducking: false
};

let obstacles = [];
let score = 0;
let highScore = 0;
let gameSpeed = 5;
let lastObstacleTime = 0;
let startTime = Date.now();
const minObstacleInterval = 1500;

function getOpacity() {
    return Math.max(0.2, 1 - (Math.floor(score / 10) * 0.1));
}

function drawPixel(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = getOpacity();
    ctx.fillRect(x, y, size, size);
    ctx.globalAlpha = 1;
}

function drawDino() {
    const pixelSize = 4;
    const dinoPixels = dino.ducking ? [
        [0,0,0,0,1,1,1,1,1,1],
        [0,0,0,1,1,1,1,1,1,1],
        [0,0,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,0]
    ] : [
        [0,0,0,0,1,1,1,1,1,1],
        [0,0,0,1,1,1,1,1,1,1],
        [0,0,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,1,0,0,1,0,0,0,0],
        [0,0,1,0,0,1,0,0,0,0],
        [0,0,1,0,0,1,0,0,0,0]
    ];

    for (let i = 0; i < dinoPixels.length; i++) {
        for (let j = 0; j < dinoPixels[i].length; j++) {
            if (dinoPixels[i][j]) {
                drawPixel(dino.x + j * pixelSize, dino.y + i * pixelSize, pixelSize, '#00AA00');
            }
        }
    }
}

function drawObstacle(obstacle) {
    const pixelSize = 4;
    const obstaclePixels = obstacle.type === 'cactus' ? [
        [0,0,1,1,0,0],
        [0,1,1,1,1,0],
        [1,1,1,1,1,1],
        [0,1,1,1,1,0],
        [0,1,1,1,1,0],
        [0,1,1,1,1,0],
        [0,1,1,1,1,0]
    ] : [
        [0,0,0,1,1,0],
        [0,0,1,1,1,1],
        [1,1,1,1,1,1],
        [0,0,1,1,0,0],
        [0,1,0,0,1,0]
    ];

    const color = obstacle.type === 'cactus' ? '#006400' : '#8B4513';

    for (let i = 0; i < obstaclePixels.length; i++) {
        for (let j = 0; j < obstaclePixels[i].length; j++) {
            if (obstaclePixels[i][j]) {
                drawPixel(obstacle.x + j * pixelSize, obstacle.y + i * pixelSize, pixelSize, color);
            }
        }
    }
}

function jump() {
    if (!dino.jumping) {
        dino.jumping = true;
        dino.jumpVelocity = -10;
    }
}

function duck() {
    if (!dino.jumping) {
        dino.ducking = true;
        dino.height = 20;
        dino.y = GROUND_Y - dino.height;
    }
}

function unduck() {
    dino.ducking = false;
    dino.height = 40;
    dino.y = GROUND_Y - dino.height;
}

function updateDino() {
    if (dino.jumping) {
        dino.y += dino.jumpVelocity;
        dino.jumpVelocity += 0.5;
        if (dino.y > GROUND_Y - dino.height) {
            dino.y = GROUND_Y - dino.height;
            dino.jumping = false;
        }
    }
}

function createObstacle() {
    const type = Math.random() < 0.7 ? 'cactus' : 'bird';
    const obstacle = {
        type: type,
        x: CANVAS_WIDTH,
        y: type === 'bird' ? GROUND_Y - 60 : GROUND_Y - 40,
        width: 24,
        height: type === 'cactus' ? 40 : 30,
        speed: gameSpeed * (0.8 + Math.random() * 0.4), // 80% to 120% of game speed
        passed: false
    };
    obstacles.push(obstacle);
}

function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, GROUND_HEIGHT);
}

function drawGameInfo() {
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillText(`Time: ${currentTime}s | Score: ${score} | High Score: ${highScore} | Speed: ${gameSpeed.toFixed(2)}`, 10, 20);
}

function gameLoop() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawGround();
    drawDino();
    updateDino();
    drawGameInfo();

    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > minObstacleInterval) {
        createObstacle();
        lastObstacleTime = currentTime;
    }

    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= obstacle.speed;
        drawObstacle(obstacle);

        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            if (!(dino.ducking && obstacle.type === 'bird')) {
                if (score > highScore) {
                    highScore = score;
                }
                alert(`Game Over! Score: ${score}`);
                score = 0;
                gameSpeed = 5;
                obstacles = [];
                startTime = Date.now();
                dino.y = GROUND_Y - dino.height;
                dino.jumping = false;
                dino.ducking = false;
                return false;
            }
        }

        if (obstacle.x + obstacle.width < dino.x && !obstacle.passed) {
            score++;
            gameSpeed = Math.min(MAX_GAME_SPEED, gameSpeed + 0.1);
            obstacle.passed = true;
        }

        return obstacle.x + obstacle.width > 0;
    });

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(event) {
    switch(event.code) {
        case 'Space':
            jump();
            break;
        case 'ArrowDown':
            duck();
            break;
        case 'ArrowLeft':
            gameSpeed = Math.max(MIN_GAME_SPEED, gameSpeed - 0.5);
            break;
        case 'ArrowRight':
            gameSpeed = Math.min(MAX_GAME_SPEED, gameSpeed + 0.5);
            break;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowDown') {
        unduck();
    }
});

// 게임 시작
gameLoop();
