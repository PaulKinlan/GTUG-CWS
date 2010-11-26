////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//element references
var optionsElem;
var introElem;
var dropArea;
var previewArea;
var videoArea;

//canvas references
var canvasArea;
var canvasPreview;
var canvasPreviewContext;


//
var file;
var fileType;
var fileURL;
//
var fileWidth;
var fileHeight;
//


var updateCubesInterval;
var updateCubesIntervalTime = Math.round(1000/30);
var updatePlanesInterval;
var updatePlanesIntervalTime = Math.round(1000/30);

//
var cubeArr = new Array();
var planeArr = new Array();

//
var sampleWidth = 30;
var sampleHeight = Math.floor((9/16)*sampleWidth);

//
var depthRange = 20;
var inverse = -1;
var cameraZoom = 15;
var lumaDepth = depthRange * inverse;
var threeIntervalTime = 10;

//
var mouseX = 0;
var mouseY = 0;

//

var inputRangeDepth;
var inputRangeZoom;
var invertOn;
var invertOff;
var bgWhite;
var bgBlack;
var orientationOn;
var orientationOff;

var bgColor = "#ffffff";
var borderColor = "#f2326d";


var camera;
var scene;
var renderer;


////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//drag and drop
function enableDropArea() {
	dropArea.addEventListener("drop", dropHandler);
	dropArea.addEventListener("dragover", dragOverHandler);
	dropArea.addEventListener("dragleave", dragLeaveHandler);
}
function disableDropArea() {
	dropArea.removeEventListener("drop", dropHandler);
	dropArea.removeEventListener("dragover", dragOverHandler);
	dropArea.removeEventListener("dragleave", dragLeaveHandler);
}

//preventDefault behaviour
function dragOverHandler(e) {
	e.preventDefault();
	dropArea.style.borderColor = borderColor;
}

//preventDefault behaviour
function dragLeaveHandler(e) {
	dropArea.style.borderColor = bgColor;
	e.preventDefault();
}

//drop handler needs to figure out if this file is a video or an image
function dropHandler(e) {
	
	//preventDefault behaviour
  	e.preventDefault();
	
	//remove the border
	dropArea.style.borderColor = bgColor;
	
	//grab the first file from the list
	file = e.dataTransfer.files[0];

	//lets find out what the fileType is
	fileType = getFileType();
	
	if (fileType == "NONE") {
		alert("File type not supported");
		return;
	}
	
	//create a new instance of FileReader
	var reader = new FileReader();

	//our callback
	reader.onload = function(loadEvent) {

		//lets find out the fileURL
		fileURL = loadEvent.target.result;

		//initPreview (now that we know what the file, fileType and fileURL are)
		initPreview();
		
	}

	//now attempt to the read the file
	reader.readAsDataURL(file);
	
	//hideIntroElem
	hideIntroElem();
	//showOptionsElem
	showOptionsElem();
  	
}

//find out what type of file we have so we know how to deal with it
function getFileType() {

	//reg for image/video
	var imageType = /image.*/;
	var videoType = /video.*/;
	
	//check the file type
	if (file.type.match(imageType)) {
		return("IMAGE");
	} else if (file.type.match(videoType)){
		return("VIDEO");
	} else {
		return("NONE");
	}
	
}

//set the size of the preview-area and get the canvas ready
function initPreview() {
	
	//clear the canvas first
	canvasPreviewContext.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
	
	//what file type are we dealing with
	if (fileType == "VIDEO") {
		
		sampleWidth = 50;
		sampleHeight = Math.floor((9/16)*sampleWidth);
		videoArea.width = sampleWidth;
		videoArea.height = sampleHeight;
		
		//reset size of the canvas
		canvasPreview.width = sampleWidth;
		canvasPreview.height = sampleHeight;
		previewArea.style.width = sampleWidth + "px";
		previewArea.style.height = sampleHeight + "px";
		
		//set the video in the videoArea so it starts playing
		videoArea.type = file.type;
		videoArea.src = fileURL;
		
		//set fileWidth
		fileWidth = sampleWidth;
		fileHeight = sampleHeight;
		
		//make a sample first
		/*canvasPreviewContext.drawImage(videoArea, 0, 0, videoArea.width, videoArea.height);*/
		
		//initBuffers();
		
		
		/*document.onclick = function() {
			initCubes();
		}*/
		
		//keep updating cubes based on the options
		//startUpdateCubesInterval();
		setTimeout(initPlanes, 2000);
		startUpdatePlanesInterval();
		stopUpdateCubesInterval();
		
		//keep rendering the screen based on mouse/camera position
		startThreeInterval();

		
	} else if (fileType == "IMAGE") {
		
		
		sampleWidth = 30;
		sampleHeight = Math.floor((9/16)*sampleWidth);
		
		//load the image data and display in the preview
		var img = new Image();
		img.onload = function() {

			//get the image dimensions so we can drawImage at the right aspect ratio
			setNewFileDimensions(img);
			
			//draw the image onto the canvas
		    canvasPreviewContext.drawImage(img, 0, 0, fileWidth, fileHeight);
			
			//initBuffers();
			initCubes();
			//initPlanes();
			
			//keep updating cubes based on the options
			startUpdateCubesInterval();
			stopUpdatePlanesInterval();
			
			//keep rendering the screen based on mouse/camera position
			startThreeInterval();

		}
		
		//set the src of our new file
		img.src = fileURL;
		
		//we should clear the video tag
		videoArea.type = "";
		videoArea.src = "";
		videoArea.pause();
		
		//we should stop sampling the video if its there
		stopSamplingVideo();
		
	}
	
}

