function bind(scope, fn)
{
	return (function(){
		fn.apply(scope, arguments);
	});
}

function MouseHandler(el){
	this.keys = {};
	this.mouseDown = {x: undefined, y: undefined};
	this.mousePos = {x: undefined, y: undefined};

	this.mouseClick = undefined;

	this.clicked = function(){
		var click = this.mouseClick;
		this.mouseClick = undefined;
		return click;
	}

	this.MouseUp = function(event)
	{
		// event.stopPropagation();
		// event.preventDefault();
		// console.log("mouseup");
	}

	this.MouseDown = function(event)
	{
		event.stopPropagation();
		event.preventDefault();

		this.mouseDown.x = event.offsetX;
		this.mouseDown.y = event.offsetY;
		// console.log("mousedown");
	}

	this.MouseMove = function(e)
	{
		this.mousePos.x = e.x;
		this.mousePos.y = e.y;
	}

	this.MouseClick = function(e)
	{
		e.stopPropagation();
		e.preventDefault();

		this.mouseClick = {};
		this.mouseClick.x = e.offsetX;
		this.mouseClick.y = e.offsetY;
	}

	// attach touch listeners
	el.addEventListener("touchstart", bind(this, this.MouseUp));
	el.addEventListener("touchend", bind(this, this.MouseDown));

	// Attach mouse listeners
	el.addEventListener("mouseup", bind(this, this.MouseUp));
	el.addEventListener("mousedown", bind(this, this.MouseDown));
	el.addEventListener("mousemove", bind(this, this.MouseMove));
	el.addEventListener("click", bind(this, this.MouseClick));

	// Attach keyboard listeners
	// window.addEventListener("keyup", bind(this, this.KeyUp));
	// window.addEventListener("keydown", bind(this, this.KeyDown));
}

function KeyboardHandler()
{
	this.setKey = function(key)
	{
		// If we are setting the key for the first time make sure it has a value
		if(this.keyStates[key.keyCode] == null) this.keyStates[key.keyCode] = false;
		this.keyStates[key.keyCode] = true;
		return true;
	}

	// unsets the key in the buffer variable
	this.unsetKey = function(key)
	{
		this.keyStates[key.keyCode] = false;
		this.pressed_keys[key.keyCode] = true;

		return true;
	}

	// This is just a getter to make the later syntax easier to read through
	this.key = function(key_value)
	{
		if(this.keyStates[key_value]) return true;
		return false;
	}

	this.keyIsDown = function(letter)
	{
		if(this.keyStates[keyHash[letter]]) return true;
		return false;
	}

	this.keyPressed = function(letter)
	{
		return this.pressed_keys[keyHash[letter]];
	}

	this.setKeyPressed = function(letter)
	{
		// console.log(letter);
	}

	this.cleaner = function()
	{
		this.pressed_keys = {};
	}

	this.listenOffsetX = 0;
	this.listenOffsetY = 0;
	this.mx = 0;
	this.my = 0;

	this.pressed_keys = {};
	this.keyStates = {};

	var keyHash = {'backspace': 8,'tab': 9,'enter': 13,'shift': 16,'ctrl': 17,'alt': 18,'pause_break': 19,'caps_lock': 20,'escape': 27,'page_up': 33,'page_down': 34,'end': 35,'home': 36,'left_arrow': 37,'up_arrow': 38,'right_arrow': 39,'down_arrow': 40,'insert': 45,'delete': 46,'0': 48,'1': 49,'2': 50,'3': 51,'4': 52,'5': 53,'6': 54,'7': 55,'8': 56,'9': 57,'a': 65,'b': 66,'c': 67,'d': 68,'e': 69,'f': 70,'g': 71,'h': 72,'i': 73,'j': 74,'k': 75,'l': 76,'m': 77,'n': 78,'o': 79,'p': 80,'q': 81,'r': 82,'s': 83,'t': 84,'u': 85,'v': 86,'w': 87,'x': 88,'y': 89,'z': 90,'left_window_key': 91,'right_window_key': 92,'select_key': 93,'numpad_0': 96,'numpad_1': 97,'numpad_2': 98,'numpad_3': 99,'numpad_4': 100,'numpad_5': 101,'numpad_6': 102,'numpad_7': 103,'numpad_8': 104,'numpad_9': 105,'multiply': 106,'add': 107,'subtract': 109,'decimal_point': 110,'divide': 111,'f1': 112,'f2': 113,'f3': 114,'f4': 115,'f5': 116,'f6': 117,'f7': 118,'f8': 119,'f9': 120,'f10': 121,'f11': 122,'f12': 123,'num_lock': 144,'scroll_lock': 145,'semi_colon': 186,'equal_sign': 187,'comma': 188,'dash': 189,'period': 190,'forward_slash': 191,'grave_accent': 192,'open_bracket': 219,'back_slash': 220,'close_braket': 221,'single_quote': 222};
	window.addEventListener("keydown", bind(this, this.setKey), false);
	window.addEventListener("keyup", bind(this, this.unsetKey), false);
	window.addEventListener("keypress", bind(this, this.setKeyPressed), false);

}

