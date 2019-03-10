
function do_step(content,built,info,is_header)
{
	var class_prefix=(is_header?'':info.system.name+'_solver::');
	var htab=(is_header?'\t':'');
	// do_step
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		// content.push(htab+'\t'+state_type+' &'+control_plant+'_x,');
		content.push(htab+'void '+class_prefix+control_plant+'_do_step(');
		content.push(htab+'\t\t'+info.system.name+'_manager &usersystem,');
		content.push(htab+'\t\t'+state_type+' &'+control_plant+'_x,');
		content.push(htab+'\t\tdouble &t,');
		content.push(htab+'\t\tdouble &dt)'+(is_header?';':''));
		if(!is_header)
		{
			content.push('{');
			content.push('\tif('+control_plant+'_m_first_call)');
			content.push('\t{');
			content.push('\t\t// initialize');
			content.push('\t\tusersystem.'+control_plant+'_rhs('+control_plant+'_x,'+control_plant+'_m_dxdt,t);');
			content.push('\t\t'+control_plant+'_m_first_call=false;');
			content.push('\t}');
			content.push('\t'+control_plant+'_do_step2(usersystem,'+control_plant+'_x,'+control_plant+'_m_dxdt,t,'+control_plant+'_x,'+control_plant+'_m_dxdt,dt);');
			content.push('}');
		}
		content.push('');
	});		
}

function do_step2(content,built,info,is_header)
{
	var class_prefix=(is_header?'':info.system.name+'_solver::');
	var htab=(is_header?'\t':'');
	// do_step2
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		content.push(htab+'void '+class_prefix+control_plant+'_do_step2(');
		content.push('\t\t'+info.system.name+'_manager &usersystem,');
		content.push('\t\tconst '+state_type+' &x_in,');
		content.push('\t\tconst '+state_type+' &dxdt_in,');
		content.push('\t\tdouble t,');
		content.push('\t\t'+state_type+' &x_out,');
		content.push('\t\t'+state_type+' &dxdt_out,');
		content.push('\t\tdouble &dt)'+(is_header?';':''));
		if(!is_header)
		{
			content.push('{');
			content.push('\tconst double a2=double(1)/double(5);');
			content.push('\tconst double a3=double(3)/double(10);');
			content.push('\tconst double a4=double(4)/double(5);');
			content.push('\tconst double a5=double(8)/double(9);');
			content.push('');
			content.push('\tconst double b21=double(1)/double(5);');
			content.push('');
			content.push('\tconst double b31=double(3)/double(40);');
			content.push('\tconst double b32=double(9)/double(40);');
			content.push('');
			content.push('\tconst double b41=double(44)/double(45);');
			content.push('\tconst double b42=double(-56)/double(15);');
			content.push('\tconst double b43=double(32)/double(9);');
			content.push('');
			content.push('\tconst double b51=double(19372)/double(6561);');
			content.push('\tconst double b52=double(-25360)/double(2187);');
			content.push('\tconst double b53=double(64448)/double(6561);');
			content.push('\tconst double b54=double(-212)/double(729);');
			content.push('');
			content.push('\tconst double b61=double(9017)/double(3168);');
			content.push('\tconst double b62=double(-355)/double(33);');
			content.push('\tconst double b63=double(46732)/double(5247);');
			content.push('\tconst double b64=double(49)/double(176);');
			content.push('\tconst double b65=double(-5103)/double(18656);');
			content.push('');
			content.push('\tconst double c1=double(35)/double(384);');
			content.push('\tconst double c3=double(500)/double(1113);');
			content.push('\tconst double c4=double(125)/double(192);');
			content.push('\tconst double c5=double(-2187)/double(6784);');
			content.push('\tconst double c6=double(11)/double(84);');
			content.push('');
			content.push('\t'+control_plant+'_m_x_tmp= x_in+dt*b21*dxdt_in;');
			content.push('');
			content.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k2,t+dt*a2);');
			content.push('\t'+control_plant+'_m_x_tmp= x_in+dt*b31*dxdt_in+dt*b32*'+control_plant+'_m_k2;');
			content.push('');
			content.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k3,t+dt*a3);');
			content.push('\t'+control_plant+'_m_x_tmp=x_in+dt*b41*dxdt_in+dt*b42*'+control_plant+'_m_k2+dt*b43*'+control_plant+'_m_k3;');
			content.push('');
			content.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp, '+control_plant+'_m_k4,t+dt*a4);');
			content.push('\t'+control_plant+'_m_x_tmp=x_in+dt*b51*dxdt_in+dt*b52*'+control_plant+'_m_k2+ dt*b53*'+control_plant+'_m_k3+dt*b54*'+control_plant+'_m_k4;');
			content.push('');
			content.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k5,t+dt*a5);');
			content.push('\t'+control_plant+'_m_x_tmp=x_in+dt*b61*dxdt_in+dt*b62*'+control_plant+'_m_k2+dt*b63*'+control_plant+'_m_k3+dt*b64*'+control_plant+'_m_k4+dt*b65*'+control_plant+'_m_k5 ;');
			content.push('');
			content.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k6,t+dt);');
			content.push('\tx_out= x_in+dt*c1*dxdt_in+dt*c3*'+control_plant+'_m_k3+dt*c4*'+control_plant+'_m_k4+dt*c5*'+control_plant+'_m_k5+dt*c6*'+control_plant+'_m_k6;');
			content.push('');
			content.push('\t// the new derivative');
			content.push('\tusersystem.'+control_plant+'_rhs(x_out,dxdt_out,t+dt);');
			content.push('}');
		}
		content.push('');
	});
}

function stepper_fix(content,built,info,is_header)
{
	do_step(content,built,info,is_header);
	do_step2(content,built,info,is_header);
}

module.exports.stepper_fix=stepper_fix;

