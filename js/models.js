import * as THREE from './three.module.js';
import { GLTFLoader }  from './GLTFLoader.js';
import { GeometryUtils } from './GeometryUtils.js';
import { Line2 } from './Line2.js';
import { LineMaterial } from './LineMaterial.js';
import { LineGeometry } from './LineGeometry.js';


// scene elements
var scene,
	camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
	renderer, container;

var loader = new GLTFLoader();
var clock = new THREE.Clock(true);

var camPos = new THREE.Vector3(0, 0, 0);
var camSpeed = 3;
var camOffset = 200;
var camAreaNormal = 50;
var camAreaSpeed = 100;

var player;
var playerVelocity = 0;
var playerMaxSpeed = 5;
var playerDrag = 0.1;
var playerSpeed = 0.3;
var playerRun = 2;
var playerRot = 0;
var playerGlideMax = 1;
var playerGlideSpeed = 0.03;
var playerGlideDir = 1;

var playerTilt = 0;
var playerTiltMax = 45;
var playerTiltBack = 3;
var playerTiltSpeed = 2;
var playerRotSpeed = 3;

var fireRate = 0.2;
var fireTime = 0;
var shotSpeed = 4;
var shotMax = 50;

// lines
var trail = [];
var trailSize = 300;
var trailActive = 12;

var line;
var matLine;

// controls
var keyState = {};    
window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);    
window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);

// light elements
var hemisphereLight, shadowLight;

// planet objects
var planets = [];

// fps
var stats;

// canvas with planet names
var ctx;
var texture;
var canvas;
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

	// var p0 = new Planet("Sun", 0, 0, 180, Colors.yellow);
	var p1 = new Planet("Mercury", 260, (2 * Math.PI) / 158, 30, Colors.orange);
	var p2 = new Planet("Venus", 350, (2 * Math.PI) / 225, 40, Colors.lightbrown);
	var p3 = new Planet("Earth", 440, (2 * Math.PI) / 365, 45, Colors.green);
	var p4 = new Planet("Mars", 540, (2 * Math.PI) / 687, 35, Colors.red);
	var p5 = new Planet("Jupiter", 880, (2 * Math.PI) / 3000, 90, Colors.lightred);
	var p6 = new Planet("Saturn", 1120, (2 * Math.PI) / 4000, 80, Colors.skin);
	var p7 = new Planet("Uranus", 1260, (2 * Math.PI) / 6000, 70, Colors.violet);
	var p8 = new Planet("Neptune", 1460, (2 * Math.PI) / 8000, 65, Colors.blue);
	var p9 = new Planet("Pluto", 1600, (2 * Math.PI) / 10000, 30, Colors.brown);

	// planets.push(p0);
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

	// // create fps stats
	createStats();

	// // add lights
	createLights();

	// // initiate planets
	initPlanets();

	// // add planents to scene
	createPlanets();

	// // add rocks
	createRocks(620, 140);

	// add player
	createPlayer();

	// create lines
	createLines();

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


// render scene
function loop() {
	// next frame
	requestAnimationFrame(loop);

	stats.begin();
	// // monitored code goes here

	playerMove();
	cameraMove();
	updateTrail();
	playerShoot();

	// bullets
	moveShots();

	// // rotate planets
	rotatePlanets();

	// // position text
	positionText();

	// // render the scene
	
	// move player

	// // end stats
	stats.end();
	
	// call the loop function again
	matLine.resolution.set( window.innerWidth, window.innerHeight );
	renderer.render(scene, camera);
}

function createLines() {

	trail = new Float32Array( trailSize * 3 );
	// trail.push(0, 0, 0, 0, 0, 0);

	// for (let i = 0; i < trailSize * 3; i++) {
	// 	if (i % 3 == 0) {
	// 		trail[i] = 1000;
	// 	}
	// }
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

	console.log(line);
}