function setNewFileDimensions(img) {
	
	//set the fileWidth to our previewArea size
	fileWidth = sampleWidth;
	fileHeight = Math.round(img.height/img.width*fileWidth);

	//set the preview Area at that size to accomodate the canvas
	previewArea.style.width = fileWidth + "px";
	previewArea.style.height = fileHeight + "px";
	
	//set the canvas at that size
	canvasPreview.width = fileWidth;
	canvasPreview.height = fileHeight;

}



















function clearCubes() {
	var numCubes = cubeArr.length;
	for (var i=0; i<numCubes; i++) {
		scene.removeObject(cubeArr[i]);
		delete cubeArr[i];
	}
	cubeArr = new Array();
}

//
function initCubes() {

	//clear previous cubes
	clearCubes();
	clearPlanes();

	//get the image data object first before loop through
	var imageData = canvasPreviewContext.getImageData(0, 0, fileWidth, fileHeight);
	var d = imageData.data;
	var dLen = d.length;

	//position counters
	var cx = 0;
	var cy = 0;
	
	//offset from the centre
	var offsetX = Math.round(fileWidth/2);
	var offsetY = Math.round(fileHeight/2);

	//create one instance of geometry
	var geometry = new Cube(1, 1, 1);

	//we have access to fileWidth, fileHeight - each position should be offset by half of these to keep the whole composition in the centre
	for (var i=0; i<dLen; i+=4) {

		//get the RGB
		var r = d[i]/255;
		var g = d[i+1]/255;
		var b = d[i+2]/255;
		
		//brightness
		var luma = 1 - (((0.2126*r) + (0.7152*g) + (0.0722*b)));
		
		//update our position counters
		cx+=1;
		if (Math.floor(i%(fileWidth*4)) == 0) {
			cy-=1;
			cx = 0;
		}
		
		//create a new instance of material
		var material = new THREE.MeshColorFillMaterial();
		
		//set the color attribute
		material.color.setRGBA(r, g, b, 1);
		
		//create a new cube using our geometry and material
		var cObj = new THREE.Mesh(geometry, material);
		
		//position the cube
		cObj.luma = luma;
		cObj.position.y = cy + offsetY;
		cObj.position.x = cx - offsetX;
		cObj.position.z = luma * lumaDepth;
		
		//and add the cube to the scene
		scene.addObject(cObj);
		
		//push this object into our array
		cubeArr.push(cObj);

	}
	
	//render
	renderer.render(scene,camera);
}

function initPlanes() {
	
	//clear previous planes
	clearPlanes();
	clearCubes();

	//get the image data object first before loop through
	var imageData = canvasPreviewContext.getImageData(0, 0, fileWidth, fileHeight);
	var d = imageData.data;
	var dLen = d.length;

	//alert(dLen);

	//position counters
	var cx = 0;
	var cy = 0;
	
	//offset from the centre
	var offsetX = Math.round(fileWidth/2);
	var offsetY = Math.round(fileHeight/2);

	//create one instance of geometry
	//var geometry = new Plane(1, 1, 1);
	
	geom = new Plane(1, 1);

	//we have access to fileWidth, fileHeight - each position should be offset by half of these to keep the whole composition in the centre
	for (var i=0; i<dLen; i+=4) {

		//get the RGB
		var r = d[i]/255;
		var g = d[i+1]/255;
		var b = d[i+2]/255;
		
		//brightness
		var luma = 1 - (((0.2126*r) + (0.7152*g) + (0.0722*b)));
		
		//update our position counters
		cx+=1;
		if (Math.floor(i%(fileWidth*4)) == 0) {
			cy-=1;
			cx = 0;
		}
		
		//create a new instance of material
		var material = new THREE.MeshColorFillMaterial();
		
		//set the color attribute
		material.color.setRGBA(r, g, b, 1);
		
		//create a new cube using our geometry and material
		var cObj = new THREE.Mesh(geom, material);
		
		//position the cube
		cObj.luma = luma;
		cObj.position.y = cy + offsetY;
		cObj.position.x = cx - offsetX;
		cObj.position.z = luma * lumaDepth;
		
		//and add the cube to the scene
		scene.addObject(cObj);
		
		//push this object into our array
		planeArr.push(cObj);

	}
	
	//render
	renderer.render(scene,camera);
}

