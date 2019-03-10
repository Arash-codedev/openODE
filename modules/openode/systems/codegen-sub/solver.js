var algorithm = require(global.appRoot+'/js/algorithm.js');
var rk_dp5 = require('./rk_dp5.js');
var rk_ck45 = require('./rk_ck45.js');
var rk_f78 = require('./rk_f78.js');

function build_headers(includes_global,includes_local,built,info,is_header)
{
	// var control_plant=(is_controller?'controller':'plant');
	if(is_header)
	{
		includes_global.push('limits');
		includes_global.push('auto-coded/types/general_types.hpp');
		var struct_ids=[];
		info.system_parts.forEach(function(is_controller){
			var ic=is_controller;
			var control_plant=(is_controller?'controller':'plant');
			['state'].forEach(function(vartype){
				var field=is_controller+'_'+vartype+'_type';
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
				var msg='[system.solver]: broken link of structure id "'+id+'" for '+control_plant+' of system '+info.system.name+'. B654161462';
				built.respond.push(msg);
			}
		});
	}
	else
	{
		if(info.project.data.build.step_type=='realtime_fix')
			includes_global.push('chrono');
		includes_global.push('auto-coded/systems/'+info.system.filebase+'/manager.hpp');
		info.system_parts.forEach(function(is_controller){
			var control_plant=(is_controller?'controller':'plant');
			includes_global.push('auto-coded/systems/'+info.system.filebase+'/solver.hpp');
			includes_global.push('auto-coded/systems/'+info.system.filebase+'/'+control_plant+'_model.hpp');
		});
		if(info.project.data.build.step_type=='realtime_fix')
			includes_global.push('unistd.h');
		if(info.project.data.build.step_type=='simulation_adaptive')
		{
			includes_global.push('algorithm');
			includes_global.push('cmath');
			includes_global.push('stdexcept');
		}
	}
}

function solver_class_private_variables(content,built,info,is_header)
{
	// solver_step_variables
	if(is_header)
	{
		content.push('\t'+info.system.name+'_manager &usersystem;');
		content.push('\tstatic constexpr double epsilon=std::numeric_limits<double>::epsilon();');
		content.push('\tstatic constexpr double m_eps_abs='+info.project.data.build.eps_abs+';');
		content.push('\tstatic constexpr double m_eps_rel='+info.project.data.build.eps_rel+';');
		content.push('\tstatic constexpr double m_a_x=1.0;');
		content.push('\tstatic constexpr double m_a_dxdt=1.0;');
		if(!isNaN(Number(info.project.data.build.step_min)))
			content.push('\tstatic constexpr double min_dt='+info.project.data.build.step_min+';');
		if(!isNaN(Number(info.project.data.build.step_max)))
			content.push('\tstatic constexpr double max_dt='+info.project.data.build.step_max+';');
		var ode_solver=info.project.data.build.ode_solver;
		switch(ode_solver)
		{
			case 'Dormand-Prince-45':
				rk_dp5.specific_private_variables(content,built,info);
				break;
			case 'Cash-Karp-45':
				rk_ck45.specific_private_variables(content,built,info);
				break;
			case 'Fehlberg-78':
				rk_f78.specific_private_variables(content,built,info);
				break;
			default:
				var msg='[Solver.vars] ODE solver \''+ode_solver+'\' not defined.';
				built.respond.push(msg);
				console.log('Code reached here. A56814614868');
		}
		content.push('');
	}
}

function solver_function_less_with_sign(content,built,info,is_header)
{
	// solver_function_less_with_sign
	var class_prefix=info.system.name+'_solver::';
	var function_header=(is_header?'\tbool ':'bool '+class_prefix)+
		'less_with_sign(double t1,double t2,double dt)';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\tif(dt>0.0)');
		content.push('\t\t//return t1 < t2;');
		content.push('\t\treturn t2-t1 > epsilon;');
		content.push('\telse');
		content.push('\t\t//return t1 > t2;');
		content.push('\t\treturn t1-t2 > epsilon;');
		content.push('}');
	}
	content.push('');
}

