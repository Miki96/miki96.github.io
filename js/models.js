import * as THREE from './three.module.js';
import { GLTFLoader }  from './GLTFLoader.js';
import { Line2 } from './Line2.js';
import { LineMaterial } from './LineMaterial.js';
import { LineGeometry } from './LineGeometry.js';


// scene elements
var scene,
	camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
	renderer, container, canvas;

var loader = new GLTFLoader();
var clock = new THREE.Clock(true);
var texLoader = new THREE.TextureLoader;

var delta = 0;

var camPos = new THREE.Vector3(0, 0, 0);
var camSpeed = 3;
var camOffset = {x: 0, y: 1200 * 1, z:0}
var camAreaNormal = 20; // 50
var camAreaSpeed = 40; // 100
var pickPosition = {x: 0, y: 0};

var player;
var playerScale = 4;
var playerVelocity = 0;
var playerMaxSpeed = 8;
var playerDrag = 0.1;
var playerSpeed = 0.7;
var playerRun = 2;
var playerRot = 220;
var playerGlideMax = 1;
var playerGlideSpeed = 0.03;
var playerGlideDir = 1;
var playerStart = {x: -1500, y: 0, z:3000};

var playerTilt = 0;
var playerTiltMax = 45;
var playerTiltBack = 3;
var playerTiltSpeed = 2;
var playerRotSpeed = 3;

var fireRate = 0.2;
var fireTime = 0;
var shotSpeed = 5;
var shotMax = 50;

// lines
var trail = [];
var trailSize = 300;
var trailActive = 12;
var trailWidth = 10;
var line;
var matLine;

// map
var mapPoints = [];
var mapLocRace = {x: -7000, y: 0, z:0};
var mapLocPlanets = {x: 0, y: 0, z: 0};
var mapLocWork = {x: -5000, y: 0, z: 5000};
var mapLocGames = {x: 3000, y: 0, z: 3000};
var mapLocSchool = {x: 500, y: 0, z: 6000};

// portals
var portalsVisible = false;
var portalOffset = {x: -200, y: 0, z:200};

// game
var gameRing;
var gameTime = 0;
var gameTimeEl;
var gameTimeExtra = 4;
var gameScore = 0;
var gameScoreEl;
var gameInfoEl;
var gameOverEl;
var gameNext = {x: 0, y: 0, z:0};
var gameNextDistance = 3000;
var gameSpace = 5000;
var gameHolesNumber = 100;
var gameHoles = [];
var gameHolesSizes = [];
var gameSlowedTime = 0;
var gameStarted = false;

// asteroids
var asteroids = [];
var asteroidsDistance = 4000;
var asteroidsNumber = 200; //200

// stars
var starsObj;
var starsDistance = 4000;
var starsNumber = 100;

// controls
var keyState = {};    
window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);    
window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);
var mobileLeft = false;
var mobileRight = false;
var mobileEngine = false;
var mobileTurbo = false;

// game links
var gameLinks = [];

// light elements
var hemisphereLight, shadowLight;

// planet objects
var planets = [];

// fps
var stats;

// canvas with planet names
var texture;
var titles = [];

// Color Palette
var Colors = {
	red: 0xd83c11,
	white: 0xd8d0d1,
	gray: 0xaaaaaa,
	yellow: 0xffdb2b,
	orange: 0xffaa2b,
	lightbrown: 0x82430d,
	green: 0x64d132,
	lightred: 0xce702d,
	skin: 0xffce54,
	violet: 0x28ffde,
	blue: 0x1e65ff,
	brown: 0x351b04,
};

class Shot {
	constructor(model, dir, speed) {
		this.model = model;
		this.dir = dir;
		this.speed = speed;
		dir.multiplyScalar(speed);
	}
	move() {
		this.model.position.add(this.dir);
	}
}
var shots = [];

// Planet class
class Planet {
	constructor(name, dist, speed, size, color) {
		this.name = name;
		this.dist = dist;
		this.speed = speed;
		this.size = size;
		this.mesh = null;
		this.pivot = null;
		this.color = color;
	}
}

// All Planets
function initPlanets() {
	var initSize = 20;
	var initSpeed = 5;
	var initDist;

	var p0 = new Planet("Sun", 0, 0, 150, Colors.orange);
	var p1 = new Planet("Mercury", 260, (2 * Math.PI) / 158, 30, Colors.orange);
	var p2 = new Planet("Venus", 350, (2 * Math.PI) / 225, 40, Colors.lightbrown);
	var p3 = new Planet("Earth", 440, (2 * Math.PI) / 365, 45, Colors.green);
	var p4 = new Planet("Mars", 540, (2 * Math.PI) / 687, 35, Colors.red);
	var p5 = new Planet("Jupiter", 880, (2 * Math.PI) / 3000, 90, Colors.lightred);
	var p6 = new Planet("Saturn", 1120, (2 * Math.PI) / 4000, 80, Colors.skin);
	var p7 = new Planet("Uranus", 1260, (2 * Math.PI) / 6000, 70, Colors.violet);
	var p8 = new Planet("Neptune", 1460, (2 * Math.PI) / 8000, 65, Colors.blue);
	var p9 = new Planet("Pluto", 1600, (2 * Math.PI) / 10000, 30, Colors.brown);

	planets.push(p0);
	planets.push(p1);
	planets.push(p2);
	planets.push(p3);
	planets.push(p4);
	planets.push(p5);
	planets.push(p6);
	planets.push(p7);
	planets.push(p8);
	planets.push(p9);
}

// create world
window.addEventListener('load', init, false);