function clearPlanes() {
	var numPlanes = planeArr.length;
	for (var i=0; i<numPlanes; i++) {
		scene.removeObject(planeArr[i]);
		delete planeArr[i];
	}
	planeArr = new Array();
}





function startUpdateCubesInterval() {
	updateCubesInterval = setInterval(updateCubes, updateCubesIntervalTime);
}

function stopUpdateCubesInterval() {
	clearInterval(updateCubesInterval);
}


function startUpdatePlanesInterval() {
	updatePlanesInterval = setInterval(updatePlanes, updatePlanesIntervalTime);
}

function stopUpdatePlanesInterval() {
	clearInterval(updatePlanesInterval);
}


function updateCubes() {
	

		//how many cubes to update
		var numCubes = cubeArr.length;
	
		//go through each one
		for (var i=0; i<numCubes; i++) {
		
			//this is our current cube
			cCube = cubeArr[i];

			//update cCube's position.z value based on it's luma and current lumaDepth
			cCube.position.z = cCube.luma * lumaDepth;
		
		}

	
}

function updatePlanes() {
	/*
	if (videoArea.currentTime < 1) {
		//alert(videoArea.currentTime);
		canvasPreviewContext.drawImage(videoArea, 0, 0, videoArea.width, videoArea.height);
		initPlanes();
	} else {
	*/
	//sample the video and draw on the preview canvas
	canvasPreviewContext.drawImage(videoArea, 0, 0, videoArea.width, videoArea.height);
	
	//get the image data object first before loop through
	var imageData = canvasPreviewContext.getImageData(0, 0, videoArea.width, videoArea.height);
	var d = imageData.data;
	var dLen = d.length;
	
	//
	var planeCounter = 0;

	//create a new instance of material
	//var material = new THREE.MeshColorFillMaterial();

	//go through each pixel
	for (var j=0; j<dLen; j+=4) {

		//get the RGB
		var r = d[j]/255;
		var g = d[j+1]/255;
		var b = d[j+2]/255;
	
		//brightness
		var luma = 1 - (((0.2126*r) + (0.7152*g) + (0.0722*b)));
		
		//update luma in our cubes
		//planeArr[planeCounter].luma = luma;
		planeArr[planeCounter].position.z = luma * lumaDepth;
		//alert(luma);


		//set the color attribute
		//material.color.setRGBA(r, g, b, 1);
		
		//CHANGE - need to apply colour here
		planeArr[planeCounter].material[0].color.setRGBA(r, g, b, 1);
		
		planeCounter++;
		
	}
	//}	
	
	/*
	//alert(videoArea.currentTime);
	if (videoArea.currentTime > 0) {
		//alert(videoArea.currentTime);
		canvasPreviewContext.drawImage(videoArea, 0, 0, videoArea.width, videoArea.height);
		initPlanes();
	}
	*/
}








//set up our cameras and world etc
function initThree() {

	//create a camera and set it's properties
	camera = new THREE.Camera(50, 960/540, 1, 1000);
	camera.position.y = 0;
	camera.position.z = cameraZoom;
	camera.target.position.y = 0;
	camera.target.position.x = 0;

	//create a new scene
	scene = new THREE.Scene();

	//create a new instance of the renderer and set the size
	renderer = new THREE.CanvasRenderer();
	renderer.setSize(960, 540);

	//write out the convas into the container we have provided
	canvasArea.appendChild(renderer.domElement);
	

}




function startThreeInterval() {
	threeInterval = setInterval(renderThree, threeIntervalTime);
}
function stopThreeInterval() {
	clearInterval(threeInterval);
}
function renderThree() {
	
	targetX = (mouseX - 480)/20;
	targetY = (-mouseY + 270)/20;
	
	camera.position.x += (targetX - camera.position.x)/5;
	camera.position.y += (targetY - camera.position.y)/5;
	
	renderer.render(scene,camera);
}










////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////











