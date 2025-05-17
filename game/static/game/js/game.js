class Bug {
    constructor(type, x, y, canvasWidth, canvasHeight) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = type === 'fast' ? 4 : 1.5;
        this.health = type === 'armored' ? 2 : 1;
        this.points = type === 'fast' ? 3 : type === 'armored' ? 5 : 1;
        this.direction = Math.random() * Math.PI * 2;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 2000;
    }

    update(currentTime) {
        // Change direction periodically
        if (currentTime - this.lastDirectionChange > this.directionChangeInterval) {
            this.direction = Math.random() * Math.PI * 2;
            this.lastDirectionChange = currentTime;
        }

        const newX = this.x + Math.cos(this.direction) * this.speed;
        const newY = this.y + Math.sin(this.direction) * this.speed;
        
        // Update position
        this.x = newX;
        this.y = newY;
        
        // Bounce off walls
        if (this.x < 0 || this.x > this.canvasWidth - this.width) {
            this.direction = Math.PI - this.direction;
        }
        if (this.y < 0 || this.y > this.canvasHeight - this.height) {
            this.direction = -this.direction;
        }
    }

    draw(ctx) {
        // Draw bug body
        ctx.fillStyle = this.type === 'fast' ? '#ff0000' : 
                       this.type === 'armored' ? '#0000ff' : '#00ff00';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some details to make bugs more interesting
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 - 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/3, this.y + this.height/3, 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width*2/3, this.y + this.height/3, 4, 0, Math.PI * 2);
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
        this.minBugs = 3;
        this.maxBugs = 7;
        this.lastUpdateTime = 0;

        // UI Elements
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.resumeButton = document.getElementById('resumeButton');
        this.quitButton = document.getElementById('quitButton');
        this.pauseOverlay = document.getElementById('pauseOverlay');

        // Event Listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.pauseGame());
        this.resumeButton.addEventListener('click', () => this.resumeGame());
        this.quitButton.addEventListener('click', () => this.quitGame());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    quitGame() {
        if (!this.isRunning) return;
        
        if (confirm('Are you sure you want to quit the game? Your current score will be lost.')) {
            this.cleanup();
            this.resetUI();
            alert('Game quit. Your score was: ' + this.score);
        }
    }

    cleanup() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.gameLoop);
        clearInterval(this.spawnInterval);
        clearInterval(this.timer);
        this.bugs = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resetUI() {
        this.startButton.disabled = false;
        this.pauseButton.disabled = true;
        this.quitButton.disabled = true;
        this.pauseOverlay.classList.remove('active');
        this.score = 0;
        this.timeLeft = 60;
        this.updateUI();
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
        this.quitButton.disabled = false;
        
        // Spawn initial bugs
        for (let i = 0; i < this.minBugs; i++) {
            this.spawnBug();
        }
        
        // Spawn bugs more frequently
        this.spawnInterval = setInterval(() => this.maintainBugCount(), 1000);
        
        // Start game loop
        this.lastUpdateTime = performance.now();
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        
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

    maintainBugCount() {
        if (this.isPaused) return;
        
        // Spawn bugs until we reach the minimum count
        while (this.bugs.length < this.minBugs && this.bugs.length < this.maxBugs) {
            this.spawnBug();
        }
    }

    spawnBug() {
        if (this.isPaused) return;
        
        const types = ['basic', 'fast', 'armored'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Calculate spawn position away from edges
        const margin = 50;
        const x = margin + Math.random() * (this.canvas.width - 2 * margin - 40);
        const y = margin + Math.random() * (this.canvas.height - 2 * margin - 40);
        
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

    update(timestamp) {
        if (!this.isRunning) return;
        
        if (!this.isPaused) {
            const deltaTime = timestamp - this.lastUpdateTime;
            this.lastUpdateTime = timestamp;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw bugs
            this.bugs.forEach(bug => {
                bug.update(timestamp);
                bug.draw(this.ctx);
            });
        }
        
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('timer').textContent = this.timeLeft;
    }

    endGame() {
        this.cleanup();
        this.resetUI();
        
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