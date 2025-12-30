class Minion extends Entity {
    constructor(x, y, team, type, lane) {
        super(x, y, team);
        
        this.type = type;
        this.lane = lane;
        
        const data = MINION_DATA[type];
        this.maxHp = data.hp;
        this.hp = this.maxHp;
        this.damage = data.damage;
        this.movementSpeed = data.movementSpeed;
        this.attackRange = data.attackRange;
        this.attackSpeed = data.attackSpeed;
        this.gold = data.gold;
        this.xp = data.xp;
        this.size = data.size;
        
        this.attackCooldown = 1000 / this.attackSpeed;
        
        this.waypointIndex = 0;
        this.waypoints = [];
    }

    setWaypoints(waypoints) {
        this.waypoints = waypoints;
    }

    update(deltaTime, gameState) {
        if (this.isDead) return;
        
        this.findTarget(gameState);
        
        if (this.target && !this.target.isDead) {
            const dist = this.distanceTo(this.target);
            
            if (dist <= this.attackRange) {
                this.performAttack(this.target, gameState);
            } else {
                this.moveTowards(this.target, this.movementSpeed, deltaTime);
            }
        } else {
            this.followLane(deltaTime, gameState);
        }
    }

    findTarget(gameState) {
        const targetEntities = [
            ...gameState.towers.filter(t => t.team !== this.team && !t.isDead),
            ...gameState.heroes.filter(h => h.team !== this.team && !h.isDead),
            ...gameState.minions.filter(m => m.team !== this.team && !m.isDead)
        ];
        
        let closestTarget = null;
        let closestDist = this.attackRange * 1.5;
        
        for (const entity of targetEntities) {
            const dist = this.distanceTo(entity);
            if (dist < closestDist) {
                closestTarget = entity;
                closestDist = dist;
            }
        }
        
        this.target = closestTarget;
    }

    followLane(deltaTime, gameState) {
        if (!this.waypoints || this.waypoints.length === 0) return;
        
        const currentWaypoint = this.waypoints[this.waypointIndex];
        if (!currentWaypoint) return;
        
        const dist = distance(this.x, this.y, currentWaypoint.x, currentWaypoint.y);
        
        if (dist < 50) {
            this.waypointIndex++;
            if (this.waypointIndex >= this.waypoints.length) {
                this.waypointIndex = this.waypoints.length - 1;
            }
        } else {
            this.moveTowards(currentWaypoint, this.movementSpeed, deltaTime);
        }
    }

    performAttack(target, gameState) {
        if (!this.canAttack()) return;
        
        super.performAttack(target, gameState);
        
        const isCrit = false;
        const actualDamage = calculateDamage(this, target, this.damage, true, isCrit);
        target.takeDamage(actualDamage, this);
        
        if (gameState.effects) {
            gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }
        
        if (this.type === 'ranged') {
            gameState.projectiles.push(
                new Projectile(this.x, this.y, target.x, target.y, 0, 600, this, {
                    size: 6,
                    color: this.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560'
                })
            );
        }
    }

    die(killer) {
        super.die(killer);
        
        if (killer && killer instanceof Hero) {
            const xpReward = this.xp;
            const goldReward = this.gold;
            
            killer.gainXP(xpReward * CONFIG.XP_LAST_HIT_BONUS, killer);
            killer.gainGold(goldReward);
        }
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.size)) return;
        
        if (this.type === 'melee') {
            ctx.fillStyle = this.team === CONFIG.TEAM_BLUE ? '#00cc44' : '#cc4400';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x - 4, this.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 4, this.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.team === CONFIG.TEAM_BLUE ? '#44ff44' : '#ff8844';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x - 2, this.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 2, this.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.drawHealthBar(ctx);
    }
}
