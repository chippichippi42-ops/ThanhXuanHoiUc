class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimap');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.gameState = {
            map: null,
            heroes: [],
            minions: [],
            creatures: [],
            towers: [],
            projectiles: [],
            effects: [],
            playerHero: null,
            elapsedTime: 0,
            gameStartTime: 0,
            isPaused: false,
            isGameOver: false,
            winner: null
        };
        
        this.camera = null;
        this.minimap = null;
        this.inputManager = null;
        this.uiManager = null;
        this.combatSystem = null;
        
        this.lastFrameTime = 0;
        this.minionSpawnTimer = 0;
        this.goldPassiveTimer = 0;
        
        this.aiControllers = [];
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.camera) {
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
        }
    }

    initialize(config) {
        this.gameState.map = new GameMap(CONFIG.MAP_SIZE);
        this.camera = new Camera(this.canvas.width, this.canvas.height, CONFIG.MAP_SIZE, CONFIG.MAP_SIZE);
        this.camera.setSmoothness(0.1);
        
        this.minimap = new Minimap(this.minimapCanvas, CONFIG.MAP_SIZE);
        this.inputManager = new InputManager();
        this.uiManager = new UIManager(this.gameState);
        this.combatSystem = new CombatSystem(this.gameState);
        this.gameState.combatSystem = this.combatSystem;
        
        this.gameState.heroes = [];
        this.gameState.minions = [];
        this.gameState.creatures = [];
        this.gameState.towers = [];
        this.gameState.projectiles = [];
        this.gameState.effects = [];
        this.aiControllers = [];
        
        this.createHeroes(config);
        this.createTowers();
        this.createJungleCreatures();
        
        this.gameState.gameStartTime = Date.now();
        this.gameState.elapsedTime = 0;
        this.gameState.isPaused = false;
        this.gameState.isGameOver = false;
        this.gameState.winner = null;
        
        this.minionSpawnTimer = 0;
        this.goldPassiveTimer = 0;
    }

    createHeroes(config) {
        const availableHeroes = Object.keys(HERO_DATA);
        const playerHeroId = config.playerHeroId;
        
        const blueSpawn = this.gameState.map.spawnPoints[CONFIG.TEAM_BLUE];
        const redSpawn = this.gameState.map.spawnPoints[CONFIG.TEAM_RED];
        
        const playerHero = new Hero(
            blueSpawn.x,
            blueSpawn.y,
            CONFIG.TEAM_BLUE,
            HERO_DATA[playerHeroId],
            true
        );
        playerHero.setSummonerSpell(config.summonerSpell);
        this.gameState.heroes.push(playerHero);
        this.gameState.playerHero = playerHero;
        this.camera.follow(playerHero);
        
        const usedHeroes = new Set([playerHeroId]);
        
        for (let i = 0; i < 2; i++) {
            const availableForAlly = availableHeroes.filter(h => !usedHeroes.has(h));
            const heroId = randomChoice(availableForAlly);
            usedHeroes.add(heroId);
            
            const offsetX = (i - 0.5) * 100;
            const offsetY = (i - 0.5) * 100;
            
            const ally = new Hero(
                blueSpawn.x + offsetX,
                blueSpawn.y + offsetY,
                CONFIG.TEAM_BLUE,
                HERO_DATA[heroId],
                false
            );
            ally.setSummonerSpell(randomChoice(['heal', 'flash', 'haste']));
            this.gameState.heroes.push(ally);
            
            const allyAI = {
                reactive: new ReactiveAI(ally, this.gameState),
                tactical: new TacticalAI(ally, this.gameState, config.allyDifficulty)
            };
            this.aiControllers.push({ hero: ally, ai: allyAI });
        }
        
        for (let i = 0; i < 3; i++) {
            const availableForEnemy = availableHeroes.filter(h => !usedHeroes.has(h));
            const heroId = randomChoice(availableForEnemy);
            usedHeroes.add(heroId);
            
            const offsetX = (i - 1) * 100;
            const offsetY = (i - 1) * 100;
            
            const enemy = new Hero(
                redSpawn.x + offsetX,
                redSpawn.y + offsetY,
                CONFIG.TEAM_RED,
                HERO_DATA[heroId],
                false
            );
            enemy.setSummonerSpell(randomChoice(['heal', 'flash', 'haste']));
            this.gameState.heroes.push(enemy);
            
            const enemyAI = {
                reactive: new ReactiveAI(enemy, this.gameState),
                tactical: new TacticalAI(enemy, this.gameState, config.enemyDifficulty)
            };
            this.aiControllers.push({ hero: enemy, ai: enemyAI });
        }
    }

    createTowers() {
        for (const team of [CONFIG.TEAM_BLUE, CONFIG.TEAM_RED]) {
            const towerPositions = this.gameState.map.towerPositions[team];
            
            const nexus = new Tower(
                towerPositions.nexus.x,
                towerPositions.nexus.y,
                team,
                'nexus'
            );
            this.gameState.towers.push(nexus);
            
            for (const lane of ['top', 'mid', 'bot']) {
                for (const towerPos of towerPositions[lane]) {
                    const tower = new Tower(
                        towerPos.x,
                        towerPos.y,
                        team,
                        towerPos.type
                    );
                    this.gameState.towers.push(tower);
                }
            }
        }
    }

    createJungleCreatures() {
        for (const team of [CONFIG.TEAM_BLUE, CONFIG.TEAM_RED]) {
            const spawnPositions = this.gameState.map.getJungleSpawnPositions(team);
            
            for (const spawn of spawnPositions) {
                const creature = new JungleCreature(spawn.x, spawn.y, spawn.type);
                this.gameState.creatures.push(creature);
            }
        }
    }

    start() {
        this.lastFrameTime = performance.now();
        this.gameLoop(this.lastFrameTime);
    }

    pause() {
        this.gameState.isPaused = true;
    }

    resume() {
        this.gameState.isPaused = false;
        this.lastFrameTime = performance.now();
    }

    gameLoop(timestamp) {
        requestAnimationFrame((t) => this.gameLoop(t));
        
        if (this.gameState.isPaused || this.gameState.isGameOver) {
            return;
        }
        
        const deltaTime = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = timestamp;
        
        this.gameState.elapsedTime = Date.now() - this.gameState.gameStartTime;
        
        this.handleInput(deltaTime);
        this.update(deltaTime);
        this.render();
    }

    handleInput(deltaTime) {
        if (!this.gameState.playerHero || this.gameState.playerHero.isDead) return;
        
        this.inputManager.updateMouseWorld(this.camera);
        
        if (this.inputManager.isKeyPressed('escape')) {
            this.inputManager.clearKey('escape');
            window.screenManager.pauseGame();
            return;
        }
        
        if (this.inputManager.isKeyPressed('p')) {
            this.inputManager.clearKey('p');
            this.uiManager.showStatsWindow();
            return;
        }
        
        const movement = this.inputManager.getMovementVector();
        const speed = this.gameState.playerHero.stats.movementSpeed;
        
        this.gameState.playerHero.vx = movement.dx * speed;
        this.gameState.playerHero.vy = movement.dy * speed;
        
        const abilities = ['q', 'w', 'e', 'r'];
        for (const key of abilities) {
            if (this.inputManager.isKeyPressed(key)) {
                this.inputManager.clearKey(key);
                this.gameState.playerHero.castAbility(
                    key,
                    this.inputManager.mouseWorldX,
                    this.inputManager.mouseWorldY,
                    this.gameState
                );
            }
        }
        
        if (this.inputManager.isKeyPressed('t')) {
            this.inputManager.clearKey('t');
            this.gameState.playerHero.useSummonerSpell(
                this.inputManager.mouseWorldX,
                this.inputManager.mouseWorldY,
                this.gameState
            );
        }
    }

    update(deltaTime) {
        this.updateTimers(deltaTime);
        
        for (const hero of this.gameState.heroes) {
            hero.update(deltaTime, this.gameState);
        }
        
        for (const controller of this.aiControllers) {
            if (!controller.hero.isDead) {
                controller.ai.reactive.update(deltaTime);
                controller.ai.tactical.update(deltaTime);
            }
        }
        
        for (const minion of this.gameState.minions) {
            minion.update(deltaTime, this.gameState);
        }
        
        for (const creature of this.gameState.creatures) {
            creature.update(deltaTime, this.gameState);
        }
        
        for (const tower of this.gameState.towers) {
            tower.update(deltaTime, this.gameState);
        }
        
        for (const projectile of this.gameState.projectiles) {
            projectile.update(deltaTime, this.gameState);
        }
        
        for (const effect of this.gameState.effects) {
            effect.update(deltaTime);
        }
        
        this.gameState.projectiles = this.gameState.projectiles.filter(p => !p.isDead);
        this.gameState.effects = this.gameState.effects.filter(e => !e.isDead);
        this.gameState.minions = this.gameState.minions.filter(m => !m.isDead);
        
        this.combatSystem.processAutoAttacks(deltaTime);
        
        this.camera.update(deltaTime);
        this.uiManager.update();
        
        const winner = this.combatSystem.checkGameEnd();
        if (winner !== null) {
            this.endGame(winner);
        }
    }

    updateTimers(deltaTime) {
        this.minionSpawnTimer += deltaTime * 1000;
        if (this.minionSpawnTimer >= CONFIG.MINION_SPAWN_INTERVAL) {
            this.minionSpawnTimer = 0;
            this.spawnMinions();
        }
        
        this.goldPassiveTimer += deltaTime * 1000;
        if (this.goldPassiveTimer >= CONFIG.GOLD_PASSIVE_INTERVAL) {
            this.goldPassiveTimer = 0;
            
            for (const hero of this.gameState.heroes) {
                if (!hero.isDead) {
                    hero.gainGold(CONFIG.GOLD_PASSIVE_AMOUNT);
                }
            }
        }
    }

    spawnMinions() {
        for (const team of [CONFIG.TEAM_BLUE, CONFIG.TEAM_RED]) {
            const lanes = ['top', 'mid', 'bot'];
            
            for (const lane of lanes) {
                const waypoints = this.gameState.map.waypoints[team][lane];
                const spawnPoint = waypoints[0];
                
                for (let i = 0; i < 2; i++) {
                    const minion = new Minion(
                        spawnPoint.x + randomRange(-30, 30),
                        spawnPoint.y + randomRange(-30, 30),
                        team,
                        'melee',
                        lane
                    );
                    minion.setWaypoints(waypoints);
                    this.gameState.minions.push(minion);
                }
                
                for (let i = 0; i < 2; i++) {
                    const minion = new Minion(
                        spawnPoint.x + randomRange(-30, 30),
                        spawnPoint.y + randomRange(-30, 30),
                        team,
                        'ranged',
                        lane
                    );
                    minion.setWaypoints(waypoints);
                    this.gameState.minions.push(minion);
                }
            }
        }
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.camera.apply(this.ctx);
        
        this.gameState.map.draw(this.ctx, this.camera);
        
        for (const effect of this.gameState.effects) {
            if (effect instanceof AuraEffect || effect instanceof RangeIndicator) {
                effect.draw(this.ctx, this.camera);
            }
        }
        
        for (const minion of this.gameState.minions) {
            minion.draw(this.ctx, this.camera);
        }
        
        for (const creature of this.gameState.creatures) {
            creature.draw(this.ctx, this.camera);
        }
        
        for (const tower of this.gameState.towers) {
            tower.draw(this.ctx, this.camera);
        }
        
        for (const hero of this.gameState.heroes) {
            hero.draw(this.ctx, this.camera);
        }
        
        for (const projectile of this.gameState.projectiles) {
            projectile.draw(this.ctx, this.camera);
        }
        
        for (const effect of this.gameState.effects) {
            if (effect instanceof HitEffect || effect instanceof AbilityEffect || effect instanceof ParticleEffect) {
                effect.draw(this.ctx, this.camera);
            }
        }
        
        this.camera.reset(this.ctx);
        
        this.minimap.draw(this.gameState, this.camera);
    }

    endGame(winner) {
        this.gameState.isGameOver = true;
        this.gameState.winner = winner;
        
        const matchStats = {
            duration: this.gameState.elapsedTime,
            heroes: this.gameState.heroes.map(h => ({
                name: h.name,
                team: h.team,
                kills: h.kills,
                deaths: h.deaths,
                assists: h.assists,
                gold: h.gold,
                level: h.level
            })),
            allyNexusHp: 0,
            enemyNexusHp: 0
        };
        
        const blueNexus = this.gameState.towers.find(t => t.team === CONFIG.TEAM_BLUE && t.type === 'nexus');
        const redNexus = this.gameState.towers.find(t => t.team === CONFIG.TEAM_RED && t.type === 'nexus');
        
        if (blueNexus) matchStats.allyNexusHp = blueNexus.hp;
        if (redNexus) matchStats.enemyNexusHp = redNexus.hp;
        
        setTimeout(() => {
            window.screenManager.showGameOver(winner, matchStats);
        }, 2000);
    }
}
