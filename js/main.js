var game = {};
var Canvas = null;
var gl = null;

var ProjectionMatrix = null;
var ViewMatrix = null;

var Camera = [];

var CurrentTime = 0.0;
var ElapsedTime = 0.0;

var Width = 1200;
var Height = 800;

var TileWidth = 40;
var TileHeight = 40;

var CurrentLevel = null;

var Player = null;

var GameObjectsStatic = [];
var GameObjectsDynamic = [];

var Resources = {};

function GetRC(k) {
	return Resources[k].item;
}

function GetDefaultResources() {

	var resources = [
		CreateResourceTemplate("image-player", "image", "images/duck_outline_back.png"),
		CreateResourceTemplate("texture-shader-vs", "text", "shaders/texture.vs.glsl"),
		CreateResourceTemplate("texture-shader-fs", "text", "shaders/texture.fs.glsl")
	];

	return resources;
}

function GetStageResources(levelId, stageId) {
	var stagePath = "maps/stage-{1}-{2}.json".format(levelId, stageId);
	var resources = []
	$.get(stagePath).done(function(result){ 
		result.images.foreach(function(imageObj){
			resources.push(CreateResourceTemplate(imageObj.key, "image", imageObj.src));
		})
	});

	return resources;
}

function LoadResources(resource_array) { 
	var p = new Promise();
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audCtx = new AudioContext();
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
            case "audio":
                (function(item){
                    item.item = "";
                    console.log("[=] Audio init: Loading " + resource.src);
                    var req = new XMLHttpRequest();
                    req.responseType = "arraybuffer";
                    req.open('GET' , resource.src, true);
                    req.onload = function() {
                        //audioData = new ArrayBuffer(req.response);
                        item.item = req.response;
                        Resources[item.key] = item;
                        window.audCtx.decodeAudioData(req.response, function(buffer) {
                            item.item = buffer;
                            Resources[item.key] = item;
                        }, function() {
                            console.log("[!] Failed to load audio resource");
                        });
                    };
                    req.send();
                    tryReturn();
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
	this.scaledPolygon = null;

	this.bb = PolygonBoundingBox(this.polygon);
	this.size = size.slice();

	this.triangles = [];
	this.geometry = [];
	this.vbo = null;
	this.texture = null;
	this.shader = null;

	this.stretch = false;

	this.resize = function() {
		this.scaledPolygon = this.polygon.map(function(c){
			return Vector2.multiply(c, self.size)
		});
		return this.scaledPolygon;
	}

	this.update = function() {
		this.resize();
		this.translatedPolygon = this.scaledPolygon.map(function(c){ 
			return Vector2.add(c, self.position);
		});
	}

	this.prepare = function() {
		
		this.resize();
		this.bb = PolygonBoundingBox(this.scaledPolygon);

		var denom = (this.stretch) ? [this.bb[2], this.bb[3]] : [TileWidth, TileHeight];

		this.geometry = TriangulateConvexPolygon(this.scaledPolygon.slice());
		this.triangles = this.geometry.slice();
		this.geometry = this.geometry.reduce(function(r, c) {
			r.push(c[0].x, c[0].y, Math.abs(c[0].x+(self.bb[2]/2))/denom.x, Math.abs(c[0].y+(self.bb[3]/2))/denom.y,
				   c[1].x, c[1].y, Math.abs(c[1].x+(self.bb[2]/2))/denom.x, Math.abs(c[1].y+(self.bb[3]/2))/denom.y,
				   c[2].x, c[2].y, Math.abs(c[2].x+(self.bb[2]/2))/denom.x, Math.abs(c[2].y+(self.bb[3]/2))/denom.y);
			return r;
		}, []);

		this.vbo = gl.createBuffer(gl.ARRAY_BUFFER);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.geometry), gl.STATIC_DRAW);

		this.update();
	}

	this.render = function() {
		gl.useProgram(this.shader);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);


		gl.uniformMatrix4fv(this.shader.uniforms["u_m4_projection"], false, ProjectionMatrix); 
		gl.uniformMatrix4fv(this.shader.uniforms["u_m4_view"], false, ViewMatrix);

		var model = Matrix4.create();
		model = Matrix4.translate(model, [this.position.x, this.position.y, 0.0]);
		// model = Matrix4.scale(model, [this.size.x, this.size.y, 1.0]);
		
		gl.uniformMatrix4fv(this.shader.uniforms["u_m4_model"], false, model); 
		gl.uniform1i(this.shader.uniforms["u_sampler2d_texture"], 0);

		gl.uniform2fv(this.shader.uniforms["u_v2_texture_ratio"], [self.size.x/40, self.size.y/40]);

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

	resource_array = GetDefaultResources();

	//var stages = LoadLevelStages(1);

	gl = Canvas.getContext("webgl");
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	ProjectionMatrix = Matrix4.ortho(0, Width, Height, 0, 0.1, 100);
	Camera = [
		[0.0, 0.0, 0.0],
		[0.0, 0.0, -1.0],
		[0.0, 1.0, 0.0]
	];

	ViewMatrix = Matrix4.lookAt(Camera.x, Camera.y, Camera.z);


	LoadResources(resources_array).done(function(){
		// function CreateResource(key, type, item, src)
		// function CreateTexture(image_object, gl_mag_filter, gl_min_filter, flip)

		var textureShader = CreateShaderProgram(GetRC("texture-shader-vs"), GetRC("texture-shader-fs"), 
			["a_v2_uv", "a_v2_position"],
			["u_f_time", "u_sampler2d_texture", "u_m4_model", "u_m4_view", "u_m4_projection", "u_texture_size"]);
		CreateResource("texture-shader", "shader", textureShader, null);

		var playerTexture = CreateTexture(GetRC("image-player"), gl.NEAREST, gl.NEAREST, false);
		CreateResource("player-texture", "texture", GetRC("image-player"), GetRC("image-player"));

        Audio = new AudioHandler();
        Audio.init();
        
		Player = new GameObject([Width/2, Height/2], [64, 64]);
		Player.texture = playerTexture;
		Player.shader = textureShader;
		Player.shortJumpTime = 100; //ms
		Player.highJumpTime = 140;
		Player.jumpTime = 0.0;
		Player.isJumping = false;
		Player.onGround = false;
		Player.stretch = true;
		Player.lastShot = 0.0;
		

		Player.prepare();

		var mapJson = GetRC("stage-1-1");
		var levelImages = mapJson.images.map(function(c){
			return CreateResourceTemplate(c.key, "image", c.src);
		})

		LoadResources(levelImages).done(function() {
			mapJson.textures.forEach(function(c) {
				var t = CreateTexture(GetRC(c.src), gl.NEAREST, gl.NEAREST, false);
				CreateResource(c.key, "texture", t, GetRC(c.src));
			});

			mapJson.objects.forEach(function(c){
				var obj = new GameObject([c.position.x+c.size.x/2, Height-c.position.y-c.size.y/2], c.size);
				obj.shader = textureShader;
				obj.texture = GetRC(c.texture);
				obj.prepare();
				if(c.static) {
					GameObjectsStatic.push(obj);
				}
			});

			Setup();
		});
	});
}

