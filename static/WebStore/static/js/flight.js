//canvas
var canvas;
var context;
var colorArr = ["rgba(255, 0, 132, 1)", "rgba(255, 0, 132, 1)", "rgba(255, 0, 132, 1)"];
var mouseX = 100;
var mouseY = 270;
var mouseR;
//var prevmouseX;
//var prevmouseY;

//
var canvasInterval;
var canvasIntervalTime = 50;
var canvasBgColor = "rgba(35, 45, 55, 1)";

//ad elements
var container;
var gameStart;
var gamePlay;
var gameEnd;
var livesDisplay;
var pointsDisplay;
var finalPointsDisplay;
var bestScoreDisplay;
//
var dclk;

//
var enemyArr = new Array();
var spawnRate = 300;
var spawnInterval;
var enemyCounter = 0;

var points = 0;

//
var betaVal;
var gammaVal;

function init() {

	prepAd();
	prepCanvas();
	//startRenderCanvas();

}

function prepCanvas() {

	//reference
	canvas = document.getElementById("canvasbg");
	context = canvas.getContext("2d");
	
	//set background
	//context.clearRect(0, 0, 800, 450);
	context.fillStyle = canvasBgColor;
	context.fillRect(0, 0, 800, 450);
	
	
}

function enableMouse() {
	canvas.onmousemove = updateMouse;
	//container.onclick = updateMouse;
}
function disableMouse() {
	canvas.onmousemove = null;
	//container.onclick = null;
}

function updateMouse(e) {
	
	e.preventDefault();
	
	/*
	prevmouseX = mouseX;
	prevmouseY = mouseY;
	*/
	
	mouseX = e.pageX - getElementPosition("canvasbg").left;
	mouseY = e.pageY - getElementPosition("canvasbg").top;
	
	/*
	var xdiff = mouseX - prevmouseX;
	var ydiff = mouseY- prevmouseY;
	
	mouseR = Math.sqrt((xdiff * xdiff) + (ydiff * ydiff));
	*/

}

//find absolute position of element
function getElementPosition(elemID){
	var offsetTrail = document.getElementById(elemID);
	var offsetLeft = 0;
	var offsetTop = 0;
	while (offsetTrail){
		offsetLeft += offsetTrail.offsetLeft;
		offsetTop += offsetTrail.offsetTop;
		offsetTrail = offsetTrail.offsetParent;
	}
	if (navigator.userAgent.indexOf('Mac') != -1 && typeof document.body.leftMargin != 'undefined'){
		offsetLeft += document.body.leftMargin;
		offsetTop += document.body.topMargin;
	}
	return {left:offsetLeft,top:offsetTop};
}


function startRenderCanvas() {
	canvasInterval = setInterval(renderCanvas, canvasIntervalTime);
}
function stopRenderCanvas() {
	clearInterval(canvasInterval);
}
function renderCanvas() {
	
	//clear the background
	context.fillStyle = canvasBgColor;
	context.fillRect(0, 0, 800, 450);
	
	//update the hero position
	dclk.update();
	
	//draw the hero
	dclk.draw();
	
	//draw the enemies (they updating the xpos automatically with the Tween object)
	for (var e in enemyArr) {
		
		//draw the enemies (they updating the xpos automatically with the Tween object)
		enemyArr[e].draw();
		
		//check the collision with Hero shield
		if (withinShield(enemyArr[e])) {
			//check to see if it's within the hole
			if (withinHole(enemyArr[e])) {
				//check to see if the collision with the Hero core
				if (withinCore(enemyArr[e])) {
					
					//add points
					points += enemyArr[e].r*enemyArr[e].speed;
					
					//remove enemy
					enemyArr[e].destroy();
					
					//updateDisplay
					updateDisplay();
					
					//flash the core!
					context.fillStyle = "rgba(255, 255, 255, 1)";
					context.beginPath();
					context.arc(dclk.xpos, dclk.ypos, dclk.coreRadius+16, 0, Math.PI*2, true);
					context.closePath();
					context.fill();
					
				}
			} else {
				
				//explosion
				explosion(enemyArr[e].xpos, enemyArr[e].ypos, enemyArr[e].c);
				//remove enemy
				enemyArr[e].destroy();
				
				//deduct lives
				dclk.deductLife();
				
				//updateDisplay
				updateDisplay();
				
				//flash the shield!
				context.strokeStyle = "rgba(255, 255, 255, 1)";
				context.beginPath();
				context.arc(dclk.xpos, dclk.ypos, dclk.shieldRadius, degToRads(-30), degToRads(30), true);
				context.stroke();
				context.closePath();
				
			}
		}
	}
	
}

