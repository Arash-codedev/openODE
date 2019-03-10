var algorithm     = require(global.appRoot+'/js/algorithm.js');
var system_codegen= require('../codegen.js');


function build_headers(includes_global,includes_local,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	if(is_header)
	{
		includes_global.push('auto-coded/systems/'+info.system.filebase+'/manager.hpp');
	}
	else
	{
		includes_global.push('auto-coded/systems/'+info.system.filebase+'/'+control_plant+'_model.hpp');
		includes_global.push('stdexcept');
		// includes_global.push('/* ?????? A356465416 */auto-coded/libs/graphics/chaosgraph.hpp');
	}
}

function build_init_states(content,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	var ic=is_controller;
	var struct_name=info.state_struct[ic].name || info.state_struct[ic].msgq;
	var function_header='void '+info.system.name+'_'+control_plant+'_init_states(double /*t*/,'+struct_name+'& /*states0*/)';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\t/* additional opportunity to change the initial states */');
		content.push('\t/* set the initial states here. */');
		content.push('\t/* The current variable is already reset. */');
		content.push('\t/* So, you can skip this function. */');
		content.push('}');
	}
	content.push('');
}

function build_manual_inits(content,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	// var htab=(is_header?'\t':'');
	var unused=[];
	var args=[];
	args.push('\t\t'+info.system.name+'_manager& system');
	unused.push('system');
	var has_devices=system_codegen.has_devices(info.system);
	if(has_devices)
	{
		args.push('\t\t'+info.system.name+'_Devices& devices');
		unused.push('devices');
	}
	var function_header='void '+info.system.name+'_'+control_plant+'_manual_inits(\n';
	function_header+=args.join(',\n')+')'
	// +(is_header?'':'\n\t\t')+info.system.name+'_manager& system)';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\t// initialize the '+info.system.name+' '+control_plant+' here.');
		unused.forEach(function(arg){
			content.push('\t(void)'+arg+';');
		});
		content.push('}');
	}
	content.push('');
}

function build_manual_finalize(content,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	// var function_header='void '+info.system.name+'_'+control_plant+'_manual_finalize('+(is_header?'':'\n\t\t[[maybe_unused]] ')+info.system.name+'_manager& system)';
	// var htab=(is_header?'\t':'');
	var unused=[];
	var args=[];
	args.push('\t\t'+info.system.name+'_manager& system');
	unused.push('system');
	var has_devices=system_codegen.has_devices(info.system);
	if(has_devices)
	{
		args.push('\t\t'+info.system.name+'_Devices& devices');
		unused.push('devices');
	}
	var function_header='void '+info.system.name+'_'+control_plant+'_manual_finalize(\n';
	function_header+=args.join(',\n')+')'
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\t// finalize the '+info.system.name+' '+control_plant+' here.');
		unused.forEach(function(arg){
			content.push('\t(void)'+arg+';');
		});
		content.push('}');
	}
	content.push('');
}

function build_rhs(content,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	var ic=is_controller;
	var control_plant_not=(!ic?'controller':'plant');
	// var htab=(is_header?'\t':'');
	var function_header='void '+info.system.name+'_'+control_plant+'_rhs(\n';

	var args=[]
	var unused=[];
	args.push('\t\tconst '+info.state_struct_name[ic]+' &state');
	unused.push('state');
	args.push('\t\t'+info.state_struct_name[ic]+' &state_dot');
	unused.push('state_dot');
	if(info.wire_struct[ic].id)
	{
		args.push('\t\tconst '+info.wire_struct_name[ic]+' &wire');
		unused.push('wire');
	}
	args.push('\t\tconst double /*t*/');
	if(info.wire_struct[ic].id)
	{
		args.push('\t\t\t\tconst '+info.wire_struct_name[ic]+' &observed_wire');
		unused.push('observed_wire');
	}
	args.push('\t\tconst double /*observed_t*/');
	if(info.input_struct[ic].id)
	{
		args.push('\t\tconst '+info.input_struct_name[ic]+' &input');
		unused.push('input');
	}
	if(info.output_struct[!ic]&&info.output_struct[!ic].id)
	{
		args.push('\t\tconst '+info.output_struct_name[!ic]+' &'+control_plant_not+'_output');
		unused.push(control_plant_not+'_output');
	}
	function_header+=args.join(',\n')+')';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\t// add your '+control_plant+' dynamic here.');
		// content.push('\t(void)state;');
		// content.push('\t(void)state_dot;');
		// if(info.input_struct[ic].id)
		// 	content.push('\t(void)input;');
		unused.forEach(function(arg){
			content.push('\t(void)'+arg+';');
		});

		content.push('\t'+algorithm.cpp_not_implemented());
		content.push('}');
	}
	content.push('');
}

function build_wires(content,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	var ic=is_controller;
	// var htab=(is_header?'\t':'');
	if(!info.wire_struct[ic].id)
		return ;

	var function_header='void '+info.system.name+'_'+control_plant+'_wires(\n';

	var args=[];
	var unused=[];
	if(info.input_struct[ic].id)
		args.push('\t\tconst '+info.input_struct_name[ic]+' &input');
	args.push('\t\tconst '+info.state_struct_name[ic]+' &state');
	unused.push('state');
	args.push('\t\tconst '+info.wire_struct_name[ic]+' &wire');
	unused.push('wire');
	args.push('\t\tconst double t');
	unused.push('t');
	args.push('\t\tconst '+info.wire_struct_name[ic]+' &/*observed_wire*/');
	args.push('\t\tconst double /*observed_t*/');
	function_header+=args.join(',\n')+')';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\t// add your '+control_plant+' middle computation here.');
		// content.push('\t(void)input;');
		// content.push('\t(void)state;');
		// content.push('\t(void)wire;');
		// content.push('\t(void)t;');
		unused.forEach(function(arg){
			content.push('\t(void)'+arg+';');
		});
		content.push('\t'+algorithm.cpp_not_implemented());
		content.push('}');
	}
	content.push('');
}