function solver_function_less_eq_with_sign(content,built,info,is_header)
{
	// solver_function_less_eq_with_sign
	var class_prefix=info.system.name+'_solver::';
	var function_header=(is_header?'\tbool ':'bool '+class_prefix)+
		'less_eq_with_sign(double t1,double t2,double dt)';
	if(is_header)
	{
		content.push(function_header+';');
	}
	else
	{
		content.push(function_header);
		content.push('{');
		content.push('\tif(dt>0.0)');
		content.push('\t\treturn t1-t2 <= epsilon;');
		content.push('\telse');
		content.push('\t\treturn t2-t1 <= epsilon;');
		content.push('}');
	}
	content.push('');
}

function solver_function_constructor(content,built,info,is_header)
{
	// solver_function_constructor
	var ode_solver=info.project.data.build.ode_solver;
	switch(ode_solver)
	{
		case 'Dormand-Prince-45':
			rk_dp5.class_constructor(content,built,info,is_header);
			break;
		case 'Cash-Karp-45':
			rk_ck45.class_constructor(content,built,info,is_header);
			break;
		case 'Fehlberg-78':
			rk_f78.class_constructor(content,built,info,is_header);
			break;
		default:
			var msg='[solver.constructor] ODE solver \''+ode_solver+'\' not defined.';
			built.respond.push(msg);
			console.log('Code reached here. A65146816815');
	}
}

function solver_function_stepper(content,built,info,is_header)
{
	// solver_function_stepper
	let str = (...args) => JSON.stringify(args);
	var ode_solver=info.project.data.build.ode_solver;
	var step_type=info.project.data.build.step_type;
	switch(str(ode_solver,step_type))
	{
		case str('Dormand-Prince-45','simulation_adaptive'):
			rk_dp5.stepper_adaptive(content,built,info,is_header);
			break;
		case str('Dormand-Prince-45','simulation_fix'):
		case str('Dormand-Prince-45','realtime_fix'):
			rk_dp5.stepper_fix(content,built,info,is_header);
			break;
		case str('Cash-Karp-45','simulation_adaptive'):
			rk_ck45.stepper_adaptive(content,built,info,is_header);
			break;
		case str('Cash-Karp-45','simulation_fix'):
		case str('Cash-Karp-45','realtime_fix'):
			rk_ck45.stepper_fix(content,built,info,is_header);
			break;
		case str('Fehlberg-78','simulation_adaptive'):
			rk_f78.stepper_adaptive(content,built,info,is_header);
			break;
		case str('Fehlberg-78','simulation_fix'):
		case str('Fehlberg-78','realtime_fix'):
			rk_f78.stepper_fix(content,built,info,is_header);
			break;
		default:
			var msg='[solver.stepper] ODE solver \''+ode_solver+'\' or step type \''+step_type+'\' not defined.';
			built.respond.push(msg);
			console.log('Code reached here. A6541685298');
	}
}

function solver_function_error(content,built,info,is_header)
{
	// solver_function_error
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var control_plant=(is_controller?'controller':'plant');

		var class_prefix=info.system.name+'_solver::';
		var stype=info.state_struct_name[ic];
		var function_headerc=(is_header?'\tdouble ':'double '+class_prefix)+
			control_plant+'_error(const '+stype+' &'+control_plant+'_x_old,const '+stype+' &'+control_plant+'_dxdt_old,'+stype+' &'+control_plant+'_x_err,double dt)'+
			' const'+(is_header?';':'');
		content.push(function_headerc);
		if(!is_header)
		{
			content.push('{');
			content.push('\t'+control_plant+'_x_err='+control_plant+'_x_err.abs()/(m_eps_abs+m_eps_rel*(m_a_x*'+control_plant+'_x_old.abs()+m_a_dxdt*dt*'+control_plant+'_dxdt_old.abs()));');
			content.push('\treturn '+control_plant+'_x_err.max();');
			content.push('}');
		}
	});
	content.push('');
}