function enableOrientation() {
	window.addEventListener("deviceorientation", captureOrientation, false);	
}
function captureOrientation(e) {

	betaVal = e.beta;
	gammaVal = e.gamma;
		
	mouseX = 480 + (gammaVal/90) * 960;
	mouseY = 270 + (betaVal/90) * 540;
		
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













function enableMouse() {
	document.onmousemove = updateMouse;
}
function disableMouse() {
	document.onmousemove = null;
}

function updateMouse(e) {

	e.preventDefault();
	
	mouseX = e.pageX - getElementPosition("three-canvas-container").left;
	mouseY = e.pageY - getElementPosition("three-canvas-container").top;


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




////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////




function enableOptions() {
	
	//depth
	inputRangeDepth.min = 0;
	inputRangeDepth.max = 40;
	inputRangeDepth.value = depthRange;
	inputRangeDepth.onchange = function() {
		depthRange = this.value;
		lumaDepth = depthRange * inverse;
	}
	
	//zoom
	inputRangeZoom.min = 5;
	inputRangeZoom.max = cameraZoom*3;
	inputRangeZoom.value = cameraZoom;
	inputRangeZoom.onchange = function() {
		cameraZoom = this.value;
		camera.position.z = cameraZoom;
	}
	
	//invert
	invertOn.onclick = function(e) {
		e.preventDefault();
		inverse = 1;
		lumaDepth = depthRange * inverse;
		invertOn.style.opacity = 1;
		invertOff.style.opacity = 0.3;
	}
	invertOff.onclick = function(e) {
		e.preventDefault();
		inverse = -1;
		lumaDepth = depthRange * inverse;
		invertOn.style.opacity = 0.3;
		invertOff.style.opacity = 1;
	}
	
	//background
	bgWhite.onclick = function(e) {
		e.preventDefault();
		bgColor = "#ffffff";
		canvasArea.style.backgroundColor = bgColor;
		dropArea.style.borderColor = bgColor;
		bgWhite.style.opacity = 1;
		bgBlack.style.opacity = 0.3;
	}
	
	bgBlack.onclick = function(e) {
		
		e.preventDefault();
		bgColor = "#000000";
		canvasArea.style.backgroundColor = bgColor;
		dropArea.style.borderColor = bgColor;
		bgWhite.style.opacity = 0.3;
		bgBlack.style.opacity = 1;
	}
	
	//orientation
	orientationOn.onclick = function(e) {

		e.preventDefault();
		enableOrientation();
		disableMouse();
		orientationOn.style.opacity = 1;
		orientationOff.style.opacity = 0.3;
	}
	
	orientationOff.onclick = function(e) {
		
		e.preventDefault();
		disableOrientation();
		enableMouse();
		orientationOn.style.opacity = 0.3;
		orientationOff.style.opacity = 1;
	}
	
	invertOn.style.opacity = 0.3;
	invertOff.style.opacity = 1;
	bgWhite.style.opacity = 1;
	bgBlack.style.opacity = 0.3;
	orientationOn.style.opacity = 0.3;
	orientationOff.style.opacity = 1;
	
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//show and hide interfaces
function showOptionsElem() {
	optionsElem.style.visibility = "visible";
}
function hideOptionsElem() {
	optionsElem.style.visibility = "hidden";
}
function showIntroElem() {
	introElem.style.visibility = "visible";
}
function hideIntroElem() {
	introElem.style.visibility = "hidden";
}
function showPreviewArea() {
	previewArea.style.visibility = "visible";
}
function hidePreviewArea() {
	previewArea.style.visibility = "hidden";
}

//prepare the page with references
function prepPage() {
	
	//get elem references
	optionsElem = document.getElementById("options-elem");
	introElem = document.getElementById("intro-elem");
	dropArea = document.getElementById("drop-area");
	previewArea = document.getElementById("preview-area");
	videoArea = document.getElementById("video-area");
	canvasArea = document.getElementById("three-canvas-container");
	
	//get canvas references
	canvasPreview = document.getElementById("canvas-preview");
	//get context references
	canvasPreviewContext = canvasPreview.getContext("2d");
	//canvasWebGlContext = canvasWebGL.getContext("webgl");
	
	
	//get option references
	inputRangeDepth = document.getElementById("input-range-depth");
	inputRangeZoom = document.getElementById("input-range-zoom");
	
	invertOn = document.getElementById("invert-on");
	invertOff = document.getElementById("invert-off");

	bgWhite = document.getElementById("bg-white");
	bgBlack = document.getElementById("bg-black");
	
	orientationOn = document.getElementById("orientation-on");
	orientationOff = document.getElementById("orientation-off");
	
	videoArea.width = sampleWidth;
	videoArea.height = sampleHeight;
	
}

//initialise
function init() {
	
	//prepPage
	prepPage();
	
	//enable the dropArea
	enableDropArea();
	
	//get the right things hidden and visible from the start
	hideOptionsElem();
	showIntroElem();
	hidePreviewArea();
	
	//enableOptions
	enableOptions();
	
	//initThree world
	initThree();
	
	//keep track of mouseX and mouseY
	enableMouse();
	
	//testLuma
	//testLuma();
	
}


function testLuma() {
	//get the RGB
	var r = 0/255;
	var g = 0/255;
	var b = 0/255;


	//brightness
	var luma = 1 - (((0.2126*r) + (0.7152*g) + (0.0722*b)));
	alert(luma);
}


//initialise the page
window.onload = init;