function Setup(levels) { 

	CurrentTime = +new Date();
	ElapsedTime = 0.0;

	PrepareLevel();
}


function PrepareLevel(id) {
	UpdateAndRender();
}


function UpdateAndRender() {
	var oldTime = CurrentTime;
	CurrentTime = +new Date();
	var frameTime = CurrentTime - oldTime;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var power = 150;
	var drag = 0.83;
	var gravity = [0, 120];

	if(KEYBOARD.keyIsDown("a")) {
		Player.acceleration.x = -power;
	}
	if(KEYBOARD.keyIsDown("d")) {
		Player.acceleration.x = power;
	}
	if(KEYBOARD.keyIsDown("w") || KEYBOARD.keyIsDown("spacebar")) {
		if(Player.onGround) {
			Player.isJumping = true;
			Player.onGround = false;
		}
	}
	else {
		Player.isJumping = false;
		Player.jumpTime = 0.0;
	}

	if(KEYBOARD.keyIsDown("s")) {
		Player.acceleration.y = power;
	}

	if(KEYBOARD.keyIsDown("j")) {

		if(CurrentTime - Player.lastShot > 300) {
			Player.lastShot = CurrentTime;

			var b = new GameObject(Player.position.slice(), [30, 10]);
			b.stretch = true;
			b.texture = GetRC("tile-blue-texture");
			b.shader = GetRC("texture-shader");
			b.velocity = [1200, 0];
			b.prepare();

			GameObjectsDynamic.push(b);
		}
	}

	if(Player.isJumping) {
		Player.jumpTime += frameTime;
		
		if(Player.jumpTime < Player.shortJumpTime) {
			Player.acceleration.y -= power*3.3;
		}
		else if(Player.jumpTime < Player.highJumpTime) {
			Player.acceleration.y -= power*2.5;
		}
	}

	// NOTE(Brett): gravity
	Player.acceleration = Vector2.add(Player.acceleration, gravity);

	Player.velocity = Vector2.add(Player.velocity, Player.acceleration);
	Player.velocity = Vector2.scale(Player.velocity, drag);
	Player.position = Vector2.add(Player.position, Vector2.scale(Player.velocity, frameTime/1000));
	
	Player.acceleration = [0, 0];
	Player.update();

	var cameraDelta = Vector3.scale(Vector3.sub([Player.position.x-Width/2, Player.position.y-Height/2, 0], Camera[0]), 0.05);
	Camera[0] = Vector3.add(Camera[0], cameraDelta);
	Camera[1] = [Camera[0].x, Camera[0].y, -1];
	ViewMatrix = Matrix4.lookAt(Camera[0], Camera[1], Camera[2]);

	GameObjectsStatic.forEach(function(c){
		var collisionResult = SATCollision(Player.translatedPolygon, c.translatedPolygon);
		if(collisionResult) {
			Player.position = Vector2.add(Player.position, Vector2.scale(collisionResult[0], collisionResult[1]));

			if(collisionResult[0].y <= 0 && Math.abs(collisionResult[0].y) > Math.abs(collisionResult[0].x)) {
				Player.onGround = true;
			}
		}
		c.render();
	});

	GameObjectsDynamic = GameObjectsDynamic.filter(function(c) {
		c.position = Vector2.add(c.position, Vector2.scale(c.velocity, frameTime/1000));
		c.update();

		var shouldLive = true;

		c.render();
		for(var i = 0; i < GameObjectsStatic.length; ++i) {
			var s = GameObjectsStatic[i];
			shouldLive = !!!SATCollision(c.translatedPolygon, s.translatedPolygon);
			if(!shouldLive) break;
		}

		return shouldLive;
	});

	Player.render();

	requestAnimFrame(UpdateAndRender);	
}