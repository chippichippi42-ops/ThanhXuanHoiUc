const Zephy = {
    id: 'zephy',
    name: 'Zephy',
    role: 'Fighter',
    emoji: '⚔️',
    description: 'Tanky fighter with crowd control abilities',
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
    normalAttack: {
        damage: 60,
        range: 150,
        speed: 0.8,
        effects: ['melee']
    },
    skills: [
        {
            key: 'q',
            name: 'Dash Strike',
            manaCost: 45,
            cooldown: 10,
            damage: 90,
            range: 400,
            impactRadius: 150,
            directionDependent: true,
            description: 'Dash forward and strike enemies in path'
        },
        {
            key: 'e',
            name: 'Iron Wall',
            manaCost: 50,
            cooldown: 14,
            duration: 3,
            damageReduction: 0.4,
            directionDependent: false,
            description: 'Reduce incoming damage by 40%'
        },
        {
            key: 'r',
            name: 'Ground Slam',
            manaCost: 55,
            cooldown: 11,
            damage: 100,
            radius: 300,
            directionDependent: false,
            description: 'AOE slam around hero'
        },
        {
            key: 't',
            name: 'Earthquake',
            manaCost: 100,
            cooldown: 90,
            damage: 200,
            radius: 500,
            stunDuration: 2,
            directionDependent: false,
            description: 'Massive AOE stun'
        }
    ]
};

window.Zephy = Zephy;
