var algorithm     = require(global.appRoot+'/js/algorithm.js');
var system_codegen= require('../codegen.js');

function build_headers(includes_global,includes_local,built,info,is_header)
{
	if(is_header)
	{
		var struct_ids=[];
		includes_global.push('cstddef');
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			['input','state','wire','output'].forEach(function(vartype){
				var field=control_plant+'_'+vartype+'_type';
				var id=info.system[field];
				if(id)
					struct_ids.push(id);
			});
		});
		struct_ids=algorithm.unique(struct_ids);
		struct_ids.forEach(function(id){
			var struct=info.project.data.structures.structs[id];
			if(struct)
				includes_global.push('auto-coded/types/'+struct.name.toLowerCase()+'.hpp');
			else
			{
				var msg='[system.manager]: broken link of structure id "'+id+'" for '+control_plant+' of system '+info.system.name+'. B65865865';
				built.respond.push(msg);
			}
		});
		info.system.devices=info.system.devices || {};
		info.project.data.devices=info.project.data.devices || {};
		info.project.data.devices.items=info.project.data.devices.items || {};
		var sys_devices=info.system.devices;
		var proj_devices=info.project.data.devices.items;
		for(var device_id in sys_devices)
			if(sys_devices.hasOwnProperty(device_id))
			{
				var sys_device=sys_devices[device_id];
				var proj_device=proj_devices[device_id];
				if(sys_device.active)
					includes_global.push('hand-coded/devices/'+proj_device.filebase+'.hpp');
			}
	}
	else
	{
		includes_global.push('auto-coded/systems/'+info.system.filebase+'/manager.hpp');
		info.system_parts.forEach(function(is_controller){
			var control_plant=(is_controller?'controller':'plant');
			includes_global.push('auto-coded/systems/'+info.system.filebase+'/solver.hpp');
			includes_global.push('auto-coded/systems/'+info.system.filebase+'/'+control_plant+'_model.hpp');
			includes_global.push('iostream');
			includes_global.push('stdexcept');
		});
	}
}

function build_constructor(content,built,info,is_header)
{
	if(is_header)
	{
		var function_header='\t'+info.system.name+'_manager()'+';';
		content.push(function_header);
	}
	else
	{
		var function_header=info.system.name+'_manager::'+info.system.name+'_manager():';
		var start_time=info.project.data.build.start_time;
		content.push(function_header);
		content.push('\t\t\tsimulation_continue(true),');
		content.push('\t\t\tobserved_t('+start_time+')');
		content.push('{');
		// info.system_parts.forEach(function(is_controller){
		// 	var ic=is_controller;
		// 	var control_plant=(is_controller?'controller':'plant');
		// 	if(info.input_struct[ic].id)
		// 		content.push('\t'+control_plant+'_input.reset();');
		// 	if(info.wire_struct[ic].id)
		// 		content.push('\t'+control_plant+'_observed_wire.reset();');
		// 	content.push('\t'+control_plant+'_output.reset();');
		// });
		content.push('}');
	}
	content.push('');
}

function build_integrate(content,built,info,is_header)
{
	// var control_plant=(is_controller?'controller':'plant');
	if(is_header)
	{
		content.push('\tsize_t integrate();');
	}
	else
	{
		var class_prefix=info.system.name+'_manager::';
		var start_time=info.project.data.build.start_time;
		var stop_time=info.project.data.build.stop_time;
		var step_size=info.project.data.build.step_size;
		content.push('size_t '+class_prefix+'integrate()');
		content.push('{');
		content.push('\tdouble t_start='+start_time+';');
		content.push('\tdouble t_stop='+(stop_time!='inf'?stop_time:'-1.0')+';');
		content.push('\tdouble dt='+step_size+';');

		var solver_type=info.system.name+'_solver';
		var has_devices=system_codegen.has_devices(info.system);
		var device_parameter=(has_devices?',devices':'');
	
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');

			var manual_init_func=info.system.name+'_'+control_plant+'_manual_inits';
			var init_states_func=info.system.name+'_'+control_plant+'_init_states';
			// var solver_type=info.system.name+'_solver';
			content.push('\t'+manual_init_func+'(*this'+device_parameter+');');
			content.push('\t'+info.state_struct_name[ic]+' '+control_plant+'_state;');
			content.push('\t'+control_plant+'_state.reset();');
			if(info.input_struct[ic].id)
				content.push('\t'+control_plant+'_input.reset();');
			if(info.wire_struct[ic].id)
				content.push('\t'+control_plant+'_observed_wire.reset();');
			content.push('\t'+control_plant+'_output.reset();');
			content.push('\t'+init_states_func+'(t_start,'+control_plant+'_state);');
		});
		content.push('\t'+solver_type+' solver(*this);');

		var state_args=[];
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			state_args.push(control_plant+'_state');
		});
		// content.push('\t'+'bool finalizing_attempted=false;');
		content.push('\t'+'size_t integrate_result=0;');
		content.push('\t'+'try');
		content.push('\t'+'{');
		content.push('\t\t'+'integrate_result=solver.integrate('+state_args.join(',')+',t_start,t_stop,dt);');
		content.push('\t'+'}');
		content.push('\t'+'catch(const exception& e)');
		content.push('\t'+'{');
		content.push('\t\t'+'cout<<e.what()<<endl;');
		content.push('\t'+'}');
		content.push('\t'+'catch(...)');
		content.push('\t'+'{');
		content.push('\t\t'+'cout<<"Unknown error: A'+algorithm.random_exception_tag()+'"<<endl;');
		content.push('\t'+'}');
		info.system_parts.slice().reverse().forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');

			var manual_finalize_func=info.system.name+'_'+control_plant+'_manual_finalize';
			content.push('\t'+manual_finalize_func+'(*this'+device_parameter+');');
		});
		content.push('\treturn integrate_result;');
		content.push('}');
	}
	content.push('');
}

