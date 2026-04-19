const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 게임 변수 설정 ---
let timer = 0;
let obstacles = [];
let jumpTimer = 0;
let animation;
let isJumping = false;
let gameState = 'playing';
let score = 0;

// [저장기능] 브라우저 저장소에서 최고 기록 불러오기 (없으면 0)
let highScore = localStorage.getItem('dino_highScore') || 0;

// 1. 캐릭터 설정
const dino = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    draw() {
        ctx.fillStyle = '#2ecc71'; 
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// 2. 장애물 설계
class Obstacle {
    constructor() {
        this.x = 800;
        this.height = 30 + Math.random() * 30; 
        this.width = 40;
        this.y = 190 - this.height; 
    }
    draw() {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 3. 메인 게임 루프
function frame() {
    if (gameState === 'gameOver') return;

    animation = requestAnimationFrame(frame);
    timer++;
    score = Math.floor(timer / 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 바닥 선 그리기
    ctx.beginPath();
    ctx.moveTo(0, 190);
    ctx.lineTo(canvas.width, 190);
    ctx.strokeStyle = '#333';
    ctx.stroke();

    drawScore();

    // 장애물 생성 (100프레임마다)
    if (timer % 100 === 0) {
        obstacles.push(new Obstacle());
    }

    // 장애물 이동 및 충돌 체크
    obstacles.forEach((a, i, o) => {
        if (a.x < -50) o.splice(i, 1);
        a.x -= 6; 
        
        if (checkCollision(dino, a)) {
            endGame(); // 게임 종료 로직 실행
        }
        a.draw();
    });

    handleJump();
    dino.draw();
}

// 4. 점프 로직
function handleJump() {
    if (isJumping) {
        dino.y -= 8; 
        jumpTimer++;
    } else if (dino.y < 150) {
        dino.y += 8; 
    }
    
    if (jumpTimer > 25) { 
        isJumping = false;
        jumpTimer = 0;
    }
}

// 5. 점수 표시
function drawScore() {
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 35);
    ctx.fillStyle = '#888';
    ctx.fillText(`HI: ${highScore}`, 20, 60); // 최고기록 표시
}

// 6. 충돌 체크
function checkCollision(dino, obs) {
    return (
        obs.x < dino.x + dino.width &&
        obs.x + obs.width > dino.x &&
        obs.y < dino.y + dino.height &&
        obs.y + obs.height > dino.y
    );
}

// 7. 게임 종료 로직
function endGame() {
    gameState = 'gameOver';
    
    // 최고 기록 갱신 및 저장
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dino_highScore', highScore);
    }
    
    cancelAnimationFrame(animation);
    drawGameOverScreen();
}

// 8. 게임오버 화면 UI
function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '20px sans-serif';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('Touch/Space to Restart', canvas.width / 2, canvas.height / 2 + 65);
}

// 9. 리셋 기능
function resetGame() {
    timer = 0;
    score = 0;
    obstacles = [];
    jumpTimer = 0;
    isJumping = false;
    dino.y = 150;
    gameState = 'playing';
    frame();
}

// 10. 컨트롤 이벤트 통합 (키보드, 터치, 클릭)
function handleControl(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    
    // 터치 시 스크롤 방지
    if (e.type === 'touchstart' && e.cancelable) {
        e.preventDefault();
    }

    if (gameState === 'playing' && dino.y === 150) {
        isJumping = true;
    } else if (gameState === 'gameOver') {
        resetGame();
    }
}

// 이벤트 리스너 등록
window.addEventListener('keydown', handleControl);
window.addEventListener('touchstart', handleControl, { passive: false });
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) handleControl(e);
});

// 게임 시작!
frame();