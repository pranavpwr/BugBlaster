class Bug {
    constructor(type, x, y, canvasWidth, canvasHeight) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = type === 'fast' ? 3 : 1;
        this.health = type === 'armored' ? 2 : 1;
        this.points = type === 'fast' ? 3 : type === 'armored' ? 5 : 1;
        this.direction = Math.random() * Math.PI * 2;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update() {
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
        
        // Bounce off walls
        if (this.x < 0 || this.x > this.canvasWidth - this.width) {
            this.direction = Math.PI - this.direction;
        }
        if (this.y < 0 || this.y > this.canvasHeight - this.height) {
            this.direction = -this.direction;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'fast' ? '#ff0000' : 
                       this.type === 'armored' ? '#0000ff' : '#00ff00';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bugs = [];
        this.score = 0;
        this.timeLeft = 60;
        this.gameLoop = null;
        this.spawnInterval = null;
        this.timer = null;
        this.isRunning = false;
        this.isPaused = false;

        // UI Elements
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.resumeButton = document.getElementById('resumeButton');
        this.pauseOverlay = document.getElementById('pauseOverlay');

        // Event Listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.pauseGame());
        this.resumeButton.addEventListener('click', () => this.resumeGame());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    startGame() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.timeLeft = 60;
        this.bugs = [];
        this.updateUI();
        
        this.startButton.disabled = true;
        this.pauseButton.disabled = false;
        
        // Spawn bugs every 2 seconds
        this.spawnInterval = setInterval(() => this.spawnBug(), 2000);
        
        // Start game loop
        this.gameLoop = setInterval(() => this.update(), 1000/60);
        
        // Start timer
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateUI();
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    pauseGame() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.pauseOverlay.classList.add('active');
        this.pauseButton.disabled = true;
    }

    resumeGame() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.pauseOverlay.classList.remove('active');
        this.pauseButton.disabled = false;
    }

    spawnBug() {
        if (this.isPaused) return;
        
        const types = ['basic', 'fast', 'armored'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.canvas.width - 40);
        const y = Math.random() * (this.canvas.height - 40);
        this.bugs.push(new Bug(type, x, y, this.canvas.width, this.canvas.height));
    }

    handleClick(e) {
        if (!this.isRunning || this.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.bugs.forEach((bug, index) => {
            if (x >= bug.x && x <= bug.x + bug.width &&
                y >= bug.y && y <= bug.y + bug.height) {
                bug.health--;
                if (bug.health <= 0) {
                    this.score += bug.points;
                    this.bugs.splice(index, 1);
                    this.updateUI();
                }
            }
        });
    }

    update() {
        if (this.isPaused) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bugs.forEach(bug => {
            bug.update();
            bug.draw(this.ctx);
        });
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('timer').textContent = this.timeLeft;
    }

    endGame() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.gameLoop);
        clearInterval(this.spawnInterval);
        clearInterval(this.timer);
        this.startButton.disabled = false;
        this.pauseButton.disabled = true;
        this.pauseOverlay.classList.remove('active');
        
        // Save score
        fetch('/game/save-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
            },
            body: `score=${this.score}`
        });
        
        alert(`Game Over! Your score: ${this.score}`);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
}); 