const DEFAULT_HERO_BASE_STATS = {
    hp: 500,
    mana: 250,
    damage: 55,
    armor: 25,
    magicResist: 30,
    abilityPower: 0,
    attackSpeed: 0.7,
    movementSpeed: 330,
    attackRange: 150,
    critChance: 0,
    critDamage: 1.5,
    lifeSteal: 0,
    spellVamp: 0,
    hpRegen: 0.02,
    manaRegen: 0.03
};

class Hero extends Entity {
    constructor(x, y, team, heroData, isPlayer = false) {
        super(x, y, team);

        const fallbackHeroData = (typeof HERO_DATA !== 'undefined' && HERO_DATA)
            ? HERO_DATA[Object.keys(HERO_DATA)[0]]
            : null;

        this.heroData = heroData || fallbackHeroData || {
            id: 'unknown',
            name: 'Unknown',
            role: 'Unknown',
            emoji: '❓',
            baseStats: { ...DEFAULT_HERO_BASE_STATS },
            growthStats: {},
            abilities: {}
        };

        this.heroId = this.heroData.id || 'unknown';
        this.name = this.heroData.name || 'Unknown';
        this.role = this.heroData.role || 'Unknown';
        this.isPlayer = isPlayer;
        this.isAI = !isPlayer;

        this.level = 1;
        this.xp = 0;
        this.gold = 500;
        this.kills = 0;
        this.deaths = 0;
        this.assists = 0;

        const baseStats = this.heroData.baseStats && typeof this.heroData.baseStats === 'object'
            ? this.heroData.baseStats
            : {};

        this.stats = { ...DEFAULT_HERO_BASE_STATS, ...baseStats };
        this.maxHp = this.stats.hp || DEFAULT_HERO_BASE_STATS.hp;
        this.hp = this.maxHp;
        this.maxMana = this.stats.mana || 0;
        this.mana = this.maxMana;
        this.size = 25;

        this.abilities = this.createAbilities();
        this.summonerSpell = null;

        const attackSpeed = Math.max(0.1, this.stats.attackSpeed || DEFAULT_HERO_BASE_STATS.attackSpeed);
        this.attackCooldown = 1000 / attackSpeed;

        this.buffs = [];
        this.debuffs = [];

        this.isStunned = false;
        this.isInvisible = false;
        this.damageReduction = 0;

        this.respawnTime = 0;
        this.deathTime = 0;

        this.lastDamageDealtTo = new Map();

        this.aiData = {
            targetEnemy: null,
            strategy: 'FARM_SAFE',
            lastDecisionTime: 0
        };
    }

    createAbilities() {
        const abilities = {};

        const heroAbilities = this.heroData?.abilities && typeof this.heroData.abilities === 'object'
            ? this.heroData.abilities
            : {};

        for (const [key, abilityData] of Object.entries(heroAbilities)) {
            if (!abilityData || typeof abilityData !== 'object') continue;

            abilities[key] = {
                ...abilityData,
                currentCooldown: 0,
                isReady: true,
                level: key === 'r' ? 0 : 1
            };
        }

        return abilities;
    }

    setSummonerSpell(spellId) {
        const spellData = SUMMONER_SPELLS[spellId];
        if (!spellData) return;
        
        this.summonerSpell = {
            ...spellData,
            currentCooldown: 0,
            isReady: true
        };
    }

    update(deltaTime, gameState) {
        if (this.isDead) {
            this.updateRespawn(gameState);
            return;
        }
        
        this.updateCooldowns(deltaTime);
        this.updateBuffs(deltaTime);
        this.updateRegen(deltaTime);
        
        if (this.isStunned) {
            this.vx = 0;
            this.vy = 0;
            return;
        }
        
        if (this.vx !== 0 || this.vy !== 0) {
            const speed = Math.min(this.stats.movementSpeed, CONFIG.MAX_MOVEMENT_SPEED);
            const newX = this.x + this.vx * deltaTime;
            const newY = this.y + this.vy * deltaTime;
            
            if (!gameState.map.isCollidingWithWall(newX, newY, this.size)) {
                this.x = newX;
                this.y = newY;
                this.rotation = Math.atan2(this.vy, this.vx);
            }
        }
    }