function updateTrail() {

	if (!player) return;

	let move = keyState[87];

	if (playerVelocity > 0) {
		for (let i = trailSize * 3 - 1; i > 2; i--) {
			trail[i] = trail[i - 3];
		}
		trail[0] = player.position.x;
		trail[1] = player.position.y;
		trail[2] = player.position.z;
	}

	if (move && trailActive < trailSize * 3) {
		trailActive += 3;
	} else if (!move && trailActive > 3) {
		trailActive -= 3;
	}

	line.geometry.setPositions(trail.slice(0, trailActive));

	// console.log(size);
}

function playerShoot() {
	if (keyState[32]) {
		if (fireTime <= 0) {
			fireTime = fireRate;
			// shoot
			let xoff = 10;
			let yoff = 0;
			let zoff = 20;
			let size = 2;

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
		fireTime = Math.max(0, fireTime - clock.getDelta());
	}
}

document.addEventListener('keydown', logKey);
function logKey(e) {
  	if (e.which == 84) {
		console.log('tetsing');
		console.log(line.geometry.attributes.position);
		console.log(trail);
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

		scene.add( player );
		let sc = 1.5;
		player.scale.x = sc;
		player.scale.y = sc;
		player.scale.z = sc;
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );
}

// move player
function playerMove() {

	if (!player) return;

	let offset = new THREE.Vector3(0, 0, 0);
	let move = 0;
	let speedUp = keyState[16] ? playerRun : 1;
	let tilted = false;
	// move
	if (keyState[87]) {
		// up
		move += 1;
	};
	if (keyState[83]) {
		// down
		move -= 1;
	};
	// rotate
	if (keyState[65]) {
		// left
		let m = (playerTilt > 0) ? 5 : 1;
		playerTilt = Math.max(playerTilt - playerTiltSpeed * m, -playerTiltMax);
		if (playerVelocity != 0) playerRot -= playerRotSpeed;
		// playerRot -= playerRotSpeed;
		tilted = true;
	};
	if (keyState[68]) {
		// right
		let m = (playerTilt < 0) ? 5 : 1;
		playerTilt = Math.min(playerTilt + playerTiltSpeed * m, playerTiltMax);
		if (playerVelocity != 0) playerRot += playerRotSpeed;
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
		playerVelocity = Math.max(playerVelocity -= playerDrag, 0);
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
		matLine.linewidth = (10 / 1000) * HEIGHT * 1.5;
	} else {
		matLine.linewidth = (10 / 1000) * HEIGHT;
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

	target.copy(player.position);
	target.x += camOffset;
	target.z += camOffset;
	start.copy(camera.position);
	start.y = target.y;

	let dist = start.distanceTo(target);
	let speedUp = keyState[16];
	let speed = camSpeed;

	// camera.position.x = target.x;
	// camera.position.z = target.z;

	if (!speedUp)
		speed = Math.max(camSpeed, (dist / camAreaNormal) * playerVelocity);
	else 
		speed = Math.max(camSpeed, (dist / camAreaSpeed) * playerVelocity);

	if (dist < speed) {
		camera.position.x = target.x;
		camera.position.z = target.z;
	} else {
		dir.copy(target);
		dir.sub(start);
		dir.normalize();
		dir.multiplyScalar(speed);
		camera.position.add(dir);
	}

	//target = player.position;
	//console.log(target);
	//start = camera.position;
	// start.y = 0;
	//camera.position.x = target.x;
	//camera.position.z = target.z;

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
	camera.position.y = camOffset;
	camera.position.x = camOffset;
	camera.position.z = camOffset;

	camera.lookAt(0, 0, 0);

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
	renderer.setSize(WIDTH, HEIGHT);

	// Enable shadow rendering
	//renderer.shadowMap.enabled = true;

	// Add the DOM element of the renderer to the 
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

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
	matLine.linewidth = (10 / 1000) * HEIGHT;
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
		linewidth: 5,
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

// Title of planet
function createText(text) {
	// create canvas
	canvas = document.createElement("canvas");
	ctx = canvas.getContext('2d');
	canvas.width = 1024;
	canvas.height = 256;
	changeCanvas(text);
	
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
	sprite.scale.set(400,100,1);
    return sprite;
}

function changeCanvas(text) {
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

// random min max
function getRandom(min, max) {
	return Math.random() * (max - min) + min;
}