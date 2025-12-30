class HitEffect {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y + randomRange(-20, -40);
        this.damage = Math.floor(damage);
        this.alpha = 1;
        this.lifetime = 1000;
        this.startTime = Date.now();
        this.isDead = false;
        this.vx = randomRange(-20, 20);
        this.vy = randomRange(-50, -100);
    }

    update(deltaTime) {
        const elapsed = Date.now() - this.startTime;
        
        if (elapsed >= this.lifetime) {
            this.isDead = true;
            return;
        }
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += 200 * deltaTime;
        
        this.alpha = 1 - (elapsed / this.lifetime);
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, 50)) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#f39c12';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.damage.toString(), this.x, this.y);
        ctx.fillText(this.damage.toString(), this.x, this.y);
        ctx.restore();
    }
}

class AbilityEffect {
    constructor(x, y, radius, color = '#4ecca3', duration = 500) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.duration = duration;
        this.startTime = Date.now();
        this.isDead = false;
        this.maxRadius = radius;
        this.alpha = 0.6;
    }

    update(deltaTime) {
        const elapsed = Date.now() - this.startTime;
        
        if (elapsed >= this.duration) {
            this.isDead = true;
            return;
        }
        
        const progress = elapsed / this.duration;
        this.radius = this.maxRadius * (0.5 + progress * 0.5);
        this.alpha = 0.6 * (1 - progress);
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.radius)) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class AuraEffect {
    constructor(entity, radius, color = '#4ecca3', pulseSpeed = 2) {
        this.entity = entity;
        this.radius = radius;
        this.color = color;
        this.pulseSpeed = pulseSpeed;
        this.time = 0;
        this.isDead = false;
    }

    update(deltaTime) {
        this.time += deltaTime * this.pulseSpeed;
        
        if (this.entity.isDead) {
            this.isDead = true;
        }
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.entity.x, this.entity.y, this.radius)) return;
        
        const pulse = (Math.sin(this.time * Math.PI) + 1) / 2;
        const alpha = 0.2 + pulse * 0.3;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.entity.x, this.entity.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class ParticleEffect {
    constructor(x, y, count = 10, color = '#f39c12') {
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = randomRange(50, 150);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: randomRange(3, 8),
                alpha: 1,
                lifetime: randomRange(500, 1000),
                startTime: Date.now(),
                color: color
            });
        }
        
        this.isDead = false;
    }

    update(deltaTime) {
        let allDead = true;
        
        for (const particle of this.particles) {
            const elapsed = Date.now() - particle.startTime;
            
            if (elapsed < particle.lifetime) {
                allDead = false;
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.vy += 100 * deltaTime;
                particle.alpha = 1 - (elapsed / particle.lifetime);
            }
        }
        
        this.isDead = allDead;
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        
        for (const particle of this.particles) {
            if (!camera.isVisible(particle.x, particle.y, particle.size)) continue;
            
            const elapsed = Date.now() - particle.startTime;
            if (elapsed >= particle.lifetime) continue;
            
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

class RangeIndicator {
    constructor(entity, range, color = 'rgba(255, 255, 255, 0.2)') {
        this.entity = entity;
        this.range = range;
        this.color = color;
        this.isDead = false;
    }

    update(deltaTime) {
        if (this.entity.isDead) {
            this.isDead = true;
        }
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.entity.x, this.entity.y, this.range)) return;
        
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.entity.x, this.entity.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
