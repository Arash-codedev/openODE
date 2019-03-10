var modules=modules || {};

var build_step_type_options=[
		'simulation_fix',
		'realtime_fix',
		'simulation_adaptive'
	];

var build_ode_solver_options=[
		'Dormand-Prince-45',
		'Cash-Karp-45',
		'Fehlberg-78'
	];

modules.build={};

function render_cmakefeature_options(project)
{
	// var html='<select name="available_cmake_features">';
	var html='';
	var features=project.available_cmake_features;
	for(var feature_id in features)
		if(features.hasOwnProperty(feature_id))
		{
			if(feature_id!="base")
			{
				var feature=features[feature_id];
				html+='<option value="'+feature_id+'">'+html_escape(feature.name)+'</option>';
			}
		}
	// html+='</select>';
	return html;
}


function render_cmakefeatures(project)
{
	var html='';
	var available_features=project.available_cmake_features;
	project.data.build=project.data.build || {};
	project.data.build.cmake_features= project.data.build.cmake_features||[];
	cmake_features=project.data.build.cmake_features;
	cmake_features.forEach(function(feature_id){
		var name='feature=????, id='+feature_id;
		var feature=available_features[feature_id];
		if(feature)
			name=html_escape(feature.name);
		html+=''+
			'<div>'+
				'<button onclick="build_up_cmake_feature(this,'+in_quote(feature.id)+');" class="glyphicon glyphicon-arrow-up btn btn-xs btn-primary" style="margin-right: 3px"></button>'+
				'<button onclick="build_down_cmake_feature(this,'+in_quote(feature.id)+');" class="glyphicon glyphicon-arrow-down btn btn-xs btn-primary"></button>'+
				'<span>'+name+'</span>'+
				'<button type="button" class="glyphicon glyphicon-remove btn btn-xs btn-danger" style="float:right" onclick="build_remove_cmake_feature('+in_quote(feature.id)+','+in_quote(name)+')"></button>'+
			'</div>';
	});
	return html;
}


modules.build.update=function(project)
{
	var build=project.data.build;
	var start_time=build.start_time;
	var stop_time=build.stop_time;
	var step_size=build.step_size;
	var step_min=build.step_min;
	var step_max=build.step_max;
	var eps_rel=build.eps_rel;
	var eps_abs=build.eps_abs;
	var step_type=build.step_type;
	var ode_solver=build.ode_solver;
	$('#build-solver-start-stop').html(
			'<span>'+start_time+
			'<span class="glyphicon glyphicon-chevron-right"></span>'+
			stop_time+'</span>');
	$('#build-solver-step-size').html(
			'<span>'+step_size+'</span>');
	$('#build-solver-min-max-step').html(
			'<span>('+step_min+', '+step_max+')</span>');
	$('#build-solver-eps-rel').html('<span>'+eps_rel+'</span>');
	$('#build-solver-eps-abs').html('<span>'+eps_abs+'</span>');
	$('#build-solver-step-type').html('<span>'+step_type+'</span>');
	$('#build-solver-ode-solver').html('<span>'+ode_solver+'</span>');

	$('div#cmake_features select').html(render_cmakefeature_options(project));
	$('div#cmake_features_list').html(render_cmakefeatures(project));

	update_building_status(project.status.building);
}

function update_building_status(logic)
{
	$('#build-status').html(logic?'Building ...':'Build');
	$('#build-button').prop('disabled',logic);
}

