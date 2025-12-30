class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    update() {
        if (!this.gameState.playerHero || this.gameState.playerHero.isDead) return;
        
        this.updatePlayerStats();
        this.updateAbilityBar();
        this.updateGameTimer();
        this.updateTeamStatus();
    }

    updatePlayerStats() {
        const hero = this.gameState.playerHero;
        
        const heroIcon = document.getElementById('heroIcon');
        if (heroIcon) {
            heroIcon.textContent = hero.heroData.emoji;
        }
        
        const heroName = document.getElementById('heroName');
        if (heroName) {
            heroName.textContent = hero.name;
        }
        
        const heroLevel = document.getElementById('heroLevel');
        if (heroLevel) {
            heroLevel.textContent = `Level ${hero.level}`;
        }
        
        const xpProgress = document.getElementById('xpProgress');
        if (xpProgress) {
            const currentXP = hero.xp;
            const requiredXP = LEVEL_XP_REQUIREMENTS[hero.level] || 1;
            const previousXP = hero.level > 0 ? LEVEL_XP_REQUIREMENTS[hero.level - 1] : 0;
            const xpPercent = ((currentXP - previousXP) / (requiredXP - previousXP)) * 100;
            xpProgress.style.width = `${Math.min(100, xpPercent)}%`;
        }
        
        const hpFill = document.getElementById('hpFill');
        const hpText = document.getElementById('hpText');
        if (hpFill && hpText) {
            const hpPercent = (hero.hp / hero.maxHp) * 100;
            hpFill.style.width = `${hpPercent}%`;
            hpText.textContent = `${Math.floor(hero.hp)} / ${Math.floor(hero.maxHp)}`;
        }
        
        const manaFill = document.getElementById('manaFill');
        const manaText = document.getElementById('manaText');
        if (manaFill && manaText) {
            const manaPercent = (hero.mana / hero.maxMana) * 100;
            manaFill.style.width = `${manaPercent}%`;
            manaText.textContent = `${Math.floor(hero.mana)} / ${Math.floor(hero.maxMana)}`;
        }
        
        const goldCounter = document.querySelector('#goldCounter span');
        if (goldCounter) {
            goldCounter.textContent = Math.floor(hero.gold);
        }
        
        const kdaCounter = document.querySelector('#kdaCounter span');
        if (kdaCounter) {
            kdaCounter.textContent = `${hero.kills}/${hero.deaths}/${hero.assists}`;
        }
    }

    updateAbilityBar() {
        const hero = this.gameState.playerHero;
        const abilityKeys = ['q', 'e', 'r', 't', 'f', ' '];
        
        for (const key of abilityKeys) {
            const slot = document.querySelector(`.ability-slot[data-key="${key}"]`);
            if (!slot) continue;
            
            let ability = null;
            let isReady = false;
            let cooldownText = '';
            
            if (key === 'f') {
                ability = hero.summonerSpell;
                if (ability) {
                    isReady = ability.isReady;
                    if (!isReady) {
                        const cooldownSec = Math.ceil(ability.currentCooldown / 1000);
                        cooldownText = cooldownSec.toString();
                    }
                }
            } else if (key === ' ') {
                isReady = hero.canAttack();
                cooldownText = '';
            } else {
                ability = hero.abilities[key];
                if (ability) {
                    isReady = ability.isReady && ability.level > 0 && hero.mana >= ability.manaCost;
                    if (!ability.isReady) {
                        const cooldownSec = Math.ceil(ability.currentCooldown / 1000);
                        cooldownText = cooldownSec.toString();
                    } else if (hero.mana < ability.manaCost) {
                        cooldownText = 'OOM';
                    } else if (ability.level === 0) {
                        cooldownText = 'X';
                    }
                }
            }
            
            if (isReady && cooldownText === '') {
                slot.classList.add('ready');
                slot.classList.remove('on-cooldown');
            } else {
                slot.classList.remove('ready');
                slot.classList.add('on-cooldown');
            }
            
            const cooldownDiv = slot.querySelector('.ability-cooldown');
            if (cooldownDiv) {
                cooldownDiv.textContent = cooldownText;
            }
        }
    }

    updateGameTimer() {
        const timerElement = document.getElementById('gameTimer');
        if (timerElement) {
            timerElement.textContent = formatTime(this.gameState.elapsedTime);
        }
    }

    updateTeamStatus() {
        const allyPanel = document.getElementById('allyTeam');
        
        if (!allyPanel) return;
        
        const playerTeam = this.gameState.playerHero.team;
        const allies = this.gameState.heroes.filter(h => h.team === playerTeam);
        
        allyPanel.innerHTML = '';
        for (const ally of allies) {
            allyPanel.appendChild(this.createTeamMemberElement(ally));
        }
    }

    createTeamMemberElement(hero) {
        const div = document.createElement('div');
        div.className = 'team-member';
        
        const icon = document.createElement('div');
        icon.className = 'member-icon';
        icon.textContent = hero.heroData.emoji;
        
        const info = document.createElement('div');
        info.className = 'member-info';
        
        const name = document.createElement('div');
        name.className = 'member-name';
        name.textContent = `${hero.name} (${hero.level})`;
        
        const hpBar = document.createElement('div');
        hpBar.className = 'member-hp-bar';
        
        const hpFill = document.createElement('div');
        hpFill.className = 'member-hp-fill';
        const hpPercent = (hero.hp / hero.maxHp) * 100;
        hpFill.style.width = `${hpPercent}%`;
        
        hpBar.appendChild(hpFill);
        info.appendChild(name);
        info.appendChild(hpBar);
        
        div.appendChild(icon);
        div.appendChild(info);
        
        if (hero.isDead) {
            div.style.opacity = '0.5';
            const respawnTime = Math.ceil((hero.respawnTime - (Date.now() - hero.deathTime)) / 1000);
            if (respawnTime > 0) {
                name.textContent += ` (${respawnTime}s)`;
            }
        }
        
        return div;
    }

    isHeroVisible(hero) {
        const playerHero = this.gameState.playerHero;
        if (hero.team === playerHero.team) return true;
        
        const visionRange = CONFIG.VISION_RANGE;
        
        if (distance(hero.x, hero.y, playerHero.x, playerHero.y) < visionRange) {
            return true;
        }
        
        for (const ally of this.gameState.heroes) {
            if (ally.team === playerHero.team && !ally.isDead) {
                if (distance(hero.x, hero.y, ally.x, ally.y) < visionRange) {
                    return true;
                }
            }
        }
        
        return false;
    }

    showStatsWindow() {
        const statsScreen = document.getElementById('statsScreen');
        const statsContent = document.getElementById('statsContent');
        
        if (!statsScreen || !statsContent) return;
        
        const hero = this.gameState.playerHero;
        
        let html = '';
        html += this.createStatRow('Health', `${Math.floor(hero.hp)} / ${Math.floor(hero.maxHp)}`);
        html += this.createStatRow('Mana', `${Math.floor(hero.mana)} / ${Math.floor(hero.maxMana)}`);
        html += this.createStatRow('Damage', Math.floor(hero.stats.damage));
        html += this.createStatRow('Ability Power', Math.floor(hero.stats.abilityPower));
        html += this.createStatRow('Armor', Math.floor(hero.stats.armor));
        html += this.createStatRow('Magic Resist', Math.floor(hero.stats.magicResist));
        html += this.createStatRow('Attack Speed', hero.stats.attackSpeed.toFixed(2));
        html += this.createStatRow('Movement Speed', Math.floor(hero.stats.movementSpeed));
        html += this.createStatRow('Attack Range', Math.floor(hero.stats.attackRange));
        html += this.createStatRow('Crit Chance', `${(hero.stats.critChance * 100).toFixed(1)}%`);
        html += this.createStatRow('Crit Damage', `${(hero.stats.critDamage * 100).toFixed(0)}%`);
        html += this.createStatRow('Life Steal', `${(hero.stats.lifeSteal * 100).toFixed(1)}%`);
        html += this.createStatRow('Spell Vamp', `${(hero.stats.spellVamp * 100).toFixed(1)}%`);
        html += this.createStatRow('HP Regen', `${(hero.stats.hpRegen * 100).toFixed(2)}%/s`);
        html += this.createStatRow('Mana Regen', `${(hero.stats.manaRegen * 100).toFixed(2)}%/s`);
        
        statsContent.innerHTML = html;
        statsScreen.classList.add('active');
    }

    hideStatsWindow() {
        const statsScreen = document.getElementById('statsScreen');
        if (statsScreen) {
            statsScreen.classList.remove('active');
        }
    }

    createStatRow(label, value) {
        return `
            <div class="stat-row">
                <span class="stat-label">${label}:</span>
                <span class="stat-value">${value}</span>
            </div>
        `;
    }
}
