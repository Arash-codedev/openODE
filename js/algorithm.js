var clone = require('clone');

function array_remove(arr)
{
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax= arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}

function array_exist(arr,value)
{
	return !!arr.find(function(x){return x==value;});
}

function random(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random_id()
{
	return random(10000,99999);
}


function random_exception_tag()
{
	return random(100000000,999999999);
}

function cpp_not_implemented()
{
	return 'throw std::runtime_error("Not implemented. Tag'+random_exception_tag()+'.");';
}

function new_id(obj,prefix)
{
	var id='';
	do
	{
		id=prefix+random_id();
	}while(obj[id]);
	return id;
}

function name_exists(obj,name,id)
{
	for(var property in obj)
		if(obj.hasOwnProperty(property))
			if(obj[property].name==name && obj[property].id!=id)
				return true;
	return false;
}

function field_value_exists(obj,field,field_value,id)
{
	for(var property in obj)
		if(obj.hasOwnProperty(property))
			if(obj[property][field]==field_value && obj[property].id!=id)
				return true;
	return false;
}

function unique(array)
{
	return Array.from(new Set(array));
}

function clock(start)
{
    if(!start)
    	return process.hrtime();
    var end=process.hrtime(start);
    return ((end[0]*1000)+(end[1]/1000000))/1000;
}

// function keys_before(container,id)
// {
// 	var keys=[];
// 	for(var property in container)
// 		if(container.hasOwnProperty(property))
// 		{
// 			if(property==id)
// 				return keys;
// 			else
// 				keys.push(property);
// 		}
// }

// function keys_after(container,id)
// {
// 	var keys=[];
// 	var id_met=false;
// 	for(var property in container)
// 		if(container.hasOwnProperty(property))
// 		{
// 			if(id_met)
// 				keys.push(property);
// 			if(property==id)
// 				id_met=true;
// 		}
// 	return keys;
// }

function extract_keys(container)
{
	var keys=[];
	for(var property in container)
		if(container.hasOwnProperty(property))
			keys.push(property);
	return keys;
}

function field_up(container,id)
{
	var keys=extract_keys(container);
	var index=keys.indexOf(id);
	if(index<0 || index==0)
		return false;
	var tmp=keys[index];
	keys[index]=keys[index-1];
	keys[index-1]=tmp;
	var copy_obj = clone(container);
	for(var property in container)
		if(container.hasOwnProperty(property))
			delete container[property];
	keys.forEach(function(key){
		container[key]=copy_obj[key]
	});
	return true;
}

function field_down(container,id)
{
	var keys=extract_keys(container);
	var index=keys.indexOf(id);
	if(index<0 || index+1>=keys.length)
		return false;
	var tmp=keys[index];
	keys[index]=keys[index+1];
	keys[index+1]=tmp;
	var copy_obj = clone(container);
	for(var property in container)
		if(container.hasOwnProperty(property))
			delete container[property];
	keys.forEach(function(key){
		container[key]=copy_obj[key]
	});
	return true;
}

module.exports.array_remove=array_remove;
module.exports.array_exist=array_exist;
module.exports.random=random;
module.exports.random_id=random_id;
module.exports.random_exception_tag=random_exception_tag;
module.exports.new_id=new_id;
module.exports.name_exists=name_exists;
module.exports.field_value_exists=field_value_exists;
module.exports.cpp_not_implemented=cpp_not_implemented;
module.exports.unique=unique;
module.exports.clock=clock;
module.exports.field_up=field_up;
module.exports.field_down=field_down;