function withinShield(e) {
	
	//check the distance (pythagaros)
	xdiff = e.xpos - dclk.xpos;
	ydiff = e.ypos - dclk.ypos;
	h = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
	
	//compare with the combined radius
	cr = dclk.shieldRadius + e.r;
	if (h <= cr) {
		return true;
	} else {
		return false;
	}
}
function withinHole(e) {

	if ((e.rUpper > dclk.holeUpper) && (e.rLower < dclk.holeLower)) {
		return true;
	} else {
		return false;
	}
	
}

function withinCore(e) {
	
	xdiff = e.xpos - dclk.xpos;
	ydiff = e.ypos - dclk.ypos;
	h = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
	
	//compare with the combined radius
	cr = dclk.coreRadius + e.r;
	if (h <= cr) {
		return true;
	} else {
		return false;
	}
	
}

function drawBall(x, y, r) {

	context.fillStyle = colorArr[Math.floor(Math.random()*colorArr.length)];
	context.beginPath();
	context.arc(x, y, r, 0, Math.PI*2, true);
	context.closePath();
	context.fill();

}

function hideGameStart() {
	gameStart.style.visibility = "hidden";
}
function showGameStart() {
	gameStart.style.visibility = "visible";
}
function hideGamePlay() {
	gamePlay.style.visibility = "hidden";
}
function showGamePlay() {
	gamePlay.style.visibility = "visible";
}
function hideGameEnd() {
	gameEnd.style.visibility = "hidden";
}
function showGameEnd() {
	gameEnd.style.visibility = "visible";
}

function playHandler(e) {
	
	//take over
	e.preventDefault();	
	
	//hideGameStart
	hideGameStart();
	
	//showGamePlay
	showGamePlay();
	
	//enableOrientation
	disableOrientation();
	enableMouse();
	
	//startGame
	startGame();

}

function playHandlerOrientation(e) {
	
	//take over
	e.preventDefault();	
	
	//hideGameStart
	hideGameStart();
	
	//showGamePlay
	showGamePlay();
	
	//enableOrientation
	enableOrientation();
	disableMouse();
	
	//startGame
	startGame();

}

function enableOrientation() {
	window.addEventListener("deviceorientation", captureOrientation, false);	
}
function captureOrientation(e) {

	betaVal = e.beta;
	gammaVal = e.gamma;
		
	mouseX += gammaVal;
	mouseY += betaVal;
		
	if (mouseX < 10) {
		mouseX = 10;
	} else if (mouseX > 950) {
		mouseX = 950;
	}
	if (mouseY < 10) {
		mouseY = 10;
	} else if (mouseY > 530) {
		mouseY = 530;
	}

}
function disableOrientation() {
	window.removeEventListener("deviceorientation", captureOrientation, false);
}

function startGame() {
	
	//create an instance of Hero
	dclk = new Hero();
	
	//start enemySpawnInterval
	startSpawn();
	
	//start rendering the canvas
	startRenderCanvas();

	//
	hideGameStart();
	hideGameEnd();
	showGamePlay();
	
	//reset points
	points = 0;
	
	//updateDisplay
	updateDisplay();
	
}

