class ScreenManager {
    constructor() {
        this.currentScreen = 'startScreen';
        this.screenBeforeSettings = this.currentScreen;
        this.selectedHero = null;
        this.selectedSummonerSpell = 'heal';
        this.enemyDifficulty = 2;
        this.allyDifficulty = 2;

        this.setupEventListeners();
        this.populateHeroSelection();
    }

    setupEventListeners() {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.showScreen('preGameScreen'));
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        const exitBtn = document.getElementById('exitBtn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                alert('Thanks for playing!');
            });
        }

        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame());
        }

        const backToMenuBtn = document.getElementById('backToMenuBtn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => this.showScreen('startScreen'));
        }

        const pauseButton = document.getElementById('pauseButton');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => this.pauseGame());
        }

        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.resumeGame());
        }

        const pauseSettingsBtn = document.getElementById('pauseSettingsBtn');
        if (pauseSettingsBtn) {
            pauseSettingsBtn.addEventListener('click', () => this.openSettings());
        }

        const quitToLobbyBtn = document.getElementById('quitToLobbyBtn');
        if (quitToLobbyBtn) {
            quitToLobbyBtn.addEventListener('click', () => {
                this.resumeGame();
                this.showScreen('startScreen');
            });
        }

        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
        
        const applySettingsBtn = document.getElementById('applySettingsBtn');
        if (applySettingsBtn) {
            applySettingsBtn.addEventListener('click', () => this.applySettings());
        }
        
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
        
        const closeStatsBtn = document.getElementById('closeStatsBtn');
        if (closeStatsBtn) {
            closeStatsBtn.addEventListener('click', () => {
                document.getElementById('statsScreen').classList.remove('active');
            });
        }
        
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.showScreen('preGameScreen');
            });
        }
        
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                this.showScreen('startScreen');
            });
        }
        
        this.setupDifficultySliders();
        this.setupSettingsSliders();
    }

    setupDifficultySliders() {
        const enemyDifficulty = document.getElementById('enemyDifficulty');
        const enemyDifficultyLabel = document.getElementById('enemyDifficultyLabel');
        
        if (enemyDifficulty) {
            enemyDifficulty.addEventListener('input', (e) => {
                this.enemyDifficulty = parseInt(e.target.value);
                const labels = ['Easy', 'Normal', 'Hard'];
                if (enemyDifficultyLabel) {
                    enemyDifficultyLabel.textContent = labels[this.enemyDifficulty - 1];
                }
            });
        }
        
        const allyDifficulty = document.getElementById('allyDifficulty');
        const allyDifficultyLabel = document.getElementById('allyDifficultyLabel');
        
        if (allyDifficulty) {
            allyDifficulty.addEventListener('input', (e) => {
                this.allyDifficulty = parseInt(e.target.value);
                const labels = ['Easy', 'Normal', 'Hard'];
                if (allyDifficultyLabel) {
                    allyDifficultyLabel.textContent = labels[this.allyDifficulty - 1];
                }
            });
        }
    }

    setupSettingsSliders() {
        const sliders = [
            { id: 'masterVolume', labelId: 'masterVolumeLabel' },
            { id: 'sfxVolume', labelId: 'sfxVolumeLabel' },
            { id: 'cameraSmoothing', labelId: 'cameraSmoothingLabel' }
        ];
        
        for (const slider of sliders) {
            const element = document.getElementById(slider.id);
            const label = document.getElementById(slider.labelId);
            
            if (element && label) {
                element.addEventListener('input', (e) => {
                    label.textContent = `${e.target.value}%`;
                });
            }
        }
    }

    populateHeroSelection() {
        const heroSelection = document.getElementById('heroSelection');
        if (!heroSelection) return;
        
        heroSelection.innerHTML = '';
        
        for (const heroData of Object.values(HERO_DATA)) {
            const card = document.createElement('div');
            card.className = 'hero-card';
            card.dataset.heroId = heroData.id;
            
            const portrait = document.createElement('div');
            portrait.className = 'hero-portrait';
            portrait.textContent = heroData.emoji;
            
            const name = document.createElement('div');
            name.className = 'hero-name';
            name.textContent = heroData.name;
            
            const role = document.createElement('div');
            role.className = 'hero-role';
            role.textContent = heroData.role;
            
            const abilities = document.createElement('div');
            abilities.className = 'hero-abilities';
            abilities.textContent = `Q: ${heroData.abilities.q.name}\nW: ${heroData.abilities.w.name}\nE: ${heroData.abilities.e.name}\nR: ${heroData.abilities.r.name}`;
            
            card.appendChild(portrait);
            card.appendChild(name);
            card.appendChild(role);
            card.appendChild(abilities);
            
            card.addEventListener('click', () => this.selectHero(heroData.id));
            
            heroSelection.appendChild(card);
        }
        
        const summonerCards = document.querySelectorAll('.summoner-card');
        summonerCards.forEach(card => {
            card.addEventListener('click', () => {
                summonerCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedSummonerSpell = card.dataset.spell;
            });
        });
        
        document.querySelector('.summoner-card[data-spell="heal"]')?.classList.add('selected');
    }

    selectHero(heroId) {
        this.selectedHero = heroId;

        const cards = document.querySelectorAll('.hero-card');
        cards.forEach(card => {
            if (card.dataset.heroId === heroId) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    openSettings() {
        if (this.currentScreen !== 'settingsScreen') {
            this.screenBeforeSettings = this.currentScreen;
        }
        this.showScreen('settingsScreen');
    }

    closeSettings() {
        const returnScreen = this.screenBeforeSettings || 'startScreen';
        this.showScreen(returnScreen);
    }

    toggleSettings() {
        if (this.currentScreen === 'settingsScreen') {
            this.closeSettings();
        } else {
            this.openSettings();
        }
    }

    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    startGame() {
        if (!this.selectedHero) {
            alert('Please select a hero!');
            return;
        }
        
        this.showScreen('gameScreen');
        
        if (window.game) {
            window.game.initialize({
                playerHeroId: this.selectedHero,
                summonerSpell: this.selectedSummonerSpell,
                enemyDifficulty: this.enemyDifficulty,
                allyDifficulty: this.allyDifficulty
            });
            window.game.start();
        }
    }

    pauseGame() {
        if (window.game) {
            window.game.pause();
            this.showScreen('pauseScreen');
        }
    }

    resumeGame() {
        if (window.game) {
            window.game.resume();
            this.showScreen('gameScreen');
        }
    }

    applySettings() {
        const cameraSmoothing = document.getElementById('cameraSmoothing');
        
        if (cameraSmoothing && window.game && window.game.camera) {
            window.game.camera.setSmoothness(parseInt(cameraSmoothing.value) / 100);
        }
        
        alert('Settings applied!');
    }

    resetSettings() {
        document.getElementById('masterVolume').value = 70;
        document.getElementById('sfxVolume').value = 70;
        document.getElementById('cameraSmoothing').value = 80;
        document.getElementById('muteAll').checked = false;
        document.getElementById('autoAttack').checked = true;
        document.getElementById('showGrid').checked = false;
        
        document.getElementById('masterVolumeLabel').textContent = '70%';
        document.getElementById('sfxVolumeLabel').textContent = '70%';
        document.getElementById('cameraSmoothingLabel').textContent = '80%';
    }

    showGameOver(winner, matchStats) {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameResult = document.getElementById('gameResult');
        const statsTable = document.getElementById('statsTable');
        const matchInfo = document.getElementById('matchInfo');
        
        if (!gameOverScreen || !gameResult) return;
        
        const playerTeam = window.game.gameState.playerHero.team;
        const isVictory = winner === playerTeam;
        
        gameResult.textContent = isVictory ? 'VICTORY!' : 'DEFEAT';
        gameResult.className = isVictory ? 'victory' : 'defeat';
        
        let tableHTML = '<div class="stats-table-row">';
        tableHTML += '<span>Hero</span><span>K</span><span>D</span><span>A</span><span>Gold</span><span>Level</span>';
        tableHTML += '</div>';
        
        for (const hero of matchStats.heroes) {
            const teamClass = hero.team === playerTeam ? 'ally' : 'enemy';
            tableHTML += `<div class="stats-table-row ${teamClass}">`;
            tableHTML += `<span>${hero.name}</span>`;
            tableHTML += `<span>${hero.kills}</span>`;
            tableHTML += `<span>${hero.deaths}</span>`;
            tableHTML += `<span>${hero.assists}</span>`;
            tableHTML += `<span>${Math.floor(hero.gold)}</span>`;
            tableHTML += `<span>${hero.level}</span>`;
            tableHTML += '</div>';
        }
        
        if (statsTable) {
            statsTable.innerHTML = tableHTML;
        }
        
        if (matchInfo) {
            matchInfo.innerHTML = `
                <div>Duration: ${formatTime(matchStats.duration)}</div>
                <div>Your Team Nexus: ${Math.floor(matchStats.allyNexusHp)} HP</div>
                <div>Enemy Team Nexus: ${Math.floor(matchStats.enemyNexusHp)} HP</div>
            `;
        }
        
        this.showScreen('gameOverScreen');
    }
}
