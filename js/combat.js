class CombatSystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    processAutoAttacks(deltaTime) {
        for (const hero of this.gameState.heroes) {
            if (hero.isDead || hero.isStunned) continue;
            
            if (!hero.isPlayer && hero.aiData.targetEnemy) {
                this.attemptAutoAttack(hero, hero.aiData.targetEnemy);
            }
        }
    }

    attemptAutoAttack(attacker, target) {
        if (!attacker.canAttack()) return false;
        if (target.isDead) return false;
        
        const dist = attacker.distanceTo(target);
        const attackRange = attacker.stats?.attackRange || attacker.attackRange || 150;
        
        if (dist > attackRange) return false;
        
        attacker.lastAttackTime = Date.now();
        
        const isCrit = attacker.stats ? shouldCrit(attacker.stats.critChance) : false;
        const baseDamage = attacker.stats?.damage || attacker.damage || 10;
        
        const actualDamage = calculateDamage(attacker, target, baseDamage, true, isCrit);
        target.takeDamage(actualDamage, attacker);
        
        if (attacker.stats?.lifeSteal && attacker.stats.lifeSteal > 0) {
            const healAmount = actualDamage * attacker.stats.lifeSteal;
            attacker.heal(healAmount);
        }
        
        if (this.gameState.effects) {
            this.gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }
        
        if (attacker.stats && attacker.stats.attackRange > 200) {
            this.gameState.projectiles.push(
                new Projectile(attacker.x, attacker.y, target.x, target.y, 0, 800, attacker, {
                    size: 8,
                    color: '#f39c12'
                })
            );
        }
        
        return true;
    }

    applyDot(target, damage, duration, interval, source) {
        const ticks = Math.floor(duration / interval);
        const damagePerTick = damage / ticks;
        
        for (let i = 0; i < ticks; i++) {
            setTimeout(() => {
                if (target.isDead) return;
                
                const actualDamage = calculateDamage(source, target, damagePerTick, false, false);
                target.takeDamage(actualDamage, source);
                
                if (this.gameState.effects) {
                    this.gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
                }
            }, i * interval);
        }
    }

    applyCrowdControl(target, ccType, duration, options = {}) {
        switch (ccType) {
            case 'stun':
                target.isStunned = true;
                target.debuffs.push({
                    type: 'stun',
                    duration: duration
                });
                
                setTimeout(() => {
                    target.isStunned = false;
                }, duration);
                break;
                
            case 'slow':
                if (target.stats && target.stats.movementSpeed) {
                    const originalSpeed = target.stats.movementSpeed;
                    const slowAmount = options.slowAmount || 0.5;
                    
                    target.stats.movementSpeed *= (1 - slowAmount);
                    target.debuffs.push({
                        type: 'slow',
                        duration: duration,
                        amount: slowAmount
                    });
                    
                    setTimeout(() => {
                        target.stats.movementSpeed = originalSpeed;
                    }, duration);
                }
                break;
                
            case 'knockback':
                if (options.direction && options.distance) {
                    const angle = options.direction;
                    const dist = options.distance;
                    
                    target.x += Math.cos(angle) * dist;
                    target.y += Math.sin(angle) * dist;
                    
                    if (this.gameState.map.isCollidingWithWall(target.x, target.y, target.size)) {
                        target.x -= Math.cos(angle) * dist;
                        target.y -= Math.sin(angle) * dist;
                    }
                }
                break;
        }
    }

    applyBuff(target, buffType, value, duration) {
        target.buffs.push({
            type: buffType,
            value: value,
            duration: duration
        });
        
        switch (buffType) {
            case 'movementSpeed':
                if (target.stats) {
                    const originalSpeed = target.stats.movementSpeed;
                    target.stats.movementSpeed *= value;
                    
                    setTimeout(() => {
                        target.stats.movementSpeed = originalSpeed;
                    }, duration);
                }
                break;
                
            case 'attackSpeed':
                if (target.stats) {
                    const originalAS = target.stats.attackSpeed;
                    target.stats.attackSpeed *= value;
                    
                    setTimeout(() => {
                        target.stats.attackSpeed = originalAS;
                    }, duration);
                }
                break;
                
            case 'damageReduction':
                target.damageReduction = Math.max(target.damageReduction, value);
                break;
        }
    }

    checkGameEnd() {
        const blueNexus = this.gameState.towers.find(t => 
            t.team === CONFIG.TEAM_BLUE && t.type === 'nexus'
        );
        
        const redNexus = this.gameState.towers.find(t => 
            t.team === CONFIG.TEAM_RED && t.type === 'nexus'
        );
        
        if (blueNexus && blueNexus.isDead) {
            return CONFIG.TEAM_RED;
        }
        
        if (redNexus && redNexus.isDead) {
            return CONFIG.TEAM_BLUE;
        }
        
        return null;
    }
}