    updateCooldowns(deltaTime) {
        for (const ability of Object.values(this.abilities)) {
            if (ability.currentCooldown > 0) {
                ability.currentCooldown -= deltaTime * 1000;
                ability.isReady = ability.currentCooldown <= 0;
            }
        }
        
        if (this.summonerSpell && this.summonerSpell.currentCooldown > 0) {
            this.summonerSpell.currentCooldown -= deltaTime * 1000;
            this.summonerSpell.isReady = this.summonerSpell.currentCooldown <= 0;
        }
    }

    updateBuffs(deltaTime) {
        this.buffs = this.buffs.filter(buff => {
            buff.duration -= deltaTime * 1000;
            return buff.duration > 0;
        });
        
        this.debuffs = this.debuffs.filter(debuff => {
            debuff.duration -= deltaTime * 1000;
            
            if (debuff.type === 'stun' && debuff.duration <= 0) {
                this.isStunned = false;
            }
            
            return debuff.duration > 0;
        });
        
        this.damageReduction = 0;
        for (const buff of this.buffs) {
            if (buff.type === 'damageReduction') {
                this.damageReduction = Math.max(this.damageReduction, buff.value);
            }
        }
    }

    updateRegen(deltaTime) {
        if (this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.maxHp * this.stats.hpRegen * deltaTime);
        }
        
        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + this.maxMana * this.stats.manaRegen * deltaTime);
        }
    }

    updateRespawn(gameState) {
        if (this.respawnTime > 0) {
            const elapsed = Date.now() - this.deathTime;
            
            if (elapsed >= this.respawnTime) {
                this.respawn(gameState);
            }
        }
    }

    castAbility(abilityKey, targetX, targetY, gameState) {
        const ability = this.abilities[abilityKey];
        
        if (!ability) return false;
        if (!ability.isReady) return false;
        if (ability.level === 0) return false;
        if (this.mana < ability.manaCost) return false;
        if (this.isStunned) return false;
        
        this.mana -= ability.manaCost;
        
        const cdr = Math.min(CONFIG.MAX_CDR, 0);
        ability.currentCooldown = ability.cooldown * 1000 * (1 - cdr);
        ability.isReady = false;
        
        this[`ability_${abilityKey}`](targetX, targetY, gameState);
        
        return true;
    }

    ability_q(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        
        switch (this.heroId) {
            case 'vanheo':
                this.vanheoMultiShot(targetX, targetY, gameState);
                break;
            case 'zephy':
                this.zephyDash(targetX, targetY, gameState);
                break;
            case 'lalo':
                this.laloFireball(targetX, targetY, gameState);
                break;
            case 'nemo':
                this.nemoHeal(targetX, targetY, gameState);
                break;
            case 'balametany':
                this.balametanyShadowDash(targetX, targetY, gameState);
                break;
        }
    }

    ability_e(targetX, targetY, gameState) {
        switch (this.heroId) {
            case 'vanheo':
                this.vanheoSwiftStep(gameState);
                break;
            case 'zephy':
                this.zephyIronWall(gameState);
                break;
            case 'lalo':
                this.laloFrostNova(targetX, targetY, gameState);
                break;
            case 'nemo':
                this.nemoShield(targetX, targetY, gameState);
                break;
            case 'balametany':
                this.balametanyStealth(gameState);
                break;
        }
    }

    ability_r(targetX, targetY, gameState) {
        switch (this.heroId) {
            case 'vanheo':
                this.vanheoPiercingArrow(targetX, targetY, gameState);
                break;
            case 'zephy':
                this.zephyGroundSlam(gameState);
                break;
            case 'lalo':
                this.laloLightning(targetX, targetY, gameState);
                break;
            case 'nemo':
                this.nemoInspire(targetX, targetY, gameState);
                break;
            case 'balametany':
                this.balametanyExecute(targetX, targetY, gameState);
                break;
        }
    }

    ability_t(targetX, targetY, gameState) {
        switch (this.heroId) {
            case 'vanheo':
                this.vanheoRainOfArrows(targetX, targetY, gameState);
                break;
            case 'zephy':
                this.zephyEarthquake(targetX, targetY, gameState);
                break;
            case 'lalo':
                this.laloMeteorStorm(targetX, targetY, gameState);
                break;
            case 'nemo':
                this.nemoDivineIntervention(gameState);
                break;
            case 'balametany':
                this.balametanyDeathMark(targetX, targetY, gameState);
                break;
        }
    }

    autoAttack(targetX, targetY, gameState) {
        if (this.canAttack()) {
            const targets = [...gameState.minions, ...gameState.heroes]
                .filter(e => e.team !== this.team && !e.isDead);
            
            let closestTarget = null;
            let closestDist = this.stats.attackRange;
            
            for (const target of targets) {
                const dist = this.distanceTo(target);
                if (dist < closestDist) {
                    closestTarget = target;
                    closestDist = dist;
                }
            }
            
            if (closestTarget) {
                this.performAttack(closestTarget, gameState);
            }
        }
    }

    vanheMultiShot(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const spread = Math.PI / 6;
        
        for (let i = 0; i < ability.shots; i++) {
            const shotAngle = angle + (i - 1) * spread / 2;
            const tx = this.x + Math.cos(shotAngle) * ability.range;
            const ty = this.y + Math.sin(shotAngle) * ability.range;
            
            gameState.projectiles.push(
                new Projectile(this.x, this.y, tx, ty, ability.damage, 800, this, {
                    color: '#f39c12'
                })
            );
        }
        
        gameState.effects.push(new AbilityEffect(this.x, this.y, 100, '#f39c12'));
    }

    vanheoSwiftStep(gameState) {
        const ability = this.abilities.e;
        
        this.buffs.push({
            type: 'movementSpeed',
            value: ability.speedBoost,
            duration: ability.duration * 1000
        });
        
        const originalSpeed = this.stats.movementSpeed;
        this.stats.movementSpeed *= ability.speedBoost;
        
        setTimeout(() => {
            this.stats.movementSpeed = originalSpeed;
        }, ability.duration * 1000);
        
        gameState.effects.push(new AuraEffect(this, 50, '#4ecca3'));
    }

    vanheoPiercingArrow(targetX, targetY, gameState) {
        const ability = this.abilities.r;
        
        gameState.projectiles.push(
            new Projectile(this.x, this.y, targetX, targetY, ability.damage, 1000, this, {
                color: '#9b59b6',
                piercing: true,
                maxDistance: ability.range
            })
        );
        
        gameState.effects.push(new AbilityEffect(this.x, this.y, 80, '#9b59b6'));
    }

    vanheoRainOfArrows(targetX, targetY, gameState) {
        const ability = this.abilities.t;
        
        const damagePerTick = ability.damage / ability.duration;
        const ticks = ability.duration;
        
        for (let i = 0; i < ticks; i++) {
            setTimeout(() => {
                if (this.isDead) return;
                
                const targets = getEntitiesInRadius(targetX, targetY, ability.radius, 
                    [...gameState.heroes, ...gameState.minions], 
                    e => e.team !== this.team && !e.isDead
                );
                
                for (const target of targets) {
                    const damage = calculateDamage(this, target, damagePerTick, true, false);
                    target.takeDamage(damage, this);
                    gameState.effects.push(new HitEffect(target.x, target.y, damage));
                }
            }, i * 1000);
        }
        
        gameState.effects.push(new AbilityEffect(targetX, targetY, ability.radius, '#e74c3c', ability.duration * 1000));
    }

    zephyDash(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const dashX = this.x + Math.cos(angle) * ability.range;
        const dashY = this.y + Math.sin(angle) * ability.range;
        
        this.x = dashX;
        this.y = dashY;
        
        const targets = getEntitiesInRadius(this.x, this.y, 150, 
            [...gameState.heroes, ...gameState.minions], 
            e => e.team !== this.team && !e.isDead
        );
        
        for (const target of targets) {
            const damage = calculateDamage(this, target, ability.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
        }
        
        gameState.effects.push(new ParticleEffect(this.x, this.y, 15, '#e74c3c'));
    }

    zephyIronWall(gameState) {
        const ability = this.abilities.e;
        
        this.buffs.push({
            type: 'damageReduction',
            value: ability.damageReduction,
            duration: ability.duration * 1000
        });
        
        gameState.effects.push(new AuraEffect(this, 60, '#95a5a6', 1));
    }

    zephyGroundSlam(gameState) {
        const ability = this.abilities.r;
        
        const targets = getEntitiesInRadius(this.x, this.y, ability.radius, 
            [...gameState.heroes, ...gameState.minions], 
            e => e.team !== this.team && !e.isDead
        );
        
        for (const target of targets) {
            const damage = calculateDamage(this, target, ability.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
        }
        
        gameState.effects.push(new AbilityEffect(this.x, this.y, ability.radius, '#e67e22'));
    }

    zephyEarthquake(targetX, targetY, gameState) {
        const ability = this.abilities.t;
        
        const targets = getEntitiesInRadius(targetX, targetY, ability.radius, 
            [...gameState.heroes, ...gameState.minions], 
            e => e.team !== this.team && !e.isDead
        );
        
        for (const target of targets) {
            const damage = calculateDamage(this, target, ability.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
            
            if (target instanceof Hero) {
                target.isStunned = true;
                target.debuffs.push({
                    type: 'stun',
                    duration: ability.stunDuration * 1000
                });
                
                setTimeout(() => {
                    target.isStunned = false;
                }, ability.stunDuration * 1000);
            }
        }
        
        gameState.effects.push(new AbilityEffect(targetX, targetY, ability.radius, '#c0392b', 1000));
    }

    laloFireball(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        
        gameState.projectiles.push(
            new Projectile(this.x, this.y, targetX, targetY, ability.damage, 600, this, {
                color: '#e74c3c',
                aoe: ability.radius,
                size: 12
            })
        );
    }

    laloFrostNova(targetX, targetY, gameState) {
        const ability = this.abilities.e;
        
        const targets = getEntitiesInRadius(targetX, targetY, ability.radius, 
            [...gameState.heroes, ...gameState.minions], 
            e => e.team !== this.team && !e.isDead
        );
        
        for (const target of targets) {
            const damage = calculateDamage(this, target, ability.damage, false, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
            
            if (target.stats && target.stats.movementSpeed) {
                const originalSpeed = target.stats.movementSpeed;
                target.stats.movementSpeed *= (1 - ability.slowAmount);
                
                setTimeout(() => {
                    target.stats.movementSpeed = originalSpeed;
                }, ability.slowDuration * 1000);
            }
        }
        
        gameState.effects.push(new AbilityEffect(targetX, targetY, ability.radius, '#3498db'));
    }

    laloLightning(targetX, targetY, gameState) {
        const ability = this.abilities.r;
        
        const targets = getEntitiesInRadius(targetX, targetY, 100, 
            gameState.heroes.filter(h => h.team !== this.team && !h.isDead), 
            () => true
        );
        
        for (const target of targets) {
            const damage = calculateDamage(this, target, ability.damage, false, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
            gameState.effects.push(new AbilityEffect(target.x, target.y, 50, '#9b59b6', 300));
        }
    }

    laloMeteorStorm(targetX, targetY, gameState) {
        const ability = this.abilities.t;
        
        for (let i = 0; i < ability.duration; i++) {
            setTimeout(() => {
                if (this.isDead) return;
                
                const targets = getEntitiesInRadius(targetX, targetY, ability.radius, 
                    [...gameState.heroes, ...gameState.minions], 
                    e => e.team !== this.team && !e.isDead
                );
                
                for (const target of targets) {
                    const damage = calculateDamage(this, target, ability.damage / ability.duration, false, false);
                    target.takeDamage(damage, this);
                    gameState.effects.push(new HitEffect(target.x, target.y, damage));
                }
            }, i * 1000);
        }
        
        gameState.effects.push(new AbilityEffect(targetX, targetY, ability.radius, '#e74c3c', ability.duration * 1000));
    }

    nemoHeal(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const healX = this.x + Math.cos(angle) * ability.range;
        const healY = this.y + Math.sin(angle) * ability.range;
        
        const targets = getEntitiesInRadius(healX, healY, 100, 
            gameState.heroes.filter(h => h.team === this.team && !h.isDead), 
            () => true
        );
        
        for (const target of targets) {
            const healAmount = ability.healing * (1 + this.stats.abilityPower / 100);
            target.hp = Math.min(target.maxHp, target.hp + healAmount);
            gameState.effects.push(new AbilityEffect(target.x, target.y, 80, '#4ecca3'));
        }
    }

    nemoShield(targetX, targetY, gameState) {
        const ability = this.abilities.e;
        
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const shieldX = this.x + Math.cos(angle) * ability.range;
        const shieldY = this.y + Math.sin(angle) * ability.range;
        
        const targets = getEntitiesInRadius(shieldX, shieldY, 100, 
            gameState.heroes.filter(h => h.team === this.team && !h.isDead), 
            () => true
        );
        
        for (const target of targets) {
            const shieldAmount = ability.shieldAmount * (1 + this.stats.abilityPower / 100);
            target.buffs.push({
                type: 'shield',
                value: shieldAmount,
                duration: ability.duration * 1000
            });
            gameState.effects.push(new AuraEffect(target, 60, '#3498db', ability.duration));
        }
    }

    nemoInspire(targetX, targetY, gameState) {
        const ability = this.abilities.r;
        
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const inspireX = this.x + Math.cos(angle) * ability.range;
        const inspireY = this.y + Math.sin(angle) * ability.range;
        
        const targets = getEntitiesInRadius(inspireX, inspireY, ability.range, 
            gameState.heroes.filter(h => h.team === this.team && !h.isDead), 
            () => true
        );
        
        for (const target of targets) {
            const asBoost = ability.attackSpeedBoost;
            const msBoost = ability.movementSpeedBoost;
            
            target.stats.attackSpeed += asBoost;
            target.stats.movementSpeed += msBoost;
            
            setTimeout(() => {
                target.stats.attackSpeed -= asBoost;
                target.stats.movementSpeed -= msBoost;
            }, ability.duration * 1000);
            
            gameState.effects.push(new AuraEffect(target, 70, '#f39c12', ability.duration));
        }
    }

    nemoDivineIntervention(gameState) {
        const ability = this.abilities.t;
        
        const allies = gameState.heroes.filter(h => h.team === this.team && !h.isDead);
        
        for (const ally of allies) {
            const healAmount = ability.healing * (1 + this.stats.abilityPower / 100);
            ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
            
            const shieldAmount = ability.shieldAmount * (1 + this.stats.abilityPower / 100);
            ally.buffs.push({
                type: 'shield',
                value: shieldAmount,
                duration: 5000
            });
            
            gameState.effects.push(new AuraEffect(ally, 100, '#4ecca3', 2));
        }
        
        gameState.effects.push(new AbilityEffect(this.x, this.y, ability.radius, '#4ecca3', 500));
    }

    balametanyShadowDash(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        
        this.x += Math.cos(angle) * ability.range;
        this.y += Math.sin(angle) * ability.range;
        
        const targets = getEntitiesInRadius(this.x, this.y, 150, 
            [...gameState.heroes, ...gameState.minions], 
            e => e.team !== this.team && !e.isDead
        );
        
        for (const target of targets) {
            const damage = calculateDamage(this, target, ability.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
        }
        
        gameState.effects.push(new ParticleEffect(this.x, this.y, 10, '#8e44ad'));
    }

    balametanyStealth(gameState) {
        const ability = this.abilities.e;
        
        this.isInvisible = true;
        this.debuffs.push({
            type: 'invisible',
            duration: ability.duration * 1000
        });
        
        setTimeout(() => {
            this.isInvisible = false;
        }, ability.duration * 1000);
        
        gameState.effects.push(new AuraEffect(this, 50, 'rgba(142, 68, 173, 0.3)', ability.duration));
    }

    balametanyExecute(targetX, targetY, gameState) {
        const ability = this.abilities.r;
        
        const targets = getEntitiesInRadius(targetX, targetY, ability.range, 
            [...gameState.heroes, ...gameState.minions], 
            e => e.team !== this.team && !e.isDead
        );
        
        for (const target of targets) {
            let damage = ability.baseDamage;
            if (target.hp / target.maxHp < ability.executeThreshold) {
                damage += ability.executeDamage;
            }
            
            const actualDamage = calculateDamage(this, target, damage, true, false);
            target.takeDamage(actualDamage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }
        
        gameState.effects.push(new AbilityEffect(targetX, targetY, 100, '#8e44ad'));
    }

    balametanyDeathMark(targetX, targetY, gameState) {
        const ability = this.abilities.t;
        
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const teleportX = targetX - Math.cos(angle) * 100;
        const teleportY = targetY - Math.sin(angle) * 100;
        
        this.x = teleportX;
        this.y = teleportY;
        
        const targets = getEntitiesInRadius(targetX, targetY, 100, 
            gameState.heroes.filter(h => h.team !== this.team && !h.isDead), 
            () => true
        );
        
        for (const target of targets) {
            const damage = calculateDamage(this, target, ability.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
            
            setTimeout(() => {
                if (!target.isDead) {
                    const executeDamage = damage * ability.markMultiplier;
                    const finalDamage = calculateDamage(this, target, executeDamage, true, false);
                    target.takeDamage(finalDamage, this);
                    gameState.effects.push(new HitEffect(target.x, target.y, finalDamage));
                }
            }, ability.markDuration * 1000);
        }
        
        gameState.effects.push(new AbilityEffect(targetX, targetY, 200, '#8e44ad', ability.markDuration * 1000));
    }
}
