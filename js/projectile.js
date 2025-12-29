class Projectile {
    constructor(x, y, targetX, targetY, damage, speed, owner, options = {}) {
        this.id = getUniqueId();
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage;
        this.speed = speed;
        this.owner = owner;
        this.isDead = false;
        this.size = options.size || 8;
        this.color = options.color || '#f39c12';
        this.piercing = options.piercing || false;
        this.hitTargets = new Set();
        this.maxDistance = options.maxDistance || 2000;
        this.startX = x;
        this.startY = y;
        this.aoe = options.aoe || 0;
        this.onHitEffect = options.onHitEffect || null;
        
        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update(deltaTime, gameState) {
        if (this.isDead) return;
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        const distanceTraveled = distance(this.x, this.y, this.startX, this.startY);
        if (distanceTraveled > this.maxDistance) {
            this.isDead = true;
            return;
        }
        
        if (this.x < 0 || this.x > gameState.map.size || this.y < 0 || this.y > gameState.map.size) {
            this.isDead = true;
            return;
        }
        
        this.checkCollisions(gameState);
    }

    checkCollisions(gameState) {
        const targets = [...gameState.heroes, ...gameState.towers, ...gameState.minions];
        
        for (const target of targets) {
            if (target.isDead) continue;
            if (target === this.owner) continue;
            if (target.team === this.owner.team) continue;
            if (this.hitTargets.has(target.id)) continue;
            
            const dist = distance(this.x, this.y, target.x, target.y);
            if (dist < this.size + target.size) {
                this.hit(target, gameState);
                
                if (!this.piercing) {
                    this.isDead = true;
                    break;
                }
            }
        }
    }

    hit(target, gameState) {
        this.hitTargets.add(target.id);
        
        const actualDamage = calculateDamage(this.owner, target, this.damage, true, false);
        target.takeDamage(actualDamage, this.owner);
        
        if (this.aoe > 0) {
            this.applyAoeDamage(target, gameState);
        }
        
        if (this.onHitEffect) {
            this.onHitEffect(target, this.owner, gameState);
        }
        
        if (gameState.effects) {
            gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }
    }

    applyAoeDamage(epicenter, gameState) {
        const targets = [...gameState.heroes, ...gameState.minions];
        
        for (const target of targets) {
            if (target.isDead) continue;
            if (target === epicenter) continue;
            if (target.team === this.owner.team) continue;
            
            const dist = distance(epicenter.x, epicenter.y, target.x, target.y);
            if (dist <= this.aoe) {
                const aoeDamage = this.damage * 0.5;
                const actualDamage = calculateDamage(this.owner, target, aoeDamage, true, false);
                target.takeDamage(actualDamage, this.owner);
                
                if (gameState.effects) {
                    gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
                }
            }
        }
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.size)) return;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
