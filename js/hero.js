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
    constructor(x, y, team, heroId, isPlayer = false) {
        super(x, y, team);

        const allHeroes = (typeof HEROES !== 'undefined' && HEROES) ? HEROES : {};
        const heroData = allHeroes[heroId] || allHeroes.vanheo || null;

        this.heroData = heroData || {
            id: 'unknown',
            name: 'Unknown',
            role: 'Unknown',
            emoji: '❓',
            baseStats: { ...DEFAULT_HERO_BASE_STATS },
            growthStats: {},
            normalAttack: { damage: 55, range: 150, speed: 0.7, effects: [] },
            skills: []
        };

        this.heroId = this.heroData.id || 'unknown';
        this.name = this.heroData.name || 'Unknown';
        this.role = this.heroData.role || 'Unknown';
        this.emoji = this.heroData.emoji || '❓';
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
        this.baseStats = { ...this.stats };
        this.growthStats = this.heroData.growthStats || {};

        this.maxHp = this.stats.hp || DEFAULT_HERO_BASE_STATS.hp;
        this.hp = this.maxHp;
        this.maxMana = this.stats.mana || 0;
        this.mana = this.maxMana;
        this.size = 25;

        this.normalAttack = this.heroData.normalAttack || { damage: 55, range: 150, speed: 0.7, effects: [] };
        this.skills = this.createSkills();

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

        this.skillCastCallback = null;
        this.setSkillCastCallback();
    }

    setSkillCastCallback() {
        const heroId = this.heroId;
        const callbacks = {
            vanheo: (ability, targetX, targetY, gameState) => this.vanheoSkills(ability, targetX, targetY, gameState),
            zephy: (ability, targetX, targetY, gameState) => this.zephySkills(ability, targetX, targetY, gameState),
            lalo: (ability, targetX, targetY, gameState) => this.laloSkills(ability, targetX, targetY, gameState),
            nemo: (ability, targetX, targetY, gameState) => this.nemoSkills(ability, targetX, targetY, gameState),
            balametany: (ability, targetX, targetY, gameState) => this.balametanySkills(ability, targetX, targetY, gameState)
        };
        this.skillCastCallback = callbacks[heroId] || ((ability, targetX, targetY, gameState) => {});
    }

    createSkills() {
        const skills = {};

        const heroSkills = this.heroData.skills && Array.isArray(this.heroData.skills)
            ? this.heroData.skills
            : [];

        for (const skillData of heroSkills) {
            if (!skillData || typeof skillData !== 'object') continue;

            skills[skillData.key] = {
                ...skillData,
                currentCooldown: 0,
                isReady: true,
                level: skillData.key === 'r' ? 0 : 1
            };
        }

        return skills;
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

        this.updateFacingDirection(gameState);
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
            }
        }
    }

    updateFacingDirection(gameState) {
        if (!gameState || !gameState.playerHero) return;

        if (this === gameState.playerHero && gameState.inputManager) {
            const mouseX = gameState.inputManager.mouseWorldX || 0;
            const mouseY = gameState.inputManager.mouseWorldY || 0;
            this.facingDirection = Math.atan2(mouseY - this.y, mouseX - this.x);
        } else if (this.vx !== 0 || this.vy !== 0) {
            this.facingDirection = Math.atan2(this.vy, this.vx);
        }
    }

    updateCooldowns(deltaTime) {
        for (const skill of Object.values(this.skills)) {
            if (skill.currentCooldown > 0) {
                skill.currentCooldown -= deltaTime * 1000;
                skill.isReady = skill.currentCooldown <= 0;
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

    getSkillDirection(targetX, targetY, directionDependent) {
        if (directionDependent && this.facingDirection !== undefined) {
            return this.facingDirection;
        }
        return Math.atan2(targetY - this.y, targetX - this.x);
    }

    castAbility(skillKey, targetX, targetY, gameState) {
        const skill = this.skills[skillKey];

        if (!skill) return false;
        if (!skill.isReady) return false;
        if (skill.level === 0) return false;
        if (this.mana < skill.manaCost) return false;
        if (this.isStunned) return false;

        this.mana -= skill.manaCost;

        const cdr = Math.min(CONFIG.MAX_CDR, 0);
        skill.currentCooldown = skill.cooldown * 1000 * (1 - cdr);
        skill.isReady = false;

        this.skillCastCallback(skill, targetX, targetY, gameState);

        return true;
    }

    vanheoSkills(skill, targetX, targetY, gameState) {
        const direction = this.getSkillDirection(targetX, targetY, skill.directionDependent);

        switch (skill.key) {
            case 'q':
                this.vanheoMultiShot(skill, direction, gameState);
                break;
            case 'e':
                this.vanheoSwiftStep(skill, gameState);
                break;
            case 'r':
                this.vanheoPiercingArrow(skill, direction, gameState);
                break;
            case 't':
                this.vanheoRainOfArrows(skill, targetX, targetY, gameState);
                break;
        }
    }

    zephySkills(skill, targetX, targetY, gameState) {
        const direction = this.getSkillDirection(targetX, targetY, skill.directionDependent);

        switch (skill.key) {
            case 'q':
                this.zephyDash(skill, direction, gameState);
                break;
            case 'e':
                this.zephyIronWall(skill, gameState);
                break;
            case 'r':
                this.zephyGroundSlam(skill, gameState);
                break;
            case 't':
                this.zephyEarthquake(skill, targetX, targetY, gameState);
                break;
        }
    }

    laloSkills(skill, targetX, targetY, gameState) {
        const direction = this.getSkillDirection(targetX, targetY, skill.directionDependent);

        switch (skill.key) {
            case 'q':
                this.laloFireball(skill, direction, gameState);
                break;
            case 'e':
                this.laloFrostNova(skill, targetX, targetY, gameState);
                break;
            case 'r':
                this.laloLightning(skill, targetX, targetY, gameState);
                break;
            case 't':
                this.laloMeteorStorm(skill, targetX, targetY, gameState);
                break;
        }
    }

    nemoSkills(skill, targetX, targetY, gameState) {
        switch (skill.key) {
            case 'q':
                this.nemoHeal(skill, targetX, targetY, gameState);
                break;
            case 'e':
                this.nemoShield(skill, targetX, targetY, gameState);
                break;
            case 'r':
                this.nemoInspire(skill, targetX, targetY, gameState);
                break;
            case 't':
                this.nemoDivineIntervention(skill, gameState);
                break;
        }
    }

    balametanySkills(skill, targetX, targetY, gameState) {
        const direction = this.getSkillDirection(targetX, targetY, skill.directionDependent);

        switch (skill.key) {
            case 'q':
                this.balametanyShadowDash(skill, direction, gameState);
                break;
            case 'e':
                this.balametanyStealth(skill, gameState);
                break;
            case 'r':
                this.balametanyExecute(skill, targetX, targetY, gameState);
                break;
            case 't':
                this.balametanyDeathMark(skill, direction, gameState);
                break;
        }
    }

    vanheoMultiShot(skill, direction, gameState) {
        const spread = skill.spreadAngle || Math.PI / 6;
        const shots = skill.shots || 3;

        for (let i = 0; i < shots; i++) {
            const shotAngle = direction + (i - Math.floor(shots / 2)) * spread / 2;
            const tx = this.x + Math.cos(shotAngle) * skill.range;
            const ty = this.y + Math.sin(shotAngle) * skill.range;

            gameState.projectiles.push(
                new Projectile(this.x, this.y, tx, ty, skill.damage, 800, this, {
                    color: '#f39c12'
                })
            );
        }

        gameState.effects.push(new AbilityEffect(this.x, this.y, 100, '#f39c12'));
    }

    vanheoSwiftStep(skill, gameState) {
        this.buffs.push({
            type: 'movementSpeed',
            value: skill.speedBoost,
            duration: skill.duration * 1000
        });

        const originalSpeed = this.stats.movementSpeed;
        this.stats.movementSpeed *= skill.speedBoost;

        setTimeout(() => {
            this.stats.movementSpeed = originalSpeed;
        }, skill.duration * 1000);

        gameState.effects.push(new AuraEffect(this, 50, '#4ecca3'));
    }

    vanheoPiercingArrow(skill, direction, gameState) {
        const targetX = this.x + Math.cos(direction) * skill.range;
        const targetY = this.y + Math.sin(direction) * skill.range;

        gameState.projectiles.push(
            new Projectile(this.x, this.y, targetX, targetY, skill.damage, 1000, this, {
                color: '#9b59b6',
                piercing: true,
                maxDistance: skill.range
            })
        );

        gameState.effects.push(new AbilityEffect(this.x, this.y, 80, '#9b59b6'));
    }

    vanheoRainOfArrows(skill, targetX, targetY, gameState) {
        const damagePerTick = skill.damage / skill.ticks;

        for (let i = 0; i < skill.ticks; i++) {
            setTimeout(() => {
                if (this.isDead) return;

                const targets = getEntitiesInRadius(targetX, targetY, skill.radius,
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

        gameState.effects.push(new AbilityEffect(targetX, targetY, skill.radius, '#e74c3c', skill.duration * 1000));
    }

    zephyDash(skill, direction, gameState) {
        const dashX = this.x + Math.cos(direction) * skill.range;
        const dashY = this.y + Math.sin(direction) * skill.range;

        this.x = dashX;
        this.y = dashY;

        const targets = getEntitiesInRadius(this.x, this.y, skill.impactRadius || 150,
            [...gameState.heroes, ...gameState.minions],
            e => e.team !== this.team && !e.isDead
        );

        for (const target of targets) {
            const damage = calculateDamage(this, target, skill.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
        }

        gameState.effects.push(new ParticleEffect(this.x, this.y, 15, '#e74c3c'));
    }

    zephyIronWall(skill, gameState) {
        this.buffs.push({
            type: 'damageReduction',
            value: skill.damageReduction,
            duration: skill.duration * 1000
        });

        gameState.effects.push(new AuraEffect(this, 60, '#95a5a6', 1));
    }

    zephyGroundSlam(skill, gameState) {
        const targets = getEntitiesInRadius(this.x, this.y, skill.radius,
            [...gameState.heroes, ...gameState.minions],
            e => e.team !== this.team && !e.isDead
        );

        for (const target of targets) {
            const damage = calculateDamage(this, target, skill.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
        }

        gameState.effects.push(new AbilityEffect(this.x, this.y, skill.radius, '#e67e22'));
    }

    zephyEarthquake(skill, targetX, targetY, gameState) {
        const targets = getEntitiesInRadius(targetX, targetY, skill.radius,
            [...gameState.heroes, ...gameState.minions],
            e => e.team !== this.team && !e.isDead
        );

        for (const target of targets) {
            const damage = calculateDamage(this, target, skill.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));

            if (target instanceof Hero) {
                target.isStunned = true;
                target.debuffs.push({
                    type: 'stun',
                    duration: skill.stunDuration * 1000
                });

                setTimeout(() => {
                    target.isStunned = false;
                }, skill.stunDuration * 1000);
            }
        }

        gameState.effects.push(new AbilityEffect(targetX, targetY, skill.radius, '#c0392b', 1000));
    }

    laloFireball(skill, direction, gameState) {
        const targetX = this.x + Math.cos(direction) * skill.range;
        const targetY = this.y + Math.sin(direction) * skill.range;

        gameState.projectiles.push(
            new Projectile(this.x, this.y, targetX, targetY, skill.damage, 600, this, {
                color: '#e74c3c',
                aoe: skill.aoeRadius,
                size: 12
            })
        );
    }

    laloFrostNova(skill, targetX, targetY, gameState) {
        const targets = getEntitiesInRadius(targetX, targetY, skill.radius,
            [...gameState.heroes, ...gameState.minions],
            e => e.team !== this.team && !e.isDead
        );

        for (const target of targets) {
            const damage = calculateDamage(this, target, skill.damage, false, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));

            if (target.stats && target.stats.movementSpeed) {
                const originalSpeed = target.stats.movementSpeed;
                target.stats.movementSpeed *= (1 - skill.slowAmount);

                setTimeout(() => {
                    target.stats.movementSpeed = originalSpeed;
                }, skill.slowDuration * 1000);
            }
        }

        gameState.effects.push(new AbilityEffect(targetX, targetY, skill.radius, '#3498db'));
    }

    laloLightning(skill, targetX, targetY, gameState) {
        const targets = getEntitiesInRadius(targetX, targetY, 100,
            gameState.heroes.filter(h => h.team !== this.team && !h.isDead),
            () => true
        );

        for (const target of targets) {
            const damage = calculateDamage(this, target, skill.damage, false, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
            gameState.effects.push(new AbilityEffect(target.x, target.y, 50, '#9b59b6', 300));
        }
    }

    laloMeteorStorm(skill, targetX, targetY, gameState) {
        for (let i = 0; i < skill.ticks; i++) {
            setTimeout(() => {
                if (this.isDead) return;

                const targets = getEntitiesInRadius(targetX, targetY, skill.radius,
                    [...gameState.heroes, ...gameState.minions],
                    e => e.team !== this.team && !e.isDead
                );

                for (const target of targets) {
                    const damage = calculateDamage(this, target, skill.damage / skill.ticks, false, false);
                    target.takeDamage(damage, this);
                    gameState.effects.push(new HitEffect(target.x, target.y, damage));
                }
            }, i * 1000);
        }

        gameState.effects.push(new AbilityEffect(targetX, targetY, skill.radius, '#e74c3c', skill.duration * 1000));
    }

    nemoHeal(skill, targetX, targetY, gameState) {
        const direction = Math.atan2(targetY - this.y, targetX - this.x);
        const healX = this.x + Math.cos(direction) * skill.range;
        const healY = this.y + Math.sin(direction) * skill.range;

        const targets = getEntitiesInRadius(healX, healY, skill.healRadius || 100,
            gameState.heroes.filter(h => h.team === this.team && !h.isDead),
            () => true
        );

        for (const target of targets) {
            const healAmount = skill.healing * (1 + this.stats.abilityPower / 100);
            target.hp = Math.min(target.maxHp, target.hp + healAmount);
            gameState.effects.push(new AbilityEffect(target.x, target.y, 80, '#4ecca3'));
        }
    }

    nemoShield(skill, targetX, targetY, gameState) {
        const direction = Math.atan2(targetY - this.y, targetX - this.x);
        const shieldX = this.x + Math.cos(direction) * skill.range;
        const shieldY = this.y + Math.sin(direction) * skill.range;

        const targets = getEntitiesInRadius(shieldX, shieldY, skill.shieldRadius || 100,
            gameState.heroes.filter(h => h.team === this.team && !h.isDead),
            () => true
        );

        for (const target of targets) {
            const shieldAmount = skill.shieldAmount * (1 + this.stats.abilityPower / 100);
            target.buffs.push({
                type: 'shield',
                value: shieldAmount,
                duration: skill.duration * 1000
            });
            gameState.effects.push(new AuraEffect(target, 60, '#3498db', skill.duration));
        }
    }

    nemoInspire(skill, targetX, targetY, gameState) {
        const direction = Math.atan2(targetY - this.y, targetX - this.x);
        const inspireX = this.x + Math.cos(direction) * skill.range;
        const inspireY = this.y + Math.sin(direction) * skill.range;

        const targets = getEntitiesInRadius(inspireX, inspireY, skill.range,
            gameState.heroes.filter(h => h.team === this.team && !h.isDead),
            () => true
        );

        for (const target of targets) {
            const asBoost = skill.attackSpeedBoost;
            const msBoost = skill.movementSpeedBoost;

            target.stats.attackSpeed += asBoost;
            target.stats.movementSpeed += msBoost;

            setTimeout(() => {
                target.stats.attackSpeed -= asBoost;
                target.stats.movementSpeed -= msBoost;
            }, skill.duration * 1000);

            gameState.effects.push(new AuraEffect(target, 70, '#f39c12', skill.duration));
        }
    }

    nemoDivineIntervention(skill, gameState) {
        const allies = gameState.heroes.filter(h => h.team === this.team && !h.isDead);

        for (const ally of allies) {
            const healAmount = skill.healing * (1 + this.stats.abilityPower / 100);
            ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);

            const shieldAmount = skill.shieldAmount * (1 + this.stats.abilityPower / 100);
            ally.buffs.push({
                type: 'shield',
                value: shieldAmount,
                duration: 5000
            });

            gameState.effects.push(new AuraEffect(ally, 100, '#4ecca3', 2));
        }

        gameState.effects.push(new AbilityEffect(this.x, this.y, skill.radius, '#4ecca3', 500));
    }

    balametanyShadowDash(skill, direction, gameState) {
        this.x += Math.cos(direction) * skill.range;
        this.y += Math.sin(direction) * skill.range;

        const targets = getEntitiesInRadius(this.x, this.y, skill.impactRadius || 150,
            [...gameState.heroes, ...gameState.minions],
            e => e.team !== this.team && !e.isDead
        );

        for (const target of targets) {
            const damage = calculateDamage(this, target, skill.damage, true, false);
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));
        }

        gameState.effects.push(new ParticleEffect(this.x, this.y, 10, '#8e44ad'));
    }

    balametanyStealth(skill, gameState) {
        this.isInvisible = true;
        this.debuffs.push({
            type: 'invisible',
            duration: skill.duration * 1000
        });

        setTimeout(() => {
            this.isInvisible = false;
        }, skill.duration * 1000);

        gameState.effects.push(new AuraEffect(this, 50, 'rgba(142, 68, 173, 0.3)', skill.duration));
    }

    balametanyExecute(skill, targetX, targetY, gameState) {
        const targets = getEntitiesInRadius(targetX, targetY, skill.range,
            [...gameState.heroes, ...gameState.minions],
            e => e.team !== this.team && !e.isDead
        );

        for (const target of targets) {
            let damage = skill.baseDamage;
            if (target.hp / target.maxHp < skill.executeThreshold) {
                damage += skill.executeDamage;
            }

            const actualDamage = calculateDamage(this, target, damage, true, false);
            target.takeDamage(actualDamage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, actualDamage));
        }

        gameState.effects.push(new AbilityEffect(targetX, targetY, 100, '#8e44ad'));
    }

    balametanyDeathMark(skill, direction, gameState) {
        const targetX = this.x + Math.cos(direction) * skill.range;
        const targetY = this.y + Math.sin(direction) * skill.range;

        this.x = targetX;
        this.y = targetY;

        const targets = getEntitiesInRadius(targetX, targetY, 100,
            gameState.heroes.filter(h => h.team !== this.team && !h.isDead),
            () => true
        );

        for (const target of targets) {
            const damage = skill.damage;
            target.takeDamage(damage, this);
            gameState.effects.push(new HitEffect(target.x, target.y, damage));

            setTimeout(() => {
                if (!target.isDead) {
                    const executeDamage = damage * skill.markMultiplier;
                    const finalDamage = calculateDamage(this, target, executeDamage, true, false);
                    target.takeDamage(finalDamage, this);
                    gameState.effects.push(new HitEffect(target.x, target.y, finalDamage));
                }
            }, skill.markDuration * 1000);
        }

        gameState.effects.push(new AbilityEffect(targetX, targetY, 200, '#8e44ad', skill.markDuration * 1000));
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

    useSummonerSpell(targetX, targetY, gameState) {
        if (!this.summonerSpell || !this.summonerSpell.isReady) return;
        if (this.isStunned) return;

        this.summonerSpell.currentCooldown = this.summonerSpell.cooldown;
        this.summonerSpell.isReady = false;

        switch (this.summonerSpell.id) {
            case 'heal':
                const healPercent = this.summonerSpell.healPercent;
                this.hp = Math.min(this.maxHp, this.hp + this.maxHp * healPercent);
                gameState.effects.push(new AbilityEffect(this.x, this.y, 50, '#4ecca3'));
                break;
            case 'flash':
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const flashRange = Math.min(this.summonerSpell.range, dist);

                if (dist > 0) {
                    const newX = this.x + (dx / dist) * flashRange;
                    const newY = this.y + (dy / dist) * flashRange;

                    if (!gameState.map.isCollidingWithWall(newX, newY, this.size)) {
                        this.x = newX;
                        this.y = newY;
                    }
                }
                gameState.effects.push(new ParticleEffect(this.x, this.y, 10, '#f39c12'));
                break;
            case 'haste':
                this.buffs.push({
                    type: 'movementSpeed',
                    value: 1,
                    duration: this.summonerSpell.duration,
                    customSpeed: this.summonerSpell.speed
                });
                gameState.effects.push(new AuraEffect(this, 50, '#f39c12', 2));
                break;
        }
    }

    gainXp(amount) {
        this.xp += amount;
        const xpToLevel = this.getXpForNextLevel();
        while (this.xp >= xpToLevel) {
            this.xp -= xpToLevel;
            this.levelUp();
        }
    }

    getXpForNextLevel() {
        return 100 + (this.level - 1) * 50;
    }

    levelUp() {
        this.level++;
        this.respawnTime = Math.min(
            CONFIG.RESPAWN_BASE_TIME + (this.level - 1) * CONFIG.RESPAWN_TIME_PER_LEVEL,
            CONFIG.RESPAWN_MAX_TIME
        );

        if (this.growthStats) {
            if (this.growthStats.hp) this.maxHp += this.growthStats.hp;
            if (this.growthStats.mana) this.maxMana += this.growthStats.mana;
            if (this.growthStats.damage) this.stats.damage += this.growthStats.damage;
            if (this.growthStats.armor) this.stats.armor += this.growthStats.armor;
            if (this.growthStats.magicResist) this.stats.magicResist += this.growthStats.magicResist;
        }

        this.hp = this.maxHp;
        this.mana = this.maxMana;
    }

    gainGold(amount) {
        this.gold += amount;
    }

    respawn(gameState) {
        const spawnPoints = gameState.map.spawnPoints;
        const spawn = this.team === CONFIG.TEAM_BLUE ? spawnPoints[CONFIG.TEAM_BLUE] : spawnPoints[CONFIG.TEAM_RED];

        this.x = spawn.x;
        this.y = spawn.y;
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        this.isDead = false;
        this.deathTime = 0;

        gameState.effects.push(new AbilityEffect(this.x, this.y, 100, '#4ecca3', 500));
    }

    draw(ctx, camera) {
        if (this.isDead) return;
        if (!camera.isVisible(this.x, this.y, this.size)) return;

        const screenX = camera.xToScreen(this.x);
        const screenY = camera.yToScreen(this.y);

        ctx.save();
        ctx.translate(screenX, screenY);

        if (this.isInvisible) {
            ctx.globalAlpha = 0.4;
        }

        const teamColor = this.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560';
        ctx.fillStyle = teamColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.facingDirection !== undefined) {
            ctx.rotate(this.facingDirection);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.lineTo(this.size - 10, -5);
            ctx.lineTo(this.size - 10, 5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji || '', screenX, screenY - this.size - 25);

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(this.name, screenX, screenY - this.size - 40);

        this.drawHealthBar(ctx, camera);
    }

    drawHealthBar(ctx, camera) {
        const screenX = camera.xToScreen(this.x);
        const screenY = camera.yToScreen(this.y);

        const barWidth = this.size * 2;
        const barHeight = 6;
        const x = screenX - barWidth / 2;
        const y = screenY - this.size - 15;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);

        const hpPercent = this.hp / this.maxHp;
        const hpColor = hpPercent > 0.5 ? '#4ecca3' : hpPercent > 0.25 ? '#f39c12' : '#e94560';

        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, barWidth * hpPercent, barHeight);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}

export { Hero };
export { Hero as default };
