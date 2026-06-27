//variables
const entities = [];
let lastTime = 0;

//render variables
const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

//control variables
const keys = {};

//mouse look
let yaw = 0;
let pitch = 0;
let sensitivity = 0.005

//events

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});

document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvas) {
        yaw -= e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;
        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    }
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


//physics
const GRAVITY = -9.8;

//classes
class Entity {
    constructor(position, size, color = 0xff00ff, anchored = false) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({ color });

        this.position = position;
        this.size = size;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.anchored = anchored
        this.onGround = false;
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.copy(position);

        scene.add(this.mesh);
    }

    update(deltaTime) {
        if (this.anchored === false) {
            this.velocity.y += GRAVITY * deltaTime;
            this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
            this.mesh.position.copy(this.position);
        }
        resolveCollisions(this);
    }
}

class Player extends Entity {
    constructor(position, size) {
        super(position, size, 0x1e90ff);
        this.speed = 10;
        this.jump = 6;
        this.lookVector = new THREE.Vector3();
    }

    update(deltaTime) {
        const right =  new THREE.Vector3(
            player.lookVector.z,
            0,
            -player.lookVector.x
        );

        let move = new THREE.Vector3();

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
            this.velocity.y = this.jump;
        }

        super.update(deltaTime);
    }
}

class Hand {
    constructor() {
        const geometry = new THREE.BoxGeometry(0.4, 0.8, 0.4);
        const material = new THREE.MeshBasicMaterial({ color: 0xffcc99 });

        this.mesh = new THREE.Mesh(geometry, material);
        this.positionOffset = new THREE.Vector3(0.75, -0.5, -1);
        this.rotationOffset = new THREE.Euler(
            -Math.PI * 0.35,
            Math.PI * 0.25,
            0
        );

        this.mesh.material.depthTest = false;
        this.mesh.renderOrder = 9999;

        scene.add(this.mesh);
    }

    update(camera, deltaTime) {
        let handPos = this.positionOffset.clone();
        let handRotation = camera.quaternion.clone();

        handPos.applyQuaternion(camera.quaternion);
        handRotation.multiply(new THREE.Quaternion().setFromEuler(this.rotationOffset));

        this.mesh.position.copy(camera.position).add(handPos);
        this.mesh.quaternion.copy(handRotation);
    }
}



//collision helpers
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
        const dz = entity.position.z - other.position.z;

        const overlapX = (entity.size.x + other.size.x) / 2 - Math.abs(dx);
        const overlapY = (entity.size.y + other.size.y) / 2 - Math.abs(dy);
        const overlapZ = (entity.size.z + other.size.z) / 2 - Math.abs(dz);

        if (overlapX < overlapY && overlapX < overlapZ) {
            if (dx > 0) entity.position.x += overlapX;
            else entity.position.x -= overlapX;

            entity.velocity.x = 0;

            if (!other.anchored) {
                other.position.x -= Math.sign(dx) * overlapX;
                other.velocity.x = entity.velocity.x * 0.5; // push strength
            }

        } else if (overlapY < overlapZ) {
            if (dy > 0) {
                entity.position.y += overlapY;
                entity.velocity.y = 0;
                entity.onGround = true;
            } else {
                entity.position.y -= overlapY;
                entity.velocity.y = 0;
            }
        } else {
            if (dz > 0) entity.position.z += overlapZ;
            else entity.position.z -= overlapZ;

            entity.velocity.z = 0;
            if (!other.anchored) {
                other.position.z -= Math.sign(dz) * overlapZ;
                other.velocity.z = entity.velocity.z * 0.5;
            }
        }
    }
}


// create objects
const player = new Player(new THREE.Vector3(0, 20, 0), new THREE.Vector3(1, 4, 1));
entities.push(player);

const ground = new Entity(new THREE.Vector3(0, 0, 0), new THREE.Vector3(50, 1, 50), 0xffffff, true);
entities.push(ground);

const ground2 = new Entity(new THREE.Vector3(0, 19, 0), new THREE.Vector3(1,1,1), 0xD9D9D9);
entities.push(ground2);

const hand = new Hand();

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

    hand.update(camera, deltaTime);

    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
