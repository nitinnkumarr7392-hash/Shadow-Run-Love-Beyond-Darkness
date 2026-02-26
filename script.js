let scene, camera, renderer, clock;
let player, enemy, boss;
let mixer, enemyMixer;
let obstacles=[], fragments=[];
let speed=0.3;
let lane=1;
let score=0, xp=0;
let level=1;
let bossSpawned=false;
const lanes=[-2,0,2];

const saveData = JSON.parse(localStorage.getItem("shadowSave")) || {
    unlockedLevel:1,
    highScore:0
};

init();
animate();

function init(){

scene=new THREE.Scene();
scene.background=new THREE.Color(0x000000);
scene.fog=new THREE.Fog(0x000000,20,150);

camera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,5,10);

renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

clock=new THREE.Clock();

const ambient=new THREE.AmbientLight(0xffffff,0.6);
scene.add(ambient);

const light=new THREE.PointLight(0xff3366,2,50);
light.position.set(0,10,5);
scene.add(light);

createTrack();
loadPlayer();
loadEnemy();
spawnSystem();
setupAudio();
}

function createTrack(){
const geo=new THREE.BoxGeometry(10,1,300);
const mat=new THREE.MeshStandardMaterial({color:0x111111});
const track=new THREE.Mesh(geo,mat);
track.position.z=-150;
scene.add(track);
}

function loadPlayer(){
const loader=new THREE.GLTFLoader();
loader.load(
'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
gltf=>{
player=gltf.scene;
player.scale.set(0.4,0.4,0.4);
player.position.y=1;
scene.add(player);
mixer=new THREE.AnimationMixer(player);
mixer.clipAction(gltf.animations[0]).play();
}
);
}

function loadEnemy(){
const loader=new THREE.GLTFLoader();
loader.load(
'https://threejs.org/examples/models/gltf/Fox.glb',
gltf=>{
enemy=gltf.scene;
enemy.scale.set(0.05,0.05,0.05);
enemy.position.set(0,0.5,-5);
scene.add(enemy);
enemyMixer=new THREE.AnimationMixer(enemy);
enemyMixer.clipAction(gltf.animations[1]).play();
}
);
}

function spawnSystem(){
setInterval(()=>{
spawnObstacle();
spawnFragment();
},2000);
}

function spawnObstacle(){
const geo=new THREE.BoxGeometry(1,2,1);
const mat=new THREE.MeshStandardMaterial({color:0x880000});
const o=new THREE.Mesh(geo,mat);
o.position.set(lanes[Math.floor(Math.random()*3)],1,-150);
scene.add(o);
obstacles.push(o);
}

function spawnFragment(){
const geo=new THREE.SphereGeometry(0.5,16,16);
const mat=new THREE.MeshStandardMaterial({color:0xff00ff});
const f=new THREE.Mesh(geo,mat);
f.position.set(lanes[Math.floor(Math.random()*3)],1,-150);
scene.add(f);
fragments.push(f);
}

function animate(){
requestAnimationFrame(animate);

let delta=clock.getDelta();
if(mixer) mixer.update(delta);
if(enemyMixer) enemyMixer.update(delta);

if(player)
player.position.x+=(lanes[lane]-player.position.x)*0.2;

obstacles.forEach(o=>o.position.z+=speed);
fragments.forEach(f=>f.position.z+=speed);

enemyAI();

checkCollision();
updateUI();

renderer.render(scene,camera);
}

function enemyAI(){
if(!enemy) return;
enemy.position.x+=(player.position.x-enemy.position.x)*0.05;
enemy.position.z+=0.05;
}

function checkCollision(){

obstacles.forEach(o=>{
if(player && player.position.distanceTo(o.position)<1.5){
gameOver();
}
});

fragments.forEach(f=>{
if(player && player.position.distanceTo(f.position)<1.5){
xp+=10;
scene.remove(f);
}
});

if(xp>=100 && !bossSpawned){
spawnBoss();
}
}

function spawnBoss(){
bossSpawned=true;
showCutscene("Demon Lord Awakens...");
const loader=new THREE.GLTFLoader();
loader.load(
'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
gltf=>{
boss=gltf.scene;
boss.scale.set(2,2,2);
boss.position.set(0,1,-50);
scene.add(boss);
}
);
}

function updateUI(){
score++;
document.getElementById("score").innerText="Score: "+score;
document.getElementById("level").innerText="Level: "+level;
document.getElementById("xpFill").style.width=xp+"%";
}

function gameOver(){
if(score>saveData.highScore){
saveData.highScore=score;
}
localStorage.setItem("shadowSave",JSON.stringify(saveData));
showCutscene("Your fate changes the ending...");
speed=0;
}

function showCutscene(text){
const c=document.getElementById("cutscene");
c.innerText=text;
setTimeout(()=>c.innerText="",3000);
}

function setupAudio(){
const listener=new THREE.AudioListener();
camera.add(listener);

const bgSound=new THREE.Audio(listener);
const loader=new THREE.AudioLoader();
loader.load(
'https://cdn.pixabay.com/download/audio/2022/03/15/audio_0b2f4a3f88.mp3',
buffer=>{
bgSound.setBuffer(buffer);
bgSound.setLoop(true);
bgSound.setVolume(0.5);
bgSound.play();
}
);
}

window.addEventListener("touchstart",e=>handleSwipeStart(e),false);
window.addEventListener("touchmove",e=>handleSwipeMove(e),false);

let xDown=null;
function handleSwipeStart(e){xDown=e.touches[0].clientX;}
function handleSwipeMove(e){
if(!xDown) return;
let diff=xDown-e.touches[0].clientX;
if(diff>50 && lane<2) lane++;
if(diff<-50 && lane>0) lane--;
xDown=null;
}