var KEYBOARD = new KeyboardHandler();

var AnimationEasingFunctions = (function(){
	/**
	 * Easing functions to be used by the animation engine
	 * @param  {Number} t Current Time in animation
	 * @param  {Number} b Start value
	 * @param  {Number} c Change in value
	 * @param  {Number} d Duration of animation
	 * @return {Number}  returns the new position
	 */
	function Linear(t, b, c, d) {
		return c*t/d + b;
	};

	function EaseInOutCubic(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	};

	function EaseInCubic(t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	};

	function EaseOutCubic(t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	};

	return {
		linear: Linear,
		easeInOutCubic: EaseInOutCubic,
		easeInCubic: EaseInCubic,
		easeOutCubic: EaseOutCubic
	};

}());


function Promise() {
	this.done = function(fn){ this.resolve = fn; };
	this.resolve = function(){};

	this.error = function(fn){ this.failed = fn; };
	this.failed = function(){};

	this.progress = function(fn){ this.updateProgress = fn; };
	this.updateProgress = function(){};
}

function getType(o){
	if(o===null)return "[object Null]"; // special case
	return Object.prototype.toString.call(o);
}

Object.clone = function(o) {
	var result = {};

	for(var k in o) {
		switch(getType(o))
		{
			case '[object Array]':
				result[k] = o[k].slice();
				break;
			default:
				result[k] = o[k];
		}
	}

	return result;
};


// REFERENCE: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			window.setTimeout(callback, 1000/60);
		};
})();

String.prototype.strip = function(){
	return this.replace(/^\s+/g, '').replace(/\s+$/g, '');	
}

Object.defineProperty(Array.prototype, "last", {
	get: function(){
		return function(){ return this[this.length-1] };
	},
	enumerable: false
});

Object.defineProperty(Array.prototype, "first", {
	get: function(){
		return function(){ return this[0] };
	},
	enumerable: false
});


/**
 *	FOR VECTORS
 */

Object.defineProperty(Array.prototype, "x", {
	get: function(){
		return this[0];
	},
	set: function(v){
		this[0] = v;
	},
	enumerable: false
});

Object.defineProperty(Array.prototype, "y", {
	get: function(){
		return this[1];
	},
	set: function(v){
		this[1] = v;
	},
	enumerable: false
});

Object.defineProperty(Array.prototype, "z", {
	get: function(){
		return this[2];
	},
	set: function(v){
		this[2] = v;
	},
	enumerable: false
});

Object.defineProperty(Array.prototype, "w", {
	get: function(){
		return this[3];
	},
	set: function(v){
		this[3] = v;
	},
	enumerable: false
});


/**
 *	FOR COLORS
 */

Object.defineProperty(Array.prototype, "r", {
	get: function(){
		return this[0];
	},
	set: function(v){
		this[0] = v;
	},
	enumerable: false
});

Object.defineProperty(Array.prototype, "g", {
	get: function(){
		return this[1];
	},
	set: function(v){
		this[1] = v;
	},
	enumerable: false
});

Object.defineProperty(Array.prototype, "b", {
	get: function(){
		return this[2];
	},
	set: function(v){
		this[2] = v;
	},
	enumerable: false
});

Object.defineProperty(Array.prototype, "a", {
	get: function(){
		return this[3];
	},
	set: function(v){
		this[3] = v;
	},
	enumerable: false
});


/**
 * MATH HELPERS
 */

Math.radians = function(degrees) {
	return degrees * Math.PI / 180.0;
}

Math.degrees = function(radians) {
	return radians * 180.0 / Math.PI;
}


/**
 * VECTOR HELPERS
 */

Vector2 = {};

Vector2.add = function(A, B) {
	return [A.x + B.x, A.y + B.y];
}

Vector2.subtract = function(A, B) {
	return [A.x - B.x, A.y - B.y];
}

Vector2.sub = Vector2.subtract;

