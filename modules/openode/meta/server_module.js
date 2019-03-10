// var odeMRoot    = global.appRoot+'/modules/openode';
var projects  = require(global.appRoot+'/js/projects.js');
var server  = require(global.appRoot+'/js/server.js');
var path          = require('path');
var fs		      = require('fs');


function handle_request(data,user_id,project,res)
{
	var out={};
	out.status='ok';
	out.data={};
	switch(data.request)
	{
		case 'edit_project_title':
			project.title=data.new_title;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		default:
			out.status='Request \''+data.request+'\' has no handler candidate.';
			server.respond_json(res,out);
	}
}

function create_project(info,proj_root)
{
	var full_path=path.join(proj_root,info.path);
	var mkdirp = require('mkdirp');
	mkdirp.sync(full_path);
	var metadata={
		id: info.id,
		title: info.title,
		access: [],
		signature : info.signature,
		dirpath: info.path,
	};
	var metadata_txt=JSON.stringify(metadata);
	var metadata_json_path=path.join(full_path,'project_meta.json');
	var project_json_path=path.join(full_path,'project.json');
	fs.writeFileSync(metadata_json_path,metadata_txt);
	fs.writeFileSync(project_json_path,'{}');
}

module.exports.handle_request=handle_request;
module.exports.create_project=create_project;
