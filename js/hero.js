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
                this.vanheMultiShot(targetX, targetY, gameState);
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

    ability_w(targetX, targetY, gameState) {
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

    ability_e(targetX, targetY, gameState) {
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

    ability_r(targetX, targetY, gameState) {
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
        const ability = this.abilities.w;
        
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
        const ability = this.abilities.e;
        
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
        const ability = this.abilities.r;
        
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
        const ability = this.abilities.w;
        
        this.buffs.push({
            type: 'damageReduction',
            value: ability.damageReduction,
            duration: ability.duration * 1000
        });
        
        gameState.effects.push(new AuraEffect(this, 60, '#95a5a6', 1));
    }

    zephyGroundSlam(gameState) {
        const ability = this.abilities.e;
        
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
        const ability = this.abilities.r;
        
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
        const ability = this.abilities.w;
        
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
        const ability = this.abilities.e;
        
        const target = getClosestEntity(
            { x: targetX, y: targetY }, 
            [...gameState.heroes, ...gameState.minions],
            ability.range,
            e => e.team !== this.team && !e.isDead
        );
        
        if (target) {
            const damage = calculateDamage(this, target, ability.damage, false, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
            gameState.effects.push(new AbilityEffect(target.x, target.y, 100, '#f1c40f', 300));
        }
    }

    laloMeteorStorm(targetX, targetY, gameState) {
        const ability = this.abilities.r;
        
        const impacts = 8;
        for (let i = 0; i < impacts; i++) {
            setTimeout(() => {
                if (this.isDead) return;
                
                const impactX = targetX + randomRange(-ability.radius, ability.radius);
                const impactY = targetY + randomRange(-ability.radius, ability.radius);
                
                const targets = getEntitiesInRadius(impactX, impactY, 150, 
                    [...gameState.heroes, ...gameState.minions], 
                    e => e.team !== this.team && !e.isDead
                );
                
                for (const target of targets) {
                    const damage = calculateDamage(this, target, ability.damage / impacts, false, false);
                    target.takeDamage(damage, this);
                    gameState.effects.push(new HitEffect(target.x, target.y, damage));
                }
                
                gameState.effects.push(new AbilityEffect(impactX, impactY, 150, '#e74c3c', 500));
                gameState.effects.push(new ParticleEffect(impactX, impactY, 8, '#e74c3c'));
            }, i * (ability.duration * 1000 / impacts));
        }
    }

    nemoHeal(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        
        const target = getClosestEntity(
            { x: targetX, y: targetY }, 
            gameState.heroes,
            ability.range,
            e => e.team === this.team && !e.isDead
        );
        
        if (target) {
            const healAmount = ability.healing * (1 + this.stats.abilityPower / 100);
            target.heal(healAmount);
            gameState.effects.push(new AbilityEffect(target.x, target.y, 80, '#2ecc71'));
        }
    }

    nemoShield(targetX, targetY, gameState) {
        const ability = this.abilities.w;
        
        const target = getClosestEntity(
            { x: targetX, y: targetY }, 
            gameState.heroes,
            ability.range,
            e => e.team === this.team && !e.isDead
        );
        
        if (target) {
            const shieldAmount = ability.shieldAmount * (1 + this.stats.abilityPower / 100);
            target.maxHp += shieldAmount;
            target.hp += shieldAmount;
            
            setTimeout(() => {
                target.maxHp -= shieldAmount;
                target.hp = Math.min(target.hp, target.maxHp);
            }, ability.duration * 1000);
            
            gameState.effects.push(new AuraEffect(target, 60, '#3498db'));
        }
    }

    nemoInspire(targetX, targetY, gameState) {
        const ability = this.abilities.e;
        
        const target = getClosestEntity(
            { x: targetX, y: targetY }, 
            gameState.heroes,
            ability.range,
            e => e.team === this.team && !e.isDead
        );
        
        if (target && target.stats) {
            const originalAS = target.stats.attackSpeed;
            const originalMS = target.stats.movementSpeed;
            
            target.stats.attackSpeed *= (1 + ability.attackSpeedBoost);
            target.stats.movementSpeed *= (1 + ability.movementSpeedBoost);
            
            setTimeout(() => {
                target.stats.attackSpeed = originalAS;
                target.stats.movementSpeed = originalMS;
            }, ability.duration * 1000);
            
            gameState.effects.push(new AuraEffect(target, 70, '#f39c12'));
        }
    }

    nemoDivineIntervention(gameState) {
        const ability = this.abilities.r;
        
        const allies = getEntitiesInRadius(this.x, this.y, ability.radius, 
            gameState.heroes, 
            e => e.team === this.team && !e.isDead
        );
        
        for (const ally of allies) {
            const healAmount = ability.healing * (1 + this.stats.abilityPower / 100);
            const shieldAmount = ability.shieldAmount * (1 + this.stats.abilityPower / 100);
            
            ally.heal(healAmount);
            ally.maxHp += shieldAmount;
            ally.hp += shieldAmount;
            
            setTimeout(() => {
                ally.maxHp -= shieldAmount;
                ally.hp = Math.min(ally.hp, ally.maxHp);
            }, 5000);
            
            gameState.effects.push(new AbilityEffect(ally.x, ally.y, 100, '#2ecc71'));
        }
    }

    balametanyShadowDash(targetX, targetY, gameState) {
        const ability = this.abilities.q;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const dashX = this.x + Math.cos(angle) * ability.range;
        const dashY = this.y + Math.sin(angle) * ability.range;
        
        this.x = dashX;
        this.y = dashY;
        
        const target = getClosestEntity(this, [...gameState.heroes, ...gameState.minions], 200, 
            e => e.team !== this.team && !e.isDead
        );
        
        if (target) {
            const damage = calculateDamage(this, target, ability.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
        }
        
        gameState.effects.push(new ParticleEffect(this.x, this.y, 12, '#9b59b6'));
    }

    balametanyStealth(gameState) {
        const ability = this.abilities.w;
        
        this.isInvisible = true;
        
        setTimeout(() => {
            this.isInvisible = false;
        }, ability.duration * 1000);
        
        gameState.effects.push(new AbilityEffect(this.x, this.y, 80, '#9b59b6'));
    }

    balametanyExecute(targetX, targetY, gameState) {
        const ability = this.abilities.e;
        
        const target = getClosestEntity(
            { x: targetX, y: targetY }, 
            [...gameState.heroes, ...gameState.minions],
            ability.range,
            e => e.team !== this.team && !e.isDead
        );
        
        if (target) {
            const hpPercent = target.hp / target.maxHp;
            const damage = hpPercent < ability.executeThreshold ? ability.executeDamage : ability.baseDamage;
            
            const actualDamage = calculateDamage(this, target, damage, true, shouldCrit(this.stats.critChance));
            target.takeDamage(actualDamage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }
    }

    balametanyDeathMark(targetX, targetY, gameState) {
        const ability = this.abilities.r;
        
        const target = getClosestEntity(
            { x: targetX, y: targetY }, 
            gameState.heroes,
            ability.range,
            e => e.team !== this.team && !e.isDead
        );
        
        if (target) {
            this.x = target.x + randomRange(-100, 100);
            this.y = target.y + randomRange(-100, 100);
            
            const damage = calculateDamage(this, target, ability.damage, true, true);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
            
            gameState.effects.push(new ParticleEffect(target.x, target.y, 20, '#9b59b6'));
            gameState.effects.push(new AuraEffect(target, 100, '#9b59b6'));
        }
    }

    useSummonerSpell(targetX, targetY, gameState) {
        if (!this.summonerSpell) return false;
        if (!this.summonerSpell.isReady) return false;
        if (this.isStunned) return false;
        
        this.summonerSpell.currentCooldown = this.summonerSpell.cooldown;
        this.summonerSpell.isReady = false;
        
        switch (this.summonerSpell.id) {
            case 'heal':
                const healAmount = this.maxHp * this.summonerSpell.healPercent;
                this.heal(healAmount);
                gameState.effects.push(new AbilityEffect(this.x, this.y, 80, '#2ecc71'));
                break;
                
            case 'flash':
                const angle = Math.atan2(targetY - this.y, targetX - this.x);
                const flashX = this.x + Math.cos(angle) * this.summonerSpell.range;
                const flashY = this.y + Math.sin(angle) * this.summonerSpell.range;
                
                if (!gameState.map.isCollidingWithWall(flashX, flashY, this.size)) {
                    this.x = flashX;
                    this.y = flashY;
                }
                
                gameState.effects.push(new ParticleEffect(this.x, this.y, 15, '#f1c40f'));
                break;
                
            case 'haste':
                const originalSpeed = this.stats.movementSpeed;
                this.stats.movementSpeed = this.summonerSpell.speed;
                
                setTimeout(() => {
                    this.stats.movementSpeed = originalSpeed;
                }, this.summonerSpell.duration);
                
                gameState.effects.push(new AuraEffect(this, 60, '#3498db'));
                break;
        }
        
        return true;
    }

    gainXP(amount, gameState) {
        if (this.level >= 18) return;
        
        this.xp += amount;
        
        while (this.level < 18 && this.xp >= LEVEL_XP_REQUIREMENTS[this.level]) {
            this.levelUp(gameState);
        }
    }

    levelUp(gameState) {
        this.level++;

        const growth = this.heroData?.growthStats && typeof this.heroData.growthStats === 'object'
            ? this.heroData.growthStats
            : {};

        this.stats.hp += growth.hp || 0;
        this.stats.mana += growth.mana || 0;
        this.stats.damage += growth.damage || 0;
        this.stats.armor += growth.armor || 0;
        this.stats.magicResist += growth.magicResist || 0;

        if (growth.abilityPower) {
            this.stats.abilityPower += growth.abilityPower;
        }

        this.maxHp = this.stats.hp * (1 + (this.level - 1) * STAT_GROWTH_PER_LEVEL.hpPercent);
        this.hp = this.maxHp;
        this.maxMana = this.stats.mana * (1 + (this.level - 1) * STAT_GROWTH_PER_LEVEL.manaPercent);
        this.mana = this.maxMana;

        if ((this.level === 6 || this.level === 11 || this.level === 16) && this.abilities?.r) {
            this.abilities.r.level++;
        }

        if (gameState.effects) {
            gameState.effects.push(new AbilityEffect(this.x, this.y, 150, '#f1c40f', 1000));
        }
    }

    gainGold(amount) {
        this.gold += amount;
    }

    takeDamage(amount, attacker) {
        if (this.isDead) return;
        
        const reducedDamage = amount * (1 - this.damageReduction);
        
        super.takeDamage(reducedDamage, attacker);
        
        if (attacker && attacker.id) {
            this.lastDamageDealtTo.set(attacker.id, {
                time: Date.now(),
                damage: reducedDamage
            });
        }
    }

    die(killer) {
        this.isDead = true;
        this.deaths++;
        
        const baseRespawnTime = CONFIG.RESPAWN_BASE_TIME;
        const levelRespawnTime = this.level * CONFIG.RESPAWN_TIME_PER_LEVEL;
        this.respawnTime = Math.min(baseRespawnTime + levelRespawnTime, CONFIG.RESPAWN_MAX_TIME);
        this.deathTime = Date.now();
        
        const goldLost = Math.floor(this.gold * CONFIG.GOLD_DEATH_PENALTY);
        this.gold -= goldLost;
        
        if (killer && killer instanceof Hero) {
            killer.kills++;
            const goldReward = CONFIG.GOLD_PER_HERO_BASE + this.level * 10;
            killer.gainGold(goldReward);
            killer.gainXP(CONFIG.XP_PER_HERO_KILL, killer);
            
            for (const [attackerId, data] of this.lastDamageDealtTo.entries()) {
                if (Date.now() - data.time < 10000 && attackerId !== killer.id) {
                    const assister = killer;
                    if (assister) {
                        assister.assists++;
                        assister.gainGold(Math.floor(goldReward * 0.5));
                    }
                }
            }
        }
    }

    respawn(gameState) {
        this.isDead = false;
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        this.respawnTime = 0;
        
        const spawnPoint = gameState.map.spawnPoints[this.team];
        this.x = spawnPoint.x;
        this.y = spawnPoint.y;
        
        this.buffs = [];
        this.debuffs = [];
        this.isStunned = false;
        this.isInvisible = false;
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.size)) return;
        
        if (this.isInvisible && !this.isPlayer) {
            ctx.globalAlpha = 0.3;
        }
        
        const emoji = this.heroData?.emoji || '❓';
        ctx.font = `${this.size * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, this.x, this.y);
        
        if (this.isInvisible && !this.isPlayer) {
            ctx.globalAlpha = 1;
        }
        
        this.drawHealthBar(ctx);
        this.drawManaBar(ctx);
        
        ctx.fillStyle = this.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - this.size - 35);
        
        if (this.isStunned) {
            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('STUNNED', this.x, this.y + this.size + 25);
        }
    }

    drawManaBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size - 25;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        const manaPercent = this.maxMana > 0 ? this.mana / this.maxMana : 0;
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x, y, barWidth * manaPercent, barHeight);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}