function build_rhs(content,built,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	var ic=is_controller;
	var control_plant_not=(!ic?'controller':'plant');
	if(is_header)
	{
		content.push('\tvoid '+control_plant+'_rhs(');
		content.push('\t\tconst '+info.state_struct_name[ic]+' &state,');
		content.push('\t\t'+info.state_struct_name[ic]+' &state_dot,');
		content.push('\t\tconst double t);');
	}
	else
	{
		var class_prefix=info.system.name+'_manager::';
		content.push('void '+class_prefix+control_plant+'_rhs(');
		content.push('\tconst '+info.state_struct_name[ic]+' &state,');
		content.push('\t'+info.state_struct_name[ic]+' &state_dot,');
		content.push('\tconst double t)');
		content.push('{');
		if(info.wire_struct[ic].id)
		{
			content.push(info.wire_struct_name[ic]+' wire;');
			var args_w='';
			if(info.input_struct[ic].id)
				args_w+='input,';
			args_w+='state,wire,t,observed_wire,observed_t';
			content.push(info.system.name+'_wires('+args_w+');');
		}
		var args_r=[];
		args_r.push('state,state_dot');
		if(info.wire_struct[ic].id)
			args_r.push('wire');
		args_r.push('t');
		if(info.wire_struct[ic].id)
			args_r.push('observed_wire');
		args_r.push('observed_t');
		if(info.input_struct[ic].id)
			args_r.push(control_plant+'_input');
		if(info.output_struct[!ic]&&info.output_struct[!ic].id)
			args_r.push(control_plant_not+'_output');
		content.push('\t'+info.system.name+'_'+control_plant+'_rhs('+args_r.join(',')+');');
		content.push('}');
	}
	content.push('');
}

function build_observer(content,built,info,is_controller,is_header)
{
	var ic=is_controller;
	var control_plant=(ic?'controller':'plant');
	var control_plant_not=(!ic?'controller':'plant');
	var htab=(is_header?'\t':'');
	var has_devices=system_codegen.has_devices(info.system);
	if(is_header)
	{
		content.push('\tvoid '+control_plant+'_observer(');
		content.push('\t\tconst '+info.state_struct_name[ic]+' &state,');
		content.push('\t\tconst double t,');
		content.push('\t\tconst double dt);');
	}
	else
	{
		var class_prefix=info.system.name+'_manager::';
		content.push('void '+class_prefix+control_plant+'_observer(');
		content.push('\t\tconst '+info.state_struct_name[ic]+' &state,');
		content.push('\t\tconst double t,');
		content.push('\t\tconst double /*dt*/)');
		content.push('{');
			/************************************
			*          input udp                *
			************************************/
			/************************************
			*          input file               *
			************************************/
			/************************************
			*          input function           *
			************************************/
		if(info.input_struct[ic].id)
		{
			var argi=[];
			argi.push(control_plant+'_input');
			if(info.output_struct[!ic]&&info.output_struct[!ic].id)
				argi.push(control_plant_not+'_output');
			argi.push('state');
			argi.push('t');
			argi.push('observed_t');
			if(has_devices)
				argi.push('devices');
			content.push('\t'+info.system.name+'_'+
				control_plant+'_input('+
				argi.join(',')+');');
		}
		if(info.wire_struct[ic].id)
		{
			content.push('\t'+info.wire_struct_name[ic]+'wire;');
			var argw=[];
			if(info.input_struct[ic].id)
				argw.push('input');
			argw.push('state');
			if(info.wire_struct[ic].id)
				argw.push('wire');
			argw.push('t');
			if(info.wire_struct[ic].id)
				argw.push('observed_wire');
			argw.push('observed_t');
			content.push('\t'+info.system.name+'_'+
				control_plant+'_wires('+
				argw.join(',')+')');
		}
		var argobs=[];
		argobs.push('simulation_continue');
		argobs.push('state');
		argobs.push('t');
		if(info.wire_struct[ic].id)
			argobs.push('wire');
		argobs.push('observed_t');
		if(info.wire_struct[ic].id)
			argobs.push('observed_wire');
		if(info.input_struct[ic].id)
			argobs.push(control_plant+'_input');
		if(info.output_struct[!ic]&&info.output_struct[!ic].id)
			argobs.push(control_plant_not+'_output');

		argobs.push(control_plant+'_output');
		if(has_devices)
			argobs.push('devices');
		content.push('\t'+info.system.name+'_'+control_plant+
			'_observer('+argobs.join(',')+');');
			/************************************
			*          output udp               *
			************************************/
			/************************************
			*         output function           *
			************************************/
			/************************************
			*         output file               *
			************************************/
		if(info.wire_struct[ic].id)
			content.push('\tobserved_wire=wire;');
		content.push('\tobserved_t=t;');
		content.push('}');
	}
	content.push('');
}