function init() {
	// // set up the scene, the camera and the renderer
	createScene();

	initMobileControls();

	initInfo();

	// add portal controls
	createPortals();

	// // create fps stats
	// createStats();

	// // add lights
	createLights();

	// // initiate planets
	initPlanets();

	// // add planents to scene
	createPlanets();

	// // add rocks
	createRocks(620, 140);

	// asteroid
	createAsteroids(asteroidsNumber);

	// stars
	createStars(starsNumber);

	// add player
	createPlayer();

	// create lines
	createLines();

	// map pivots
	createMap();

	// rings
	createRingGame();
	createHoles(gameHolesNumber);

	// games
	createGames();

	delta = clock.getDelta();
	// load ship
	//loadShip();

	// // add backgroundStars
	// console.log('heloo');

	// // mouse control
	// //var controls = new THREE.OrbitControls(camera);

	// //var controls;

	// loop();

	// camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	// camera.position.z = 1;

	// scene = new THREE.Scene();

	// renderer = new THREE.WebGLRenderer( { antialias: true } );
	// renderer.setSize( window.innerWidth, window.innerHeight );
	// document.getElementById('world').appendChild( renderer.domElement );



	loop();
}

function createPortals() {
	let portal = document.getElementById('portal');
	let links = document.getElementById('menu');

	// show hide portals
	portal.addEventListener("click", () => {
		portalsVisible = !portalsVisible;
		if (portalsVisible) {
			links.style.opacity = "1";
			links.style.visibility = "visible";
		} else {
			links.style.opacity = "0";
			links.style.visibility = "hidden";
		}
	});
}

function initMobileControls() {

	let left = document.getElementById('leftButton');
	let right = document.getElementById('rightButton');
	let engine = document.getElementById('engineButton');
	let turbo = document.getElementById('turboButton');

	// left
	['touchstart', 'mousedown'].forEach( e => 
		left.addEventListener(e, () => { mobileLeft = true; mobileRight = false; })
	);
	['touchend', 'mouseup', 'mouseout'].forEach( e => 
		left.addEventListener(e, () => { mobileLeft = false; })
	);

	['touchstart', 'mousedown'].forEach( e => 
		right.addEventListener(e, () => { mobileRight = true; mobileLeft = false; })
	);
	['touchend', 'mouseup', 'mouseout'].forEach( e => 
		right.addEventListener(e, () => { mobileRight = false })
	);

	['touchstart', 'mousedown'].forEach( e => 
		engine.addEventListener(e, () => { mobileEngine = true; })
	);
	['touchend', 'mouseup', 'mouseout'].forEach( e => 
		engine.addEventListener(e, () => { mobileEngine = false })
	);

	['touchstart', 'mousedown'].forEach( e => 
		turbo.addEventListener(e, () => { mobileTurbo = true })
	);
	['touchend', 'mouseup', 'mouseout'].forEach( e => 
		turbo.addEventListener(e, () => { mobileTurbo = false })
	);


}

function initInfo() {
	let strings = ["CONTROLS", "WASD - MOVE", "SHIFT - BOOST", "SPACE - SHOOT"];
	for (let i = 0; i < strings.length; i++) {
		let text = createInfo(strings[i]);
		text.position.x = playerStart.x + 200 - 500 - i * 20 + 300;
		text.position.y = playerStart.y;
		text.position.z = playerStart.z + i * 60 + 150;
		scene.add(text);
	}
}

// render scene
function loop() {
	// next frame
	requestAnimationFrame(loop);

	// stats.begin();
	// // monitored code goes here

	delta = clock.getDelta();

	playerMove();
	cameraMove();
	updateTrail();
	playerShoot();

	// bullets
	moveShots();

	// // rotate planets
	rotatePlanets();

	// move asteroids
	updateAsteroids();

	// move stars
	updateStars();

	// // position text
	positionText();

	ringUpdate();
	holesCollision();

	// update map
	updateMap();

	// // render the scene
	
	// move player

	// // end stats
	// stats.end();
	
	// call the loop function again
	matLine.resolution.set( window.innerWidth, window.innerHeight );
	renderer.render(scene, camera);
}

function createLines() {

	trail = new Float32Array( trailSize * 3 );
	for (let i = 0; i < trailSize * 3; i++) {
		if (i % 3 == 0) {
			trail[i] = playerStart.x;
			trail[i+1] = playerStart.y;
			trail[i+2] = playerStart.z;
		}
	}
	let colors = [];

	// colors
	let color = new THREE.Color();

	for (let i = 0; i < trailSize; i++) {

		color.setHSL( i / trailSize, 1.0, 0.5 );
		colors.push( color.r, color.g, color.b );

	}

	var geometry = new LineGeometry();
	geometry.setPositions( trail );
	geometry.setColors( colors );

	matLine = new LineMaterial( {

		color: 0xffffff,
		linewidth: 10, // in pixels
		vertexColors: THREE.VertexColors,
		//resolution:  // to be set by renderer, eventually
		dashed: false

	} );

	line = new Line2( geometry, matLine );
	line.computeLineDistances();
	line.scale.set( 1, 1, 1 );
	line.position.x = 0;
	scene.add( line );

	// console.log(line);
}

