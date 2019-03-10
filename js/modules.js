var security  = require('./security.js');
var fs        = require('fs');
var path      = require('path');
var projects  = require('./projects.js');
var server    = require('./server.js');
var mg_config = require(path.join(global.module_group_path,'mg_config.js'));

var available_modules   = mg_config.available_modules();

function module_list()
{
	return available_modules;
}

function initialize_modules(project)
{
	available_modules.forEach(function(element){
		if(element.server_module_js)
		{
			var module=require(path.join(global.module_group_path,element.folder_path,element.server_module_js));
			if(module.initialize)
				module.initialize(project);
		}
	});
}

function render_modules(project_id,project)
{
	initialize_modules(project);
	var content=mg_config.project_html();
	var server_name=mg_config.server_name();
	content=content.replace('##title##',project.title+' - '+server_name);
	content=content.replace('##title2##',project.title);
	content=content.replace('##project_id##',project_id);
	var navigator_head='';
	var navigator_content='';
	var active_module_id=available_modules[0].id;
	var js_links=''; 
	var css_links=''; 
	available_modules.forEach(function(element){
		navigator_head+=
			'<li id="project-list" class="'+(element.id==active_module_id?'active':'')+'">'+
			'<a href="#'+element.id+'" data-toggle="tab">'+element.title+'</a>'+
			'</li>';
		var module_content='';
		if(element.server_render_js)
		{
			var this_module=require(path.join(global.module_group_path,element.folder_path,element.server_render_js));
			module_content=this_module.render_div_content(element,project);
			js_links+=this_module.js_link(element);
			css_links+=this_module.css_link(element);
		}
		navigator_content+='<div class="tab-pane '+(element.id==active_module_id?' active':'')+'" id="'+element.id+'">'+module_content+'</div>';
	});
	content=content.replace('##navigator_head##',navigator_head);
	content=content.replace('##navigator_content##',navigator_content);
	content=content.replace('##js_links##',js_links);
	content=content.replace('##css_links##',css_links);
	return content;
}

function routing_modules(app)
{
	app.post('/module',function(req,res)
	{
		// parameters:
		//             request
		//             module
		//             project_id
		//
		var user_id=security.user_id(req);
		if(!user_id)
		{
			server.respond_permission_error_json(res)
			return ;
		}
		var data=JSON.parse(req.body.data);
		var project_id=data.project_id;
		// var request=data.request;
		var module=data.module;
		var request_handled=false;
		available_modules.forEach(function(element){
			if(element.id==module && !request_handled)
			{
				var project=projects.get_project(project_id);
				require(path.join(global.module_group_path,element.folder_path,element.server_module_js)).handle_request(data,user_id,project,res);
				request_handled=true;
			}
		});
		if(!request_handled)
		{
			var out={};
			out.status='No candidate found for module \''+module+'\'.';
			out.data={};
			server.respond_json(res,out);
		}
	});
}

function routing_module_js(app)
{
	app.get('/js/module/:module_id/:jsfile',function(req,res)
	{
		var module_id = req.params.module_id;
		var jsfile = req.params.jsfile;
		var module_js_handled=false;
		available_modules.forEach(function(module_element){
			if(module_element.id==module_id)
			{
				var module_req=require(path.join(global.module_group_path,module_element.folder_path,module_element.server_render_js));
				var js_content=module_req.render_js(jsfile,module_element);
				res.writeHeader(200, {"Content-Type": "text/javascript"});  
				res.write(js_content);  
				res.end();  
				module_js_handled=true;
			}
		});
		if(!module_js_handled)
		{
			var content='module \''+module_id+'\' not found. A54615462';
			res.writeHeader(200, {"Content-Type": "text/plain"});
			res.write(content);
			res.end();
			return ;
		}
	});
}


function routing_module_css(app)
{
	app.get('/css/module/:module_id/:cssfile',function(req,res)
	{
		var module_id = req.params.module_id;
		var cssfile = req.params.cssfile;
		var module_css_handled=false;
		available_modules.forEach(function(module_element){
			if(module_element.id==module_id)
			{
				var module_req=require(path.join(global.module_group_path,module_element.folder_path,module_element.server_render_js));
				var css_content=module_req.render_css(cssfile,module_element);
				res.writeHeader(200, {"Content-Type": "text/css"});  
				res.write(css_content);  
				res.end();  
				module_css_handled=true;
			}
		});
		if(!module_css_handled)
		{
			var content='module \''+module_id+'\' not found. A54615462';
			res.writeHeader(200, {"Content-Type": "text/plain"});
			res.write(content);
			res.end();
			return ;
		}
	});
}

module.exports.module_list=module_list;
module.exports.render_modules=render_modules;
module.exports.routing_modules=routing_modules;
module.exports.routing_module_js=routing_module_js;
module.exports.routing_module_css=routing_module_css;
