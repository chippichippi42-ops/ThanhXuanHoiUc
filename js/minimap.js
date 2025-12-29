class Minimap {
    constructor(canvas, worldSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldSize = worldSize;
        this.scale = canvas.width / worldSize;
    }

    draw(gameState, camera) {
        const ctx = this.ctx;
        const scale = this.scale;
        
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (gameState.map && gameState.map.bushes) {
            ctx.fillStyle = '#0a3d2a';
            for (const bush of gameState.map.bushes) {
                ctx.beginPath();
                ctx.arc(bush.x * scale, bush.y * scale, bush.radius * scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        if (gameState.towers) {
            for (const tower of gameState.towers) {
                if (tower.isDead) continue;
                
                ctx.fillStyle = tower.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560';
                ctx.beginPath();
                ctx.arc(tower.x * scale, tower.y * scale, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        if (gameState.heroes) {
            for (const hero of gameState.heroes) {
                if (hero.isDead) continue;
                
                const isVisible = this.isHeroVisible(hero, gameState);
                
                if (isVisible || hero.isPlayer) {
                    ctx.fillStyle = hero.team === CONFIG.TEAM_BLUE ? '#4ecca3' : '#e94560';
                    ctx.beginPath();
                    ctx.arc(hero.x * scale, hero.y * scale, 4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    if (hero.isPlayer) {
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            }
        }
        
        if (camera) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                camera.x * scale,
                camera.y * scale,
                camera.width * scale,
                camera.height * scale
            );
        }
    }

    isHeroVisible(hero, gameState) {
        if (!gameState.playerHero) return false;
        if (hero.team === gameState.playerHero.team) return true;
        
        const visionRange = CONFIG.VISION_RANGE;
        
        if (distance(hero.x, hero.y, gameState.playerHero.x, gameState.playerHero.y) < visionRange) {
            return true;
        }
        
        for (const ally of gameState.heroes) {
            if (ally.team === gameState.playerHero.team && !ally.isDead) {
                if (distance(hero.x, hero.y, ally.x, ally.y) < visionRange) {
                    return true;
                }
            }
        }
        
        for (const tower of gameState.towers) {
            if (tower.team === gameState.playerHero.team && !tower.isDead) {
                if (distance(hero.x, hero.y, tower.x, tower.y) < visionRange) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
