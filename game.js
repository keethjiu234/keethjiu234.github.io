const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const entities = [];

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

const player = new Player(
    new Vector2(100, 100),
    new Vector2(50, 50)
);

let lastTime = 0;

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

class Player extends Entity {
    constructor(position, size) {
        super(position, size);
        this.speed = 250; // pixels per second
    }

    update(deltaTime) {
        this.velocity.set(0, 0);

        if (keys["w"]) this.velocity.y = -this.speed;
        if (keys["s"]) this.velocity.y = this.speed;
        if (keys["a"]) this.velocity.x = -this.speed;
        if (keys["d"]) this.velocity.x = this.speed;

        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            const inv = Math.SQRT1_2; // 1 / sqrt(2)
            this.velocity.x *= inv;
            this.velocity.y *= inv;
        }

        super.update(deltaTime);
    }

    draw(ctx) {
        ctx.fillStyle = "dodgerblue";
        ctx.fillRect(
            this.position.x,
            this.position.y,
            this.size.x,
            this.size.y
        );
    }
}

//actual game funcs

function isOnScreen(entity) {
    return !(
        entity.position.x + entity.size.x < camera.x ||
        entity.position.x > camera.x + camera.width ||
        entity.position.y + entity.size.y < camera.y ||
        entity.position.y > camera.y + camera.height
    );
}


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


//onstart

entities.push(player);

requestAnimationFrame(gameLoop);