function startSpawn() {
	spawnInterval = setInterval(spawnEnemy, spawnRate);
}
function stopSpawn() {
	clearInterval(spawnInterval);
}
function spawnEnemy() {
	
	//instantiate enemy
	enemyArr["e" + enemyCounter] = new Enemy();
	enemyCounter++;
}

function prepAd() {
	
	//reference elements
	container = document.getElementById("container");
	
	gameStart = document.getElementById("game-start");
	gamePlay = document.getElementById("game-play");
	gameEnd = document.getElementById("game-end");
	
	livesDisplay = document.getElementById("lives-display");
	pointsDisplay = document.getElementById("points-display");
	finalPointsDisplay = document.getElementById("final-points-display");
	bestScoreDisplay = document.getElementById("best-score-display");
	
	play = document.getElementById("game-start-btn");
	playOrientation = document.getElementById("game-start-btn-orientation");
	replay = document.getElementById("game-restart-btn");
	replayOrientation = document.getElementById("game-restart-btn-orientation");
	quit = document.getElementById("quit-btn");
	
	//add clicks
	play.onclick = playHandler;
	playOrientation.onclick = playHandlerOrientation;
	replay.onclick = playHandler;
	replayOrientation.onclick = playHandlerOrientation;
	quit.onclick = quitGame;
	
	//show hide stuff
	showGameStart();
	hideGamePlay();
	hideGameEnd();
	
}

function quitGame(e) {
	
	e.preventDefault();
	
	//clear canvas
	context.fillStyle = canvasBgColor;
	context.fillRect(0, 0, 800, 450);
	
	
	endGame();
	showGameStart();
	hideGameEnd();
	
}

function Hero() {
	
	//this.shieldColors = ["rgba(0, 198, 255, 1)", "rgba(8, 226, 90, 1)", "rgba(245, 231, 0, 1)", "rgba(255, 72, 00, 1)"];
	this.shieldColors = ["rgba(0, 226, 240, 1)", "rgba(0, 226, 240, 1)", "rgba(0, 226, 240, 1)", "rgba(0, 226, 240, 1)"];
	this.totalLives = this.shieldColors.length;
	//this.shieldColors.reverse();
	this.currentLivesLeft = this.totalLives;
	this.xpos = 0;
	this.ypos = 0;
	this.speed = 4;
	this.shieldRadius = 20;
	this.coreRadius = 5;
	this.holeRadius = 10;
	this.holeUpper = this.ypos - this.holeRadius;
	this.holeLower = this.ypos + this.holeRadius;
	
	//
	context.lineWidth = 4;
	context.lineCap = "round";
	
}

Hero.prototype.update = function() {

	this.xpos += Math.floor((mouseX-this.xpos)/this.speed);
	this.ypos += Math.floor((mouseY-this.ypos)/this.speed);
	
	this.holeUpper = this.ypos - this.holeRadius;
	this.holeLower = this.ypos + this.holeRadius;
	
}

Hero.prototype.draw = function() {
	
	context.strokeStyle = this.shieldColors[this.currentLivesLeft-1];
	
	//shield
	context.beginPath();
	context.arc(this.xpos, this.ypos, this.shieldRadius, degToRads(-30), degToRads(30), true);
	
	context.stroke();
	context.closePath();
	
	//core
	context.fillStyle = "rgba(255, 255, 255, 0.2)"
	context.beginPath();
	context.arc(this.xpos, this.ypos, this.coreRadius, 0, Math.PI*2, true);
	context.closePath();
	context.fill();
	
	
}

Hero.prototype.deductLife = function() {
	
	//remove a life
	this.currentLivesLeft--;
	
	//check to see if we have died
	if (this.currentLivesLeft <= 0) {
		
		//
		endGame();
		
	}
	
}
function endGame() {
	
	//stop the enemySpawn
	stopSpawn();
	flushEnemyArr();
	
	//stop rendering canvas (this will also stop updates to hero)
	stopRenderCanvas();
	
	//make sure all displays are up to date
	updateDisplay();
	
	//store the score if we have beaten it
	if (points > localStorage.getItem("bestScore")) {
		localStorage.setItem("bestScore", points);
	}
	
	//switch interfaces
	hideGamePlay();
	showGameEnd();
	
}