function build_add_cmake_feature(button)
{
	var feature_id=$(button).parent().find('select').val();
	if(!feature_id)
	{
		alert('No feature is selected');
		return ;
	}
	var library_path=$(button).parent().find('input').val();
	main.standard_post("/module",{
		request: "build_cmake_feature_add",
		module: "build",
		project_id: project_id,
		feature_id: feature_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function build_remove_cmake_feature(feature_id,feature_name)
{
	// var feature_name=$(button).parent().find('span').html();
	if(!confirm('Are you sure to remove cmake feature \''+feature_name+'\'?'))
		return ;
	main.standard_post("/module",{
		request: "build_cmake_feature_remove",
		module: "build",
		project_id: project_id,
		feature_id: feature_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

// function build_render_find_package(package)
// {
// 	var html='<div class="label label-primary"><span>'+html_escape(package)+'</span> <button type="button" class="btn btn-default btn-xs" onclick="build_remove_find_package('+in_quote(package)+')">x</button></div>';
// 	return html;
// }

// function build_render_directory(directory)
// {
// 	var html='<div class="label label-success"><span>'+html_escape(directory)+'</span> <button type="button" class="btn btn-default btn-xs" onclick="build_remove_directory('+in_quote(directory)+')">x</button></div>';
// 	return html;
// }

// function build_render_link_library(library)
// {
// 	var html='<div class="label label-primary"><span>'+html_escape(library)+'</span> <button type="button" class="btn btn-default btn-xs" onclick="build_remove_link_library('+in_quote(library)+')">x</button></div>';
// 	return html;
// }

// function build_render_transfer_library(library)
// {
// 	var html=''+
// 		'<div>'+
// 			'<button onclick="build_edit_transfer_library(this,'+in_quote(library.id)+',false);" class="glyphicon glyphicon-edit btn btn-xs btn-primary"></button>'+
// 			'<span>'+html_escape(library.path)+'</span>'+
// 			'<button type="button" class="glyphicon glyphicon-remove btn btn-xs btn-danger" style="float:right" onclick="build_remove_transfer_library('+in_quote(library.id)+')"></button>'+
// 		'</div>';
// 	return html;
// }

// function build_render_source(source)
// {
// 	var html=''+
// 		'<div>'+
// 			'<button onclick="build_edit_source(this,'+in_quote(source.id)+',false);" class="glyphicon glyphicon-edit btn btn-xs btn-primary"></button>'+
// 			'<span>'+html_escape(source.path)+'</span>'+
// 			'<button type="button" class="glyphicon glyphicon-remove btn btn-xs btn-danger" style="float:right" onclick="build_remove_source('+in_quote(source.id)+')"></button>'+
// 		'</div>';
// 	return html;
// }

// function build_edit_transfer_library(button,library_id,submit)
// {
// 	if(!submit)
// 	{
// 		get_project(function(project){
// 			var library_path=project.data.build.transfer_libraries[library_id].path;
// 			var element=$(button).parent().find('span');
// 			var onclick='build_edit_transfer_library($(this),\''+library_id+'\',true)';
// 			var html='<input size="40" placeholder="eg. graphics/chaosgraph.cpp" type="text" value="'+library_path+'">';
// 			var title='edit transfer library';
// 			edit_element(element,onclick,html,title)
// 		});
// 	}
// 	else
// 	{
// 		var library_path=$(button).parent().find('input').val();
// 		main.standard_post("/module",{
// 			request: "build_edit_transfer_library",
// 			module: "build",
// 			project_id: project_id,
// 			library_id: library_id,
// 			library_path: library_path,
// 					},
// 			function(output)
// 			{
// 				update_project();
// 				input.val('');
// 			}
// 			);
// 	}
// }

// function build_edit_source(button,source_id,submit)
// {
// 	if(!submit)
// 	{
// 		get_project(function(project){
// 			var source_path=project.data.build.additional_sources[source_id].path;
// 			var element=$(button).parent().find('span');
// 			var onclick='build_edit_source($(this),\''+source_id+'\',true)';
// 			var html='<input size="40" placeholder="eg. my_source.cpp" type="text" value="'+source_path+'">';
// 			var title='edit transfer source';
// 			edit_element(element,onclick,html,title)
// 		});
// 	}
// 	else
// 	{
// 		var source_path=$(button).parent().find('input').val();
// 		main.standard_post("/module",{
// 			request: "build_edit_source",
// 			module: "build",
// 			project_id: project_id,
// 			source_id: source_id,
// 			source_path: source_path,
// 					},
// 			function(output)
// 			{
// 				update_project();
// 				input.val('');
// 			}
// 			);
// 	}
// }

// function build_add_find_package(button)
// {
// 	var input=$(button).parent().find('input');
// 	var package_name=input.val();
// 	main.standard_post("/module",{
// 		request: "build_add_find_package",
// 		module: "build",
// 		project_id: project_id,
// 		package_name: package_name,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 			input.val('');
// 		}
// 		);
// }

// function build_add_directory(button)
// {
// 	var input=$(button).parent().find('input');
// 	var directory_name=input.val();
// 	main.standard_post("/module",{
// 		request: "build_add_directory",
// 		module: "build",
// 		project_id: project_id,
// 		directory_name: directory_name,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 			input.val('');
// 		}
// 		);
// }

// function build_add_link_library(button)
// {
// 	var input=$(button).parent().find('input');
// 	var library_name=input.val();
// 	main.standard_post("/module",{
// 		request: "build_add_link_library",
// 		module: "build",
// 		project_id: project_id,
// 		library_name: library_name,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 			input.val('');
// 		}
// 		);
// }

// function build_add_transfer_library(button)
// {
// 	var input=$(button).parent().find('input');
// 	var library_path=input.val();
// 	main.standard_post("/module",{
// 		request: "build_add_transfer_library",
// 		module: "build",
// 		project_id: project_id,
// 		library_path: library_path,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 			input.val('');
// 		}
// 		);
// }

// function build_add_source(button)
// {
// 	var input=$(button).parent().find('input');
// 	var source_path=input.val();
// 	main.standard_post("/module",{
// 		request: "build_add_source",
// 		module: "build",
// 		project_id: project_id,
// 		source_path: source_path,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 			input.val('');
// 		}
// 		);
// }

// function build_remove_find_package(package_name)
// {
// 	// var package_name=$(button).parent().find('span').html();
// 	main.standard_post("/module",{
// 		request: "build_remove_find_package",
// 		module: "build",
// 		project_id: project_id,
// 		package_name: package_name,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 		}
// 		);
// }

// function build_remove_directory(directory_name)
// {
// 	main.standard_post("/module",{
// 		request: "build_remove_directory",
// 		module: "build",
// 		project_id: project_id,
// 		directory_name: directory_name,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 		}
// 		);
// }

// function build_remove_link_library(library_name)
// {
// 	main.standard_post("/module",{
// 		request: "build_remove_link_library",
// 		module: "build",
// 		project_id: project_id,
// 		library_name: library_name,
// 				},
// 		function(output)
// 		{
// 			update_project();
// 		}
// 		);
// }

// function build_remove_transfer_library(transfer_library_id)
// {
// 	get_project(function(project){
// 		var library=project.data.build.transfer_libraries[transfer_library_id];
// 		var library_path=library.path;
// 		if(!confirm('Are you sure to remove library path '+in_quote(library_path)+'?'))
// 			return ;
// 		main.standard_post("/module",{
// 			request: "build_remove_transfer_library",
// 			module: "build",
// 			project_id: project_id,
// 			transfer_library_id: transfer_library_id,
// 					},
// 			function(output)
// 			{
// 				update_project();
// 			}
// 			);
// 	});
// }

// function build_remove_source(source_id)
// {
// 	get_project(function(project){
// 		var source=project.data.build.additional_sources[source_id];
// 		var source_path=source.path;
// 		if(!confirm('Are you sure to remove source path '+in_quote(source_path)+'?'))
// 			return ;
// 		main.standard_post("/module",{
// 			request: "build_remove_source",
// 			module: "build",
// 			project_id: project_id,
// 			source_id: source_id,
// 					},
// 			function(output)
// 			{
// 				update_project();
// 			}
// 			);
// 	});
// }

function edit_build_solver(button,submit)
{
	if(!submit)
	{
		get_project(
			function(project)
			{
				var build=project.data.build;
				var target_id=$(button).parent().parent().find('div')[3].id;
				var element=$('#'+target_id);
				var onclick='edit_build_solver($(this),true)';
				var html='???????';
				var title='?????';
				switch(target_id)
				{
					case 'build-solver-start-stop':
						html=''+
							'from '+'<input type="text" size="4" placeholder="eg. 0.0" value="'+build.start_time+'">'+ ' to ' +
							'<input type="text" size="4" placeholder="eg. 500" value="'+build.stop_time+'">';
						title='edit start/stop time';
						break;
					case 'build-solver-step-size':
						html=''+
							'<input type="text" size="4" placeholder="eg. 0.001" value="'+build.step_size+'">';
						title='edit step size';
						break;
					case 'build-solver-min-max-step':
						html=''+
							'('+'<input type="text" size="5" placeholder="eg. 0" value="'+build.step_min+'">'+ ' to ' +
							'<input type="text" size="5" placeholder="eg. inf" value="'+build.step_max+'">'+')';
						title='edit max/min step';
						break;
					case 'build-solver-eps-rel':
						html=''+
							'<input type="text" size="4" placeholder="1.0e-8" value="'+build.eps_rel+'">';
						title='relative epsilon';
						break;
					case 'build-solver-eps-abs':
						html=''+
							'<input type="text" size="4" placeholder="1.0e-6" value="'+build.eps_abs+'">';
						title='absolute epsilon';
						break;
					case 'build-solver-step-type':
						html=html_options(build_step_type_options,build.step_type);
						title='step type';
					 break;
					case 'build-solver-ode-solver':
						html=html_options(build_ode_solver_options,build.ode_solver);
						title='step solver';
						break;
					default:
						alert('unknown field \''+target_id+'\'. A3413684163');
				}
				edit_element(element,onclick,html,title);
			}
		);
	}
	else
	{
		get_project(
			function(project)
			{
				var target_id=$(button).parent()[0].id;
				var build=project.data.build;
				switch(target_id)
				{
					case 'build-solver-start-stop':
						build.start_time=$($('#'+target_id).find('input')[0]).val();
						build.stop_time=$($('#'+target_id).find('input')[1]).val();
						break;
					case 'build-solver-step-size':
						build.step_size=$('#'+target_id).find('input').val();
						break;
					case 'build-solver-min-max-step':
						build.step_min=$($('#'+target_id).find('input')[0]).val();
						build.step_max=$($('#'+target_id).find('input')[1]).val();
						break;
					case 'build-solver-eps-rel':
						build.eps_rel=$('#'+target_id).find('input').val();
						break;
					case 'build-solver-eps-abs':
						build.eps_abs=$('#'+target_id).find('input').val();
						break;
					case 'build-solver-step-type':
						build.step_type=$('#'+target_id).find('select').val();
					 break;
					case 'build-solver-ode-solver':
						build.ode_solver=$('#'+target_id).find('select').val();
						break;
					default:
						alert('unknown field \''+target_id+'\'. A25461546841');
				}
				main.standard_post("/module",{
					request: "build_solver_edit",
					module: "build",
					project_id: project_id,
					build: build,
							},
					function(output)
					{
						update_project();
					}
					);

			}
		);
	}
}

// function quick_lib_prototype()
// {
// 	var task={};
// 	task.url='/module';
// 	task.data_obj={
// 		request: "?????",
// 		module: "build",
// 		project_id: project_id,
// 		// package_name: package_name,
// 				};
// 	task.func_fail_benign=function(){};
// 	return task;
// }

// function build_quick_lib(libname)
// {
// 	var package_name='';
// 	var directory_name='';
// 	var library_name='';
// 	var on_success=function(){update_project();};
// 	switch(libname)
// 	{
// 		case 'openGL':
// 			var task1=quick_lib_prototype();
// 			task1.data_obj.request='build_add_find_package';
// 			task1.data_obj.package_name='OpenGL';
// 			var task2=quick_lib_prototype();
// 			task2.data_obj.request='build_add_directory';
// 			task2.data_obj.directory_name='${OPENGL_INCLUDE_DIRS}';
// 			var task3=quick_lib_prototype();
// 			task3.data_obj.request='build_add_link_library';
// 			task3.data_obj.library_name='${OPENGL_LIBRARIES}';
// 			var tasks=[];
// 			tasks.push(task1);
// 			tasks.push(task2);
// 			tasks.push(task3);
// 			main.multiple_post(tasks,on_success);
// 			break;
// 		case 'GLUT':
// 			var task1=quick_lib_prototype();
// 			task1.data_obj.request='build_add_find_package';
// 			task1.data_obj.package_name='GLUT';
// 			var task2=quick_lib_prototype();
// 			task2.data_obj.request='build_add_directory';
// 			task2.data_obj.directory_name='${GLUT_INCLUDE_DIRS}';
// 			var task3=quick_lib_prototype();
// 			task3.data_obj.request='build_add_link_library';
// 			task3.data_obj.library_name='${GLUT_LIBRARY}';
// 			var tasks=[];
// 			tasks.push(task1);
// 			tasks.push(task2);
// 			tasks.push(task3);
// 			main.multiple_post(tasks,on_success);
// 			break;
// 		case 'SDL2':
// 			var task1=quick_lib_prototype();
// 			task1.data_obj.request='build_add_find_package';
// 			task1.data_obj.package_name='SDL2';
// 			var task2=quick_lib_prototype();
// 			task2.data_obj.request='build_add_directory';
// 			task2.data_obj.directory_name='${SDL2_INCLUDE_DIRS}';
// 			var task3=quick_lib_prototype();
// 			task3.data_obj.request='build_add_link_library';
// 			task3.data_obj.library_name='${SDL2_LIBRARIES}';
// 			var tasks=[];
// 			tasks.push(task1);
// 			tasks.push(task2);
// 			tasks.push(task3);
// 			main.multiple_post(tasks,on_success);
// 			break;
// 		case 'ffmpeg':
// 			var tasks=[];
// 			var libraries=['avdevice','avfilter','avformat','avcodec','rt','dl','Xfixes','Xext','X11','asound','${SDL2_LIBRARIES}','z','rt','swresample','swscale','avutil','m','lzma','bz2','swresample','dl','pthread'];
// 			libraries.forEach(function(lib){
// 				var task=quick_lib_prototype();
// 				task.data_obj.request='build_add_link_library';
// 				task.data_obj.library_name=lib;
// 				tasks.push(task);
// 			});
// 			main.multiple_post(tasks,on_success);
// 			break;
// 		default:
// 			alert('unkown library \''+libname+'\'. A56742614');
// 			return ;
// 	}
// }

function build_project(button)
{
	update_building_status(true);
	main.standard_post("/module",{
		request: "build_project",
		module: "build",
		project_id: project_id,
				},
		function(output) // success
		{
			update_project();
		},
		function(output) // fail benign
		{
			update_project();
		},
		function() // fail fatal
		{
			update_project();
		}
		);	
}
