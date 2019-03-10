var path          = require('path');
var projects      = require(global.appRoot+'/js/projects.js');

function extract_cmakefeatures(build,available_features)
{
	var features={};
	var to_extract=[
		"set",
		"find_package",
		"include_directories",
		"transfer_libraries",
		"add_executable",
		"target_link_libraries",
		"additional_sources"
		];
	to_extract.forEach(function(field){
		features[field]=[];
		var cmake_features=["base"];
		build.cmake_features.forEach(function(feature_id){
			cmake_features.push(feature_id);
		})
		cmake_features.forEach(function(feature_id){
			var feature=available_features[feature_id];
			if(feature && feature[field])
			{
				feature[field].forEach(function(item){
					if(features[field].indexOf(item)<0)
						features[field].push(item);
				});
			}
		});
	});
	return features;
}

function render_cmake(project,built)
{
	built.files=built.files || [];
	var content=[];
	var build=project.data.build;
	var available_features=projects.cmake_feature_list(project.dirpath);
	var features=extract_cmakefeatures(build,available_features);

	content.push('');
	content.push('cmake_minimum_required(VERSION 2.8.9)');
	content.push('');
	content.push('project('+project.id+')');
	content.push('');
	content.push('find_package(Threads)');
	content.push('');
	content.push('include_directories(.)');
	content.push('');
	content.push('# Detect operating system');
	content.push('if(${CMAKE_SYSTEM_NAME} STREQUAL "Linux")');
	content.push('    add_definitions(-DSYSTEM_LINUX)');
	content.push('endif()');
	content.push('if(${CMAKE_SYSTEM_NAME} MATCHES "FreeBSD")');
	content.push('    add_definitions(-DSYSTEM_FREEBSD)');
	content.push('endif()');
	content.push('if(${CMAKE_SYSTEM_NAME} MATCHES "Windows")');
	content.push('    add_definitions(-DSYSTEM_WINDOWS)');
	content.push('endif()');
	content.push('');
	content.push('# settings');
	features.set.forEach(function(set){
		content.push('set('+set+')');
	});
	content.push('# Libraries');
	features.find_package.forEach(function(package){
		content.push('find_package('+package+')');
	});
	content.push('');
	content.push('');
	// content.push('include_directories()');
	content.push('');
	content.push('# Flags');
	content.push('set(CMAKE_CXX_FLAGS         "${CMAKE_CXX_FLAGS} -std=c++17 -Wall -Wconversion -Wfatal-errors -Wextra")');
	content.push('set(CMAKE_CXX_FLAGS_DEBUG   "-Og -g3 -fsanitize=address")');
	content.push('set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")');
	content.push('');
	features.include_directories.forEach(function(dir){
		content.push('include_directories('+dir+')');
	});
	content.push('');
	content.push('if(NOT Boost_FOUND)');
	content.push('	message(FATAL_ERROR "Boost ${BOOST_VERSION} not found." )');
	content.push('endif()');
	content.push('');
	content.push('add_executable('+project.id);
	built.files.forEach(function(file){
		if(file.path.endsWith('.cpp'))
		content.push('\t'+file.path);
	});
	features.add_executable.forEach(function(file){
		if(file.path.endsWith('.cpp'))
		content.push('\t'+file.path);
	});
	var sources_sep=false;
	features.additional_sources.forEach(function(source){
		if(!sources_sep)
		{
			sources_sep=true;
			content.push('\t# transferred sources');
		}
		if(source.endsWith('.cpp'))
			content.push('\t'+source);
	});
	var lib_sep=false;
	features.transfer_libraries.forEach(function(lib){
		if(!lib_sep)
		{
			lib_sep=true;
			content.push('\t# transferred libraries');
		}
		if(lib.endsWith('.cpp'))
			content.push('\t'+path.join('auto-coded/libs',lib));
	});
	content.push(')');
	content.push('');
	content.push('# Link');
	// content.push('target_link_libraries('+project.id+' )');
	// content.push('target_link_libraries('+project.id+' ');
	features.target_link_libraries.forEach(function(lib){
		content.push('target_link_libraries('+project.id+' '+lib+')');
	});

	built.files.push({
			path: 'CMakeLists.txt',
			overwrite: true,
			is_json: false,
			is_header: false,
			autogen_preamble: true,
			generator_mark: 'G5416829841',
			includes_global: [],
			includes_local: [],
			content: content,
		});
}

function render_build_scripts(project,built)
{
	built.files=built.files || [];
	var content_debug=[];

	content_debug.push('');
	// content_debug.push('mkdir -p ./bin');
	content_debug.push('cmake -DCMAKE_BUILD_TYPE=Debug -H. -B_built_d && cd _built_d && make && cp ./'+project.id+' ../');

	built.files.push({
			path: 'debug_build.sh',
			overwrite: true,
			is_json: false,
			is_header: false,
			autogen_preamble: true,
			generator_mark: 'G54168428419',
			includes_global: [],
			includes_local: [],
			content: content_debug,
		});

	var content_release=[];
	content_release.push('');
	// content_release.push('mkdir -p ./bin');
	content_release.push('cmake -DCMAKE_BUILD_TYPE=Release -H. -B_built_r && cd _built_r && make && cp ./'+project.id+' ../');

	built.files.push({
			path: 'release_build.sh',
			overwrite: true,
			is_json: false,
			is_header: false,
			autogen_preamble: true,
			generator_mark: 'G6416149813',
			includes_global: [],
			includes_local: [],
			content: content_release,
		});
}

function render_make(project,built)
{
	render_cmake(project,built);
	render_build_scripts(project,built);
}

module.exports.render_make=render_make;