function updateTrail() {

	if (!player) return;

	let move = keyState[87] || mobileEngine || mobileTurbo;

	if (playerVelocity > 0 || true) {
		for (let i = trailSize * 3 - 1; i > 2; i--) {
			trail[i] = trail[i - 3];
		}
		trail[0] = player.position.x;
		trail[1] = 0;
		trail[2] = player.position.z;
	}

	if (move && trailActive < trailSize * 3 - 12) {
		trailActive += 3;
	} else if (!move && trailActive > 6) {
		trailActive -= 3;
	}

	// line.geometry.setPositions(trail.slice(0, trailActive));
	line.geometry.setPositions(trail);
	line.geometry.maxInstancedCount = trailActive / 3;
	// line.geometry.attributes.position.needsUpdate = true;
	// line.updateMatrix();
	// console.log(trailActive);
}

function playerShoot() {
	if (keyState[32]) {
		if (fireTime <= 0) {
			fireTime = fireRate;
			// shoot
			let xoff = 25;
			let yoff = 0;
			let zoff = 20;
			let size = 5;

			let shot1 = createShot(size, xoff, yoff, zoff);
			shot1.position.copy(player.position);
			shot1.rotation.y = player.rotation.y;
			scene.add(shot1);
			let shot2 = createShot(size, -xoff, yoff, zoff);
			shot2.position.copy(player.position);
			shot2.rotation.y = player.rotation.y;
			scene.add(shot2);

			let rad = -(Math.PI / 180) * playerRot;
			let dir = new THREE.Vector3(Math.sin(rad), 0, Math.cos(rad));

			let s1 = new Shot(shot1, dir, shotSpeed);
			let s2 = new Shot(shot2, dir, shotSpeed);
			shots.unshift(s1, s2);
		}
		// decrease time
		fireTime = Math.max(0, fireTime - delta);
	}
}

document.addEventListener('keydown', test);
function test(e) {
  	if (e.which == 84) {
		console.log('testing');
		console.log(player.position);
	}
}

function createShot(size, x, y, z) {
	let geom = new THREE.CylinderBufferGeometry(size, size, size * 3, 12);
	var mat = new THREE.MeshBasicMaterial({
		color: Colors.yellow,
		// flatShading: THREE.FlatShading,
		// shininess: 10,
	});
	let mesh = new THREE.Mesh(geom, mat);
	mesh.rotation.x = Math.PI / 2;
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;
	let pivot = new THREE.Object3D();
	pivot.add(mesh);
	return pivot;
}

// player
function createPlayer() {
	// load model
	loader.load( 'models/ship.glb', function ( model ) {
		player = model.scene;
		player.children[0].position.z = 8;
		player.children[0].position.y = -2;

		player.position.x = playerStart.x;
		player.position.z = playerStart.z;

		scene.add( player );
		let sc = playerScale;
		player.scale.x = sc;
		player.scale.y = sc;
		player.scale.z = sc;

		updateStars(true);
		updateAsteroids(true);
	
	}, undefined, function ( error ) {
		console.error( error );
	} );
}

// move player
function playerMove() {

	if (!player) return;

	let offset = new THREE.Vector3(0, 0, 0);
	let move = 0;
	let speedUp = (keyState[16] || mobileTurbo) ? playerRun : 1;
	let slowed = 1;
	if (gameSlowedTime > 0) {
		speedUp = 0.5;
		slowed = 4;
	}
	let tilted = false;
	let minVel = 1;
	// move
	if (keyState[87] || mobileEngine || mobileTurbo) {
		// up
		move += 1;
	};
	// rotate
	if (keyState[65] || mobileLeft) {
		// left
		let m = (playerTilt > 0) ? 5 : 1;
		playerTilt = Math.max(playerTilt - playerTiltSpeed * m, -playerTiltMax);
		if (playerVelocity > minVel) playerRot -= playerRotSpeed;
		// playerRot -= playerRotSpeed;
		tilted = true;
	};
	if (keyState[68] || mobileRight) {
		// right
		let m = (playerTilt < 0) ? 5 : 1;
		playerTilt = Math.min(playerTilt + playerTiltSpeed * m, playerTiltMax);
		if (playerVelocity > minVel) playerRot += playerRotSpeed;
		// playerRot += playerRotSpeed;
		tilted = true;
	};
	
	// apply rotation
	playerRot = (playerRot + 360) % 360;
	let rad = -(Math.PI / 180) * playerRot;
	player.rotation.y = rad;
	// change velocity
	if (move == 1 && playerVelocity < playerMaxSpeed * speedUp) {
		playerVelocity = Math.min(playerVelocity + playerSpeed * speedUp * speedUp, playerMaxSpeed * speedUp);
	} else {
		playerVelocity = Math.max(playerVelocity -= playerDrag * slowed, 0);
	}
	// apply position
	player.position.x += Math.sin(rad) * playerVelocity;
	player.position.z += Math.cos(rad) * playerVelocity;
	// tilt
	if (!tilted) {
		if (playerTilt > 0) {
			playerTilt = Math.max(playerTilt - playerTiltBack, 0);
		} else {
			playerTilt = Math.min(playerTilt + playerTiltBack, 0);
		}
	}
	let tilt = (Math.PI / 180) * playerTilt;
	player.rotation.z = tilt;
	// trail size
	if (speedUp > 1 && move == 1) {
		matLine.linewidth = (trailWidth / 1000) * HEIGHT * 1.5;
	} else {
		matLine.linewidth = (trailWidth / 1000) * HEIGHT;
	}
	// player glide
	let y = player.position.y;
	player.position.y += playerGlideSpeed * playerGlideDir;
	if (playerGlideDir > 0 && y > playerGlideMax || playerGlideDir < 0 && y < -playerGlideMax) {
		playerGlideDir *= -1;
	}
};

