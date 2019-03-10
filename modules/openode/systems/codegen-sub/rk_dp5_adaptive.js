
function try_step(content,built,info,is_header)
{
	// try_step
	var class_prefix=(is_header?'':info.system.name+'_solver::');
	var htab=(is_header?'\t':'');
	content.push(htab+'controlled_step_result '+class_prefix+'try_step(');
	content.push(htab+'\t\t'+info.system.name+'_manager &usersystem,');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		content.push(htab+'\t'+state_type+' &'+control_plant+'_x,');
	});	
	content.push(htab+'\t\tdouble &t,');
	content.push(htab+'\t\tdouble &dt)'+(is_header?';':''));
	if(!is_header)
	{
		content.push('{');
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			var state_type=info.state_struct_name[ic];
			content.push('\tif('+control_plant+'_m_first_call)');
			content.push('\t{');
			content.push('\t\t// initialize');
			content.push('\t\tusersystem.'+control_plant+'_rhs('+control_plant+'_x,'+control_plant+'_m_dxdt,t);');
			content.push('\t\t'+control_plant+'_m_first_call=false;');
			content.push('\t}');
		});
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			var state_type=info.state_struct_name[ic];
			content.push('\tcontrolled_step_result res=try_step2(usersystem,'+control_plant+'_x,'+control_plant+'_m_dxdt,t,'+control_plant+'_m_xnew,'+control_plant+'_m_dxdtnew,dt);');
		});
		content.push('\tif(res==controlled_step_result::success)');
		content.push('\t{');
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			var state_type=info.state_struct_name[ic];
			content.push('\t'+control_plant+'_x='+control_plant+'_m_xnew;');
			content.push('\t'+control_plant+'_m_dxdt='+control_plant+'_m_dxdtnew;');
		});
		content.push('\t}');
		content.push('\treturn res;');
		content.push('}');
	}
	content.push('');
}

function try_step2(content,built,info,is_header)
{
	// try_step2
	var class_prefix=(is_header?'':info.system.name+'_solver::');
	var htab=(is_header?'\t':'');
	content.push('controlled_step_result '+class_prefix+'try_step2(');
	content.push('\t\t'+info.system.name+'_manager &system,');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		content.push('\t\tconst '+state_type+' &'+control_plant+'_x_in,');
	});
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		content.push('\t\tconst '+state_type+' &'+control_plant+'_dxdt_in,');
	});
	content.push('\t\tdouble &t,');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		content.push('\t\t'+state_type+' &'+control_plant+'_x_out,');
	});
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		// content.push('\t\tconst '+state_type+' &dxdt_in,');
		content.push('\t\t'+state_type+' &'+control_plant+'_dxdt_out,');
	});
	content.push('\t\tdouble &dt)'+(is_header?';':''));
	if(!is_header)
	{
		content.push('{');
		var max_exists=!isNaN(Number(info.project.data.build.step_max));
		var min_exists=!isNaN(Number(info.project.data.build.step_min));
		var maxmin_exists=max_exists||min_exists;
		if(maxmin_exists)
			content.push('\tbool dt_overwritten=false;');
		if(!isNaN(Number(info.project.data.build.step_min)))
		{
			content.push('\tif(dt<min_dt)');
			content.push('\t{');
			content.push('\t\tdt=min_dt; // added for minimum step size');
			content.push('\t\tdt_overwritten=true;');
			content.push('\t}');
		}
		if(!isNaN(Number(info.project.data.build.step_max)))
		{
			content.push('\tif(dt>max_dt)');
			content.push('\t{');
			content.push('\t\tdt=max_dt; // added for maximum step size');
			content.push('\t\tdt_overwritten=true;');
			content.push('\t}');
		}
		var args_x_in='';
		var args_dxdt_in='';
		var args_x_out='';
		var args_dxdt_out='';
		var args_m_xerr='';
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			var state_type=info.state_struct_name[ic];
			args_x_in=control_plant+'_x_in';
			args_dxdt_in=control_plant+'_dxdt_in';
			args_x_out=control_plant+'_x_out';
			args_dxdt_out=control_plant+'_dxdt_out';
			args_m_xerr=control_plant+'_m_xerr';
	
			var do_step_args=[];
			do_step_args.push('usersystem');
			do_step_args.push(args_x_in);
			do_step_args.push(args_dxdt_in);
			do_step_args.push('t');
			do_step_args.push(args_x_out);
			do_step_args.push(args_dxdt_out);
			do_step_args.push('dt');
			do_step_args.push(args_m_xerr);

			var error_args=[];
			error_args.push(args_x_in);
			error_args.push(args_dxdt_in);
			error_args.push(args_m_xerr);
			error_args.push('dt');

			content.push('\tdo_step('+do_step_args.join(',')+');');
			content.push('\t// this potentially overwrites m_x_err! (standard_error_checker does, at least)');
			content.push('\tdouble max_rel_err='+control_plant+'_error('+error_args.join(',')+');');
			content.push('\tif(max_rel_err>1.0'+(maxmin_exists?'&&!dt_overwritten':'')+')');
			content.push('\t{');
			content.push('\t\t// error too large - decrease dt ,limit scaling factor to 0.2 and reset state');
			content.push('\t\t// simplified: max(9/10*pow(max_rel_err,-1/(m_stepper.error_order_value - 1) ) ,1/5 );');
			content.push('\t\tdt*=std::max(double(double(9)/double(10) *');
			content.push('\t\t\t\t\tpow(max_rel_err,double(-1) / (error_order_value - 1 ) ) ) ,');
			content.push('\t\t\t\t\tdouble(double(1)/double(5)) );');
			content.push('\t\treturn controlled_step_result::fail;');
			content.push('\t}');
			content.push('\telse');
			content.push('\t{');
				content.push('\t\tt+=dt;');
				content.push('\t\tif(max_rel_err<0.5)');
				content.push('\t\t{   //error too small - increase dt and keep the evolution and limit scaling factor to 5.0');
				content.push('\t\t\t// error should be > 0');
				content.push('\t\t\tmax_rel_err=std::max(double(pow(double(5.0),-double(stepper_order_value))),max_rel_err);');
				content.push('\t\t\t// simplified: 9/10 * pow(max_rel_err,-1 / m_stepper.stepper_order_value )');
				content.push('\t\t\tdt*= double(double(9)/double(10) * pow(max_rel_err,double(-1)/stepper_order_value));');
				content.push('\t\t}');
				content.push('\t\treturn controlled_step_result::success;');
			content.push('\t}');
		});
		content.push('}');
	}
	content.push('');
}

