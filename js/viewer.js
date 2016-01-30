var Viewer = function() {
	this.center = Vector.fromComponents(0, 0);
	this.scale = 1;
	this.images = getImages();
	
	this.sunResize = 4.0 / 3.0;
	this.planetResize = 4.0 / 3.0
	this.moonResize = 3.0 / 2.0;
	
	this.scalingFactor = 1.5;
	
	this.music = new Audio("assets/one_sly_move.mp3");
	this.music.play();
	
	/**
	 * This function will draw everything!
	 */
    this.draw = function() {
		
		this.drawBackground();
		
		myModel.getBodies().forEach(this.drawObject, this); 
		
		if (myController.getGhostBody() != null) {
			this.drawObject(myController.getGhostBody());
		}
		
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "30px Courier New";
		ctx.fillText("High Score: " + myModel.highScore.toString(), 10, 30);
		ctx.fillText("Score: " + myModel.score.toString(), 10, 70);
		ctx.font = "10px Courier New";
		ctx.fillText("(Less eccentricity => Higher Score!)", 10, 100);
		
		// Draw the button that leads to the about page.
		ctx.fillStyle = "#888888";
		ctx.fillRect( 10, window.innerHeight - 10 - 20, 20, 20);
		ctx.strokeStyle = "#AAAAAA";
		ctx.strokeRect( 10, window.innerHeight - 10 - 20, 20, 20);
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "20px Arial";
		ctx.fillText("?", 14, window.innerHeight - 13.75); 
    }
    
    this.drawBackground = function() {
		var pictureSize = 2000 / Math.pow(this.scale, 0.2);
		for (var i = -10; i < 10; i++) {
			for (var j = -10; j < 10; j++) {
				var topLeft = Vector.fromComponents(i, j).scMult(pictureSize).add(myViewer.center.scMult(-0.1 / this.scale));
				
				ctx.drawImage(this.images["background"][0], topLeft.x, topLeft.y, pictureSize, pictureSize);
			}
		}
	}
	
	this.drawObject = function(myObject) {
		
		// First order of business: know where to draw.
		var positionVector = myObject.positionVector;
		var screenVector = Viewer.coordinatePlaneToScreen(positionVector);
		
		var screenRadius = myObject.radius / this.scale;
		var objectType;
		var skinId;
		
		if (Star.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.sunResize;
			screenRadius = Math.max(screenRadius, 20);
			objectType = "star";
			var skinData = Viewer.starColorFromRadius(myObject.radius);
			var skinId = Math.floor(skinData);
			var progressToNext = skinData - skinId;
			var val1 = 1 - progressToNext;
			var val2 = progressToNext;
			var vector = screenVector;
			
			var radius = screenRadius;
			var glowRadius = radius * 8 / 5
			
			// Draw next.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.glow[skinId],
				vector.x - glowRadius, vector.y - glowRadius,
				2 * glowRadius, 2 * glowRadius);
				
			if (progressToNext != 0) {
				ctx.globalAlpha = val2;
				ctx.drawImage(this.images.glow[skinId + 1],
					vector.x - glowRadius, vector.y - glowRadius,
					2 * glowRadius, 2 * glowRadius);
			}
			// Draw actual.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.star[skinId],
				vector.x - radius, vector.y - radius,
				2 * radius, 2 * radius);
			if (progressToNext != 0) {
				
				ctx.globalAlpha = val2;
				
				ctx.drawImage(this.images.star[skinId + 1],
					vector.x - radius, vector.y - radius,
					2 * radius, 2 * radius);
			}
			ctx.globalAlpha = 1;
			
		} else if (Planet.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.planetResize;
			screenRadius = Math.max(screenRadius, 5);
			objectType = "planet";
			var skinId = myObject.img;
			ctx.drawImage(this.images[objectType][skinId],
				screenVector.x - screenRadius,
				screenVector.y - screenRadius,
				2 * screenRadius, 2 * screenRadius);
		} else if (Moon.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.moonResize;
			screenRadius = Math.max(screenRadius, 2);
			objectType = "moon";
			var skinId = myObject.img;
			ctx.drawImage(this.images[objectType][skinId],
				screenVector.x - screenRadius,
				screenVector.y - screenRadius,
				2 * screenRadius, 2 * screenRadius);
		}
	}
	
	/**
	 * Adjusts viewer center and scale s.t. screenVector will stay
	 * consistent with planeVector, but scale will change by
	 * scalingFactor.
	 */
	this.zoomAt = function(screenVector, direction) {
		if (direction == "OUT") {
			if (this.scale < 10) {
				// First, we need the mouse position in coordinate
				var mouseCoordinate = Viewer.screenToCoordinatePlane(screenVector);
				// Next, we need to measure the offset of that from the view center.
				var mouseOffset = mouseCoordinate.subtract(this.center);
				// Since we zoom out, the distance will become greater by the scaling factor.
				var scaledOffset = mouseOffset.scMult(this.scalingFactor);
				this.center = mouseCoordinate.subtract(scaledOffset);
				this.scale *= this.scalingFactor;
			}
		} else {
			// First, we need the mouse position in coordinate
			var mouseCoordinate = Viewer.screenToCoordinatePlane(screenVector);
			// Next, we need to measure the offset of that from the view center.
			var mouseOffset = mouseCoordinate.subtract(this.center);
			// Since we zoom out, the distance will become greater by the scaling factor.
			var scaledOffset = mouseOffset.scMult(1 / this.scalingFactor);
			this.center = mouseCoordinate.subtract(scaledOffset);
			this.scale /= this.scalingFactor;
		}
	}
}

Viewer.coordinatePlaneToScreen = function(planeVector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var windowCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var screenVector = planeVector.subtract(myViewer.center).scMult(1 / myViewer.scale).add(windowCenter);
	return screenVector;
}

Viewer.screenToCoordinatePlane = function(screenVector) {
	/**
	 * PlaneVec = (ScreenVec - ScreenCenter) * Scale + ViewCenter
	 */
	var windowCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var planeVector = screenVector.subtract(windowCenter).scMult(myViewer.scale).add(myViewer.center);
	return planeVector;
}

Viewer.starColorFromRadius = function(radius) {
	if (radius < Controller.timeToRadius(2.5)) {
		return 7;
	} else if (radius < Controller.timeToRadius(15)) {
		var bigRadius = Controller.timeToRadius(15);
		var smallRadius = Controller.timeToRadius(2.5);
		var color = (bigRadius - radius) / (bigRadius - smallRadius) * 7;
		return color;
	} else {
		return 0;
	}
}