function cameraMove() {

	if (!player) return;

	let start = new THREE.Vector3();
	let target = new THREE.Vector3();
	let dir = new THREE.Vector3();

	// target.copy(player.position);
	// target.x += camOffset.x; // diag
	// target.z += camOffset.z; // diag
	// start.copy(camera.position);
	// start.y = target.y;

	// let dist = start.distanceTo(target);
	// let speedUp = keyState[16];
	// let speed = camSpeed;

	// // camera.position.x = target.x;
	// // camera.position.z = target.z;

	// if (!speedUp)
	// 	speed = Math.max(camSpeed, (dist / camAreaNormal) * playerVelocity);
	// else 
	// 	speed = Math.max(camSpeed, (dist / camAreaSpeed) * playerVelocity);

	// if (dist < speed) {
	// 	camera.position.x = target.x;
	// 	camera.position.z = target.z;
	// } else {
	// 	dir.copy(target);
	// 	dir.sub(start);
	// 	dir.normalize();
	// 	dir.multiplyScalar(speed);
	// 	camera.position.add(dir);
	// }

	// camera.lookAt(player.position);

	target = player.position;
	//console.log(target);
	//start = camera.position;
	// start.y = 0;
	camera.position.x = target.x + camOffset.x;
	camera.position.y = target.y + camOffset.y;
	camera.position.z = target.z + camOffset.z;
	camera.lookAt(player.position);

}

function moveShots() {
	if (shots.length > shotMax) {
		for (let i = shotMax; i < shots.length; i++) {
			scene.remove(shots[i].model);
		}
		shots.length = shotMax;
	}
	for (let i = 0; i < shots.length; i++) {
		shots[i].move();
	}
}

function createMap() {
	// center
	mapPoints.push(mapPoint('mapCenter', mapLocPlanets));
	mapPoints.push(mapPoint('mapRace', mapLocRace));
	mapPoints.push(mapPoint('mapSchool', mapLocSchool));
	mapPoints.push(mapPoint('mapWork', mapLocWork));
	mapPoints.push(mapPoint('mapGame', mapLocGames));

	// links
	let links = document.getElementsByClassName("link");
	for (let i = 0; i < links.length; i++) {
		let ii = i;
		links[i].addEventListener("click", () => {
			travelToLocation(ii - 1);
		});
	}
}

function mapPoint(domName, loc) {
	let mapPoint = new THREE.Object3D();
	mapPoint.position.x = loc.x;
	mapPoint.position.y = loc.y;
	mapPoint.position.z = loc.z;
	let domElem = document.getElementById(domName);
	scene.add(mapPoint);
	return {point: mapPoint, dom: domElem};
}

function updateMap() {
	let pad = 31;
	for (let i = 0; i < mapPoints.length; i++) {
		let pos = toScreenPosition(mapPoints[i].point, camera);
		// fix if out 
		if (pos.x < pad) pos.x = pad;
		if (pos.x > WIDTH - pad) pos.x = WIDTH - pad;
		if (pos.y < pad) pos.y = pad;
		if (pos.y > HEIGHT - pad) pos.y = HEIGHT - pad;
		pos.x += 0.02;
		pos.y += 0.02;
		mapPoints[i].dom.style.transform = "translate(" + pos.x + "px," + pos.y + "px)";
	}

	// let pos = toScreenPosition(mapCenter, camera);
	// // fix if out 
	// let pad = 31;
	// if (pos.x < pad) pos.x = pad;
	// if (pos.x > WIDTH - pad) pos.x = WIDTH - pad;
	// if (pos.y < pad) pos.y = pad;
	// if (pos.y > HEIGHT - pad) pos.y = HEIGHT - pad;

	// pos.x += 0.02;
	// pos.y += 0.02;

	// mapCenterEl.style.color = "red";
	// mapCenterEl.style.transform = "translate(" + pos.x + "px," + pos.y + "px)";
}

function travelToLocation(index) {
	playerVelocity = 0

	if (index == -1) {
		// start position
		player.position.x = playerStart.x;
		player.position.y = playerStart.y;
		player.position.z = playerStart.z;
	}
	else {
		player.position.x = mapPoints[index].point.position.x;
		player.position.y = mapPoints[index].point.position.y;
		player.position.z = mapPoints[index].point.position.z;
		player.position.add(portalOffset);
	}
	trailActive = 12;

	// hide menu
	portalsVisible = !portalsVisible;
	let links = document.getElementById('menu');
	links.style.opacity = "0";
	links.style.visibility = "hidden";

	// update based on player position
	updateStars(true);
	updateAsteroids(true);

}

// rings
function createRingGame() {
	// geometry
	let geometry = new THREE.TorusBufferGeometry( 100, 12, 6, 10 );
	let material = new THREE.MeshPhongMaterial({
		color: 0xffff00,
		flatShading: THREE.FlatShading,
		shininess: 10,
	});
	gameRing = new THREE.Mesh( geometry, material );
	// arrow
	geometry = new THREE.ConeBufferGeometry(30, 60, 10);
	let arr = new THREE.Mesh( geometry, material );
	arr.rotation.x = Math.PI / 2;
	arr.position.z = 100;
	gameRing.add(arr);

	// position first
	gameRing.position.x = mapPoints[1].point.position.x;
	gameRing.position.z = mapPoints[1].point.position.z;

	// position next
	let angle = (Math.PI / 180) * getRandom(0, 359);
	gameNext.x = gameRing.position.x + Math.sin(angle) * gameNextDistance;
	gameNext.z = gameRing.position.z + Math.cos(angle) * gameNextDistance;
	

	// rotate first
	let x = gameNext.x - gameRing.position.x;
	let y = gameNext.z - gameRing.position.z;
	let rot = Math.atan2(x, y);
	gameRing.rotation.y = rot;

	// update map
	mapPoints[1].point.position.x = gameRing.position.x;
	mapPoints[1].point.position.z = gameRing.position.z;
	scene.add(gameRing);

	// find elements
	gameScoreEl = document.getElementById("gameRaceScore");
	gameTimeEl = document.getElementById("gameRaceTime");
	gameOverEl = document.getElementById("gameOver");
	gameInfoEl = document.getElementById("gameRace");
}

