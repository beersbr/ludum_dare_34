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