function do_step(content,built,info,is_header)
{
	// do_step
	var class_prefix=(is_header?'':info.system.name+'_solver::');
	var htab=(is_header?'\t':'');
	content.push('void '+class_prefix+'do_step(');
	var dsargs=[];
	dsargs.push(info.system.name+'_manager &usersystem');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		dsargs.push('const '+state_type+' &'+control_plant+'_x_in');
	});
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		dsargs.push('const '+state_type+' &'+control_plant+'_dxdt_in');
	});
	dsargs.push('double &t');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		dsargs.push(state_type+' &'+control_plant+'_x_out');
	});
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		dsargs.push(state_type+' &'+control_plant+'_dxdt_out');
	});
	dsargs.push('double &dt');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');
		var state_type=info.state_struct_name[ic];
		dsargs.push(state_type+' &'+control_plant+'_xerr');
	});
	content.push(htab+'\t\t'+dsargs.join(',\n\t\t'+htab)+')'+(is_header?';':''));
	if(!is_header)
	{
		content.push('{');

		content.push('\tconst double a2 = double(1)/double(5);');
		content.push('\tconst double a3 = double(3)/double(10);');
		content.push('\tconst double a4 = double(4)/double(5);');
		content.push('\tconst double a5 = double(8)/double(9);');
		content.push('');
		content.push('\tconst double b21 = double(1)/double(5);');
		content.push('');
		content.push('\tconst double b31 = double(3)/double(40);');
		content.push('\tconst double b32 = double(9)/double(40);');
		content.push('');
		content.push('\tconst double b41 = double(44)/double(45);');
		content.push('\tconst double b42 = double(-56)/double(15);');
		content.push('\tconst double b43 = double(32)/double(9);');
		content.push('');
		content.push('\tconst double b51 = double(19372)/double(6561);');
		content.push('\tconst double b52 = double(-25360)/double(2187);');
		content.push('\tconst double b53 = double(64448)/double(6561);');
		content.push('\tconst double b54 = double(-212)/double(729);');
		content.push('');
		content.push('\tconst double b61 = double(9017)/double(3168);');
		content.push('\tconst double b62 = double(-355)/double(33);');
		content.push('\tconst double b63 = double(46732)/double(5247);');
		content.push('\tconst double b64 = double(49)/double(176);');
		content.push('\tconst double b65 = double(-5103)/double(18656);');
		content.push('');
		content.push('\tconst double c1 = double(35)/double(384);');
		content.push('\tconst double c3 = double(500)/double(1113);');
		content.push('\tconst double c4 = double(125)/double(192);');
		content.push('\tconst double c5 = double(-2187)/double(6784);');
		content.push('\tconst double c6 = double(11)/double(84);');
		content.push('');
		content.push('\tconst double dc1 = c1 - double(5179)/double(57600);');
		content.push('\tconst double dc3 = c3 - double(7571)/double(16695);');
		content.push('\tconst double dc4 = c4 - double(393)/double(640);');
		content.push('\tconst double dc5 = c5 - double(-92097)/double(339200);');
		content.push('\tconst double dc6 = c6 - double(187)/double(2100);');
		content.push('\tconst double dc7 = double(-1)/double(40);');
		content.push('');
		var step1=[];
		var step2=[];
		var step3=[];
		var step4=[];
		var step5=[];
		var step6=[];
		var step7=[];
		var step8=[];
		var step9=[];
		var step10=[];
		var step11=[];
		var step12=[];
		var step13=[];
		var step14=[];
		var step15=[];
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			var state_type=info.state_struct_name[ic];
			step1.push('\t'+control_plant+'_m_x_tmp='+control_plant+'_x_in+dt*b21*'+control_plant+'_dxdt_in;');
		
			step2.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k2,t+dt*a2);');
			step3.push('\t'+control_plant+'_m_x_tmp='+control_plant+'_x_in+dt*b31*'+control_plant+'_dxdt_in+dt*b32*'+control_plant+'_m_k2; // why cannot factor dt????');

			step4.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k3,t+dt*a3);');
			step5.push('\t'+control_plant+'_m_x_tmp='+control_plant+'_x_in+dt*b41*'+control_plant+'_dxdt_in+dt*b42*'+control_plant+'_m_k2+dt*b43*'+control_plant+'_m_k3;');

			step6.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k4,t+dt*a4);');
			step7.push('\t'+control_plant+'_m_x_tmp='+control_plant+'_x_in+dt*b51*'+control_plant+'_dxdt_in+dt*b52*'+control_plant+'_m_k2+dt*b53*'+control_plant+'_m_k3+dt*b54*'+control_plant+'_m_k4;');

			step8.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k5,t+dt*a5);');
			step9.push('\t'+control_plant+'_m_x_tmp='+control_plant+'_x_in+dt*b61*'+control_plant+'_dxdt_in+dt*b62*'+control_plant+'_m_k2+dt*b63*'+control_plant+'_m_k3+dt*b64*'+control_plant+'_m_k4+dt*b65*'+control_plant+'_m_k5;');

			step10.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_m_x_tmp,'+control_plant+'_m_k6,t+dt);');
			step11.push('\t'+control_plant+'_x_out='+control_plant+'_x_in+dt*c1*'+control_plant+'_dxdt_in+dt*c3*'+control_plant+'_m_k3+dt*c4*'+control_plant+'_m_k4+dt*c5*'+control_plant+'_m_k5+dt*c6*'+control_plant+'_m_k6;');

			step13.push('\tusersystem.'+control_plant+'_rhs('+control_plant+'_x_out,'+control_plant+'_dxdt_out,t+dt);');
			
			step15.push('\t'+control_plant+'_xerr=dt*dc1*'+control_plant+'_dxdt_in+dt*dc3*'+control_plant+'_m_k3+dt*dc4*'+control_plant+'_m_k4+dt*dc5*'+control_plant+'_m_k5+dt*dc6*'+control_plant+'_m_k6+dt*dc7*'+control_plant+'_dxdt_out;');
		});
		step12.push('\t// the new derivative');
		step14.push('\t//error estimate');
		
		[step1,[''],step2,step3,[''],step4,step5,[''],
		 step6,step7,[''],step8,step9,[''],step10,step11,
		 [''],step12,step13,[''],step14,step15].forEach(function(step){
			step.forEach(function(line){
				content.push(line);
			});
		});
		content.push('}');
	}
	content.push('');
}

function stepper_adaptive(content,built,info,is_header)
{
	try_step(content,built,info,is_header);
	try_step2(content,built,info,is_header);
	do_step(content,built,info,is_header);
}

module.exports.stepper_adaptive=stepper_adaptive;

