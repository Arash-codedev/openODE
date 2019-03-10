// var project_meta=require('./projects_meta.js');
var path          = require('path');
var fs		      = require('fs');
var logger	      = require('./log.js');
var algorithm     = require('./algorithm.js');
var security      = require('./security.js');
var server        = require('./server.js');
var project_meta  = require('./projects_meta.js');
var modules       = require('./modules.js');
var mkdirp        = require('mkdirp');

var open_projects=[];
var projects={};


function get_open_projects()
{
	return open_projects;
}

function project_access(project_id,user_id)
{
	if(!projects[project_id])
		return false;
	if(security.is_admin(user_id))
		return true;
	return algorithm.array_exist(projects[project_id].access,user_id);
}


function is_modified_project(project_id)
{
	if(!projects[project_id])
		return false;
	if(!projects[project_id].status)
		return false;
	return projects[project_id].status.modified || false;
}

function open_project(project_id,user_id)
{
	var respond={status:'ok',data:{}};
	var already_open=algorithm.array_exist(open_projects,project_id);
	if(already_open)
	{
		respond.status='Project is already open';
		return respond;
	}
	project_list=project_meta.meta_info_list(user_id);
	var dirpath=null;
	var meta_obj=null;
	project_list.forEach(function(element) {
		if(element.accessible && element.data.id==project_id)
		{
			dirpath=element.dirpath;
			meta_obj=element;
		}
	});
	if(dirpath)
	{
		var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
		var project_path=path.join(mg_config.project_folder(),dirpath,'project.json');
		if(!fs.existsSync(project_path))
		{
			var warn_msg='Project file \"'+project_path+'\" does not exist.';
			logger.info(warn_msg);
			respond.status=warn_msg;
			return respond;
		}
		var project_content = fs.readFileSync(project_path,'utf8');
		if(!project_content)
		{
			var warn_msg='Project file \"'+project_path+'\" is empty.';
			logger.info(warn_msg);
		}
		if(!meta_obj.data.signature || meta_obj.data.signature!=mg_config.signature())
		{
			var warn_msg='Project signature mismatch at \"'+project_path+'\".';
			logger.info(warn_msg);
			respond.status=warn_msg;
			return respond;
		}
		var proj={};
		proj.id=project_id;
		proj.title=meta_obj.data.title;
		proj.access=meta_obj.data.access;
		proj.dirpath=dirpath;
		proj.signature=meta_obj.data.signature;
		proj.data=JSON.parse(project_content);
		proj.status={};
		proj.status.modified=false;
		proj.status.building=false;
		projects[project_id]=proj;
		open_projects.push(project_id);
		logger.info('Project "'+project_id+'" loaded by user ['+user_id+']');
		return respond;
	}
	respond.status='Not such an accessible project found.';
	return respond;
}

function project_close(project_id,user_id,insist)
{
	var respond={status:'ok',data:{is_closed:false,ask_for_save:false}};
	var already_open=algorithm.array_exist(open_projects,project_id);
	if(!already_open)
	{
		respond.status='Project is not open';
		return respond;
	}
	if(!project_access(project_id,user_id))
	{
		respond.status='Project is not accessible by this user';
		return respond;
	}
	if(projects[project_id].status.modified && !insist)
	{
		respond.data.is_closed=false;
		respond.data.ask_for_save=true;
		return respond;
	}
	else
	{
		projects[project_id]={};
		algorithm.array_remove(open_projects,project_id);
		respond.data.is_closed=true;
		respond.data.ask_for_save=false;
		logger.info('Project "'+project_id+'" closed by user ['+user_id+']');
		return respond;
	}
}

function projects_close_all(user_id,insist)
{
	var out={status:'ok',data:{all_closed:true}};
	for(var i=open_projects.length-1;i>=0;i--)
	{
		var project_id=open_projects[i];
		if(project_access(project_id,user_id))
		{
			var attempt=project_close(project_id,user_id,insist);
			if(attempt.status!='ok' || !attempt.data.is_closed)
				out.data.all_closed=false;
		}	
	}
	return out;
}


function browse(project_id,user_id,res)
{
	if(!project_access(project_id,user_id))
	{
		server.write_error_page(res,'No project access','error')
		return ;
	}
	if(!algorithm.array_exist(open_projects,project_id))
	{
		server.write_error_page(res,'Project is not open','error')
		return ;
	}
	var html=modules.render_modules(project_id,projects[project_id]);
	res.writeHeader(200, {"Content-Type": "text/html"});
	res.write(html);
	res.end();
}

