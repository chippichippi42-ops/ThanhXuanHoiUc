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

const LEVEL_XP_REQUIREMENTS = [0, 100, 280, 560, 960, 1500, 2200, 3200, 4400, 6000, 7800, 10000, 12500, 15500, 19000, 23000, 27500, 32500, 38000];
