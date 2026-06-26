const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

//classes

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(v) { 
        this.x += v.x; 
        this.y += v.y; 
        return this; 
    }
    scale(s) {
        this.x *= s; 
        this.y *= s; 
        return this; 
    }
    clone() { 
        return new Vector2(this.x, this.y); 
    }
    set(x, y) { 
        this.x = x; 
        this.y = y; 
        return this; 
    }
}

class Entity {
    constructor(position, size) {
        this.position = position;
        this.size = size;
        this.velocity = new Vector2(0, 0);
    }

    update(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }

    draw(ctx) {
        ctx.fillStyle = "magenta";
        ctx.fillRect(
            this.position.x,
            this.position.y,
            this.size.x,
            this.size.y
        );
    }
}

//actual game

const entities = [];

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

function isOnScreen(entity) {
    return !(
        entity.position.x + entity.size.x < camera.x ||
        entity.position.x > camera.x + camera.width ||
        entity.position.y + entity.size.y < camera.y ||
        entity.position.y > camera.y + camera.height
    );
}

entities.push(new Entity(new Vector2(100, 100), new Vector2(50, 50)));

let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    for (const e of entities) {
        e.update(deltaTime);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const e of entities) {
        if (isOnScreen(e)) {
            e.draw(ctx);
        }
    }
}

requestAnimationFrame(gameLoop);
