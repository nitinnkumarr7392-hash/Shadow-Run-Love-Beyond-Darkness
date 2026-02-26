let scene, camera, renderer;
let player, enemy;
let obstacles = [];
let fragments = [];
let speed = 0.3;
let lane = 0;
let score = 0;
let xp = 0;
let bossActive = false;

const lanes = [-2, 0, 2];

init();
animate();

function init() {

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 20, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x666666);
    scene.add(ambient);

    const light = new THREE.PointLight(0xff3366, 2, 50);
    light.position.set(0, 10, 5);
    scene.add(light);

    createTrack();
    createPlayer();
    createEnemy();

    spawnObstacles();
    spawnFragments();

    showCutscene("Escape the cursed cave... She is waiting.");
}

function createTrack() {
    const geometry = new THREE.BoxGeometry(10, 1, 200);
    const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const track = new THREE.Mesh(geometry, material);
    track.position.z = -100;
    scene.add(track);
}

function createPlayer() {
    const geometry = new THREE.BoxGeometry(1,2,1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    player = new THREE.Mesh(geometry, material);
    player.position.y = 1;
    scene.add(player);
}

function createEnemy() {
    const geometry = new THREE.BoxGeometry(1.5,2.5,1.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(0,1,-5);
    scene.add(enemy);
}

function spawnObstacles() {
    setInterval(() => {
        const geometry = new THREE.BoxGeometry(1,2,1);
        const material = new THREE.MeshStandardMaterial({ color: 0x880000 });
        const obstacle = new THREE.Mesh(geometry, material);

        let randomLane = lanes[Math.floor(Math.random()*3)];
        obstacle.position.set(randomLane,1,-100);
        scene.add(obstacle);
        obstacles.push(obstacle);
    }, 1500);
}

function spawnFragments() {
    setInterval(() => {
        const geometry = new THREE.SphereGeometry(0.5,16,16);
        const material = new THREE.MeshStandardMaterial({ color: 0xff00ff });
        const fragment = new THREE.Mesh(geometry, material);

        let randomLane = lanes[Math.floor(Math.random()*3)];
        fragment.position.set(randomLane,1,-100);
        scene.add(fragment);
        fragments.push(fragment);
    }, 2500);
}

function animate() {
    requestAnimationFrame(animate);

    player.position.x += (lanes[lane] - player.position.x) * 0.2;

    obstacles.forEach(o => o.position.z += speed);
    fragments.forEach(f => f.position.z += speed);

    checkCollision();
    enemyAI();

    score++;
    document.getElementById("score").innerText = "Score: " + score;

    renderer.render(scene, camera);
}

function checkCollision() {

    obstacles.forEach(o => {
        if(player.position.distanceTo(o.position) < 1.5){
            showCutscene("You were consumed by darkness...");
            speed = 0;
        }
    });

    fragments.forEach(f => {
        if(player.position.distanceTo(f.position) < 1.5){
            xp += 10;
            document.getElementById("xpFill").style.width = xp + "%";
            scene.remove(f);
        }
    });

    if(xp >= 100 && !bossActive){
        bossFight();
    }
}

function enemyAI() {
    enemy.position.x += (player.position.x - enemy.position.x) * 0.05;
    enemy.position.z += 0.05;
}

function bossFight(){
    bossActive = true;
    showCutscene("The Demon Lord emerges...");
    speed = 0.5;
}

function showCutscene(text){
    const cut = document.getElementById("cutscene");
    cut.innerText = text;
    setTimeout(()=> cut.innerText="", 3000);
}

window.addEventListener("touchstart", handleTouchStart, false);
window.addEventListener("touchmove", handleTouchMove, false);

let xDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
};

function handleTouchMove(evt) {
    if (!xDown) return;

    let xUp = evt.touches[0].clientX;
    let diff = xDown - xUp;

    if (diff > 50 && lane < 2) lane++;
    else if (diff < -50 && lane > 0) lane--;

    xDown = null;
};