function show_json(project_id,user_id,res)
{
	if(!project_access(project_id,user_id))
	{
		server.write_error_page(res,'No project access','error')
		return ;
	}
	if(!algorithm.array_exist(open_projects,project_id))
	{
		server.write_error_page(res,'Project is not open','error')
		return ;
	}
	var html=modules.render_modules(project_id,projects[project_id]);
	res.writeHeader(200, {"Content-Type": "text/html"});
	var json_html='<pre id=json></pre>';
	json_html+='<script>var project='+
		JSON.stringify(projects[project_id],null,2)+';\n'+
		'var text_node = document.createTextNode(JSON.stringify(project,null,2));\n'+
		'var elem = document.getElementById(\'json\');\n'+
		'elem.appendChild(text_node);\n'+
		'</script>';
	var title=projects[project_id].title+' -- json';
	var html=server.wrapp_html(title,'',json_html)  
	res.write(html);  
	res.end();  
}

function projects_save_all(user_id)
{
	var status='';
	logger.info('user ['+user_id+'] requested for saving all projects.')
	open_projects.forEach(function(project_id) {
		if(project_access(project_id,user_id))
		{
			if(projects[project_id].status.modified)
			{
				var respond=project_save(project_id,user_id);
				if(respond.status!='ok')
					status=status+(status!=''?'\n':'')+respond.status;
			}		
		}
	});
	status=status||'ok';
	return {status:status,data:{}};
}


function any_pending_save(user_id)
{
	var status='';
	project_list=project_meta.meta_info_list(user_id);
	var pending=false;
	project_list.forEach(function(meta) {
		if(meta.accessible)
		{
			var is_open=algorithm.array_exist(open_projects,meta.id);
			var is_modified=is_open && projects[meta.id].status.modified;
			if(is_modified)
				pending=true;
		}
	});
	var out_data={};
	out_data.pending=pending;
	return {status:'ok',data:out_data};
}

function write_file_txt(project_id,rel_path,txt,overwrite)
{
	var project=projects[project_id];
	var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
	var proj_path=path.join(mg_config.project_folder(),project.dirpath);
	if(proj_path)
	{
		if(fs.existsSync(proj_path))
		{
			var abs_path=path.join(proj_path,rel_path);
			var file_dir = path.dirname(abs_path);
			mkdirp.sync(file_dir);
			if(!fs.existsSync(abs_path) || overwrite)
			{
				fs.writeFileSync(abs_path,txt);
				return true;
			}
			else
			{
				var abs_path=path.join(proj_path,'log','unwritten',rel_path);
				var file_dir = path.dirname(abs_path);
				mkdirp.sync(file_dir);
				fs.writeFileSync(abs_path,txt);
				return false;
			}
		}
	}
	return false;
}

function write_file_obj(project_id,rel_path,obj,overwrite)
{
	return write_file_txt(project_id,rel_path,JSON.stringify(obj,null,2),overwrite);
}


function project_save(project_id,user_id)
{
	var respond={status:'ok',data:{}};
	var is_open=algorithm.array_exist(open_projects,project_id);
	if(!is_open)
	{
		respond.status='Project \''+project_id+'\' is not open. A545641654';
		return respond;
	}
	project_list=project_meta.meta_info_list(user_id);
	var project=projects[project_id];
	var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
	var proj_dir=path.join(mg_config.project_folder(),project.dirpath);
	if(proj_dir)
	{
		if(!fs.existsSync(proj_dir))
		{
			var warn_msg='Project directory path \"'+proj_dir+'\" does not exist.';
			logger.info(warn_msg);
			respond.status=warn_msg;
			return respond;
		}
		var this_project_data=project.data;
		var this_project_meta={};
		for(var property in project)
			if(project.hasOwnProperty(property))
				if(property!='data' && property!='status' && property!='available_cmake_features')
					this_project_meta[property]=project[property];
		write_file_obj(project_id,'project.json',this_project_data,true);
		write_file_obj(project_id,'project_meta.json',this_project_meta,true);
		project.status.modified=false;
		logger.info('user ['+user_id+'] saved project \"'+project_id+'\".');
		return respond;
	}
	respond.status='Not such an accessible project found.';
	return respond;
}

function cmake_feature_list(project_dir)
{
	var walkSync = function(dir,cmake_features) {
				// filelist = filelist || [];
				cmake_features = cmake_features || {};
				if(fs.existsSync(dir))
				{
					var files = fs.readdirSync(dir);
					files.forEach(function(file) {
						var file_path=path.join(dir,file);
						if(file.endsWith('.json'))
						{
							var feature_path=file_path;
							var feature_content=fs.readFileSync(feature_path,'utf8');
							var feature_obj;
							try {
								feature_obj=JSON.parse(feature_content);
								feature_obj.path=feature_path;
								if(feature_obj.id)
								{
									if(!cmake_features[feature_obj.id])
										cmake_features[feature_obj.id]=feature_obj;
								}
								else
									console.log("Warning: cmake feature \""+feature_path+"\" has no id.");
							}
							catch(err) {
								console.log("Warning: Unable to load cmake feature \""+feature_path+"\"");
							}
						}
						if(fs.statSync(file_path).isDirectory())
							walkSync(file_path,cmake_features);
					});
				}
				return cmake_features;
			};
	
	cmake_features={};
	var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
	cmake_features=walkSync(path.join(mg_config.project_folder(),project_dir,'assets/cmake_features'),cmake_features);
	cmake_features=walkSync('./assets/cmake_features',cmake_features);

	return cmake_features;
}

