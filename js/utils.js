class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return this.divide(len);
    }

    distanceTo(v) {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
    }

    angleTo(v) {
        return Math.atan2(v.y - this.y, v.x - this.x);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function circlesIntersect(x1, y1, r1, x2, y2, r2) {
    const dist = distance(x1, y1, x2, y2);
    return dist < r1 + r2;
}

function pointInCircle(px, py, cx, cy, radius) {
    return distance(px, py, cx, cy) < radius;
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function lineIntersectsCircle(x1, y1, x2, y2, cx, cy, radius) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = (fx * fx + fy * fy) - radius * radius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return false;
    
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
    
    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function calculateDamage(attacker, target, baseDamage, isDamagePhysical = true, isCrit = false) {
    let damage = baseDamage;
    
    if (attacker.stats) {
        damage *= (1 + attacker.stats.damage / 100);
        damage *= (1 + attacker.stats.abilityPower / 100);
    }
    
    if (target.stats) {
        if (isDamagePhysical) {
            const armorReduction = target.stats.armor / (target.stats.armor + 100);
            damage *= (1 - armorReduction);
        } else {
            const mrReduction = target.stats.magicResist / (target.stats.magicResist + 100);
            damage *= (1 - mrReduction);
        }
    }
    
    if (isCrit && attacker.stats) {
        damage *= attacker.stats.critDamage;
    }
    
    return Math.max(1, Math.floor(damage));
}

function shouldCrit(critChance) {
    return Math.random() < critChance;
}

function getUniqueId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getClosestEntity(fromEntity, entities, maxDistance = Infinity, filterFn = null) {
    let closest = null;
    let closestDist = maxDistance;
    
    for (const entity of entities) {
        if (entity === fromEntity) continue;
        if (filterFn && !filterFn(entity)) continue;
        
        const dist = distance(fromEntity.x, fromEntity.y, entity.x, entity.y);
        if (dist < closestDist) {
            closest = entity;
            closestDist = dist;
        }
    }
    
    return closest;
}

function getEntitiesInRadius(x, y, radius, entities, filterFn = null) {
    const result = [];
    
    for (const entity of entities) {
        if (filterFn && !filterFn(entity)) continue;
        
        const dist = distance(x, y, entity.x, entity.y);
        if (dist <= radius) {
            result.push(entity);
        }
    }
    
    return result;
}

function moveTowards(current, target, maxStep) {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist <= maxStep) {
        return target.clone();
    }
    
    return new Vector2(
        current.x + (dx / dist) * maxStep,
        current.y + (dy / dist) * maxStep
    );
}

function isInBush(x, y, bushes) {
    for (const bush of bushes) {
        if (pointInCircle(x, y, bush.x, bush.y, bush.radius)) {
            return true;
        }
    }
    return false;
}

function hasLineOfSight(x1, y1, x2, y2, walls) {
    for (const wall of walls) {
        if (lineIntersectsRect(x1, y1, x2, y2, wall.x, wall.y, wall.width, wall.height)) {
            return false;
        }
    }
    return true;
}

function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    const left = lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    const right = lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
    const top = lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
    const bottom = lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
    
    return left || right || top || bottom;
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    if (denom === 0) return false;
    
    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
    const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
    
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