function integrator_simulation_adaptive(content,built,info,is_header)
{
	// solver_function_integrator_sim_adaptive
	if(is_header)
		return ;
	content.push('\tconst std::size_t max_attempts = 1000;');
	content.push('\tconst char *error_string = \"Integrate adaptive : Maximal number of iterations reached. A step size could not be found.\";');
	content.push('\tstd::size_t count = 0;');
	content.push('');
	if(!isNaN(Number(info.project.data.build.step_max)))
	{
		content.push('\tif(max_dt<epsilon)');
		content.push('\t\tthrow std::runtime_error("Maximum step size has been proposed to be less than epsilon!");');
		content.push('\tif(dt>max_dt)');
		content.push('\t\tdt=max_dt;');
	}
	if(!isNaN(Number(info.project.data.build.step_min)))
	{
		content.push('\tif(dt<min_dt)');
		content.push('\t\tdt=min_dt;');
	}
	content.push('');

	var stop_time=info.project.data.build.stop_time;
	if(stop_time!='inf')
		content.push('\twhile(less_with_sign(start_time,end_time,dt)&&usersystem.simulation_continue)');
	else
	{
		content.push('\t(void) end_time;');
		content.push('\twhile(usersystem.simulation_continue)');
	}
	content.push('\t{');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		// var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');
		content.push('\tusersystem.'+control_plant+'_observer('+control_plant+'_start_state,start_time,dt);');
	});
	content.push('');
	if(stop_time!='inf')
	{
		content.push('\tif(less_with_sign(end_time,start_time+dt,dt))');
		content.push('\t{');
		content.push('\t\tdt=end_time-start_time;');
		content.push('\t\tif(std::abs(dt)<epsilon)');
		content.push('\t\t\tthrow std::runtime_error("dt has been proposed to be zero!");');
		content.push('\t}');
	}
	content.push('\tstd::size_t trials=0;');
	content.push('\tcontrolled_step_result res=controlled_step_result::success;');
	content.push('\tdo');
	content.push('\t{');
	var ts_args='';
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		// var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');
		ts_args+=','+control_plant+'_start_state';
	});
	content.push('\t\tres=try_step(usersystem'+ts_args+',start_time,dt);');
	content.push('\t\t++trials;');
	content.push('\t}');
	content.push('\twhile((res==controlled_step_result::fail)&&(trials<max_attempts));');
	content.push('\t\tif(trials==max_attempts)');
	content.push('\t\t\tthrow std::overflow_error(error_string);');
	content.push('\t\t++count;');
	content.push('\t}');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		// var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');
		content.push('\tusersystem.'+control_plant+'_observer('+control_plant+'_start_state,start_time,dt);');
	});
}

function integrator_simulation_fix(content,built,info,is_header)
{
	// solver_function_integrator_sim_fix
	content.push('\tdouble time=start_time;');
	content.push('\tstd::size_t step=0;');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');
		content.push('\t// removed(R65416546) usersystem.'+control_plant+'_observer('+control_plant+'_start_state,time,dt);');
	});
	content.push('\t// cast time+dt explicitely in case of expression templates (e.g. multiprecision)');
	var stop_time=info.project.data.build.stop_time;
	if(stop_time!='inf')
		content.push('\twhile(less_eq_with_sign(time+dt,end_time,dt)&&usersystem.simulation_continue)');
	else
	{
		content.push('\t(void) end_time;');
		content.push('\twhile(usersystem.simulation_continue)');
	}
	content.push('\t{');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');
		content.push('\t\tusersystem.'+control_plant+'_observer('+control_plant+'_start_state,time,dt);');
		content.push('\t\t'+control_plant+'_do_step(usersystem,'+control_plant+'_start_state,time,dt);');
	});
	content.push('\t\t// direct computation of the time avoids error propagation happening when using time += dt');
	content.push('\t\t// we need clumsy type analysis to get boost units working here');
	content.push('\t\t++step;');
	content.push('\t\ttime=start_time+double(step)*dt;');
	content.push('\t}');
	content.push('\treturn step;');
}