function get_project(project_id)
{
	return projects[project_id];
}

function project_create(info)
{
	var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
	mg_config.create_project(info);
}

function routing_project(app)
{
	app.post('/project_object',function(req,res)
	{
		// parameters:
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
		var out={};
		out.status='ok';
		out.data=projects[project_id];
		out.data.available_cmake_features=cmake_feature_list(projects[project_id].dirpath);
		server.respond_json(res,out);
	});

	app.post('/project_create',function(req,res)
	{
		// parameters:
		//             id
		//             path
		//             title
		//
		var user_id=security.user_id(req);
		if(!user_id)
		{
			server.respond_permission_error_json(res)
			return ;
		}
// console.log('-----------------');
// console.log(req.body);
// console.log('-----------------');
		var data=JSON.parse(req.body.data);
		var project_path=data.path;
		var project_name=project_path.split('/').pop();
		var out={};
		out.status='ok';
		if(!project_name)
		{
			out.status='Invalid project name';
			server.respond_json(res,out);
			return ;
		}
		var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
		var full_path = path.join(mg_config.project_folder(),project_path);
		if(fs.existsSync(full_path))
		{
			out.status='Folder \''+full_path+'\' already exists';
			server.respond_json(res,out);
			return ;
		}

		project_create({
			id:data.id,
			path:data.path,
			title:data.title
		});
		server.respond_json(res,out);
	});

	app.post('/project_save',function(req,res)
	{
		// parameters:
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
		var out=project_save(project_id,user_id);
		server.respond_json(res,out);
	});

	app.post('/projects_save_all',function(req,res)
	{
		// parameters:
		//             (empty)
		//
		var user_id=security.user_id(req);
		if(!user_id)
		{
			server.respond_permission_error_json(res)
			return ;
		}
		var data=JSON.parse(req.body.data);
		// var project_id=data.project_id;
		var out=projects_save_all(user_id);
		server.respond_json(res,out);
	});

	app.post('/projects_close_all',function(req,res)
	{
		// parameters:
		//             insist
		//
		var user_id=security.user_id(req);
		if(!user_id)
		{
			server.respond_permission_error_json(res)
			return ;
		}
		var data=JSON.parse(req.body.data);
		var insist=data.insist;
		var out=projects_close_all(user_id,insist);
		server.respond_json(res,out);
	});

	app.post('/stop_server',function(req,res)
	{
		// parameters:
		//             (empty)
		//
		var user_id=security.user_id(req);
		if(!user_id)
		{
			server.respond_permission_error_json(res)
			return ;
		}
		var is_admin=security.is_admin(user_id);
		if(!is_admin)
		{
			server.respond_permission_error_json(res)
			return ;
		}
		var data=JSON.parse(req.body.data);
		var insist=data.insist;
		var stop_server=data.stop_server;
		if(!stop_server)
		{
			var out={};
			out.status='server termination is called accidentally';
			out.data={};
			server.respond_json(res,out);
			return ;
		}
		var out={};
		out.status='ok';
		out.data={};
		if(open_projects.length==0 || insist)
		{
			out.data.exit_confirmed=true;
			server.respond_json(res,out);
			var username = req.session.username; 
			var msg1='The server is requested to be stopped by user \"'+username+'\":['+user_id+'].';
			logger.info(msg1);
			var msg2='The server is stopped by user \"'+username+'\":['+user_id+'].';
			setTimeout(function(){logger.info(msg2);process.exit();},2000);
		}
		else
		{
			out.data.exit_confirmed=false;
			server.respond_json(res,out);
		}
	});

	app.post('/any_pending_save',function(req,res)
	{
		// parameters:
		//             (empty)
		//
		var user_id=security.user_id(req);
		if(!user_id)
		{
			server.respond_permission_error_json(res)
			return ;
		}
		var data=JSON.parse(req.body.data);
		var out=any_pending_save(user_id);
		server.respond_json(res,out);
	});
}

module.exports.routing_project     = routing_project;
module.exports.get_open_projects   = get_open_projects;
module.exports.open_project        = open_project;
module.exports.project_close       = project_close;
module.exports.browse              = browse;
module.exports.show_json           = show_json;
module.exports.get_project         = get_project;
module.exports.is_modified_project = is_modified_project;
module.exports.write_file_txt      = write_file_txt;
module.exports.write_file_obj      = write_file_obj;
module.exports.cmake_feature_list  = cmake_feature_list;
