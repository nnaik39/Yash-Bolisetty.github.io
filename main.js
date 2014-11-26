
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
}


Math.dist=function(dx,dy) {
	return Math.sqrt(dx*dx+dy*dy);
}
Math.hyp=Math.dist;

function mixColors(c1,c2,p) {
	var r=c1[0]*p+c2[0]*(1-p);
	var g=c1[1]*p+c2[1]*(1-p);
	var b=c1[2]*p+c2[2]*(1-p);
	return Math.round(r)+", "+Math.round(g)+", "+Math.round(b);
}


function RGB(r,g,b,a) {
	this.r=Math.round(r);
	this.g=Math.round(g);
	this.b=Math.round(b);
	if(a==undefined) a=1;
	this.a=a;
	this.v="rgb("+this.r+","+this.g+","+this.b+")";
	this.va="rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
}
RGB.black=new RGB(0,0,0);
RGB.white=new RGB(255,255,255);


function HSL(h,s,l) {
	this.h=h;
	this.s=s;
	this.l=l;
	this.v="hsl("+h+","+Math.round(s*100)+"%,"+Math.round(l*100)+"%)";
}
HSL.black=new HSL(0,0,0);
HSL.white=new HSL(0,0,1);

function f(t) {
	var x=16*Math.pow(Math.sin(t),3);
	var y=-1*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
	return [x,y];
}
function fx(t) {
	return (f(x))[0];
}
function fy(t) {
	return (f(x))[1];
}
function Surface() {
	this.canvas=document.getElementById("surface");
	if(this.canvas.getContext) {
		this.context=this.canvas.getContext("2d");
		this.canvas.width=window.innerWidth;
		this.canvas.height=window.innerHeight;
		this.width=parseInt(this.canvas.width);
		this.height=parseInt(this.canvas.height);

		this.state=0;
		this.keys=[];
		this.mouse=[];
		this.mx=0;
		this.my=0;

		this.elements=[];
		var order=[];
		for(var a=0;a<points.length;a++) {
			order.push(a);
		}
		var mixed=[];
		while(order.length>0) {
			var r=Math.floor(Math.random()*order.length);
			mixed.push(order[r]);
			order.remove(r);
		}
		for(var a=0;a<points.length;a++) {
			var t=a/points.length*Math.PI*2;
	
			var e=new lolball(new RGB(points[a][2],points[a][3],points[a][4],points[a][5]),compression+2);
			var r=Math.min(this.height/2,this.width/2);
			
			e.setPos(points[a][0]-size[0]/2,points[a][1]-size[1]/2);
			e.setTarget(points[a][0]-size[0]/2,points[a][1]-size[1]/2);
			
			e.setDelay(0);
			this.elements.push(e);
		}
	} else {
		alert("No <canvas> support.");
	}
}
Surface.prototype.stepEach=function(arr) {
	var i;
	var rem=[];
	for(i=0;i<arr.length;i++) {
		var o=arr[i];
		if(o && o.step && o.draw && o.dead) {
			o.step();
			o.draw();
			if(o.dead()) {
				if(o.destroy) o.destroy();
				rem.push(i);
			}
		}
	}
	for(i=0;i<rem.length;i++) {
		arr.remove(rem[i]);
	}
}
Surface.prototype.step=function() {
	if(this.state==0) this.state=1;
	this.canvas.width=window.innerWidth;
	this.canvas.height=window.innerHeight;
	this.width=parseInt(this.canvas.width);
	this.height=parseInt(this.canvas.height);

	this.context.clearRect(0,0,this.width,this.height);
	this.stepEach(this.elements);

	setTimeout("surface.step()",1);
}
Surface.prototype.scatter=function() {
	this.ready=0;
	for(var i=0;i<this.elements.length;i++) {
		var e=this.elements[i];
		e.ready=false;
		e.dx=Math.random()*30-15;
		e.dy=Math.random()*30-15;
	}
}
Surface.prototype.keyu=function(e) {this.keys[e.keyCode]=false}
Surface.prototype.keyd=function(e) {this.keys[e.keyCode]=true}
Surface.prototype.mouseu=function(e) {this.mouse[e.button]=false}
Surface.prototype.moused=function(e) {
	if(surface.state==0) surface.step();
	else if(surface.state==1) surface.scatter();
	this.mouse[e.button]=true;
}
Surface.prototype.mousem=function(e) {
	this.mx=e.offsetX;
	this.my=e.offsetY;
}

function Element() {}
Element.prototype.setPos=function(x,y) {
	this.x=x;
	this.y=y;
}
Element.prototype.draw=function() {}
Element.prototype.step=function() {}
Element.prototype.keyd=function() {}
Element.prototype.keyu=function() {}
Element.prototype.dead=function() {return false}
Element.prototype.destroy=function() {}
Element.prototype.bounds=function(x,y) {
	var dx=this.x-x;
	var dy=this.y-y;
	return Math.sqrt(dx*dx+dy*dy)<=4;
}


function Ball(color,radius) {
	this.color=color;
	this.radius=radius;
}
Ball.prototype=new Element();
Ball.prototype.draw=function() {
	surface.context.beginPath();
	surface.context.fillStyle=this.color.va;
	surface.context.lineWidth=1;
	
	surface.context.rect(this.x+surface.width/2,this.y+surface.height/2,this.radius,this.radius);
	surface.context.fill();
}


function lolball(color,radius) {
	this.color=color;
	this.radius=radius;
	this.dx=0;
	this.dy=0;
	this.fz=[0.97,0.7];
	this.z=0;
}
lolball.prototype=new Ball();
lolball.prototype.setDelay=function(t) {
	this.delay=t;
}
lolball.prototype.setTarget=function(x,y) {
	this.tx=x;
	this.ty=y;
}
lolball.prototype.setT=function(t) {
	this.t=t;
}
lolball.prototype.step=function() {
	if(this.delay>0) return this.delay--;
	
	var rx=this.tx;
	var ry=this.ty;
	var mx=surface.mx-this.x-surface.width/2;
	var my=surface.my-this.y-surface.height/2;
	var m=Math.dist(mx,my);
	rx-=2000*mx/m/m;
	ry-=2000*my/m/m;

	var dx=rx-this.x;
	var dy=ry-this.y;
	var d=Math.dist(dx,dy);
	this.dx+=dx/d/10;
	this.dy+=dy/d/10;
	this.dx*=this.fz[this.z];
	this.dy*=this.fz[this.z];
	this.x+=this.dx;
	this.y+=this.dy;
	if(d<=1 && Math.dist(this.dx,this.dy)<=1) this.z=1;
	else this.z=0;
}


var surface;
$(function() {
	surface=new Surface();
	surface.step();
	window.addEventListener("keydown",function(e) {surface.keyd(e)},true);
	window.addEventListener("keyup",function(e) {surface.keyu(e)},true);
	surface.canvas.addEventListener("mousedown",function(e) {surface.moused(e)},true);
	surface.canvas.addEventListener("mouseup",function(e) {surface.mouseu(e)},true);
	surface.canvas.addEventListener("mousemove",function(e) {surface.mousem(e)},true);
	window.addEventListener("selectstart",function(e) {e.preventDefault()},true);
	window.addEventListener("contextmenu",function(e) {e.preventDefault()},true);
});