function build_device_class(content,built,info,is_header)
{
	if(!is_header)
		return ;
	var sys_devices=info.system.devices;
	var proj_devices=info.project.data.devices.items;
	var has_devices=system_codegen.has_devices(info.system);
	if(!has_devices)
		return ;

	content.push('struct '+info.system.name+'_Devices');
	content.push('{');
	for(var device_id in sys_devices)
		if(sys_devices.hasOwnProperty(device_id))
		{
			var sys_device=sys_devices[device_id];
			if(sys_device.active)
			{
				var proj_device=proj_devices[device_id];
				content.push('\t'+proj_device.name+' dev_'+proj_device.name.toLowerCase()+';');
			}
		}
	content.push('};');
	content.push('');
}


function build_class(content,built,info,is_header)
{
	if(is_header)
	{
		content.push('class '+info.system.name+'_manager');
		content.push('{');
		content.push('public:');
		content.push('\t// fields');
		content.push('\tbool simulation_continue;');
		content.push('\tdouble observed_t;');
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			if(info.input_struct[ic].id)
				content.push('\t'+info.input_struct_name[ic]+' '+control_plant+'_input;');
			if(info.wire_struct[ic].id)
				content.push('\t'+info.wire_struct_name[ic]+' '+control_plant+'_observed_wire;');
			content.push('\t'+info.output_struct_name[ic]+' '+control_plant+'_output;');
		});
		info.system.devices=info.system.devices || {};
		info.project.data.devices=info.project.data.devices || {};
		info.project.data.devices.items=info.project.data.devices.items || {};
		var sys_devices=info.system.devices;
		var has_devices=system_codegen.has_devices(info.system);
		if(has_devices)
			content.push('\t'+info.system.name+'_Devices devices;');

		// var has_devices=false;
		// for(var device_id in sys_devices)
		// 	if(sys_devices.hasOwnProperty(device_id))
		// 		has_devices=true;
		// if(has_devices)
		// 	content.push('\t'+info.system.name+'_Devices devices;');
		content.push('');
		content.push('\t// methods');
	}
	build_constructor(content,built,info,is_header);
	build_integrate(content,built,info,is_header);
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		build_rhs(content,built,info,is_controller,is_header);
		build_observer(content,built,info,is_controller,is_header);
		// build_input(content,built,info,is_controller,is_header);
	});
	if(is_header)
		content.push('};');
	content.push('');
}

function build_sys_manager(built,info,is_header)
{
	var content=[];
	var includes_global=[];
	var includes_local=[];

	build_headers(includes_global,includes_local,built,info,is_header);
	build_device_class(content,built,info,is_header);
	build_class(content,built,info,is_header);
	var autohand='auto';
	built.files.push({
			path: autohand+'-coded/systems/'+info.system.filebase+'/manager.'+(is_header?'hpp':'cpp'),
			overwrite: true,
			is_json: false,
			is_header: is_header,
			autogen_preamble: true,
			generator_mark: 'G7692348073',
			includes_global: includes_global,
			includes_local: includes_local,
			content: content,
		});
}

module.exports.build_sys_manager=build_sys_manager;