function build_input(content,info,is_controller,is_header)
{
	var ic=is_controller;
	var control_plant=(ic?'controller':'plant');
	var control_plant_not=(!ic?'controller':'plant');
	if(!info.input_struct[ic].id)
		return ;

	// var htab=(is_header?'\t':'');
	var function_header='void '+info.system.name+'_'+control_plant+'_input(\n';

	var args=[];
	var unused=[];
	args.push('\t\t'+info.input_struct_name[ic]+' &input');
	unused.push('input');
	if(info.output_struct[!ic]&&info.output_struct[!ic].id)
	{
		args.push('\t\tconst '+info.output_struct_name[!ic]+' &'+control_plant_not+'_output');
		unused.push(control_plant_not+'_output');
	}
	args.push('\t\tconst '+info.state_struct_name[ic]+' &state');
	unused.push('state');
	args.push('\t\tconst double t');
	unused.push('t');
	args.push('\t\tconst double /*observed_t*/');

	var has_devices=system_codegen.has_devices(info.system);
	if(has_devices)
	{
		args.push('\t\t'+info.system.name+'_Devices &devices');
		unused.push('devices');
	}
	function_header+=args.join(',\n')+')';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\t// add your '+control_plant+' input computations here.');
		// content.push('\t(void)input;');
		// if(info.output_struct[!ic]&&info.output_struct[!ic].id)
		// 	content.push('\t(void)'+control_plant_not+'_output');
		// content.push('\t(void)state;');
		// content.push('\t(void)t;');
		unused.forEach(function(arg){
			content.push('\t(void)'+arg+';');
		});
		content.push('\t'+algorithm.cpp_not_implemented());
		content.push('}');
	}
	content.push('');
}

function build_observer(content,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	var ic=is_controller;
	var control_plant_not=(!ic?'controller':'plant');
	var has_devices=system_codegen.has_devices(info.system);

	var function_header='void '+info.system.name+'_'+control_plant+'_observer(\n';
	// var htab=(is_header?'\t':'');
	var args=[];
	var unused=[];
	args.push('\t\tbool &/*simulation_continue*/');
	// unused.push('simulation_continue');
	args.push('\t\tconst '+info.state_struct_name[ic]+' &state');
	unused.push('state');
	args.push('\t\tconst double t');
	unused.push('t');
	if(info.wire_struct[ic].id)
	{
		args.push('\t\tconst '+info.wire_struct_name[ic]+' &wire');
		unused.push('wire');
		args.push('\t\tconst '+info.wire_struct_name[ic]+' &/*observed_wire*/');
	}
	args.push('\t\tconst double /*observed_t*/');
	if(info.input_struct[ic].id)
	{
		args.push('\t\tconst '+info.input_struct_name[ic]+' &input');
		unused.push('input');
	}
	if(info.output_struct[!ic]&&info.output_struct[!ic].id)
	{
		args.push('\t\tconst '+info.output_struct_name[!ic]+' &'+control_plant_not+'_output');
		unused.push(control_plant_not+'_output');
	}
	if(info.output_struct[ic].id)
	{
		args.push('\t\t'+info.output_struct_name[ic]+' &output');
		unused.push('output');
	}
	if(has_devices)
	{
		args.push('\t\t'+info.system.name+'_Devices& /*devices*/');
		// unused.push('devices');
	}

	function_header+=args.join(',\n')+')';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\t// add your '+control_plant+' output calculation here.');
		// content.push('\t(void)state;');
		// content.push('\t(void)t;');
		// content.push('\t(void)output;');
		unused.forEach(function(arg){
			content.push('\t(void)'+arg+';');
		});
		// content.push('}');
		// ?????????????????????
		content.push('\t'+algorithm.cpp_not_implemented());
		content.push('}');
	}
	content.push('');
}

function build_sys_model(built,info,is_controller,is_header)
{
	var control_plant=(is_controller?'controller':'plant');
	var content=[];
	var includes_global=[];
	var includes_local=[];

	build_headers(includes_global,includes_local,info,is_controller,is_header);
	build_init_states(content,info,is_controller,is_header);
	build_manual_inits(content,info,is_controller,is_header);
	build_manual_finalize(content,info,is_controller,is_header);
	build_rhs(content,info,is_controller,is_header);
	build_wires(content,info,is_controller,is_header);
	build_input(content,info,is_controller,is_header);
	build_observer(content,info,is_controller,is_header);
	var autohand=(is_header?'auto':'hand');
	built.files.push({
			path: autohand+'-coded/systems/'+info.system.filebase+'/'+control_plant+'_model.'+(is_header?'hpp':'cpp'),
			overwrite: is_header,
			is_json: false,
			is_header: is_header,
			autogen_preamble: is_header,
			generator_mark: 'G54168791813',
			includes_global: includes_global,
			includes_local: includes_local,
			content: content,
		});
}

module.exports.build_sys_model=build_sys_model;
