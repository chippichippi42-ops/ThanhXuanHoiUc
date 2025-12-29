class JungleCreature extends Entity {
    constructor(x, y, type) {
        super(x, y, -1);
        
        this.type = type;
        const data = JUNGLE_CREEP_DATA[type];
        
        this.maxHp = data.hp;
        this.hp = this.maxHp;
        this.damage = data.damage;
        this.movementSpeed = data.movementSpeed;
        this.attackRange = data.attackRange;
        this.gold = data.gold;
        this.xp = data.xp;
        this.size = data.size;
        this.color = data.color;
        
        this.attackCooldown = 1500;
        
        this.spawnX = x;
        this.spawnY = y;
        this.wanderRadius = 100;
        this.isAggro = false;
        this.aggroRange = 300;
        this.leashRange = 500;
        
        this.wanderTime = 0;
        this.wanderTarget = null;
    }

    update(deltaTime, gameState) {
        if (this.isDead) return;
        
        if (this.isAggro && this.target) {
            if (this.target.isDead || this.distanceTo({ x: this.spawnX, y: this.spawnY }) > this.leashRange) {
                this.resetAggro();
                return;
            }
            
            const dist = this.distanceTo(this.target);
            
            if (dist <= this.attackRange) {
                this.performAttack(this.target, gameState);
            } else {
                this.moveTowards(this.target, this.movementSpeed, deltaTime);
            }
        } else {
            this.checkForAggro(gameState);
            this.wander(deltaTime);
        }
    }

    checkForAggro(gameState) {
        for (const hero of gameState.heroes) {
            if (hero.isDead) continue;
            
            const dist = this.distanceTo(hero);
            if (dist < this.aggroRange) {
                this.isAggro = true;
                this.target = hero;
                break;
            }
        }
    }

    wander(deltaTime) {
        this.wanderTime += deltaTime;
        
        if (this.wanderTime > 3 || !this.wanderTarget) {
            this.wanderTime = 0;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.wanderRadius;
            
            this.wanderTarget = {
                x: this.spawnX + Math.cos(angle) * dist,
                y: this.spawnY + Math.sin(angle) * dist
            };
        }
        
        if (this.wanderTarget) {
            const dist = distance(this.x, this.y, this.wanderTarget.x, this.wanderTarget.y);
            if (dist > 10) {
                this.moveTowards(this.wanderTarget, this.movementSpeed * 0.5, deltaTime);
            }
        }
    }

    resetAggro() {
        this.isAggro = false;
        this.target = null;
        this.hp = this.maxHp;
        this.x = this.spawnX;
        this.y = this.spawnY;
    }

    performAttack(target, gameState) {
        if (!this.canAttack()) return;
        
        super.performAttack(target, gameState);
        
        const actualDamage = calculateDamage(this, target, this.damage, true, false);
        target.takeDamage(actualDamage, this);
        
        if (gameState.effects) {
            gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }
    }

    takeDamage(amount, attacker) {
        super.takeDamage(amount, attacker);
        
        if (!this.isAggro && attacker) {
            this.isAggro = true;
            this.target = attacker;
        }
    }

    die(killer) {
        super.die(killer);
        
        if (killer && killer instanceof Hero) {
            killer.gainXP(this.xp * CONFIG.XP_LAST_HIT_BONUS, killer);
            killer.gainGold(this.gold);
        }
        
        setTimeout(() => {
            this.respawn();
        }, 60000);
    }

    respawn() {
        this.isDead = false;
        this.hp = this.maxHp;
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.isAggro = false;
        this.target = null;
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.size)) return;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        this.drawHealthBar(ctx);
    }
}
