var odeMRoot     = global.appRoot+'/modules/openode';
var build_codegen=require(odeMRoot+'/build/codegen.js');

function get_struct(info,built,is_controller,fieldbase,compulsory)
{
	var result={};
	var control_plant=(is_controller?'controller':'plant');
	var field=(is_controller?'controller':'plant')+'_'+fieldbase+'_type';
	var struct_id=info.system[field];
	if(!struct_id)
	{
		var msg='undefined '+fieldbase+' structure ';
		var msg2='[system]: '+msg+' for '+control_plant+' of system '+info.system.name;
		result.msg=msg;
		if(compulsory)
			built.respond.push(msg2);
		return result;
	}
	var struct=info.project.data.structures.structs[struct_id];
	result.struct=struct;
	if(!struct)
	{
		var msg='broken '+fieldbase+' structure link with id '+struct_id;
		var msg2='[system]: '+msg+' \n\t\tfor '+control_plant+' of system '+info.system.name;
		result.msg=msg;
		result.msgq='??? '+msg+' ???';
		built.respond.push(msg2);
	}
	else
	{
		result.name=struct.name;
		result.id=struct.id;
	}
	return result;	
}

function build_system_model(built,info,is_controller)
{
	var codegen=require('./codegen-sub/model.js');
	codegen.build_sys_model(built,info,is_controller,true);
	codegen.build_sys_model(built,info,is_controller,false);
}

function build_system_solver(built,info)
{
	var codegen=require('./codegen-sub/solver.js');
	codegen.build_sys_solver(built,info,true);
	codegen.build_sys_solver(built,info,false);
}

function build_system_manager(built,info)
{
	var codegen=require('./codegen-sub/manager.js');
	codegen.build_sys_manager(built,info,true);
	codegen.build_sys_manager(built,info,false);
}

function build_system_model_parts(built,info)
{
	info.system_parts.forEach(function(is_controller){
		// info.is_controller=is_controller;
		build_system_model(built,info,is_controller);
	});
}

function build_system_load_structures(built,info)
{
	var system_parts=[];
	if(info.system.has_controller)
		system_parts.push(true);
	if(info.system.has_plant)
		system_parts.push(false);
	info.system_parts=system_parts;

	info.state_struct={};
	info.state_struct_name={};
	info.wire_struct={};
	info.wire_struct_name={};
	info.input_struct={};
	info.input_struct_name={};
	info.output_struct={};
	info.output_struct_name	={};
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		info.state_struct[ic]=get_struct(info,built,ic,'state',true);
		info.state_struct_name[ic]=info.state_struct[ic].name || info.state_struct[ic].msgq;
		info.wire_struct[ic]=get_struct(info,built,ic,'wire',false);
		info.wire_struct_name[ic]=info.wire_struct[ic].name || info.wire_struct[ic].msgq;
		info.input_struct[ic]=get_struct(info,built,ic,'input',false);
		info.input_struct_name[ic]=info.input_struct[ic].name || info.input_struct[ic].msgq;
		info.output_struct[ic]=get_struct(info,built,ic,'output',true);
		info.output_struct_name[ic]=info.output_struct[ic].name || info.output_struct[ic].msgq;
	});
}

function build_systems(project,built)
{
	built.files=built.files || [];
	built.respond=built.respond || [];
	var systems=project.data.systems.items;
	for(var system_id in systems)
		if(systems.hasOwnProperty(system_id))
		{
			var system=systems[system_id];
			var info={};
			info.project=project;
			info.system=system;
			build_system_load_structures(built,info);
			build_system_model_parts(built,info);
			build_system_manager(built,info);
			build_system_solver(built,info);
		}
	return ;
}

function has_devices(system)
{
	var sys_devices=system.devices;
	for(var device_id in sys_devices)
		if(sys_devices.hasOwnProperty(device_id))
			return true;
	return false;
}

module.exports.has_devices=has_devices;
module.exports.build_systems=build_systems;
