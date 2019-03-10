var fs		  = require('fs');
var server	  = require('./server.js');
var logger	  = require('./log.js');
var express	  = require('express');
var security  = require('./security.js');
var util      = require('util');
var projects  = require('./projects.js');
var path      = require('path');
var algorithm     = require('./algorithm.js');

var project_meta_file='project_meta.json';


function meta_info_list(user_id)
{
	var walkSync = function(proot,dir,filelist) {
				var files = fs.readdirSync(path.join(proot,dir));
				filelist = filelist || [];
				var has_project=false;
				files.forEach(function(file) {
					if(file==project_meta_file)
						has_project=true;
				});
				if(has_project)
				{
					var meta_path=path.join(proot,dir, project_meta_file)
					var meta_content=fs.readFileSync(meta_path,'utf8');
					var meta_obj=JSON.parse(meta_content);
					meta_obj.id=meta_obj.id || ('no_id_'+algorithm.random_id());
					meta_obj.dirpath=dir;
					meta_obj.meta_filename=project_meta_file;
					meta_obj.meta_fullpath=path.join(dir, project_meta_file);
					meta_obj.status={};
					meta_obj.status.modified=projects.is_modified_project(meta_obj.id);
					meta_obj.status.building=false;
					filelist.push(meta_obj);
				}
				else
				{
					files.forEach(function(file) {
						if (fs.statSync(path.join(proot,dir, file)).isDirectory())
							walkSync(proot,path.join(dir, file), filelist);
					});

				}
				return filelist;
			};
	
	var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
	project_meta_list=walkSync(mg_config.project_folder(),'');
	var is_admin=security.is_admin(user_id);

	project_meta_list.forEach(function(element) {
		content = fs.readFileSync(path.join(mg_config.project_folder(),element.meta_fullpath),'utf8');
		element.data=JSON.parse(content);
		element.accessible=is_admin;
		if(!element.accessible && element.access)
		{
			// if not admin but there is an access array, check more
			element.access.forEach(function(access_id){
				if(access_id==user_id)
					element.accessible=true;
			});
		}
	});
	return project_meta_list;
}

function routing_project_meta(app)
{
	app.post('/update_project_list',function(req,res)
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
		project_list=module.exports.meta_info_list(user_id);
		var allowed_project_list=[];
		project_list.forEach(function(element) {
			if(element.accessible)
				allowed_project_list.push(element);
		});
		var out={};
		out.status='ok';
		out.data={};
		out.data.meta=allowed_project_list;
		out.data.active=projects.get_open_projects();
		server.respond_json(res,out);
	});

	app.post('/open_project',function(req,res)
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
		var out=projects.open_project(project_id,user_id);
		server.respond_json(res,out);
	});

	app.post('/project_close',function(req,res)
	{
		// parameters:
		//             project_id
		//             insist
		//
		var user_id=security.user_id(req);
		if(!user_id)
		{
			server.respond_permission_error_json(res)
			return ;
		}
		var data=JSON.parse(req.body.data);
		var project_id=data.project_id;
		var insist=data.insist;
		var out=projects.project_close(project_id,user_id,insist);
		server.respond_json(res,out);
	});

}

module.exports.routing_project_meta=routing_project_meta;
module.exports.meta_info_list=meta_info_list;
