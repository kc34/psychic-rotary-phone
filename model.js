"use strict"
/**
 * Hey guys! I'm going to write kind of a template here that you guys
 * can fill out however you like. If you want to change function names
 * or given variable names, let me know and I will update the other
 * files to reflect the changes!
 */
 
/**
 * The Model is a container for a set of bodies. You'll be able to 
 * manipulate them through here!
 */
 
var Sector = function(){
	this.bodies = [];
}

Sector.prototype.addBody = function(x,y,t,v) { // Remind Kevin to edit values
	if (t > 2)
	{
		var new_body = new Star(x,y,t,v); // Remind Kevin to put stars.
		this.bodies.push(new_body);
	}
	else if (t < 1)
	{
		var new_body = new Moon(x,y,t,v);
		this.bodies.push(new_body);
	}
	else
	{
		var new_body = new Planet(x,y,t,v);
		this.bodies.push(new_body);
	}
}
Sector.prototype.update = function(dt) {
	for (idx in Sector.bodies)
}
Sector.prototype.get_bodies = function() {
	return this.bodies;
}

Sector.prototype.collision_update = function(){
	var col_array = [[],[]];
	for (idx in Sector.bodies) {
		for (idx2 in Sector.bodies) {
			if (idx != idx2) {
				var x1 = Sector.bodies[idx].x_position;
				var x2 = Sector.bodies[idx2].x_position;
				var y1 = Sector.bodies[idx].y_position;
				var y2 = Sector.bodies[idx2].y_position; // Remind Kevin to add index.
				var x_dist = (x1-x2);
				var y_dist = (y1-y2);
				var t_dist = Math.pow(Math.pow(x_dist, 2) + Math.pow(y_dist, 2), 0.5); // ** doesn't work i guess.
				if ((Sector.bodies[idx].radius + Sector.bodies[idx2].radius) > t_dist){
					if (typeof(Sector.bodies[idx]) == Star) {
						Sector.remove(Sector.bodies[idx2]);
						var coor = (x2,y2);
						col_array[0].push(coor);
					} 
					else if (typeof(Sector.bodies[idx2]) == Star){
						Sector.remove(Sector.bodies[idx]);
						var coor = (x1,y1);
						col_array[0].push(coor);
					}
					else {
						Sector.remove(Sector.bodies[idx2]);
						Sector.remove(Sector.bodies[idx]);
						var x_coor = (x1+x2)/2;
						var y_coor = (y1+y2)/2;
						var coor = (x_coor,y_coor);
						col_array[1].push(coor);
					}
				}
			}
		}
	}
	return col_array;
}

var createOrbitables = function(bodytype) {
	orbitables = [];
	if (bodytype == 'Planet') {
		for (idx in Sector.bodies) {
			if (typeof Sector.bodies[idx] == 'Star') {
				orbitables.push(Sector.bodies[idx]);
			}
		}
	}
	elseif (bodytype == 'Moon') {
		for (idx in Sector.bodies) {
			if (typeof Sector.bodies[idx] == 'Star' || typeof Sector.bodies == 'Planet') {
				orbitables.push(Sector.bodies[idx]);
			}
		}
	}
	return orbitables;
}
	
	
Sector.prototype.neighbor = function(body) {
	var dist_array = [];
	var neighbor_array = [];
	orbitables = createOrbitables(typeof body)
	for (idx in orbitables) {
		var x1 = body.x_position - Sector.bodies[idx].x_position;
		var y1 = body.y_position - Sector.bodies[idx].y_position;
		var dist = Math.pow(Math.pow(x1, 2) + Math.pow(y1, 2), 0.5);
		if (dist != 0){
			dist_array.push(dist);
			neighbor_array.push(Sector.bodies[idx]);
		}
	}
	var min_dist = math.min(dist_array);
	var n_idx = dist_array.indexOf(min_dist);
	return [neighbor_array[n_idx], x1, y1, dist];
}

// calculates the acceleration for body1 (body2 is unaffected by this acceleration)
Sector.prototype.acceleration = function(body1, body2, dist, x1, y1) {
	var magnitude = body1.mass * body2.mass / Math.pow(dist,2);
	var cos = -x1/dist;
	var sin = -y1/dist;
	return [magnitude*cos, magnitude*sin]
}

var Body = function(x, y, t, v) {
	this.x = x;
	this.y = y;
}

var Star = function(x, y, t, v) {
	Body.call(this, x, y, t, v);
	this.color = "#FFFF00";
	this.radius = 400;
}

var Planet = function(x, y, t, v) {
	Body.call(this, x, y, t, v);
	this.color = "#00FF00"
	this.radius = 20;
}

var Moon = function(x, y, t, v) {
	Body.call(this, x, y, t, v);
	this.color = "#888888";
	this.radius = 5;
}
