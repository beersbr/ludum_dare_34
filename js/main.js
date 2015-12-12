var game = {};
var Canvas = null;
var gl = null;

var ProjectionMatrix = null;
var ViewMatrix = null;

var CurrentTime = 0.0;
var ElapsedTime = 0.0;

var Width = 1200;
var Height = 800;

var TileWidth = 40;
var TileHeight = 40;

var CurrentLevel = null;

var Player = null;

var GameObjects = [];

var Resources = {};

function GetRC(k) {
	return Resources[k].item;
}

function LoadResources(resource_array) { 
	var p = new Promise();
	
	var tryReturn = function() {
		var itemCount = resource_array.length;
		var tries = ++tryReturn.tries;

		if(tries == itemCount) p.resolve();
	};
	tryReturn.tries = 0;

	LoadResources.ids = LoadResources.ids || 0;

	for(var index in resource_array) {
		var resource = {};
		resource.id = (++LoadResources.ids);
		resource.created = +new Date();
		resource.key = resource_array[index].key;
		resource.src = resource_array[index].src;
		resource.type = resource_array[index].type;

		switch(resource_array[index].type) {
			case "image":
				(function(item){
					item.item = new Image();
					item.item.onload = function() {
						item.item = this;
						Resources[item.key] = item;
						tryReturn();
					};
					item.item.src = item.src;
				}(resource));
				break;
			case "text":
				(function(item){
					item.item = "";
					$.get(resource.src).done(function(result){ 
						item.item = result;
						Resources[item.key] = item;
						tryReturn();
					});
				}(resource));
				break;
		}
	}

	return p;
}

function CreateResourceTemplate(key, type, src){ 
	return { type:type, key:key, src:src };
}

function CreateResource(key, type, item, src) {
	src = src || null; 

	Resources[key] = {
		src: src,
		key: key,
		type: type,
		item: item,
		created: +new Date(),
		id: ++LoadResources.ids
	};

	return Resources[key];
}

function GameObject(position, size) {
	var self = this;
	this.position = position.slice();
	this.velocity = [0.0, 0.0];
	this.acceleration = [0.0, 0.0];

	this.polygon = [[-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5]];

	this.bb = PolygonBoundingBox(this.polygon);
	this.size = size.slice();

	this.triangles = [];
	this.geometry = [];
	this.vbo = null;
	this.texture = null;
	this.shader = null;

	this.prepare = function() {
		this.geometry = TriangulateConvexPolygon(this.polygon.slice());
		this.triangles = this.geometry.slice();
		this.geometry = this.geometry.reduce(function(r, c) {
			r.push(c[0].x, c[0].y, Math.abs(c[0].x-self.bb.x)/self.bb[2], Math.abs(c[0].y+self.bb.y)/self.bb[3],
				   c[1].x, c[1].y, Math.abs(c[1].x-self.bb.x)/self.bb[2], Math.abs(c[1].y+self.bb.y)/self.bb[3],
				   c[2].x, c[2].y, Math.abs(c[2].x-self.bb.x)/self.bb[2], Math.abs(c[2].y+self.bb.y)/self.bb[3]);
			return r;
		}, []);

		this.vbo = gl.createBuffer(gl.ARRAY_BUFFER);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.geometry), gl.STATIC_DRAW);
	}

	this.render = function() {
		gl.useProgram(this.shader);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);


		gl.uniformMatrix4fv(this.shader.uniforms["u_m4_projection"], false, ProjectionMatrix); 

		var model = Matrix4.create();
		model = Matrix4.translate(model, [this.position.x, this.position.y, 0.0]);
		model = Matrix4.scale(model, [this.size.x, this.size.y, 1.0]);
		
		gl.uniformMatrix4fv(this.shader.uniforms["u_m4_model"], false, model); 
		gl.uniform1i(this.shader.uniforms["u_sampler2d_texture"], 0);
		

		// TODO(brett): this can be moved to a texture starter and stopper

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.enableVertexAttribArray(this.shader.attributes["a_v2_position"]);
		gl.enableVertexAttribArray(this.shader.attributes["a_v2_uv"]);

		gl.vertexAttribPointer(this.shader.attributes["a_v2_position"], 2, gl.FLOAT, gl.FALSE, 16, 0);
		gl.vertexAttribPointer(this.shader.attributes["a_v2_uv"], 2, gl.FLOAT, gl.FALSE, 16, 8);

		gl.drawArrays(gl.TRIANGLES, 0, this.triangles.length * 3);
	}
}

function InitializeGame(resources_array) {
	Canvas = document.getElementById("canvas");
	Width = Canvas.width;
	Height = Canvas.height;

	gl = Canvas.getContext("webgl");

	ProjectionMatrix = Matrix4.ortho(0, Width, Height, 0, 0.1, 100);

	LoadResources(resources_array).done(function(){
		// function CreateResource(key, type, item, src)
		// function CreateTexture(image_object, gl_mag_filter, gl_min_filter, flip)

		var textureShader = CreateShaderProgram(GetRC("texture-shader-vs"), GetRC("texture-shader-fs"), 
			["a_v2_uv", "a_v2_position"],
			["u_f_time", "u_sampler2d_texture", "u_m4_model", "u_m4_view", "u_m4_projection"]);
		CreateResource("texture-shader", "shader", textureShader, null);

		var playerTexture = CreateTexture(GetRC("image-player"), gl.NEAREST, gl.NEAREST, true);
		CreateResource("player-texture", "texture", GetRC("image-player"), GetRC("image-player"));

		var BlueTexture = CreateTexture(GetRC("image-blue"), gl.NEAREST, gl.NEAREST, true);
		CreateResource("tile-blue-texture", "texture", GetRC("image-blue"), GetRC("image-blue"));

		Player = new GameObject([Width/2, Height/2], [GetRC("image-player").width/2, GetRC("image-player").height/2]);
		Player.texture = playerTexture;
		Player.shader = textureShader;
		Player.prepare();

		// GameObjects.push(Player);
		BlueTile1 = new GameObject([0, Height-TileHeight], [TileWidth, TileHeight]);
		BlueTile1.texture = GetRC("tile-blue-texture");
		BlueTile1.shader = textureShader;
		GameObjects.push(BlueTile1);

		Setup();
	});
}

function Setup(levels) { 

	PrepareLevel();
}


function PrepareLevel(id) {
	UpdateAndRender();
}


function UpdateAndRender() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	GameObjects.filter()

	Player.render();



	requestAnimFrame(UpdateAndRender);	
}