class ReactiveAI {
    constructor(hero, gameState) {
        this.hero = hero;
        this.gameState = gameState;
    }

    update(deltaTime) {
        if (this.hero.isDead || this.hero.isStunned) {
            this.hero.vx = 0;
            this.hero.vy = 0;
            return;
        }
        
        const threats = this.detectThreats();
        
        if (threats.immediate.length > 0) {
            this.dodgeThreats(threats.immediate, deltaTime);
            return;
        }
        
        if (this.shouldLastHit()) {
            this.performLastHit();
        }
        
        this.maintainSafeDistance();
    }

    detectThreats() {
        const immediate = [];
        const potential = [];
        
        for (const projectile of this.gameState.projectiles) {
            if (projectile.isDead || projectile.owner.team === this.hero.team) continue;
            
            const dist = distance(this.hero.x, this.hero.y, projectile.x, projectile.y);
            const projectileVector = new Vector2(projectile.vx, projectile.vy).normalize();
            const toHero = new Vector2(this.hero.x - projectile.x, this.hero.y - projectile.y).normalize();
            
            const dotProduct = projectileVector.dot(toHero);
            
            if (dist < 200 && dotProduct > 0.7) {
                immediate.push({ type: 'projectile', entity: projectile, distance: dist });
            }
        }
        
        for (const enemy of this.gameState.heroes) {
            if (enemy.team === this.hero.team || enemy.isDead) continue;
            
            const dist = distance(this.hero.x, this.hero.y, enemy.x, enemy.y);
            if (dist < 300) {
                potential.push({ type: 'hero', entity: enemy, distance: dist });
            }
        }
        
        return { immediate, potential };
    }

    dodgeThreats(threats, deltaTime) {
        let dodgeX = 0;
        let dodgeY = 0;
        
        for (const threat of threats) {
            const dx = this.hero.x - threat.entity.x;
            const dy = this.hero.y - threat.entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                dodgeX += (dx / dist);
                dodgeY += (dy / dist);
            }
        }
        
        const length = Math.sqrt(dodgeX * dodgeX + dodgeY * dodgeY);
        if (length > 0) {
            dodgeX /= length;
            dodgeY /= length;
        }
        
        const speed = this.hero.stats.movementSpeed;
        this.hero.vx = dodgeX * speed;
        this.hero.vy = dodgeY * speed;
    }

    shouldLastHit() {
        const nearbyMinions = this.gameState.minions.filter(m => {
            if (m.team === this.hero.team || m.isDead) return false;
            const dist = distance(this.hero.x, this.hero.y, m.x, m.y);
            return dist < this.hero.stats.attackRange + 100;
        });
        
        for (const minion of nearbyMinions) {
            const estimatedDamage = calculateDamage(this.hero, minion, this.hero.stats.damage, true, false);
            if (minion.hp <= estimatedDamage && minion.hp > estimatedDamage * 0.5) {
                return minion;
            }
        }
        
        return null;
    }

    performLastHit() {
        const target = this.shouldLastHit();
        if (!target) return;
        
        const dist = distance(this.hero.x, this.hero.y, target.x, target.y);
        
        if (dist <= this.hero.stats.attackRange) {
            if (this.hero.canAttack()) {
                this.gameState.combatSystem.attemptAutoAttack(this.hero, target);
            }
        } else {
            this.moveTowardsTarget(target);
        }
    }

    maintainSafeDistance() {
        if (!this.hero.aiData.targetEnemy) return;
        
        const target = this.hero.aiData.targetEnemy;
        if (target.isDead) {
            this.hero.aiData.targetEnemy = null;
            return;
        }
        
        const dist = distance(this.hero.x, this.hero.y, target.x, target.y);
        const optimalRange = this.hero.stats.attackRange * 0.8;
        
        if (dist < optimalRange * 0.5) {
            this.moveAwayFrom(target);
        } else if (dist > this.hero.stats.attackRange) {
            this.moveTowardsTarget(target);
        } else {
            this.hero.vx = 0;
            this.hero.vy = 0;
        }
    }

    moveTowardsTarget(target) {
        const dx = target.x - this.hero.x;
        const dy = target.y - this.hero.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const speed = this.hero.stats.movementSpeed;
            this.hero.vx = (dx / dist) * speed;
            this.hero.vy = (dy / dist) * speed;
        }
    }

    moveAwayFrom(target) {
        const dx = this.hero.x - target.x;
        const dy = this.hero.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const speed = this.hero.stats.movementSpeed;
            this.hero.vx = (dx / dist) * speed;
            this.hero.vy = (dy / dist) * speed;
        }
    }

    shouldUseAbility(abilityKey) {
        const ability = this.hero.abilities[abilityKey];
        
        if (!ability || !ability.isReady) return false;
        if (this.hero.mana < ability.manaCost) return false;
        if (ability.level === 0) return false;
        
        const target = this.hero.aiData.targetEnemy;
        if (!target || target.isDead) return false;
        
        const dist = distance(this.hero.x, this.hero.y, target.x, target.y);
        const range = ability.range || this.hero.stats.attackRange;
        
        if (dist > range) return false;
        
        const hpPercent = this.hero.hp / this.hero.maxHp;
        const manaPercent = this.hero.mana / this.hero.maxMana;
        
        if (abilityKey === 'r') {
            const enemyHpPercent = target.hp / target.maxHp;
            return enemyHpPercent < 0.5 && hpPercent > 0.3 && manaPercent > 0.5;
        }
        
        if (abilityKey === 'q' || abilityKey === 'e') {
            return manaPercent > 0.3 && dist < range;
        }
        
        if (abilityKey === 'w') {
            return hpPercent < 0.5 || this.hero.heroData.role === 'Support';
        }
        
        return false;
    }

    executeAbility(abilityKey) {
        const target = this.hero.aiData.targetEnemy;
        if (!target) return;
        
        this.hero.castAbility(abilityKey, target.x, target.y, this.gameState);
    }
}
