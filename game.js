//variables
const entities = [];
let lastTime = 0;

//render variables
const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

//control variables
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// mouse look
let yaw = 0;
let pitch = 0;

canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});

document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvas) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    }
});

// physics
const GRAVITY = -9.8;

//classes
class Entity {
    constructor(position, size, color = 0xff00ff, anchored = false) {
        this.position = position;
        this.size = size;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.anchored = anchored
        this.onGround = false;

        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        scene.add(this.mesh);
    }

    update(deltaTime) {
        if (this.anchored === false) {
            this.velocity.y += GRAVITY * deltaTime;
        }
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.mesh.position.copy(this.position);
        resolveCollisions(this);
    }
}

class Player extends Entity {
    constructor(position, size) {
        super(position, size, 0x1e90ff);
        this.speed = 5;
        this.lookVector = new THREE.Vector3()
    }

    update(deltaTime) {
        const right =  new THREE.Vector3(
            player.lookVector.z,
            0,
            -player.lookVector.x
        );

        const move = new THREE.Vector3();

        if (keys["w"]) move.add(this.lookVector.clone().negate());
        if (keys["s"]) move.add(this.lookVector);
        if (keys["a"]) move.add(right.clone().negate());
        if (keys["d"]) move.add(right);

        if (move.lengthSq() > 0) {
            move.normalize().multiplyScalar(this.speed);
            this.velocity.x = move.x;
            this.velocity.z = move.z;
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }

        if (this.onGround && keys[" "]) {
            this.velocity.y = 6;
        }

        super.update(deltaTime);
    }
}

// collision helpers
function checkCollision(a, b) {
    return (
        Math.abs(a.position.x - b.position.x) * 2 < (a.size.x + b.size.x) &&
        Math.abs(a.position.y - b.position.y) * 2 < (a.size.y + b.size.y) &&
        Math.abs(a.position.z - b.position.z) * 2 < (a.size.z + b.size.z)
    );
}

function resolveCollisions(entity) {
    entity.onGround = false;

    for (const other of entities) {
        if (other === entity) continue;

        if (!checkCollision(entity, other)) continue;

        const dx = entity.position.x - other.position.x;
        const dy = entity.position.y - other.position.y;

        const overlapX = (entity.size.x + other.size.x) / 2 - Math.abs(dx);
        const overlapY = (entity.size.y + other.size.y) / 2 - Math.abs(dy);

        if (overlapX < overlapY) {
            if (dx > 0) {
                entity.position.x += overlapX;
            } else {
                entity.position.x -= overlapX;
            }

            entity.velocity.x = 0;
        } else {
            if (dy > 0) {
                entity.position.y += overlapY;
                entity.velocity.y = 0;
                entity.onGround = true;
            } else {
                entity.position.y -= overlapY;
                entity.velocity.y = 0;
            }
        }
    }
}
// create objects
const player = new Player(new THREE.Vector3(0, 20, 0), new THREE.Vector3(1, 4, 1));
entities.push(player);

const ground = new Entity(new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(50, 1, 50), 0xffffff, true);
entities.push(ground);

// game loop
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    for (const e of entities) e.update(deltaTime);

    camera.position.copy(player.position);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    player.lookVector = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));

    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
