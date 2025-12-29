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
                
                const sx = tower.x * scale;
                const sy = tower.y * scale;
                
                if (tower.type === 'nexus') {
                    ctx.fillStyle = tower.team === CONFIG.TEAM_BLUE ? '#00ff00' : '#ff0000';
                    ctx.fillRect(sx - 8, sy - 8, 16, 16);
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('★', sx, sy + 4);
                } else {
                    ctx.fillStyle = tower.team === CONFIG.TEAM_BLUE ? '#00aa00' : '#aa0000';
                    ctx.beginPath();
                    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        if (gameState.heroes) {
            for (const hero of gameState.heroes) {
                if (hero.isDead) continue;
                
                const isVisible = this.isHeroVisible(hero, gameState);
                
                if (isVisible || hero.isPlayer) {
                    ctx.fillStyle = hero.team === CONFIG.TEAM_BLUE ? '#00ff00' : '#ff0000';
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
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
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
