
function specific_private_variables(content,built,info,is_header)
{
	content.push('\tconst unsigned short stepper_order_value = 5;');
	content.push('\tconst unsigned short error_order_value = 4;');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		content.push('\t'+state_type+' '+control_plant+'_m_dxdt;');
		content.push('\t'+state_type+' '+control_plant+'_m_xerr;');
		content.push('\t'+state_type+' '+control_plant+'_m_xnew;');
		content.push('\t'+state_type+' '+control_plant+'_m_dxdtnew;');
		content.push('\tbool '+control_plant+'_m_first_call;');
		content.push('\t'+state_type+' '+control_plant+'_m_x_tmp;');
		content.push('\t'+state_type+' '+control_plant+'_m_k2;');
		content.push('\t'+state_type+' '+control_plant+'_m_k3;');
		content.push('\t'+state_type+' '+control_plant+'_m_k4;');
		content.push('\t'+state_type+' '+control_plant+'_m_k5;');
		content.push('\t'+state_type+' '+control_plant+'_m_k6;');
	});
}

function class_constructor(content,built,info,is_header)
{
	// solver_function_constructoin_dp5
	var class_prefix=info.system.name+'_solver::';
	var function_headerc=(is_header?'\t':class_prefix)+
		info.system.name+'_solver('+info.system.name+'_manager &usersystem)';
	function_headerc+=(is_header?';':':');
	content.push(function_headerc);
	if(!is_header)
	{
		var inits=[];
		inits.push('\t\tusersystem(usersystem)');
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			inits.push('\t\t'+control_plant+'_m_first_call(true)');
		});
		content.push(inits.join(',\n'));
		content.push('{');
		content.push('\t// constructor');
		content.push('}');
	}
	content.push('');
}

function stepper_adaptive(content,built,info,is_header)
{
	// solver_function_stepper_dp5_adaptive
	require("./rk_dp5_adaptive").stepper_adaptive(content,built,info,is_header);
}


function stepper_fix(content,built,info,is_header)
{
	// solver_function_stepper_dp5_fixed
	require("./rk_dp5_fix").stepper_fix(content,built,info,is_header);
}

module.exports.specific_private_variables=specific_private_variables;
module.exports.class_constructor=class_constructor;
module.exports.stepper_adaptive=stepper_adaptive;
module.exports.stepper_fix=stepper_fix;
