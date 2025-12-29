export const Lalo = {
    id: 'lalo',
    name: 'LaLo',
    role: 'Mage',
    emoji: '🔮',
    description: 'Powerful mage with area damage spells',
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
    normalAttack: {
        damage: 50,
        range: 400,
        speed: 0.6,
        effects: ['ranged', 'magic']
    },
    skills: [
        {
            key: 'q',
            name: 'Fireball',
            manaCost: 60,
            cooldown: 7,
            damage: 110,
            range: 600,
            aoeRadius: 200,
            directionDependent: true,
            description: 'Explosive fireball that damages area'
        },
        {
            key: 'e',
            name: 'Frost Nova',
            manaCost: 50,
            cooldown: 10,
            damage: 70,
            radius: 250,
            slowAmount: 0.5,
            slowDuration: 2,
            directionDependent: false,
            description: 'Freeze and slow enemies in area'
        },
        {
            key: 'r',
            name: 'Lightning Bolt',
            manaCost: 70,
            cooldown: 9,
            damage: 150,
            range: 700,
            directionDependent: true,
            description: 'Single target burst damage'
        },
        {
            key: 't',
            name: 'Meteor Storm',
            manaCost: 120,
            cooldown: 100,
            damage: 300,
            radius: 600,
            duration: 4,
            ticks: 4,
            directionDependent: false,
            description: 'Devastating AOE ultimate'
        }
    ]
};

window.Lalo = Lalo;
