var path = require('path');
var fs   = require('fs');

function project_folder()
{
	return './projects/openode';
}

function signature()
{
	return 'open_ode';
}

function create_project(info)
{
	var meta = require(path.join(global.module_group_path,'meta','server_module.js'));
	info.signature=signature();
	meta.create_project(info,project_folder())
}

function project_html()
{
	var html_path=path.join(global.appRoot,'public','private','project.html');
	var content=fs.readFileSync(html_path,'utf8');
	return content;
}

function server_name()
{
	return 'openODE Server';
}

function available_modules()
{
	var modules=[
			{
				id:"meta",
				title:"Meta",
				folder_path: "meta",
				css:"themes.css",
				server_render_js:"server_render.js",
				server_module_js:"server_module.js",
			},
			{
				id:"config",
				title:"Config",
				folder_path: "config",
				css:"themes.css",
				server_render_js:"server_render.js",
				server_module_js:"server_module.js",
			},
			{
				id:"structures",
				title:"Structures",
				folder_path: "structures",
				css:"themes.css",
				server_render_js:"server_render.js",
				server_module_js:"server_module.js",
			},
			{
				id:"devices",
				title:"Devices",
				folder_path: "devices",
				css:"themes.css",
				server_render_js:"server_render.js",
				server_module_js:"server_module.js",
			},
			{
				id:"systems",
				title:"Systems",
				folder_path: "systems",
				css:"themes.css",
				server_render_js:"server_render.js",
				server_module_js:"server_module.js",
			},
			{
				id:"build",
				title:"Build",
				folder_path: "build",
				css:"themes.css",
				server_render_js:"server_render.js",
				server_module_js:"server_module.js",
			},
		];
	return modules;
}

function extra_routing(app)
{
	// do nothing
}

module.exports.project_folder=project_folder;
module.exports.create_project=create_project;
module.exports.available_modules=available_modules;
module.exports.project_html=project_html;
module.exports.signature=signature;
module.exports.server_name=server_name;
module.exports.extra_routing=extra_routing;
