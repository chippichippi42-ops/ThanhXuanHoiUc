class InputManager {
    constructor() {
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseWorldX = 0;
        this.mouseWorldY = 0;
        this.mouseDown = false;
        
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'Escape') {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        window.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        window.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
        });
        
        window.addEventListener('mouseup', (e) => {
            this.mouseDown = false;
        });
        
        window.addEventListener('blur', () => {
            this.keys = {};
            this.mouseDown = false;
        });
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] === true;
    }

    updateMouseWorld(camera) {
        this.mouseWorldX = this.mouseX + camera.x;
        this.mouseWorldY = this.mouseY + camera.y;
    }

    getMovementVector() {
        let dx = 0;
        let dy = 0;
        
        if (this.isKeyPressed('w')) dy -= 1;
        if (this.isKeyPressed('s')) dy += 1;
        if (this.isKeyPressed('a')) dx -= 1;
        if (this.isKeyPressed('d')) dx += 1;
        
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
            dx /= length;
            dy /= length;
        }
        
        return { dx, dy };
    }

    clearKey(key) {
        this.keys[key.toLowerCase()] = false;
    }
}
