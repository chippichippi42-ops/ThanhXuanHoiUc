const CONFIG = {
    MAP_SIZE: 8000,
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,
    
    TEAM_BLUE: 0,
    TEAM_RED: 1,
    
    MAX_MOVEMENT_SPEED: 800,
    MAX_ATTACK_SPEED: 2.0,
    MAX_CDR: 0.4,
    
    VISION_RANGE: 800,
    BUSH_VISION_REDUCTION: 0.5,
    
    MINION_SPAWN_INTERVAL: 20000,
    MINIONS_PER_WAVE: 4,
    
    XP_PER_MINION: 15,
    XP_PER_HERO_KILL: 100,
    XP_PER_JUNGLE_CREEP: 30,
    XP_PER_TOWER: 50,
    XP_LAST_HIT_BONUS: 1.25,
    
    GOLD_PER_MINION: 15,
    GOLD_PER_HERO_BASE: 200,
    GOLD_PER_TOWER: 150,
    GOLD_PASSIVE_INTERVAL: 10000,
    GOLD_PASSIVE_AMOUNT: 10,
    GOLD_DEATH_PENALTY: 0.15,
    
    RESPAWN_BASE_TIME: 5000,
    RESPAWN_TIME_PER_LEVEL: 2000,
    RESPAWN_MAX_TIME: 50000,
    
    AI_UPDATE_INTERVAL: 1500,
    
    LANES: {
        TOP: 'top',
        MID: 'mid',
        BOT: 'bot'
    }
};