function ringUpdate() {
	if (!player) return;
	gameTime = Math.max(0, gameTime - delta);

	if (gameTime == 0 && gameStarted) {
		gameInfoEl.classList.add("hide");
		gameOverEl.innerHTML = "GAME OVER <span>" + gameScore + "</span>";
		gameOverEl.classList.remove("hide");
		// gameOver
		setTimeout(() => {
			// reset
			gameOverEl.classList.add("hide");
			gameStarted = false;
			gameScore = 0;
		}, 3000);
	}

	if (gameTime > 0) {
		gameTimeEl.innerHTML = Math.round(gameTime);
	}

	// check if player collected ring
	if (gameRing.position.distanceTo(player.position) < 120) {
		// update ring
		gameRing.position.x = gameNext.x;
		gameRing.position.z = gameNext.z;

		// calc next
		let angle = 0;
		while (true) {
			angle = (Math.PI / 180) * getRandom(0, 359);
			gameNext.x += Math.sin(angle) * gameNextDistance;
			gameNext.z += Math.cos(angle) * gameNextDistance;
			
			if (gameNext.x < mapLocRace.x + gameSpace &&
				gameNext.x > mapLocRace.x - gameSpace &&
				gameNext.z < mapLocRace.z + gameSpace &&
				gameNext.z > mapLocRace.z - gameSpace) {
					break;
			} else {
				gameNext.x -= Math.sin(angle) * gameNextDistance;
				gameNext.z -= Math.cos(angle) * gameNextDistance;
			}
		}

		// rotate first
		let x = gameNext.x - gameRing.position.x;
		let y = gameNext.z - gameRing.position.z;
		let rot = Math.atan2(x, y);
		gameRing.rotation.y = rot;

		// update map
		mapPoints[1].point.position.x = gameRing.position.x;
		mapPoints[1].point.position.z = gameRing.position.z;


		// scored
		
		if (!gameStarted) {
			gameStarted = true;
			gameTime = 5;
			gameScore = 0;
			gameInfoEl.classList.remove("hide");
		} else {
			gameScore++;
		}

		gameTime += gameTimeExtra;
		gameScoreEl.innerHTML = gameScore;
	}
}

// black holes
function createHoles(size) {
	let beginX = mapLocRace.x - gameSpace;
	let endX = mapLocRace.x + gameSpace;
	let beginZ = mapLocRace.z - gameSpace;
	let endZ = mapLocRace.z + gameSpace;
	for (let i = 0; i < size; i++) {
		let r = getRandom(70, 150);
		let a = asteroid(r);
		a.position.x = getRandom(beginX, endX);
		a.position.z = getRandom(beginZ, endZ);
		gameHoles.push(a);
		gameHolesSizes.push(r);
		scene.add(a);
	}
}

function holesCollision() {
	if (!player) return;
	gameSlowedTime = Math.max(0, gameSlowedTime - delta);
	if (gameSlowedTime > 0) return;

	for (let i = 0; i < gameHoles.length; i++) {
		if (player.position.distanceTo(gameHoles[i].position) < gameHolesSizes[i]) {
			gameSlowedTime = 0.5;
			break;
		}
	}
}

// asteroids
function createAsteroids(size) {
	for (let i = 0; i < size; i++) {
		let a = asteroid(getRandom(10, 30));
		a.position.x = getRandom(-asteroidsDistance, asteroidsDistance);
		a.position.z = getRandom(-asteroidsDistance, asteroidsDistance);
		asteroids.push(a);
		scene.add(a);
	}
}

function updateAsteroids(teleport = false) {
	if (!player) return;
	let px = player.position.x;
	let pz = player.position.z;
	let dist = 0;
	let angle = 0;
	let offset = (asteroidsDistance / 2);

	for (let i = 0; i < asteroids.length; i++) {
		let a = asteroids[i];
		if (teleport) {
			angle = (Math.PI / 180) * getRandom(0, 359);
			dist = asteroidsDistance;
			dist = dist * Math.sqrt(getRandom(0, 1));
			a.position.x = px + Math.sin(angle) * dist;
			a.position.z = pz + Math.cos(angle) * dist;
			a.position.y = getRandom(-450, -20);
		} else if (a.position.distanceTo(player.position) > asteroidsDistance) {
			angle = (Math.PI / 180) * getRandom(0, 359);
			dist = offset + getRandom(0, asteroidsDistance - offset);
			a.position.x = px + Math.sin(angle) * dist;
			a.position.z = pz + Math.cos(angle) * dist;
			a.position.y = getRandom(-450, -20);
		}
	}
}

function asteroid(size) {
	let geom;
	// random shape
	if (Math.random()>0.5)
		geom = new THREE.IcosahedronGeometry(size, 0);
	else 
		geom = new THREE.OctahedronGeometry(size, 1);

	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.gray,
		flatShading: THREE.FlatShading,
	});

	var mesh = new THREE.Mesh(geom, mat);

	return mesh;
}

