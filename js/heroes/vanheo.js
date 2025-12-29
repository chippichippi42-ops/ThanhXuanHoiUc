const VanHeo = {
    id: 'vanheo',
    name: 'Vanheo',
    role: 'Archer',
    emoji: '🏹',
    description: 'Ranged damage dealer with multi-shot abilities',
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
    normalAttack: {
        damage: 65,
        range: 500,
        speed: 0.7,
        effects: ['ranged']
    },
    skills: [
        {
            key: 'q',
            name: 'Multi-Shot',
            manaCost: 50,
            cooldown: 8,
            damage: 80,
            shots: 3,
            range: 500,
            spreadAngle: Math.PI / 6,
            directionDependent: true,
            description: 'Fire 3 arrows in a cone'
        },
        {
            key: 'e',
            name: 'Swift Step',
            manaCost: 40,
            cooldown: 12,
            duration: 3,
            speedBoost: 1.5,
            directionDependent: false,
            description: 'Gain 50% movement speed'
        },
        {
            key: 'r',
            name: 'Piercing Arrow',
            manaCost: 60,
            cooldown: 10,
            damage: 120,
            range: 700,
            piercing: true,
            directionDependent: true,
            description: 'Arrow pierces through enemies'
        },
        {
            key: 't',
            name: 'Rain of Arrows',
            manaCost: 100,
            cooldown: 80,
            damage: 250,
            radius: 400,
            duration: 3,
            ticks: 3,
            directionDependent: false,
            description: 'AOE damage over time'
        }
    ]
};

window.VanHeo = VanHeo;
