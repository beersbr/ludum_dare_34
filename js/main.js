var game = {};
var gl = null;

var CurrentTime = 0.0;
var ElapsedTime = 0.0;

var resource = {};



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