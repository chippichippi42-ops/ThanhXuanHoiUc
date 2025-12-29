# MOBA 3v3 Arena

A fully functional MOBA-style web game built with vanilla JavaScript, HTML5 Canvas, and CSS3. Play as 1 hero with 2 AI allies against 3 AI enemies in an epic arena battle!

## Features

- **5 Unique Heroes** with distinct abilities and playstyles
  - **Vanheo** (Archer): High-range physical damage dealer
  - **Zephy** (Fighter): Tanky melee warrior
  - **LaLo** (Mage): Powerful magic damage dealer
  - **Nemo** (Support): Healer and buffer
  - **Balametany** (Assassin): High burst damage and mobility

- **Complete MOBA Mechanics**
  - WASD movement with smooth controls
  - 4 unique abilities per hero (Q, W, E, R)
  - Summoner spells (Heal, Flash, Haste)
  - Leveling system (1-18)
  - Gold and XP progression
  - Items and stats

- **Strategic Gameplay**
  - 3-lane map (Top, Mid, Bot)
  - Towers and Nexus (main base)
  - Minion waves spawning every 20 seconds
  - Jungle creatures for extra gold/XP
  - Vision system with fog of war
  - Bush hiding mechanics

- **Smart AI System**
  - Two-layer AI (Reactive + Tactical)
  - 3 difficulty levels (Easy, Normal, Hard)
  - Strategic decision-making
  - Team coordination

- **Full UI/UX**
  - Hero selection screen
  - In-game HUD with HP/Mana bars
  - Minimap with team positions
  - Ability cooldown indicators
  - Detailed stats window (P key)
  - Pause menu (ESC key)
  - Game over screen with match statistics

## How to Play

### Installation

1. Download or clone this repository
2. Extract all files to a folder
3. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)

No server or installation required! The game runs entirely offline in your browser.

### Game Controls

**Movement:**
- `W` - Move Up
- `A` - Move Left
- `S` - Move Down
- `D` - Move Right

**Abilities:**
- `Q` - First Ability
- `W` - Second Ability
- `E` - Third Ability
- `R` - Ultimate Ability (unlocks at Level 6)
- `T` - Summoner Spell

**Interface:**
- `ESC` - Pause Game
- `P` - Open Stats Window
- `Mouse` - Aim abilities

### Getting Started

1. **Main Menu**: Click "PLAY" to start
2. **Hero Selection**: Choose your hero from 5 available options
3. **Summoner Spell**: Select Heal, Flash, or Haste
4. **AI Difficulty**: Adjust enemy and ally AI difficulty sliders
5. **Start Game**: Click "START GAME" to begin

### Win Condition

Destroy the enemy team's Nexus (main base) to win! Defend your own Nexus from enemy attacks.

### Tips for Success

1. **Farm Minions**: Kill enemy minions for gold and XP
2. **Level Up**: Gain levels to unlock stronger abilities
3. **Watch Your HP**: Retreat when low on health
4. **Use Abilities Wisely**: Manage your mana carefully
5. **Destroy Towers**: Take down enemy towers to push forward
6. **Team Play**: Stay near your AI allies for team fights
7. **Jungle Camps**: Kill jungle creatures for extra resources
8. **Map Awareness**: Check the minimap for enemy positions

## Hero Guide

### Vanheo (Archer)
- **Role**: Physical Damage Dealer
- **Range**: Long (500px)
- **Playstyle**: Stay at max range and deal consistent damage
- **Q**: Multi-Shot - Fire 3 arrows in a cone
- **W**: Swift Step - Gain movement speed boost
- **E**: Piercing Arrow - Arrow pierces through enemies
- **R**: Rain of Arrows - Massive AOE damage over time

### Zephy (Fighter)
- **Role**: Tank/Frontline
- **Range**: Melee (150px)
- **Playstyle**: Engage fights and absorb damage for your team
- **Q**: Dash Strike - Dash forward and deal damage
- **W**: Iron Wall - Reduce incoming damage by 40%
- **E**: Ground Slam - AOE damage around you
- **R**: Earthquake - Large AOE with stun effect

### LaLo (Mage)
- **Role**: Magic Damage Dealer
- **Range**: Medium (400px)
- **Playstyle**: Cast powerful spells from a safe distance
- **Q**: Fireball - Explosive AOE projectile
- **W**: Frost Nova - Freeze and slow enemies
- **E**: Lightning Bolt - High single-target damage
- **R**: Meteor Storm - Devastating ultimate with multiple impacts

### Nemo (Support)
- **Role**: Healer/Buffer
- **Range**: Medium (300px)
- **Playstyle**: Support your team with heals and buffs
- **Q**: Healing Touch - Heal an ally
- **W**: Protective Shield - Grant shield to ally
- **E**: Inspire - Buff attack speed and movement speed
- **R**: Divine Intervention - Team heal and shield

### Balametany (Assassin)
- **Role**: High Burst Damage
- **Range**: Short (200px)
- **Playstyle**: Eliminate low-HP targets quickly
- **Q**: Shadow Dash - Quick dash with damage
- **W**: Stealth - Become invisible
- **E**: Execute - Extra damage on low HP enemies
- **R**: Death Mark - Teleport and burst damage

## Game Mechanics

### Leveling
- Start at Level 1, max Level 18
- Gain XP from killing minions, heroes, and jungle creatures
- Each level increases your stats
- Ultimate ability (R) unlocks at Level 6

### Combat
- Auto-attacks occur automatically when near enemies
- Abilities have cooldowns and mana costs
- Damage is reduced by Armor (physical) and Magic Resist (magical)
- Critical strikes deal extra damage
- Life Steal and Spell Vamp heal you based on damage dealt

### Towers
- Towers automatically attack enemies in range
- Tower damage stacks with each hit (up to 4 stacks)
- Destroying towers grants gold and XP to your team
- Nexus is the main objective - destroy it to win!

### Vision
- You can only see areas near allies, minions, and towers
- Enemies in bushes are hidden unless you're very close
- Use the minimap to track visible enemies

## Technical Details

- **Technology**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **No frameworks or libraries required**
- **Fully offline compatible**
- **Responsive design** (works on desktop and mobile)
- **Performance target**: 60 FPS on mid-range devices

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Edge 80+
- Safari 13+

## Credits

Created as a complete MOBA game implementation showcasing:
- Game architecture and design patterns
- Canvas 2D rendering
- AI systems (reactive and tactical)
- Combat and ability systems
- UI/UX design

## License

This project is open source and available for educational purposes.

## Troubleshooting

**Game not loading?**
- Make sure you're opening `index.html` directly in a browser
- Check browser console (F12) for any errors
- Try a different modern browser

**Low FPS?**
- Close other browser tabs
- Lower browser zoom level
- Try a different browser (Chrome recommended)

**Controls not working?**
- Click on the game canvas to focus it
- Make sure no other inputs are focused

## Version

**v1.0.0** - Complete MOBA 3v3 Game

---

**Enjoy the game! Good luck on the battlefield!** 🎮⚔️