function integrator_realtime_fix(content,built,info,is_header)
{
	// solver_function_integrator_realtime_fix
	content.push('\tdouble time=start_time;');
	content.push('\ttypedef std::chrono::high_resolution_clock::time_point ClockType;');
	content.push('\tstd::size_t step=0;');
	content.push('\tClockType sync_start, sync_now;');
	content.push('\tusing Clock=std::chrono::high_resolution_clock;');
	content.push('\tsync_start=Clock::now();');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');
		content.push('\t// removed(R65416546) usersystem.'+control_plant+'_observer('+control_plant+'_start_state,time,dt);');
	});
	content.push('\t// cast time+dt explicitely in case of expression templates (e.g. multiprecision)');
	var stop_time=info.project.data.build.stop_time;
	if(stop_time!='inf')
		content.push('\twhile(less_eq_with_sign(time+dt,end_time,dt)&&usersystem.simulation_continue)');
	else
	{
		content.push('\t(void) end_time;');
		content.push('\twhile(usersystem.simulation_continue)');
	}
	content.push('\t{');
	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');
		content.push('\t\tusersystem.'+control_plant+'_observer('+control_plant+'_start_state,time,dt);');
		content.push('\t\t'+control_plant+'_do_step(usersystem,'+control_plant+'_start_state,time,dt);');
	});
	content.push('\t\t// direct computation of the time avoids error propagation happening when using time += dt');
	content.push('\t\t// we need clumsy type analysis to get boost units working here');
	content.push('\t\t++step;');
	content.push('\t\ttime=start_time+double(step)*dt;');
	content.push('\t\tsync_now=Clock::now();');
	content.push('\t\tdouble time_diff=double(std::chrono::duration_cast<std::chrono::microseconds>(sync_now-sync_start).count())/1000000.0;;');
	content.push('\t\tdouble remained=dt*double(step)-time_diff;');
	content.push('\t\tif(remained>0)');
	content.push('\t\t\tusleep(uint(remained*1000000));');
	content.push('\t}');
	content.push('\treturn step;');
}

function solver_function_integrator(content,built,info,is_header)
{
	// solver_function_integrator
	var class_prefix=(is_header?'':info.system.name+'_solver::');
	var htab=(is_header?'\t':'')
	var function_headerc=htab+'std::size_t '+class_prefix+'integrate(\n';

	info.system_parts.forEach(function(is_controller){
		var ic=is_controller;
		var stype=info.state_struct_name[ic];
		var control_plant=(is_controller?'controller':'plant');

		function_headerc+=htab+'\t\t'+stype+' &'+control_plant+'_start_state,\n';
	});
	function_headerc+=htab+'\t\t'+'double start_time,\n';
	function_headerc+=''+
			htab+'\t\t'+'double end_time,\n'+
			htab+'\t\t'+'double dt)'+
			(is_header?';':'');
	content.push(function_headerc);
	if(!is_header)
	{
		// var ode_solver=info.project.data.build.ode_solver;
		content.push('{');
		var step_type=info.project.data.build.step_type;
		switch(step_type)
		{
			case 'simulation_adaptive':
				integrator_simulation_adaptive(content,built,info,is_header);
				break;
			case 'simulation_fix':
				integrator_simulation_fix(content,built,info,is_header);
				break;
			case 'realtime_fix':
				integrator_realtime_fix(content,built,info,is_header);
				break;
			default:
				var msg='[solver.integral] ODE solver \''+ode_solver+'\' not defined.';
				built.respond.push(msg);
				console.log('Code reached here. A4265146540165');
		}	
		content.push('}');
	}
	content.push('');
}

function build_class(content,built,info,is_header)
{
	// code_generator_solver_hpp_content
	if(is_header)
	{
		content.push('class '+info.system.name+'_solver');
		content.push('{');
		content.push('private:');
		solver_class_private_variables(content,built,info,is_header);
	}
	solver_function_less_with_sign(content,built,info,is_header);
	solver_function_less_eq_with_sign(content,built,info,is_header);
	solver_function_stepper(content,built,info,is_header);
	if(info.project.data.build.step_type)
		solver_function_error(content,built,info,is_header);
	if(is_header)
		content.push('public:');
	solver_function_constructor(content,built,info,is_header);
	solver_function_integrator(content,built,info,is_header);
	if(is_header)
		content.push('};');
}

function build_sys_solver(built,info,is_header)
{
	var content=[];
	var includes_global=[];
	var includes_local=[];

	build_headers(includes_global,includes_local,built,info,is_header);
	build_class(content,built,info,is_header);

	var autohand='auto';
	built.files.push({
			path: autohand+'-coded/systems/'+info.system.filebase+'/solver.'+(is_header?'hpp':'cpp'),
			overwrite: true,
			is_json: false,
			is_header: is_header,
			autogen_preamble: true,
			generator_mark: 'G68514641',
			includes_global: includes_global,
			includes_local: includes_local,
			content: content,
		});
}

module.exports.build_sys_solver=build_sys_solver;