const HERO_DATA = {
    vanheo: {
        id: 'vanheo',
        name: 'Vanheo',
        role: 'Archer',
        emoji: '🏹',
        baseStats: {
            hp: 550,
            mana: 300,
            damage: 65,
            armor: 25,
            magicResist: 30,
            abilityPower: 0,
            attackSpeed: 0.7,
            movementSpeed: 340,
            attackRange: 500,
            critChance: 0.1,
            critDamage: 1.5,
            lifeSteal: 0,
            spellVamp: 0,
            hpRegen: 0.02,
            manaRegen: 0.03
        },
        growthStats: {
            hp: 85,
            mana: 40,
            damage: 3.5,
            armor: 3,
            magicResist: 1.5
        },
        abilities: {
            q: {
                name: 'Multi-Shot',
                manaCost: 50,
                cooldown: 8,
                damage: 80,
                shots: 3,
                range: 500,
                description: 'Fire 3 arrows in a cone'
            },
            w: {
                name: 'Swift Step',
                manaCost: 40,
                cooldown: 12,
                duration: 3,
                speedBoost: 1.5,
                description: 'Gain 50% movement speed'
            },
            e: {
                name: 'Piercing Arrow',
                manaCost: 60,
                cooldown: 10,
                damage: 120,
                range: 700,
                description: 'Arrow pierces through enemies'
            },
            r: {
                name: 'Rain of Arrows',
                manaCost: 100,
                cooldown: 80,
                damage: 250,
                radius: 400,
                duration: 3,
                description: 'AOE damage over time'
            }
        }
    },
    zephy: {
        id: 'zephy',
        name: 'Zephy',
        role: 'Fighter',
        emoji: '⚔️',
        baseStats: {
            hp: 650,
            mana: 250,
            damage: 60,
            armor: 45,
            magicResist: 35,
            abilityPower: 0,
            attackSpeed: 0.8,
            movementSpeed: 330,
            attackRange: 150,
            critChance: 0.05,
            critDamage: 1.5,
            lifeSteal: 0.05,
            spellVamp: 0,
            hpRegen: 0.03,
            manaRegen: 0.02
        },
        growthStats: {
            hp: 95,
            mana: 35,
            damage: 3,
            armor: 4,
            magicResist: 2
        },
        abilities: {
            q: {
                name: 'Dash Strike',
                manaCost: 45,
                cooldown: 10,
                damage: 90,
                range: 400,
                description: 'Dash forward and strike'
            },
            w: {
                name: 'Iron Wall',
                manaCost: 50,
                cooldown: 14,
                duration: 3,
                damageReduction: 0.4,
                description: 'Reduce incoming damage by 40%'
            },
            e: {
                name: 'Ground Slam',
                manaCost: 55,
                cooldown: 11,
                damage: 100,
                radius: 300,
                description: 'AOE slam around hero'
            },
            r: {
                name: 'Earthquake',
                manaCost: 100,
                cooldown: 90,
                damage: 200,
                radius: 500,
                stunDuration: 2,
                description: 'Massive AOE stun'
            }
        }
    },
    lalo: {
        id: 'lalo',
        name: 'LaLo',
        role: 'Mage',
        emoji: '🔮',
        baseStats: {
            hp: 480,
            mana: 400,
            damage: 50,
            armor: 20,
            magicResist: 30,
            abilityPower: 80,
            attackSpeed: 0.6,
            movementSpeed: 325,
            attackRange: 400,
            critChance: 0,
            critDamage: 1.5,
            lifeSteal: 0,
            spellVamp: 0.1,
            hpRegen: 0.015,
            manaRegen: 0.04
        },
        growthStats: {
            hp: 75,
            mana: 50,
            damage: 2.5,
            armor: 2.5,
            magicResist: 1.5,
            abilityPower: 8
        },
        abilities: {
            q: {
                name: 'Fireball',
                manaCost: 60,
                cooldown: 7,
                damage: 110,
                radius: 200,
                range: 600,
                description: 'Explosive fireball'
            },
            w: {
                name: 'Frost Nova',
                manaCost: 50,
                cooldown: 10,
                damage: 70,
                slowAmount: 0.5,
                slowDuration: 2,
                radius: 250,
                description: 'Freeze and slow enemies'
            },
            e: {
                name: 'Lightning Bolt',
                manaCost: 70,
                cooldown: 9,
                damage: 150,
                range: 700,
                description: 'Single target burst'
            },
            r: {
                name: 'Meteor Storm',
                manaCost: 120,
                cooldown: 100,
                damage: 300,
                radius: 600,
                duration: 4,
                description: 'Devastating AOE ultimate'
            }
        }
    },
    nemo: {
        id: 'nemo',
        name: 'Nemo',
        role: 'Support',
        emoji: '💚',
        baseStats: {
            hp: 520,
            mana: 350,
            damage: 45,
            armor: 30,
            magicResist: 35,
            abilityPower: 60,
            attackSpeed: 0.65,
            movementSpeed: 335,
            attackRange: 300,
            critChance: 0,
            critDamage: 1.5,
            lifeSteal: 0,
            spellVamp: 0.05,
            hpRegen: 0.025,
            manaRegen: 0.035
        },
        growthStats: {
            hp: 80,
            mana: 45,
            damage: 2,
            armor: 3.5,
            magicResist: 2.5,
            abilityPower: 5
        },
        abilities: {
            q: {
                name: 'Healing Touch',
                manaCost: 60,
                cooldown: 8,
                healing: 120,
                range: 500,
                description: 'Heal an ally'
            },
            w: {
                name: 'Protective Shield',
                manaCost: 55,
                cooldown: 12,
                shieldAmount: 150,
                duration: 3,
                range: 500,
                description: 'Shield an ally'
            },
            e: {
                name: 'Inspire',
                manaCost: 50,
                cooldown: 15,
                duration: 4,
                attackSpeedBoost: 0.5,
                movementSpeedBoost: 0.3,
                range: 500,
                description: 'Buff ally stats'
            },
            r: {
                name: 'Divine Intervention',
                manaCost: 100,
                cooldown: 85,
                healing: 250,
                shieldAmount: 200,
                radius: 600,
                description: 'Team heal and shield'
            }
        }
    },
    balametany: {
        id: 'balametany',
        name: 'Balametany',
        role: 'Assassin',
        emoji: '🗡️',
        baseStats: {
            hp: 490,
            mana: 280,
            damage: 75,
            armor: 22,
            magicResist: 28,
            abilityPower: 40,
            attackSpeed: 0.9,
            movementSpeed: 360,
            attackRange: 200,
            critChance: 0.2,
            critDamage: 2.0,
            lifeSteal: 0.1,
            spellVamp: 0,
            hpRegen: 0.02,
            manaRegen: 0.025
        },
        growthStats: {
            hp: 78,
            mana: 38,
            damage: 4,
            armor: 2.5,
            magicResist: 1.5,
            abilityPower: 3
        },
        abilities: {
            q: {
                name: 'Shadow Dash',
                manaCost: 40,
                cooldown: 7,
                damage: 70,
                range: 450,
                description: 'Quick dash with damage'
            },
            w: {
                name: 'Stealth',
                manaCost: 50,
                cooldown: 18,
                duration: 4,
                description: 'Become invisible'
            },
            e: {
                name: 'Execute',
                manaCost: 65,
                cooldown: 11,
                baseDamage: 100,
                executeDamage: 200,
                executeThreshold: 0.3,
                range: 250,
                description: 'Extra damage on low HP targets'
            },
            r: {
                name: 'Death Mark',
                manaCost: 100,
                cooldown: 75,
                damage: 220,
                range: 600,
                markDuration: 3,
                markMultiplier: 0.5,
                description: 'Teleport and mark enemy'
            }
        }
    }
};

