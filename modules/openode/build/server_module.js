var projects      = require(global.appRoot+'/js/projects.js');
var server        = require(global.appRoot+'/js/server.js');
var algorithm     = require(global.appRoot+'/js/algorithm.js');
var logger        = require(global.appRoot+'/js/log.js');
var odeMRoot      = global.appRoot+'/modules/openode';

function handle_request(data,user_id,project,res)
{
	var out={};
	out.status='ok';
	out.data={};
	switch(data.request)
	{
		case 'build_solver_edit':
			project.data.build = project.data.build || {};
			project.data.build=data.build;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'build_cmake_feature_add':
			project.data.build = project.data.build || {};
			var build=project.data.build;
			build.cmake_features=build.cmake_features || [];

			var feature_id=data.feature_id;
			var feature_list=projects.cmake_feature_list(project.dirpath);
			if(!feature_id)
			{
				out.status='Invalid feature id \''+feature_id+'\'. A02386405238';
				server.respond_json(res,out);
				return ;
			}
			if(build.cmake_features.indexOf(feature_id)>=0)
			{
				out.status='cmake feature id \''+feature_id+'\' already exists. A3046502387';
				server.respond_json(res,out);
				return ;
			}
			if(!feature_list[feature_id])
			{
				out.status='cmake feature id \''+feature_id+'\' not found. A34872035';
				server.respond_json(res,out);
				return ;
			}
			build.cmake_features.push(feature_id);
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'build_cmake_feature_remove':
			project.data.build = project.data.build || {};
			var build=project.data.build;
			build.cmake_features=build.cmake_features || [];
			var feature_id=data.feature_id;
			var feature_index=build.cmake_features.indexOf(feature_id);
			if(feature_index>=0)
				build.cmake_features.splice(feature_index, 1);
			else
			{
				out.status='feature id \''+feature_id+'\' does not exist. A65168713546';
				server.respond_json(res,out);
				return ;
			}
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'build_project':
			project.status.building=true;
			var project_id=project.id;
			logger.info('Building project "'+project_id+'" by user ['+user_id+']');
			project.status.building=false;
			require('./codegen.js').remove_unwrittens(project,built);
			var built={};
			var respond=[];
			var t0 = algorithm.clock();
			require(odeMRoot+'/meta/codegen.js').build_meta(project,built,respond);
			require(odeMRoot+'/config/codegen.js').build_configs(project,built,respond);
			require(odeMRoot+'/structures/codegen.js').build_structures(project,built,respond);
			require(odeMRoot+'/systems/codegen.js').build_systems(project,built,respond);
			require(odeMRoot+'/devices/codegen.js').build_devices(project,built,respond);
			require('./codegen_make.js').render_make(project,built);
			require('./codegen_types.js').render_types(project,built);
			require('./codegen.js').transfer_libraries(project,built);
			require('./codegen.js').render_files(project,built);
			projects.write_file_obj(project_id,'log/built.json',built,true)
			var dt = algorithm.clock(t0);
			logger.info('Project "'+project_id+'" was built in '+dt+' seconds.');
			server.respond_json(res,out);
			break
		default:
			out.status='Request \''+data.request+'\' has no handler candidate. A684164168321';
			server.respond_json(res,out);
	}
}

function initialize(project)
{
	project.data.build=project.data.build || {};
	project.data.build.start_time=project.data.build.start_time || '0.0';
	project.data.build.stop_time=project.data.build.stop_time || '500.0';
	project.data.build.step_size=project.data.build.step_size || '0.001';
	project.data.build.step_min=project.data.build.step_min || '0.0';
	project.data.build.step_max=project.data.build.step_max || 'inf';
	project.data.build.eps_rel=project.data.build.eps_rel || '1.0e-8';
	project.data.build.eps_abs=project.data.build.eps_abs || '1.0e-6';
	project.data.build.step_type=project.data.build.step_type || 'simulation_fix';
	project.data.build.ode_solver=project.data.build.ode_solver || 'Dormand-Prince-45';
	project.data.build.cmake_features=project.data.build.cmake_features || [];
	project.status.building= project.status.building || false;

/* legacy code */
	project.data.build.find_packages=undefined;
	project.data.build.directories=undefined;
	project.data.build.link_libraries=undefined;
	project.data.build.additional_sources=undefined;
	project.data.build.transfer_libraries=undefined;
}

module.exports.handle_request=handle_request;
module.exports.initialize=initialize;
// module.exports.cmake_feature_list=cmake_feature_list;
