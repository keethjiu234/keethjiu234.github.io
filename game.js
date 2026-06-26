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

//classes
class Entity {
    constructor(position, size, color = 0xff00ff) {
        this.position = position;
        this.size = size;
        this.velocity = new THREE.Vector3(0, 0, 0);

        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
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


const player = new Player(new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(1, 1, 1));
entities.push(player);

const camOffset = new THREE.Vector3(0, 1, 3);

//functions
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    for (const e of entities) {
        e.update(deltaTime);
    }

    camera.position.copy(player.mesh.position).add(camOffset);
    renderer.render(scene, camera);

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
