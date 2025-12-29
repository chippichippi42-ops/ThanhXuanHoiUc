class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.x = 0;
        this.y = 0;
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.target = null;
        this.smoothing = 0.1;
    }

    follow(entity) {
        this.target = entity;
    }

    update(deltaTime) {
        if (!this.target) return;
        
        const targetX = this.target.x - this.width / 2;
        const targetY = this.target.y - this.height / 2;
        
        this.x += (targetX - this.x) * this.smoothing;
        this.y += (targetY - this.y) * this.smoothing;
        
        this.x = clamp(this.x, 0, this.worldWidth - this.width);
        this.y = clamp(this.y, 0, this.worldHeight - this.height);
    }

    apply(ctx) {
        ctx.save();
        ctx.translate(-this.x, -this.y);
    }

    reset(ctx) {
        ctx.restore();
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    isVisible(x, y, radius = 0) {
        return x + radius > this.x &&
               x - radius < this.x + this.width &&
               y + radius > this.y &&
               y - radius < this.y + this.height;
    }

    setSmoothness(value) {
        this.smoothing = clamp(value, 0, 1);
    }
}
