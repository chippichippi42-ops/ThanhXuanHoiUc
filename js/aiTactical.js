class TacticalAI {
    constructor(hero, gameState, difficulty = 2) {
        this.hero = hero;
        this.gameState = gameState;
        this.difficulty = difficulty;
        this.updateInterval = CONFIG.AI_UPDATE_INTERVAL;
        this.lastUpdateTime = 0;
        
        this.difficultyModifiers = {
            1: { reactionTime: 2000, accuracy: 0.6, aggression: 0.4 },
            2: { reactionTime: 1500, accuracy: 0.8, aggression: 0.6 },
            3: { reactionTime: 1000, accuracy: 0.95, aggression: 0.8 }
        };
    }

    update(deltaTime) {
        const now = Date.now();
        
        if (now - this.lastUpdateTime < this.updateInterval) {
            return;
        }
        
        this.lastUpdateTime = now;
        
        const decision = this.makeDecision();
        this.executeDecision(decision);
    }

    makeDecision() {
        const situation = this.analyzeSituation();
        
        const hpPercent = this.hero.hp / this.hero.maxHp;
        const manaPercent = this.hero.mana / this.hero.maxMana;
        const level = this.hero.level;
        
        if (hpPercent < 0.3) {
            return {
                strategy: 'RETREAT',
                target: this.getRetreatPosition(),
                reasoning: 'Low health, need to retreat'
            };
        }
        
        if (situation.nearbyEnemies.length > situation.nearbyAllies.length + 1 && hpPercent < 0.6) {
            return {
                strategy: 'RETREAT',
                target: this.getNearestAlly(),
                reasoning: 'Outnumbered, retreat to allies'
            };
        }
        
        const weakEnemy = this.findWeakEnemy(situation.nearbyEnemies);
        if (weakEnemy && hpPercent > 0.5 && situation.nearbyAllies.length >= situation.nearbyEnemies.length) {
            return {
                strategy: 'ALL_IN',
                target: weakEnemy,
                reasoning: 'Weak enemy detected, all in'
            };
        }
        
        if (situation.nearbyEnemies.length > 0 && manaPercent > 0.4) {
            return {
                strategy: 'HARASS',
                target: situation.nearbyEnemies[0],
                reasoning: 'Enemy in range, harass'
            };
        }
        
        const nearbyTower = this.findAttackableTower();
        if (nearbyTower && situation.nearbyEnemies.length === 0) {
            return {
                strategy: 'PUSH_OBJECTIVE',
                target: nearbyTower,
                reasoning: 'No enemies nearby, push tower'
            };
        }
        
        if (manaPercent < 0.3 || hpPercent < 0.5) {
            return {
                strategy: 'FARM_SAFE',
                target: this.findSafeFarmLocation(),
                reasoning: 'Need resources, farm safely'
            };
        }
        
        return {
            strategy: 'FARM_SAFE',
            target: this.findNearestMinion(),
            reasoning: 'Default: farm minions'
        };
    }

    analyzeSituation() {
        const visionRange = CONFIG.VISION_RANGE;
        
        const nearbyEnemies = this.gameState.heroes.filter(h => {
            if (h.team === this.hero.team || h.isDead) return false;
            const dist = distance(this.hero.x, this.hero.y, h.x, h.y);
            return dist < visionRange;
        });
        
        const nearbyAllies = this.gameState.heroes.filter(h => {
            if (h.team !== this.hero.team || h.isDead || h === this.hero) return false;
            const dist = distance(this.hero.x, this.hero.y, h.x, h.y);
            return dist < visionRange;
        });
        
        const nearbyMinions = this.gameState.minions.filter(m => {
            if (m.isDead) return false;
            const dist = distance(this.hero.x, this.hero.y, m.x, m.y);
            return dist < visionRange;
        });
        
        return {
            nearbyEnemies,
            nearbyAllies,
            nearbyMinions,
            teamPower: this.calculateTeamPower(nearbyAllies) + this.calculateHeroPower(this.hero),
            enemyPower: nearbyEnemies.reduce((sum, e) => sum + this.calculateHeroPower(e), 0)
        };
    }

    calculateHeroPower(hero) {
        if (!hero || hero.isDead) return 0;
        
        const hpFactor = hero.hp / hero.maxHp;
        const levelFactor = hero.level / 18;
        const statFactor = (hero.stats.damage + hero.stats.abilityPower) / 200;
        
        return (hpFactor * 0.4 + levelFactor * 0.3 + statFactor * 0.3) * 100;
    }

    calculateTeamPower(allies) {
        return allies.reduce((sum, ally) => sum + this.calculateHeroPower(ally), 0);
    }

    findWeakEnemy(enemies) {
        let weakest = null;
        let lowestHp = Infinity;
        
        for (const enemy of enemies) {
            const hpPercent = enemy.hp / enemy.maxHp;
            if (hpPercent < 0.4 && enemy.hp < lowestHp) {
                weakest = enemy;
                lowestHp = enemy.hp;
            }
        }
        
        return weakest;
    }

    findAttackableTower() {
        const towers = this.gameState.towers.filter(t => {
            if (t.team === this.hero.team || t.isDead) return false;
            const dist = distance(this.hero.x, this.hero.y, t.x, t.y);
            return dist < 1000;
        });
        
        towers.sort((a, b) => {
            const distA = distance(this.hero.x, this.hero.y, a.x, a.y);
            const distB = distance(this.hero.x, this.hero.y, b.x, b.y);
            return distA - distB;
        });
        
        return towers[0] || null;
    }

    findNearestMinion() {
        const enemyMinions = this.gameState.minions.filter(m => {
            if (m.team === this.hero.team || m.isDead) return false;
            const dist = distance(this.hero.x, this.hero.y, m.x, m.y);
            return dist < 1500;
        });
        
        if (enemyMinions.length === 0) return null;
        
        enemyMinions.sort((a, b) => {
            const distA = distance(this.hero.x, this.hero.y, a.x, a.y);
            const distB = distance(this.hero.x, this.hero.y, b.x, b.y);
            return distA - distB;
        });
        
        return enemyMinions[0];
    }

    findSafeFarmLocation() {
        const spawnPoint = this.gameState.map.spawnPoints[this.hero.team];
        return spawnPoint;
    }

    getRetreatPosition() {
        const spawnPoint = this.gameState.map.spawnPoints[this.hero.team];
        return spawnPoint;
    }

    getNearestAlly() {
        const allies = this.gameState.heroes.filter(h => {
            if (h.team !== this.hero.team || h.isDead || h === this.hero) return false;
            return true;
        });
        
        if (allies.length === 0) return this.getRetreatPosition();
        
        allies.sort((a, b) => {
            const distA = distance(this.hero.x, this.hero.y, a.x, a.y);
            const distB = distance(this.hero.x, this.hero.y, b.x, b.y);
            return distA - distB;
        });
        
        return allies[0];
    }

    executeDecision(decision) {
        this.hero.aiData.strategy = decision.strategy;
        
        switch (decision.strategy) {
            case 'RETREAT':
                this.executeRetreat(decision.target);
                break;
                
            case 'ALL_IN':
                this.executeAllIn(decision.target);
                break;
                
            case 'HARASS':
                this.executeHarass(decision.target);
                break;
                
            case 'PUSH_OBJECTIVE':
                this.executePushObjective(decision.target);
                break;
                
            case 'FARM_SAFE':
                this.executeFarmSafe(decision.target);
                break;
                
            default:
                this.hero.vx = 0;
                this.hero.vy = 0;
        }
    }

    executeRetreat(target) {
        this.hero.aiData.targetEnemy = null;
        
        if (!target) {
            target = this.getRetreatPosition();
        }
        
        const dx = target.x - this.hero.x;
        const dy = target.y - this.hero.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 100) {
            const speed = this.hero.stats.movementSpeed;
            this.hero.vx = (dx / dist) * speed;
            this.hero.vy = (dy / dist) * speed;
        } else {
            this.hero.vx = 0;
            this.hero.vy = 0;
        }
    }

    executeAllIn(target) {
        if (!target || target.isDead) {
            this.hero.aiData.targetEnemy = null;
            return;
        }
        
        this.hero.aiData.targetEnemy = target;
        
        const dist = distance(this.hero.x, this.hero.y, target.x, target.y);
        
        if (dist <= this.hero.stats.attackRange) {
            this.hero.vx = 0;
            this.hero.vy = 0;
            
            if (this.hero.canAttack()) {
                this.gameState.combatSystem.attemptAutoAttack(this.hero, target);
            }
            
            for (const key of ['q', 'w', 'e', 'r']) {
                if (Math.random() < 0.3) {
                    this.hero.castAbility(key, target.x, target.y, this.gameState);
                }
            }
        } else {
            const dx = target.x - this.hero.x;
            const dy = target.y - this.hero.y;
            const speed = this.hero.stats.movementSpeed;
            this.hero.vx = (dx / dist) * speed;
            this.hero.vy = (dy / dist) * speed;
        }
    }

    executeHarass(target) {
        if (!target || target.isDead) {
            this.hero.aiData.targetEnemy = null;
            return;
        }
        
        this.hero.aiData.targetEnemy = target;
        
        const dist = distance(this.hero.x, this.hero.y, target.x, target.y);
        const safeRange = this.hero.stats.attackRange * 0.9;
        
        if (dist <= safeRange) {
            this.hero.vx = 0;
            this.hero.vy = 0;
            
            if (this.hero.canAttack()) {
                this.gameState.combatSystem.attemptAutoAttack(this.hero, target);
            }
            
            if (Math.random() < 0.2) {
                const abilities = ['q', 'e'];
                const abilityKey = randomChoice(abilities);
                this.hero.castAbility(abilityKey, target.x, target.y, this.gameState);
            }
        } else if (dist > this.hero.stats.attackRange) {
            const dx = target.x - this.hero.x;
            const dy = target.y - this.hero.y;
            const speed = this.hero.stats.movementSpeed;
            this.hero.vx = (dx / dist) * speed;
            this.hero.vy = (dy / dist) * speed;
        }
    }

    executePushObjective(target) {
        if (!target || target.isDead) {
            this.hero.aiData.targetEnemy = null;
            return;
        }
        
        this.hero.aiData.targetEnemy = target;
        
        const dist = distance(this.hero.x, this.hero.y, target.x, target.y);
        
        if (dist <= this.hero.stats.attackRange) {
            this.hero.vx = 0;
            this.hero.vy = 0;
            
            if (this.hero.canAttack()) {
                this.gameState.combatSystem.attemptAutoAttack(this.hero, target);
            }
        } else {
            const dx = target.x - this.hero.x;
            const dy = target.y - this.hero.y;
            const speed = this.hero.stats.movementSpeed;
            this.hero.vx = (dx / dist) * speed;
            this.hero.vy = (dy / dist) * speed;
        }
    }

    executeFarmSafe(target) {
        this.hero.aiData.targetEnemy = null;
        
        if (!target) {
            this.hero.vx = 0;
            this.hero.vy = 0;
            return;
        }
        
        const dist = distance(this.hero.x, this.hero.y, target.x, target.y);
        
        if (target instanceof Minion) {
            if (dist <= this.hero.stats.attackRange) {
                this.hero.vx = 0;
                this.hero.vy = 0;
                
                if (this.hero.canAttack()) {
                    this.gameState.combatSystem.attemptAutoAttack(this.hero, target);
                }
            } else if (dist < 500) {
                const dx = target.x - this.hero.x;
                const dy = target.y - this.hero.y;
                const speed = this.hero.stats.movementSpeed;
                this.hero.vx = (dx / dist) * speed;
                this.hero.vy = (dy / dist) * speed;
            }
        } else {
            if (dist > 200) {
                const dx = target.x - this.hero.x;
                const dy = target.y - this.hero.y;
                const speed = this.hero.stats.movementSpeed * 0.5;
                this.hero.vx = (dx / dist) * speed;
                this.hero.vy = (dy / dist) * speed;
            } else {
                this.hero.vx = 0;
                this.hero.vy = 0;
            }
        }
    }
}
