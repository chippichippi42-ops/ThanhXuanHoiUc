export const Nemo = {
    id: 'nemo',
    name: 'Nemo',
    role: 'Support',
    emoji: '💚',
    description: 'Healer and support with buffs and shields',
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
    normalAttack: {
        damage: 45,
        range: 300,
        speed: 0.65,
        effects: ['ranged']
    },
    skills: [
        {
            key: 'q',
            name: 'Healing Touch',
            manaCost: 60,
            cooldown: 8,
            healing: 120,
            range: 500,
            healRadius: 100,
            directionDependent: false,
            description: 'Heal an ally hero'
        },
        {
            key: 'e',
            name: 'Protective Shield',
            manaCost: 55,
            cooldown: 12,
            shieldAmount: 150,
            duration: 3,
            range: 500,
            shieldRadius: 100,
            directionDependent: false,
            description: 'Shield an ally hero'
        },
        {
            key: 'r',
            name: 'Inspire',
            manaCost: 50,
            cooldown: 15,
            duration: 4,
            attackSpeedBoost: 0.5,
            movementSpeedBoost: 0.3,
            range: 500,
            directionDependent: false,
            description: 'Buff ally attack and movement speed'
        },
        {
            key: 't',
            name: 'Divine Intervention',
            manaCost: 100,
            cooldown: 85,
            healing: 250,
            shieldAmount: 200,
            radius: 600,
            duration: 5,
            directionDependent: false,
            description: 'Team-wide heal and shield'
        }
    ]
};

window.Nemo = Nemo;