const SUMMONER_SPELLS = {
    heal: {
        id: 'heal',
        name: 'Heal',
        cooldown: 45000,
        healPercent: 0.12,
        description: 'Restore 12% max HP'
    },
    flash: {
        id: 'flash',
        name: 'Flash',
        cooldown: 60000,
        range: 400,
        description: 'Teleport forward'
    },
    haste: {
        id: 'haste',
        name: 'Haste',
        cooldown: 40000,
        speed: 800,
        duration: 10000,
        description: 'Gain max speed for 10s'
    }
};

const MINION_DATA = {
    melee: {
        hp: 60,
        damage: 12,
        movementSpeed: 120,
        attackRange: 150,
        attackSpeed: 1.0,
        gold: 15,
        xp: 15,
        size: 20
    },
    ranged: {
        hp: 40,
        damage: 8,
        movementSpeed: 120,
        attackRange: 300,
        attackSpeed: 0.8,
        gold: 15,
        xp: 15,
        size: 18
    }
};

const JUNGLE_CREEP_DATA = {
    wraith: {
        type: 'wraith',
        hp: 30,
        damage: 6,
        movementSpeed: 100,
        attackRange: 150,
        gold: 30,
        xp: 25,
        size: 25,
        color: '#8e44ad'
    },
    golem: {
        type: 'golem',
        hp: 80,
        damage: 12,
        movementSpeed: 80,
        attackRange: 150,
        gold: 75,
        xp: 50,
        size: 35,
        color: '#7f8c8d'
    },
    krug: {
        type: 'krug',
        hp: 150,
        damage: 18,
        movementSpeed: 60,
        attackRange: 200,
        gold: 150,
        xp: 100,
        size: 45,
        color: '#e67e22'
    }
};

const TOWER_DATA = {
    nexus: {
        hp: 10000,
        damage: 1200,
        attackSpeed: 1.0,
        attackRange: 800,
        gold: 0,
        xp: 0,
        size: 60
    },
    mainTower: {
        hp: 9000,
        damage: 800,
        attackSpeed: 1.0,
        attackRange: 750,
        gold: 300,
        xp: 50,
        size: 50
    },
    innerTower: {
        hp: 7500,
        damage: 650,
        attackSpeed: 1.0,
        attackRange: 700,
        gold: 250,
        xp: 50,
        size: 45
    },
    outerTower: {
        hp: 6000,
        damage: 500,
        attackSpeed: 1.0,
        attackRange: 650,
        gold: 200,
        xp: 50,
        size: 40
    }
};

const TOWER_DAMAGE_STACK = {
    base: 1.0,
    perStack: 0.5,
    maxStacks: 4
};

const LEVEL_XP_REQUIREMENTS = [
    0, 100, 220, 360, 520, 700,
    900, 1120, 1360, 1620, 1900,
    2200, 2520, 2860, 3220, 3600,
    4000, 4420
];

const STAT_GROWTH_PER_LEVEL = {
    hpPercent: 0.05,
    manaPercent: 0.03,
    damagePercent: 0.02
};