Vector2.multiply = function(A, B) {
	return [A.x * B.x, A.y * B.y];
}

Vector2.mult = Vector2.multiply;

Vector2.divide = function(A, B) {
	return [A.x / B.x, A.y / B.y];
}

Vector2.areEqual = function(A, B) {
	return (A.x == B.x && A.y == B.y);
}

Vector2.scale = function(A, S) {
	return [A.x * S, A.y * S];
}

Vector2.dot = function(A, B) {
	return (A.x * B.x + A.y * B.y);
}

//NOTE(brett): this is in 2d so only a scalar is returned, basically the z component of the 3d cross
Vector2.cross = function(A, B) {
	return A.x*B.y - A.y*B.x;
}

Vector2.length = function(A) {
	return Math.sqrt(A.x * A.x + A.y * A.y);
}

Vector2.unit = function(A) {
	var l = Vector2.length(A);
	if(l != 0)
		return [A.x/l, A.y/l];
	else
		return [0, 0];
}

Vector2.projection = function(A, B) {
	var a = Vector2.dot(A, B) / (Vector2.length(B) * Vector2.length(B));
	return Vector2.scale(B, a);
}

Vector2.scalar_projection = function(A, B) {
	return Vector2.dot(A, B) / Vector2.length(B);
}

Vector3 = {};

Vector3.add = function(A, B) {
	return [A.x + B.x, A.y + B.y, A.z + B.z];
}

Vector3.subtract = function(A, B) {
	return [A.x - B.x, A.y - B.y, A.z - B.z];
}

Vector3.sub = Vector3.subtract;

Vector3.multiply = function(A, B) {
	return [A.x * B.x, A.y * B.y, A.z * B.z];
}

Vector3.mult = Vector3.multiply;

Vector3.divide = function(A, B) {
	return [A.x / B.x, A.y / B.y, A.z / B.z];
}

Vector3.scale = function(A, S) {
	return [A.x * S, A.y * S, A.z * S];
}

Vector3.dot = function(A, B) {
	return (A.x * B.x + A.y * B.y + A.z * B.z);
}

//NOTE(brett): this is in 2d so only a scalar is returned, basically the z component of the 3d cross
Vector3.cross = function(A, B) {
	return [A.y*B.z - A.z*B.y, A.z*B.x - A.x*B.z, A.x*B.y - A.y*B.x];
}

Vector3.length = function(A) {
	return Math.sqrt(A.x * A.x + A.y * A.y + A.z * A.z);
}

Vector3.unit = function(A) {
	var l = Vector3.length(A);
	return [A.x/l, A.y/l, A.z/l];
}

// Vector3.projection = function(A, B) {
// 	var a = Vector3.dot(A, B) / (Vector3.length(B) * Vector3.length(B));
// 	return Vector3.scale(B, a);
// }

// Vector3.scalar_projection = function(A, B) {
// 	return Vector3.dot(A, B) / Vector3.length(B);
// }


// NOTE(brett): These are copies of glMatrix.js

var Matrix4 = {};
Matrix4.create = function() {
	return ([1, 0, 0, 0,
			 0, 1, 0, 0,
			 0, 0, 1, 0,
			 0, 0, 0, 1]);
}

Matrix4.ortho = function(left, right, bottom, top, near, far) {
	return ([2/(right-left), 0, 0, 0,
		 0, 2/(top-bottom), 0, 0,
		 0, 0, -(2/(far-near)), 0,
		 -((right+left)/(right-left)), -((top+bottom)/(top-bottom)), -((far+near)/(far-near)), 1]);
}

Matrix4.perspective = function(fovy, aspect, near, far) {
	var t = 1.0/Math.tan(fovy/2.0);
	var r = 1.0/(near-far);
	return ([t/aspect, 0, 0, 0,
			 0, t, 0, 0,
			 0, 0, (far+near)*r, 1,
			 0, 0, (2.0*far*near)*r, 0]);
}

