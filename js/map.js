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
        const center = s / 2;
        const quarter = s / 4;
        
        this.spawnPoints = {
            [CONFIG.TEAM_BLUE]: { x: quarter, y: quarter },
            [CONFIG.TEAM_RED]: { x: s - quarter, y: s - quarter }
        };
        
        this.generateWalls();
        this.generateBushes();
        this.generateWaypoints();
        this.generateTowerPositions();
    }

    generateWalls() {
        const s = this.size;
        const wallThickness = 100;
        const forestSize = s / 3;
        
        const forests = [
            { x: 0, y: 0, w: forestSize, h: forestSize },
            { x: s - forestSize, y: 0, w: forestSize, h: forestSize },
            { x: 0, y: s - forestSize, w: forestSize, h: forestSize },
            { x: s - forestSize, y: s - forestSize, w: forestSize, h: forestSize }
        ];
        
        for (const forest of forests) {
            const numWalls = randomInt(8, 12);
            for (let i = 0; i < numWalls; i++) {
                const w = randomRange(80, 200);
                const h = randomRange(80, 200);
                const x = forest.x + randomRange(50, forest.w - w - 50);
                const y = forest.y + randomRange(50, forest.h - h - 50);
                
                this.walls.push({ x, y, width: w, height: h });
            }
        }
        
        this.walls.push({ x: -wallThickness, y: -wallThickness, width: wallThickness, height: s + wallThickness * 2 });
        this.walls.push({ x: s, y: -wallThickness, width: wallThickness, height: s + wallThickness * 2 });
        this.walls.push({ x: 0, y: -wallThickness, width: s, height: wallThickness });
        this.walls.push({ x: 0, y: s, width: s, height: wallThickness });
    }

    generateBushes() {
        const s = this.size;
        const bushRadius = 150;
        
        const bushPositions = [
            { x: s * 0.3, y: s * 0.3, radius: bushRadius },
            { x: s * 0.7, y: s * 0.3, radius: bushRadius },
            { x: s * 0.3, y: s * 0.7, radius: bushRadius },
            { x: s * 0.7, y: s * 0.7, radius: bushRadius },
            { x: s * 0.5, y: s * 0.35, radius: bushRadius },
            { x: s * 0.5, y: s * 0.65, radius: bushRadius },
            { x: s * 0.35, y: s * 0.5, radius: bushRadius },
            { x: s * 0.65, y: s * 0.5, radius: bushRadius }
        ];
        
        this.bushes = bushPositions;
    }

    generateWaypoints() {
        const s = this.size;
        
        const topLane = [
            { x: s * 0.2, y: s * 0.15 },
            { x: s * 0.4, y: s * 0.15 },
            { x: s * 0.6, y: s * 0.15 },
            { x: s * 0.8, y: s * 0.15 }
        ];
        
        const midLane = [
            { x: s * 0.25, y: s * 0.25 },
            { x: s * 0.4, y: s * 0.4 },
            { x: s * 0.5, y: s * 0.5 },
            { x: s * 0.6, y: s * 0.6 },
            { x: s * 0.75, y: s * 0.75 }
        ];
        
        const botLane = [
            { x: s * 0.15, y: s * 0.2 },
            { x: s * 0.15, y: s * 0.4 },
            { x: s * 0.15, y: s * 0.6 },
            { x: s * 0.15, y: s * 0.8 }
        ];
        
        this.waypoints = {
            [CONFIG.TEAM_BLUE]: {
                top: topLane,
                mid: midLane,
                bot: botLane.map(p => ({ x: p.y, y: p.x }))
            },
            [CONFIG.TEAM_RED]: {
                top: topLane.map(p => ({ x: s - p.x, y: s - p.y })).reverse(),
                mid: midLane.map(p => ({ x: s - p.x, y: s - p.y })).reverse(),
                bot: botLane.map(p => ({ x: s - p.y, y: s - p.x })).reverse()
            }
        };
    }

    generateTowerPositions() {
        const s = this.size;
        
        this.towerPositions = {
            [CONFIG.TEAM_BLUE]: {
                nexus: { x: s * 0.15, y: s * 0.15, type: 'nexus' },
                top: [
                    { x: s * 0.25, y: s * 0.12, type: 'outerTower' },
                    { x: s * 0.40, y: s * 0.12, type: 'innerTower' },
                    { x: s * 0.20, y: s * 0.18, type: 'mainTower' }
                ],
                mid: [
                    { x: s * 0.30, y: s * 0.30, type: 'outerTower' },
                    { x: s * 0.38, y: s * 0.38, type: 'innerTower' },
                    { x: s * 0.22, y: s * 0.22, type: 'mainTower' }
                ],
                bot: [
                    { x: s * 0.12, y: s * 0.25, type: 'outerTower' },
                    { x: s * 0.12, y: s * 0.40, type: 'innerTower' },
                    { x: s * 0.18, y: s * 0.20, type: 'mainTower' }
                ]
            },
            [CONFIG.TEAM_RED]: {
                nexus: { x: s * 0.85, y: s * 0.85, type: 'nexus' },
                top: [
                    { x: s * 0.75, y: s * 0.88, type: 'outerTower' },
                    { x: s * 0.60, y: s * 0.88, type: 'innerTower' },
                    { x: s * 0.80, y: s * 0.82, type: 'mainTower' }
                ],
                mid: [
                    { x: s * 0.70, y: s * 0.70, type: 'outerTower' },
                    { x: s * 0.62, y: s * 0.62, type: 'innerTower' },
                    { x: s * 0.78, y: s * 0.78, type: 'mainTower' }
                ],
                bot: [
                    { x: s * 0.88, y: s * 0.75, type: 'outerTower' },
                    { x: s * 0.88, y: s * 0.60, type: 'innerTower' },
                    { x: s * 0.82, y: s * 0.80, type: 'mainTower' }
                ]
            }
        };
    }

    getJungleSpawnPositions(team) {
        const s = this.size;
        const positions = [];
        
        if (team === CONFIG.TEAM_BLUE) {
            positions.push(
                { x: s * 0.20, y: s * 0.08, type: 'wraith' },
                { x: s * 0.08, y: s * 0.20, type: 'wraith' },
                { x: s * 0.25, y: s * 0.25, type: 'golem' },
                { x: s * 0.35, y: s * 0.25, type: 'krug' },
                { x: s * 0.25, y: s * 0.35, type: 'krug' }
            );
        } else {
            positions.push(
                { x: s * 0.80, y: s * 0.92, type: 'wraith' },
                { x: s * 0.92, y: s * 0.80, type: 'wraith' },
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
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.size, this.size);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        const gridSize = 200;
        for (let x = 0; x <= this.size; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.size);
            ctx.stroke();
        }
        for (let y = 0; y <= this.size; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.size, y);
            ctx.stroke();
        }
        
        ctx.fillStyle = '#0a3d2a';
        for (const bush of this.bushes) {
            ctx.beginPath();
            ctx.arc(bush.x, bush.y, bush.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = '#2a2a2a';
        for (const wall of this.walls) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
        
        const s = this.size;
        ctx.strokeStyle = '#4a6fa5';
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.moveTo(s * 0.1, s * 0.1);
        ctx.lineTo(s * 0.9, s * 0.9);
        ctx.stroke();
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
