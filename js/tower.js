class Tower extends Entity {
    constructor(x, y, team, type) {
        super(x, y, team);
        
        this.type = type;
        const data = TOWER_DATA[type];
        
        this.maxHp = data.hp;
        this.hp = this.maxHp;
        this.damage = data.damage;
        this.attackSpeed = data.attackSpeed;
        this.attackRange = data.attackRange;
        this.gold = data.gold;
        this.xp = data.xp;
        this.size = data.size;
        
        this.attackCooldown = 1000 / this.attackSpeed;
        
        this.damageStacks = new Map();
    }

    update(deltaTime, gameState) {
        if (this.isDead) return;
        
        this.findTarget(gameState);
        
        if (this.target && !this.target.isDead) {
            const dist = this.distanceTo(this.target);
            
            if (dist <= this.attackRange) {
                this.performAttack(this.target, gameState);
            } else {
                this.target = null;
                this.damageStacks.delete(this.target?.id);
            }
        }
        
        this.cleanupStacks();
    }

    findTarget(gameState) {
        const priorities = [
            gameState.heroes.filter(h => h.team !== this.team && !h.isDead),
            gameState.minions.filter(m => m.team !== this.team && !m.isDead)
        ];
        
        for (const group of priorities) {
            for (const entity of group) {
                const dist = this.distanceTo(entity);
                if (dist <= this.attackRange) {
                    if (this.target !== entity) {
                        this.damageStacks.delete(this.target?.id);
                    }
                    this.target = entity;
                    return;
                }
            }
        }
        
        this.target = null;
    }

    performAttack(target, gameState) {
        if (!this.canAttack()) return;
        
        super.performAttack(target, gameState);
        
        if (!this.damageStacks.has(target.id)) {
            this.damageStacks.set(target.id, {
                stacks: 0,
                lastHit: Date.now()
            });
        }
        
        const stackData = this.damageStacks.get(target.id);
        stackData.stacks = Math.min(stackData.stacks + 1, TOWER_DAMAGE_STACK.maxStacks);
        stackData.lastHit = Date.now();
        
        const damageMultiplier = TOWER_DAMAGE_STACK.base + 
            (stackData.stacks - 1) * TOWER_DAMAGE_STACK.perStack;
        
        const baseDamage = this.damage * damageMultiplier;
        const actualDamage = calculateDamage(this, target, baseDamage, true, false);
        target.takeDamage(actualDamage, this);
        
        if (gameState.effects) {
            gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }
        
        gameState.projectiles.push(
            new Projectile(this.x, this.y, target.x, target.y, 0, 1000, this, {
                size: 10,
                color: this.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560'
            })
        );
    }

    cleanupStacks() {
        const now = Date.now();
        for (const [targetId, stackData] of this.damageStacks.entries()) {
            if (now - stackData.lastHit > 3000) {
                this.damageStacks.delete(targetId);
            }
        }
    }

    die(killer) {
        super.die(killer);
        
        if (killer && killer instanceof Hero) {
            killer.gainXP(this.xp, killer);
            killer.gainGold(this.gold);
            
            for (const hero of killer) {
                if (hero.team === killer.team && !hero.isDead) {
                    const dist = distance(hero.x, hero.y, this.x, this.y);
                    if (dist < 1000) {
                        hero.gainGold(Math.floor(this.gold * 0.3));
                    }
                }
            }
        }
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.size)) return;
        
        ctx.fillStyle = this.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        
        const height = this.size * 1.5;
        ctx.fillRect(this.x - this.size / 2, this.y - height, this.size, height);
        ctx.strokeRect(this.x - this.size / 2, this.y - height, this.size, height);
        
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(this.x, this.y - height - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        this.drawHealthBar(ctx);
        
        if (this.target && !this.target.isDead) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.attackRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 8;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size * 1.5 - 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        const hpPercent = this.hp / this.maxHp;
        const hpColor = hpPercent > 0.5 ? '#4ecca3' : hpPercent > 0.25 ? '#f39c12' : '#e94560';
        
        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}