// stars
function createStars(size) {
	let vertices = [];
	let colors = [];
	let color = new THREE.Color();

	for ( let i = 0; i < size; i ++ ) {
		let x = getRandom(-starsDistance, starsDistance);
		let y = getRandom(-1000, 0);
		//let y = 0;
		let z = getRandom(-starsDistance, starsDistance);
		vertices.push( x, y, z );

		color.setHSL( i / size, 1.0, 0.6 );
		colors.push( color.r, color.g, color.b );
		//colors.push(0, 255, 255);
	}

	let geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3));
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute(colors, 3));

	let material = new THREE.PointsMaterial( { vertexColors: true, size:15 } );
	let points = new THREE.Points( geometry, material );
	points.geometry.attributes.position.needsUpdate = true;

	starsObj = points;
	starsObj.frustumCulled = false;

	scene.add( points );
}

function updateStars(teleport = false) {

	let stars = starsObj.geometry.attributes.position.array;

	if (!player) return;
	let px = player.position.x;
	let pz = player.position.z;
	let dist = 0;
	let angle = 0;
	let offset = (starsDistance / 2);

	for (let i = 0; i < stars.length; i+=3) {
		let v = new THREE.Vector3( stars[i], 0, stars[i+2] );

		if (teleport) {
			angle = (Math.PI / 180) * getRandom(0, 359);
			dist = starsDistance * Math.sqrt(getRandom(0, 1));
			stars[i] = px + Math.sin(angle) * dist;
			stars[i+2] = pz + Math.cos(angle) * dist;
		} else if (v.distanceTo(player.position) > starsDistance) {
			angle = (Math.PI / 180) * getRandom(0, 359);
			dist = offset + getRandom(0, starsDistance - offset);
			stars[i] = px + Math.sin(angle) * dist;
			stars[i+2] = pz + Math.cos(angle) * dist;
		}
	}

	starsObj.geometry.attributes.position.needsUpdate = true;
}

// scene and renderer
function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera 
	// and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene
	scene = new THREE.Scene();

	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	// scene.fog = new THREE.Fog(Colors.sky, 100, 950);

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);

	// Set the position of the camera
	// camera.position.x = 0;
	// camera.position.z = 2500;
	// camera.position.y = 3500;
	//camera.position.y = 2500;
	//camera.position.z = 2500;
	camera.position.y = camOffset.y;
	camera.position.x = playerStart.x;
	camera.position.z = playerStart.z;
	// camera.position.x = camOffset; // diag
	// camera.position.z = camOffset; // diag

	camera.lookAt(playerStart.x, 0, playerStart.z);

	// Create the renderer
	renderer = new THREE.WebGLRenderer({
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true,

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true
	});

	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);

	// Enable shadow rendering
	//renderer.shadowMap.enabled = true;

	// Add the DOM element of the renderer to the 
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	
	// interactions
	canvas = renderer.domElement;

	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

// fix window size on resize
function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
	// update trail
	matLine.resolution.set(WIDTH, HEIGHT);
	matLine.linewidth = (trailWidth / 1000) * HEIGHT;
}

// show fps
function createStats() {
	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.getElementById('world').appendChild( stats.dom );
}

// lights
function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x666666, .9)

	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);

	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);
	scene.add(shadowLight);
}

//planet
var PlanetMesh = function (planetSize, color) {

	// create the geometry (shape) of the planet;
	var geom = new THREE.IcosahedronGeometry(planetSize, 1);
	//geom = new THREE.OctahedronGeometry(planetSize, 2);

	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color: color,
		flatShading: THREE.FlatShading,
		shininess: 10,
	});

	// To create an object in Three.js, we have to create a mesh 
	// which is a combination of a geometry and some material
	this.mesh = new THREE.Mesh(geom, mat);

	// Allow the planet to receive shadows
	this.mesh.receiveShadow = true;
}

// Instantiate planes
function createPlanets() {

	for (let i = 0; i < planets.length; i++) {
		// create 
		var size = planets[i].size;
		planets[i].mesh = new PlanetMesh(size, planets[i].color).mesh;
		planets[i].mesh.position.x = -planets[i].dist;

		// add pivot
		var pivot = new THREE.Object3D();
		pivot.add(planets[i].mesh);
		planets[i].pivot = pivot;

		// start position
		planets[i].pivot.rotation.y = (2 * Math.PI) * Math.random();

		// add path
		var path = createPath(planets[i].dist);

		// add title of planet
		var text = createText(planets[i].name);
		text.position.x = -planets[i].dist;
		titles.push(text);
		scene.add(text);

		// add to scene
		scene.add(planets[i].pivot);
		scene.add(path);
	}

}

// Rotate planets around sun and its axis
function rotatePlanets() {

	for (let i = 0; i < planets.length; i++) {
		// around sun
		planets[i].pivot.rotation.y += planets[i].speed / 2;

		// around self
		planets[i].mesh.rotation.y += 0.01;
		
	}

}

// Cirle path of planets
function createPath(radius) {
	var curve = new THREE.EllipseCurve(
		0, 0, // ax, aY
		radius, radius, // xRadius, yRadius
		0, 2 * Math.PI, // aStartAngle, aEndAngle
		false, // aClockwise
		0 // aRotation
	);

	var points = curve.getPoints(100);
	var geometry = new THREE.BufferGeometry().setFromPoints(points);

	var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
		color: Colors.white,
		transparent: true,
		linewidth: 1,
		opacity: 0.3
	}));

	line.rotation.x = Math.PI / 2;

	return line;

}

