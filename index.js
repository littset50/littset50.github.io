
function $(id) {
  return document.getElementById(id);
}


var currentClockImage;

function load() {
	drawQipan();
}

function loadAllImages(){
	var img = new Image();
	img.onload = function() {
		//blankClockImage = img;
		currentClockImage = img;
		drawQipan();
	};
	img.src = 'images/blank-clock-150.png';
}

function drawQipan(){
	if(!currentClockImage){
		loadAllImages();
		return;
	}

	var ctx = $('clock').getContext('2d');
	ctx.drawImage(currentClockImage, 0, 0);
	
	var cx = 75;
	var cy = 77;

	ctx.lineWidth = 5;
	ctx.strokeStyle = '#696969';
	ctx.globalAlpha = 0.5;
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(100, 200);
	ctx.stroke();
}

document.addEventListener('DOMContentLoaded', load);
