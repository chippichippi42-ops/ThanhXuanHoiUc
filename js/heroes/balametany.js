const Balametany = {
    id: 'balametany',
    name: 'Balametany',
    role: 'Assassin',
    emoji: '🗡️',
    description: 'Stealthy assassin with high burst damage',
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
    normalAttack: {
        damage: 75,
        range: 200,
        speed: 0.9,
        effects: ['melee', 'crit']
    },
    skills: [
        {
            key: 'q',
            name: 'Shadow Dash',
            manaCost: 40,
            cooldown: 7,
            damage: 70,
            range: 450,
            impactRadius: 150,
            directionDependent: true,
            description: 'Quick dash with damage'
        },
        {
            key: 'e',
            name: 'Stealth',
            manaCost: 50,
            cooldown: 18,
            duration: 4,
            directionDependent: false,
            description: 'Become invisible for a short time'
        },
        {
            key: 'r',
            name: 'Execute',
            manaCost: 65,
            cooldown: 11,
            baseDamage: 100,
            executeDamage: 200,
            executeThreshold: 0.3,
            range: 250,
            directionDependent: true,
            description: 'Extra damage on low HP targets'
        },
        {
            key: 't',
            name: 'Death Mark',
            manaCost: 100,
            cooldown: 75,
            damage: 220,
            range: 600,
            markDuration: 3,
            markMultiplier: 0.5,
            directionDependent: true,
            description: 'Teleport and mark enemy, burst after delay'
        }
    ]
};

window.Balametany = Balametany;
