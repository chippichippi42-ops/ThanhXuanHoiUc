class GameMap {
    constructor(size) {
        this.size = size;
        this.walls = [];
        this.bushes = [];
        this.waypoints = {};
        this.spawnPoints = {};
        this.towerPositions = {};
        
        this.generate();
    }

    generate() {
        const s = this.size;
        
        this.spawnPoints = {
            [CONFIG.TEAM_BLUE]: { x: -200, y: s + 200 },
            [CONFIG.TEAM_RED]: { x: s + 200, y: -200 }
        };
        
        this.generateWalls();
        this.generateBushes();
        this.generateWaypoints();
        this.generateTowerPositions();
    }

    generateWalls() {
        const s = this.size;
        const wallThickness = 100;
        
        this.walls.push({ x: -wallThickness, y: -wallThickness, width: wallThickness, height: s + wallThickness * 2 });
        this.walls.push({ x: s, y: -wallThickness, width: wallThickness, height: s + wallThickness * 2 });
        this.walls.push({ x: 0, y: -wallThickness, width: s, height: wallThickness });
        this.walls.push({ x: 0, y: s, width: s, height: wallThickness });
        
        const jungleWallSize = 120;
        const jungleWallThickness = 60;
        
        const jungles = [
            { x: s * 0.15, y: s * 0.15 },
            { x: s * 0.85, y: s * 0.85 },
            { x: s * 0.15, y: s * 0.65 },
            { x: s * 0.85, y: s * 0.35 },
            { x: s * 0.35, y: s * 0.15 },
            { x: s * 0.65, y: s * 0.85 },
            { x: s * 0.35, y: s * 0.85 },
            { x: s * 0.65, y: s * 0.15 },
            { x: s * 0.5, y: s * 0.35 },
            { x: s * 0.5, y: s * 0.65 }
        ];
        
        for (const jungle of jungles) {
            this.walls.push({
                x: jungle.x - jungleWallThickness / 2,
                y: jungle.y - jungleWallThickness / 2,
                width: jungleWallThickness,
                height: jungleWallThickness
            });
        }
    }

    generateBushes() {
        const s = this.size;
        const bushRadius = 150;
        
        const bushPositions = [
            { x: s * 0.2, y: s * 0.2, radius: bushRadius },
            { x: s * 0.8, y: s * 0.8, radius: bushRadius },
            { x: s * 0.2, y: s * 0.7, radius: bushRadius },
            { x: s * 0.8, y: s * 0.3, radius: bushRadius },
            { x: s * 0.4, y: s * 0.15, radius: bushRadius },
            { x: s * 0.6, y: s * 0.85, radius: bushRadius },
            { x: s * 0.4, y: s * 0.85, radius: bushRadius },
            { x: s * 0.6, y: s * 0.15, radius: bushRadius },
            { x: s * 0.5, y: s * 0.3, radius: bushRadius },
            { x: s * 0.5, y: s * 0.7, radius: bushRadius }
        ];
        
        this.bushes = bushPositions;
    }

    generateWaypoints() {
        const s = this.size;
        
        const topLaneBlue = [
            { x: s * 0.1, y: s * 0.15 },
            { x: s * 0.2, y: s * 0.18 },
            { x: s * 0.3, y: s * 0.12 },
            { x: s * 0.4, y: s * 0.18 },
            { x: s * 0.5, y: s * 0.12 },
            { x: s * 0.6, y: s * 0.18 },
            { x: s * 0.7, y: s * 0.12 },
            { x: s * 0.8, y: s * 0.18 },
            { x: s * 0.9, y: s * 0.15 }
        ];
        
        const midLaneBlue = [
            { x: s * 0.2, y: s * 0.8 },
            { x: s * 0.3, y: s * 0.7 },
            { x: s * 0.4, y: s * 0.6 },
            { x: s * 0.5, y: s * 0.5 },
            { x: s * 0.6, y: s * 0.4 },
            { x: s * 0.7, y: s * 0.3 },
            { x: s * 0.8, y: s * 0.2 }
        ];
        
        const botLaneBlue = [
            { x: s * 0.15, y: s * 0.1 },
            { x: s * 0.15, y: s * 0.25 },
            { x: s * 0.15, y: s * 0.4 },
            { x: s * 0.15, y: s * 0.55 },
            { x: s * 0.15, y: s * 0.7 },
            { x: s * 0.15, y: s * 0.85 },
            { x: s * 0.15, y: s * 0.9 }
        ];
        
        this.waypoints = {
            [CONFIG.TEAM_BLUE]: {
                top: topLaneBlue,
                mid: midLaneBlue,
                bot: botLaneBlue
            },
            [CONFIG.TEAM_RED]: {
                top: topLaneBlue.map(p => ({ x: s - p.x, y: s - p.y })).reverse(),
                mid: midLaneBlue.map(p => ({ x: s - p.x, y: s - p.y })).reverse(),
                bot: botLaneBlue.map(p => ({ x: s - p.x, y: s - p.y })).reverse()
            }
        };
    }

    generateTowerPositions() {
        const s = this.size;
        
        this.towerPositions = {
            [CONFIG.TEAM_BLUE]: {
                nexus: { x: s * 0.1, y: s * 0.9, type: 'nexus' },
                top: [
                    { x: s * 0.15, y: s * 0.12, type: 'outerTower' },
                    { x: s * 0.35, y: s * 0.12, type: 'innerTower' },
                    { x: s * 0.55, y: s * 0.12, type: 'mainTower' }
                ],
                mid: [
                    { x: s * 0.25, y: s * 0.75, type: 'outerTower' },
                    { x: s * 0.35, y: s * 0.65, type: 'innerTower' },
                    { x: s * 0.45, y: s * 0.55, type: 'mainTower' }
                ],
                bot: [
                    { x: s * 0.12, y: s * 0.2, type: 'outerTower' },
                    { x: s * 0.12, y: s * 0.4, type: 'innerTower' },
                    { x: s * 0.12, y: s * 0.6, type: 'mainTower' }
                ]
            },
            [CONFIG.TEAM_RED]: {
                nexus: { x: s * 0.9, y: s * 0.1, type: 'nexus' },
                top: [
                    { x: s * 0.85, y: s * 0.88, type: 'outerTower' },
                    { x: s * 0.65, y: s * 0.88, type: 'innerTower' },
                    { x: s * 0.45, y: s * 0.88, type: 'mainTower' }
                ],
                mid: [
                    { x: s * 0.75, y: s * 0.25, type: 'outerTower' },
                    { x: s * 0.65, y: s * 0.35, type: 'innerTower' },
                    { x: s * 0.55, y: s * 0.45, type: 'mainTower' }
                ],
                bot: [
                    { x: s * 0.88, y: s * 0.8, type: 'outerTower' },
                    { x: s * 0.88, y: s * 0.6, type: 'innerTower' },
                    { x: s * 0.88, y: s * 0.4, type: 'mainTower' }
                ]
            }
        };
    }

    getJungleSpawnPositions(team) {
        const s = this.size;
        const positions = [];
        
        if (team === CONFIG.TEAM_BLUE) {
            positions.push(
                { x: s * 0.15, y: s * 0.08, type: 'wraith' },
                { x: s * 0.08, y: s * 0.15, type: 'wraith' },
                { x: s * 0.25, y: s * 0.25, type: 'golem' },
                { x: s * 0.35, y: s * 0.25, type: 'krug' },
                { x: s * 0.25, y: s * 0.35, type: 'krug' }
            );
        } else {
            positions.push(
                { x: s * 0.85, y: s * 0.92, type: 'wraith' },
                { x: s * 0.92, y: s * 0.85, type: 'wraith' },
                { x: s * 0.75, y: s * 0.75, type: 'golem' },
                { x: s * 0.65, y: s * 0.75, type: 'krug' },
                { x: s * 0.75, y: s * 0.65, type: 'krug' }
            );
        }
        
        return positions;
    }

    isCollidingWithWall(x, y, radius) {
        for (const wall of this.walls) {
            if (circleIntersectsRect(x, y, radius, wall.x, wall.y, wall.width, wall.height)) {
                return true;
            }
        }
        
        if (x - radius < 0 || x + radius > this.size || y - radius < 0 || y + radius > this.size) {
            return true;
        }
        
        return false;
    }

    draw(ctx, camera) {
        const s = this.size;
        
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, s, s);
        
        ctx.strokeStyle = '#2a5a3a';
        ctx.lineWidth = 80;
        ctx.beginPath();
        ctx.moveTo(s * 0.15, s * 0.12);
        for (let i = 0.2; i <= 0.9; i += 0.1) {
            ctx.lineTo(s * i, s * (0.12 + Math.sin(i * Math.PI * 4) * 0.04));
        }
        ctx.stroke();
        
        ctx.strokeStyle = '#4a6fa5';
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.moveTo(s * 0.2, s * 0.8);
        ctx.lineTo(s * 0.8, s * 0.2);
        ctx.stroke();
        
        ctx.strokeStyle = '#5a3a2a';
        ctx.lineWidth = 80;
        ctx.beginPath();
        ctx.moveTo(s * 0.12, s * 0.1);
        ctx.lineTo(s * 0.12, s * 0.9);
        ctx.stroke();
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        const gridSize = 200;
        for (let x = 0; x <= s; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, s);
            ctx.stroke();
        }
        for (let y = 0; y <= s; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(s, y);
            ctx.stroke();
        }
        
        ctx.fillStyle = '#0a3d2a';
        for (const bush of this.bushes) {
            ctx.beginPath();
            ctx.arc(bush.x, bush.y, bush.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = '#3a3a3a';
        for (const wall of this.walls) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
    }
}

function circleIntersectsRect(cx, cy, radius, rx, ry, rw, rh) {
    const testX = clamp(cx, rx, rx + rw);
    const testY = clamp(cy, ry, ry + rh);
    
    const distX = cx - testX;
    const distY = cy - testY;
    const distSquared = distX * distX + distY * distY;
    
    return distSquared < radius * radius;
}
