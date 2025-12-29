class Entity {
    constructor(x, y, team) {
        this.id = getUniqueId();
        this.x = x;
        this.y = y;
        this.team = team;
        this.isDead = false;
        this.maxHp = 100;
        this.hp = 100;
        this.size = 20;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.target = null;
        this.attackCooldown = 0;
        this.lastAttackTime = 0;
    }

    takeDamage(amount, attacker) {
        if (this.isDead) return;
        
        this.hp -= amount;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.die(attacker);
        }
    }

    heal(amount) {
        if (this.isDead) return;
        
        this.hp = Math.min(this.hp + amount, this.maxHp);
    }

    die(killer) {
        this.isDead = true;
    }

    update(deltaTime, gameState) {
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.size)) return;
        
        ctx.fillStyle = this.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        this.drawHealthBar(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 6;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size - 15;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        const hpPercent = this.hp / this.maxHp;
        const hpColor = hpPercent > 0.5 ? '#4ecca3' : hpPercent > 0.25 ? '#f39c12' : '#e94560';
        
        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    distanceTo(entity) {
        return distance(this.x, this.y, entity.x, entity.y);
    }

    angleTo(entity) {
        return Math.atan2(entity.y - this.y, entity.x - this.x);
    }

    moveTowards(target, speed, deltaTime) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            
            const moveAmount = speed * deltaTime;
            if (dist < moveAmount) {
                this.x = target.x;
                this.y = target.y;
            } else {
                this.x += this.vx * deltaTime;
                this.y += this.vy * deltaTime;
            }
            
            this.rotation = Math.atan2(dy, dx);
        }
    }

    canAttack() {
        return Date.now() - this.lastAttackTime >= this.attackCooldown;
    }

    performAttack(target, gameState) {
        if (!this.canAttack() || !target || target.isDead) return;
        
        this.lastAttackTime = Date.now();
    }
}