function flushEnemyArr() {
	//clear away previous enemies
	for (var e in enemyArr) {
		enemyArr[e].t.stop();
		delete enemyArr[e];
	}
	enemyArr = [];
}

function degToRads(d) {
	return (d*Math.PI)/180;
}



function Enemy() {
	
	this.i = enemyCounter;
	this.r = Math.floor(Math.random()*10)+5;
	this.c = colorArr[Math.floor(Math.random()*colorArr.length)];
	this.xpos = 1000;
	this.ypos = Math.floor(Math.random() * 530) + 10;
	this.speed = Math.floor(Math.random() * 8) + 4;
	this.rUpper = this.ypos - this.r;
	this.rLower = this.ypos + this.r;
	
	//start moving
	this.t = new Tween(this, "xpos", Tween.none, this.xpos, -50, this.speed);
	this.t.eRef = this;
	this.t.onMotionFinished = function() {
		
		//add points
		points += this.eRef.r;
		
		//remove from enemyArr
		delete enemyArr["e" + this.eRef.i];
		
		//updateDisplay
		updateDisplay();
	}
	this.t.start();
	//increment the counter

}


Enemy.prototype.draw = function() {

	context.fillStyle = this.c;
	context.beginPath();
	context.arc(this.xpos, this.ypos, this.r, 0, Math.PI*2, true);
	context.closePath();
	context.fill();
}

Enemy.prototype.destroy = function() {
	
	//stop any current animation
	this.t.stop();
	
	//remove from arr
	delete enemyArr["e" + this.i];
	
}

function explosion(sx, sy, c) {
	
	numParticles = 24;
	
	for (var i=0; i<numParticles; i++) {
		new Particle(parseInt(sx), parseInt(sy), c);
	}
	
}

function Particle(sx, sy, c) {

	
	//start
	//sx, sy
	//end
	//ex, ey
	
	this.sx = sx;
	this.sy = sy;
	this.c = c;
	this.a = 1;
	
	this.xpos = this.sx;
	this.ypos = this.sy;
	
	this.range = 50;
	this.duration = Math.random();
	
	//end coords
	this.ex = this.sx + Math.floor(Math.random() * (this.range*2)) - this.range;
	this.ey = this.sy + Math.floor(Math.random() * (this.range*2)) - this.range;
	
	//create new Tween to animate this out to tx and ty
	//pass reference to this instance
	this.tx = new Tween(this, "xpos", Tween.strongEaseOut, this.sx, this.ex, this.duration);
	this.ty = new Tween(this, "ypos", Tween.strongEaseOut, this.sy, this.ey, this.duration);
	this.ta = new Tween(this, "a", Tween.none, 10, 0, this.duration/2);
	
	
	this.tx.pRef = this;
	
	//onMotionChange call the draw method on this instance
	this.tx.onMotionChanged = function() {
		this.pRef.draw();
	}
	//onMotionFinish delete the particle instance using reference
	this.tx.onMotionFinished = function() {
		delete this.pRef;
	}
	
	this.tx.start();
	this.ty.start();
	this.ta.start();
}

Particle.prototype.draw = function() {
	
	//context.fillStyle = this.c;
	context.fillStyle = "rgba(255, 255, 255, " + (parseInt(this.a)/10) + ")";
	context.beginPath();
	context.arc(this.xpos, this.ypos, 2, 0, Math.PI*2, true);
	//context.arc(100, 100, 10, 0, Math.PI*2, true);
	context.closePath();
	context.fill();
	
}

function updateDisplay() {
	
	livesDisplay.innerHTML = dclk.currentLivesLeft;
	pointsDisplay.innerHTML = points;
	finalPointsDisplay.innerHTML = "Final Score: " + points;
	bestScoreDisplay.innerHTML = " All Time Best: " + localStorage.getItem("bestScore");
}

window.onload = init;