Matrix4.lookAt = function(v3_eye, v3_center, v3_up) {

	var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
		eyex = v3_eye[0],
		eyey = v3_eye[1],
		eyez = v3_eye[2],
		upx = v3_up[0],
		upy = v3_up[1],
		upz = v3_up[2],
		centerx = v3_center[0],
		centery = v3_center[1],
		centerz = v3_center[2];

	if (Math.abs(eyex - centerx) < 0.000001 &&
		Math.abs(eyey - centery) < 0.000001 &&
		Math.abs(eyez - centerz) < 0.000001) {
		return Matrix4.create();
	}

	z0 = eyex - centerx;
	z1 = eyey - centery;
	z2 = eyez - centerz;

	len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;

	x0 = upy * z2 - upz * z1;
	x1 = upz * z0 - upx * z2;
	x2 = upx * z1 - upy * z0;
	len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	if (!len) {
		x0 = 0;
		x1 = 0;
		x2 = 0;
	} else {
		len = 1 / len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}

	y0 = z1 * x2 - z2 * x1;
	y1 = z2 * x0 - z0 * x2;
	y2 = z0 * x1 - z1 * x0;

	len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	if (!len) {
		y0 = 0;
		y1 = 0;
		y2 = 0;
	} else {
		len = 1 / len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}

	var d = [];
	d[0] = x0;
	d[1] = y0;
	d[2] = z0;
	d[3] = 0;
	d[4] = x1;
	d[5] = y1;
	d[6] = z1;
	d[7] = 0;
	d[8] = x2;
	d[9] = y2;
	d[10] = z2;
	d[11] = 0;
	d[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	d[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	d[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	d[15] = 1;

	return d;
}

Matrix4.scale = function(m, v3) {
	d = [];
	d[0] = m[0]*v3.x;
	d[1] = m[1]*v3.x; 
	d[2] = m[2]*v3.x;
	d[3] = m[3]*v3.x;
	d[4] = m[4]*v3.y;
	d[5] = m[5]*v3.y;
	d[6] = m[6]*v3.y;
	d[7] = m[7]*v3.y;
	d[8] = m[8]*v3.z;
	d[9] = m[9]*v3.z;
	d[10] = m[10]*v3.z;
	d[11] = m[11]*v3.z;
	d[12] = m[12];
	d[13] = m[13];
	d[14] = m[14];
	d[15] = m[15];
	return d;
}

Matrix4.translate = function(m, v3) {
	var x = v3[0], y = v3[1], z = v3[2],
		a00, a01, a02, a03,
		a10, a11, a12, a13,
		a20, a21, a22, a23;

	 var d = [];

	a00 = m[0]; a01 = m[1]; a02 = m[2]; a03 = m[3];
	a10 = m[4]; a11 = m[5]; a12 = m[6]; a13 = m[7];
	a20 = m[8]; a21 = m[9]; a22 = m[10]; a23 = m[11];

	d[0] = a00; d[1] = a01; d[2] = a02; d[3] = a03;
	d[4] = a10; d[5] = a11; d[6] = a12; d[7] = a13;
	d[8] = a20; d[9] = a21; d[10] = a22; d[11] = a23;

	d[12] = a00 * x + a10 * y + a20 * z + m[12];
	d[13] = a01 * x + a11 * y + a21 * z + m[13];
	d[14] = a02 * x + a12 * y + a22 * z + m[14];
	d[15] = a03 * x + a13 * y + a23 * z + m[15];


	return d;
}

Matrix4.rotate = function(m, v3) {

}

function ProjectPolygonOnAxis2D(polygon, axis)
{

	var projection = [10000000, -1000000];
	for(var i = 0; i < polygon.length; ++i)
	{
		var t = Vector2.dot(polygon[i], axis);
		projection[1] = Math.max(projection[1], t);
		projection[0] = Math.min(projection[0], t);
	}

	return projection;
}

function LinesOverlap(lineA, lineB)
{
	var ha = (lineA.y - lineA.x)/2;
	var hb = (lineB.y - lineB.x)/2;

	var a = lineA.x + ha;
	var b = lineB.x + hb;

	return (ha+hb) - Math.abs(b-a);
}

function PolygonCenter(polygon)
{
	var d = polygon.reduce(function(p, c){
		p.x += c.x;
		p.y += c.y;

		return p;
	}, [0, 0])

	return [d.x/polygon.length, d.y/polygon.length];
}

/**
 * Triangulates a convex polygon. This function assumes a CC winding order.
 * @param {[type]} points polygon points as an array of [[x, y], [x, y], [x, y], ... ]
 */
function TriangulateConvexPolygon(points)
{
	var points = points.slice();
	var triangles = [];

	for(var i = 0; i+2 < points.length; ++i)
	{	
		triangles.push([points[0], points[i+1], points[i+2]])
	}

	return triangles;
}

function PolygonBoundingBox(points) {
	var xs = points.map(function(c) { return c.x });
	var ys = points.map(function(c) { return c.x });

	var minx = Math.min.apply(null, xs);
	var miny = Math.min.apply(null, ys);
	var maxx = Math.max.apply(null, xs);
	var maxy = Math.max.apply(null, ys);

	return [minx, miny, maxx-minx, maxy-miny];

}

function SATCollision(polygonA, polygonB)
{
	var collision = [[0, 0], 1000000];
	var done = false;
	// NOTE(Brett): get axis for A
	for(var i = 0; i < polygonA.length; ++i)
	{
		var axis = Vector2.unit(Vector2.subtract(polygonA[(i+1)%polygonA.length], polygonA[i]));
		axis = [axis.y, -axis.x];

		var pa = ProjectPolygonOnAxis2D(polygonA, axis);
		var pb = ProjectPolygonOnAxis2D(polygonB, axis);

		var overlap = LinesOverlap(pa, pb);
		if(overlap > 0)
		{
			if(overlap < collision[1])
				collision = [axis, overlap];
		}
		else
		{
			done = true;
			break;
		}
	}

	if(!done)
	{
		for(var i = 0; i < polygonB.length; ++i)
		{
			var axis = Vector2.unit(Vector2.subtract(polygonB[(i+1)%polygonB.length], polygonB[i]));
			axis = [axis.y, -axis.x];

			var pa = ProjectPolygonOnAxis2D(polygonA, axis);
			var pb = ProjectPolygonOnAxis2D(polygonB, axis);

			var overlap = LinesOverlap(pa, pb);

			if(overlap > 0)
			{
				if(overlap < collision[1])
					collision = [axis, overlap];
			}
			else
			{
				done = true;
				break;
			}
		}
	}
	
	if(done)
		return false;

	var ca = PolygonCenter(polygonA);
	var cb = PolygonCenter(polygonB);
	var r = Vector2.dot(Vector2.subtract(cb, ca), collision[0]);

	if(r > 0) collision[0] = Vector2.scale(collision[0], -1);

	// collision[0] = Vector2.unit(collision[0]);
	return collision;
}

function getOffsetLeft( elem )
{
	var offsetLeft = 0;
	do {
		if(!isNaN(elem.offsetLeft))
		{
			offsetLeft += elem.offsetLeft;
		}
	} while(elem = elem.offsetParent);
	return offsetLeft;
}

function getOffsetTop( elem )
{
	var offsetTop = 0;
	do {
		if(!isNaN(elem.offsetTop))
		{
			offsetTop += elem.offsetTop;
		}
	} while(elem = elem.offsetParent);
	return offsetTop;
}


/************************************************************************
OPENGL HELPERS
************************************************************************/

function CreateTexture(image_object, gl_mag_filter, gl_min_filter, flip) {

	gl.activeTexture(gl.TEXTURE0);

	var texture = gl.createTexture();

	texture.image = image_object;
	texture.width = image_object.width;
	texture.height = image_object.height;

	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!flip);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image_object);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_mag_filter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_min_filter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
}

function CreateShaderProgram(vertex_source, fragment_source, attributes, uniforms) {

	var shaderProgram = gl.createProgram();

	var vertex_id = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertex_id, vertex_source);
	gl.compileShader(vertex_id);

	if(!gl.getShaderParameter(vertex_id, gl.COMPILE_STATUS)) {
		console.error("There was an error compiling the vertex shader: \n", gl.getShaderInfoLog(vertex_id));
	}

	var fragment_id = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragment_id, fragment_source);
	gl.compileShader(fragment_id);

	if(!gl.getShaderParameter(fragment_id, gl.COMPILE_STATUS)) {
		console.error("There was an error compiling the fragment shader: \n", gl.getShaderInfoLog(fragment_id));
	}

	gl.attachShader(shaderProgram, vertex_id);
	gl.attachShader(shaderProgram, fragment_id);
	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error("Could not link shader programs:\n", vertex_source.substr(0, 50)+"...\n\n", fragment_source.substr(0, 50)+"...");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.uniforms = {};
	shaderProgram.attributes = {};

	for(var attr_index in attributes) {
		shaderProgram.attributes[attributes[parseInt(attr_index)]] = gl.getAttribLocation(shaderProgram, attributes[parseInt(attr_index)]);
		// gl.enableVertexAttribArray(shaderProgram.attributes[attributes[parseInt(attr_index)]]);
	}

	for(var uni_index in uniforms) {
		shaderProgram.uniforms[uniforms[parseInt(uni_index)]] = gl.getUniformLocation(shaderProgram, uniforms[parseInt(uni_index)]);
	}

	return shaderProgram;
}