// Rocks Area
function createRocks(start, width) {
	var startLine = start;
	var finishLine = start + width;
	var rocksNum = 300;
	var size = 8;

	// create rocks 
	for (var i = 0; i < rocksNum; i++) {
		// random position
		var rock = rockMesh(size);
		rock.position.x = -getRandom(startLine, finishLine);
		rock.position.y = -getRandom(-20, 20);
		rock.rotation.x = (2 * Math.PI) * Math.random();
		rock.rotation.y = (2 * Math.PI) * Math.random();
		
		// add pivot
		var pivot = new THREE.Object3D();
		pivot.add(rock);
		pivot.rotation.y = (2 * Math.PI) * Math.random();

		scene.add(pivot);
	}
}

function rockMesh(size) {

	var geom;
	// random shape
	if (Math.random()>0.5)
		geom = new THREE.IcosahedronGeometry(size, 0);
	else 
		geom = new THREE.OctahedronGeometry(size, 1);

	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.gray,
		flatShading: THREE.FlatShading,
		// transparent: true,
		// opacity: 0.8,
	});

	var mesh = new THREE.Mesh(geom, mat);

	return mesh;
}

// Info
function createInfo(text, size = 70, bold = true, depth = false, w = 1024, h = 256, align = 'right') {
	// create canvas
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext('2d');
	canvas.width = w;
	canvas.height = h;
	
	// EDIT
	let style = (bold) ? 'bold ' : ' ';
	ctx.font = style + size + 'pt Kano';
	//ctx.fillStyle = 'red';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = align;
	// ctx.textBaseline = "middle";
	if (align == 'center')
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
	else if (align == 'right')
		ctx.fillText(text, canvas.width, canvas.height / 2);
	else
		ctx.fillText(text, 0, canvas.height / 2);
	
	// texture and geometry for text
	texture = new THREE.Texture(canvas);
	var material = new THREE.SpriteMaterial({ 
		map: texture, 
		color: 0xffffff,
		transparent: true,
		depthTest: depth,
		depthWrite: false,
		opacity: 0.9
	});
	texture.needsUpdate = true;
	// final mesh
	let sprite = new THREE.Sprite( material );
	sprite.scale.set(w / 2.5, h / 2.5, 1);
    return sprite;
}

// Rect
function createRect(w, h) {
	// create canvas
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext('2d');
	canvas.width = w;
	canvas.height = h;
	
	// back
	ctx.beginPath();
	ctx.lineWidth = "0";
	ctx.fillStyle = "#ffffff11";
	ctx.rect(0, 0, w, h);
	ctx.fill();

	// border
	ctx.beginPath();
	ctx.lineWidth = "10";
	ctx.strokeStyle = "white";
	ctx.rect(0, 0, w, h);
	ctx.stroke();

	// texture and geometry for text
	texture = new THREE.Texture(canvas);
	var material = new THREE.SpriteMaterial({ 
		map: texture, 
		color: 0xffffff,
		transparent: true,
		opacity: 0.6
	});
	material.depthTest = false;
	texture.needsUpdate = true;
	// final mesh
	let sprite = new THREE.Sprite( material );
	sprite.scale.set(w / 1, h / 1, 1);
    return sprite;
}

// Title of planet
function createText(text) {
	// create canvas
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext('2d');
	canvas.width = 1024;
	canvas.height = 256;
	changeCanvas(text, ctx, canvas);
	
	// texture and geometry for text
	texture = new THREE.Texture(canvas);
	var material = new THREE.SpriteMaterial({ 
		map: texture, 
		color: 0xffffff,
		transparent: true,
		opacity: 0.9
	});
	material.depthTest = false;
	texture.needsUpdate = true;
	// final mesh
	let sprite = new THREE.Sprite( material );
	sprite.scale.set(400 / 2,100 / 2,1);
    return sprite;
}

function changeCanvas(text, ctx, canvas) {
    ctx.font = 'bolder 130pt Kano';
	// ctx.fillStyle = 'red';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = "right";
    // ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width, canvas.height / 2);
}

function positionText() {
	for (let i = 0; i < titles.length; i++) {
		// next to planet
		titles[i].position.setFromMatrixPosition(planets[i].mesh.matrixWorld);
		// offset 
		titles[i].position.x += 100;
		titles[i].position.y += 50;
	}
}

// games
function createGames() {
	let loc = mapLocGames;
	//loc = playerStart;
	let x = loc.x + 600;
	let y = loc.y - 50;
	let z = loc.z;

	let imgList = [
		{name: 'ROLLER', image: 'game7.png', link: '/games/roller', done: true},
		{name: 'RACER', image: 'game6.png', link: '#', done: false},
		{name: 'TOWER', image: 'game0.png', link: '#', done: false},
		{name: 'UNITS', image: 'game5.png', link: '#', done: false},
		{name: 'HEROES', image: 'game4.png', link: '#', done: false},
		{name: 'RUNNER', image: 'game1.png', link: '#', done: false},
	];

	for (let i = 0; i < imgList.length; i++) {
		createBilboard(x, y, z, imgList[i].image);
		createGameText(x, y, z, imgList[i].name, imgList[i].link, imgList[i].done);
		x += 100;
		z += 350;
	}
}

