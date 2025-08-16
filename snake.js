const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

const box = 20;
const canvasSize = 400;
let snake, direction, food, score, gameOver, colors, frame;
const gameOverDiv = document.getElementById('game-over');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

function resetGame() {
    snake = [
        { x: 7 * box, y: 10 * box },
        { x: 6 * box, y: 10 * box },
        { x: 5 * box, y: 10 * box }
    ];
    direction = 'RIGHT';
    food = spawnFood();
    score = 0;
    gameOver = false;
    frame = 0;
    colors = {
        head: '#43ff83',
        body: '#89ffc0',
        food: '#FF5722'
    };
    // Só esconde o game over, não mostra!
    gameOverDiv.classList.add('hidden');
    draw();
    if (typeof gameLoopHandle === "number") clearTimeout(gameLoopHandle);
    gameLoop();
}

function spawnFood() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };
    } while (snake && snake.some(seg => seg.x === position.x && seg.y === position.y));
    return position;
}

document.addEventListener('keydown', event => {
    if (gameOver) return;
    if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

restartBtn.addEventListener('click', resetGame);

function drawSnake() {
    ctx.save();
    ctx.shadowColor = "#77ffbb";
    ctx.shadowBlur = 12;
    ctx.fillStyle = colors.head;
    ctx.beginPath();
    ctx.arc(snake[0].x + box / 2, snake[0].y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Olhinhos
    ctx.save();
    ctx.fillStyle = "#222";
    let eyeOffsetY = box / 4;
    let eyeOffsetX = direction === "LEFT" ? -box / 5 : direction === "RIGHT" ? box / 5 : 0;
    ctx.beginPath();
    ctx.arc(snake[0].x + box/2 - 4 + eyeOffsetX, snake[0].y + box/2 - 4 + eyeOffsetY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(snake[0].x + box/2 + 4 + eyeOffsetX, snake[0].y + box/2 - 4 + eyeOffsetY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Corpo
    for (let i = 1; i < snake.length; i++) {
        let grad = ctx.createRadialGradient(
            snake[i].x+box/2, snake[i].y+box/2, box/7,
            snake[i].x+box/2, snake[i].y+box/2, box/2
        );
        grad.addColorStop(0, '#aaffd7');
        grad.addColorStop(1, '#2e995e');
        ctx.save();
        ctx.shadowColor = "#c1f7d6";
        ctx.shadowBlur = 4;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2.1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

function drawFood() {
    ctx.save();
    ctx.shadowColor = "#ff9a5b";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2.1, 0, 2 * Math.PI);
    ctx.fillStyle = colors.food;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#fff7";
    ctx.beginPath();
    ctx.arc(food.x + box / 2 + 3, food.y + box / 2 - 3, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

function drawScore() {
    ctx.save();
    ctx.font = "bold 22px Segoe UI, Arial";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#44ffb5";
    ctx.shadowBlur = 10;
    ctx.textAlign = "left";
    ctx.fillText("Pontuação: " + score, 16, 32);
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    for (let i = 0; i < canvasSize / box; i++) {
        for (let j = 0; j < canvasSize / box; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? '#212b24' : '#25332b';
            ctx.fillRect(i * box, j * box, box, box);
        }
    }
    drawFood();
    drawSnake();
    drawScore();
}

function update() {
    if (gameOver) return;
    frame++;
    colors.head = `hsl(${120 + frame * 2 % 60}, 85%, 60%)`;
    colors.food = `hsl(${(30 + frame * 4) % 360}, 95%, 56%)`;

    let head = { x: snake[0].x, y: snake[0].y };
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;

    if (
        head.x < 0 || head.x >= canvasSize ||
        head.y < 0 || head.y >= canvasSize
    ) {
        return endGame();
    }
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return endGame();
        }
    }
    if (head.x === food.x && head.y === food.y) {
        score++;
        snake.unshift(head);
        food = spawnFood();
    } else {
        snake.pop();
        snake.unshift(head);
    }
}

function endGame() {
    gameOver = true;
    finalScore.textContent = `Sua pontuação: ${score}`;
    gameOverDiv.classList.remove('hidden');
}

let gameLoopHandle;
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        gameLoopHandle = setTimeout(gameLoop, 96);
    }
}

resetGame();
