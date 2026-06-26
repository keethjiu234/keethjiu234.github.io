import * as THREE from 'three';

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

const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial(0xff00ff);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const player = new Player(new Vector3(0, 0.5, 0), new Vector3(1, 1, 1));
entities.push(player);

//control variables

const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

//classes

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    scale(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
}

class Entity {
    constructor(position, size, color = 0xff00ff) {
        this.position = position;
        this.size = size;
        this.velocity = new Vector3(0, 0, 0);

        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.position.add(this.velocity.clone().scale(deltaTime));
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    }
}

class Player extends Entity {
    constructor(position, size) {
        super(position, size, 0x1e90ff);
        this.speed = 5;
    }

    update(deltaTime) {
        this.velocity.set(0, 0, 0);

        if (keys["w"]) this.velocity.z = -this.speed;
        if (keys["s"]) this.velocity.z = this.speed;
        if (keys["a"]) this.velocity.x = -this.speed;
        if (keys["d"]) this.velocity.x = this.speed;

        super.update(deltaTime);
    }
}

//functions

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    for (const e of entities) {
        e.update(deltaTime);
    }

    camera.lookAt(player.mesh.position);
    renderer.render(scene, camera);

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