function createBilboard(x, y, z, image) {
	let rtd = (3.14 / 180);

	let pivot = new THREE.Object3D();
	//let rock = rockMesh(35);
	let rock = createBox(30, 30, 30, Colors.gray);
	//rock.position.y = -10;
	//rock.rotation.x = 30 * rtd;
	//pivot.add(rock);

	// board
	let width = 128 * 3.42;
	let height = 72 * 3.42;
	let depth = 30;
	let offset = 0;
	//let board = createBox(width, depth, height, Colors.gray);
	//board.position.z = -200;
	//pivot.add(board);
	
	// pin
	let pin1 = createBox(100, 10, 10, Colors.gray);
	pin1.position.x = - width / 2;
	pin1.position.z = -60;
	pin1.rotation.x = 45 * rtd;
	pivot.add(pin1);
	let pin2 = createBox(100, 10, 10, Colors.gray);
	pin2.position.x = - width / 2;
	pin2.position.z = 60;
	pin2.rotation.x = 45 * rtd;
	pivot.add(pin2);


	// borders
	let bSize = 10;

	let bR = createBox(bSize, bSize, height, Colors.gray);
	bR.position.x = width/2 - bSize /2;
	bR.position.z = offset;
	bR.position.y = depth / 2;
	pivot.add(bR);

	let bL = createBox(bSize, bSize, height, Colors.gray);
	bL.position.x = -width/2 + bSize /2;
	bL.position.z = offset;
	bL.position.y = depth / 2;
	pivot.add(bL);

	let bT = createBox(width, bSize, bSize, Colors.gray);
	bT.position.z = offset - height/2 + bSize /2;;
	bT.position.y = depth / 2;
	pivot.add(bT);

	let bB = createBox(width, bSize, bSize, Colors.gray);
	bB.position.z = offset + height/2 - bSize /2;;
	bB.position.y = depth / 2;
	pivot.add(bB);
	
	// image
	let geometry = new THREE.PlaneGeometry(width - bSize * 2, height - bSize * 2, 1, 1);
	let texture = texLoader.load('images/' + image, undefined, undefined, undefined);
	// texture.minFilter = THREE.LinearFilter;

	let material = new THREE.MeshBasicMaterial({map: texture});
	//let material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );

	let poster = new THREE.Mesh(geometry, material);
	poster.position.z = offset;
	poster.position.y = 10;
	poster.rotation.x = 90 * rtd;
	poster.rotation.y = 180 * rtd;
	poster.rotation.z = 180 * rtd;
	pivot.add(poster);

	
	// pivot.rotation.x = 25 * rtd;
	// pivot.rotation.y = -25 * rtd;
	// pivot.rotation.z = 15 * rtd;
	pivot.position.x = x;
	pivot.position.y = y;
	pivot.position.z = z;

	scene.add(pivot);
}

function createGameText(x, y, z, text, link, done) {
	// text
	let s1 = "CLICK TO PLAY";
	let s2 = "COMING SOON";
	let s = done ? s1 : s2;
	let strings = [s, text];
	for (let i = 0; i < strings.length; i++) {
		let text = createInfo(strings[i], (i+1) * 38, i == 1, false, 1024, 1024, 'center');
		text.position.x = x + -390;
		text.position.y = y + 0;
		text.position.z = z + i * 60 + -30;
		scene.add(text);
	}

	// link
	let rect = createRect(256, 256);
	rect.userData = { URL: link };
	rect.position.x = x - 390;
	rect.position.y = y;
	rect.position.z = z + 0;
	scene.add(rect);
	
	gameLinks.push(rect);
}

function createBox(width, height, depth, color) {
	let geometry = new THREE.BoxGeometry( width, height, depth );
	let material = new THREE.MeshPhongMaterial({
		color: color,
		flatShading: THREE.FlatShading,
	});
	let cube = new THREE.Mesh( geometry, material );
	return cube;
}

// interaction
function getCanvasRelativePosition(event) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left) * canvas.width  / rect.width,
		y: (event.clientY - rect.top ) * canvas.height / rect.height,
	};
}

function setPickPosition(event) {
	const pos = getCanvasRelativePosition(event);
	pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
	pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
	//console.log(pickPosition);

	// prevent click when flying
	if (!mobileLeft && !mobileRight && !mobileEngine && !mobileTurbo) {
		pick(pickPosition, scene, camera);
	}
}

function pick(normalizedPosition, scene, camera) {
	let raycaster = new THREE.Raycaster();

	// cast a ray through the frustum
	raycaster.setFromCamera(normalizedPosition, camera);
	// get the list of objects the ray intersected
	const intersectedObjects = raycaster.intersectObjects(gameLinks);
	//console.log(gameLinks);
	if (intersectedObjects.length) {
		// pick the first object. It's the closest one
		let pickedObject = intersectedObjects[0].object;
		// save its color
		//console.log(pickedObject);
		if (pickedObject && !portalsVisible) {
			//console.log("PAGE " + pickedObject.userData.URL);
			window.location = pickedObject.userData.URL;
		}
		//pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
		// set its emissive color to flashing red/yellow
		//pickedObject.material.emissive.setHex((100 * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
	}
}

//touchstart
window.addEventListener('click', setPickPosition);

// Helper functions
function getRandom(min, max) {
	return Math.random() * (max - min) + min;
}

function toScreenPosition(obj, cam)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.getContext().canvas.width;
    var heightHalf = 0.5*renderer.getContext().canvas.height;

    obj.updateMatrixWorld();
	vector.setFromMatrixPosition(obj.matrixWorld);
	vector.project(cam);
	
	// invert if behind
	if (vector.z >= 1) {
		vector.x = -vector.x;
		vector.y = -vector.y;
	}

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x / window.devicePixelRatio,
        y: vector.y / window.devicePixelRatio
    };
};