var odeMRoot    = global.appRoot+'/modules/openode';
var projects    = require(global.appRoot+'/js/projects.js');
var server      = require(global.appRoot+'/js/server.js');
var algorithm   = require(global.appRoot+'/js/algorithm.js');


function handle_request(data,user_id,project,res)
{
	var out={};
	out.status='ok';
	out.data={};
	switch(data.request)
	{
		case 'config_new_group':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var groups=project.data.config.groups;
			var id=algorithm.new_id(groups,'id_cnf_grp_');
			if(algorithm.name_exists(groups,data.group_name,id))
			{
				out.status='config group \''+data.group_name+'\' already exists. A62936493';
				server.respond_json(res,out);
				return ;
			}
			if(!data.group_name)
			{
				out.status='Invalid name \''+data.group_name+'\'. A3469245230';
				server.respond_json(res,out);
				return ;
			}
			groups[id]={
				id:id,
				name:data.group_name,
				items:{},
				dynamic: true
			};
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'config_new_group_item':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var item_name=data.item_name;
			var group_id=data.group_id;
			var group=project.data.config.groups[group_id];
			if(!group)
			{
				out.status='config group id \''+group_id+'\' does not exist. A34926439523';
				server.respond_json(res,out);
				return ;
			}
			if(!item_name)
			{
				out.status='Invalid name \''+item_name+'\'. A845032487';
				server.respond_json(res,out);
				return ;
			}
			group.items=group.items || {};
			var id=algorithm.new_id(group.items,'id_cnf_itm_');
			if(algorithm.name_exists(group.items,item_name,id))
			{
				out.status='config group item \''+item_name+'\' already exists in \''+group.name+'\'. A2347652934';
				server.respond_json(res,out);
				return ;
			}
			group.items[id]={
				id:id,
				type:'???',
				name:item_name,
				length:1,
				value:'?'
			};
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'config_edit_group_name':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var group_name=data.group_name;
			var group_id=data.group_id;
			var groups=project.data.config.groups;
			var group=groups[group_id];
			if(!group)
			{
				out.status='config group id \''+group_id+'\' does not exist. A3623947652';
				server.respond_json(res,out);
				return ;
			}
			if(!group_name)
			{
				out.status='Invalid name \''+group_name+'\'. A49832659643';
				server.respond_json(res,out);
				return ;
			}
			group.items=group.items || {};
			if(algorithm.name_exists(groups,group_name,group_id))
			{
				out.status='config group name \''+group_name+'\' already exists. A37469234';
				server.respond_json(res,out);
				return ;
			}
			group.name=group_name;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'configs_up_item':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var group_id=data.group_id;
			var item_id=data.item_id;
			var groups=project.data.config.groups;
			var group=groups[group_id];
			if(!group)
			{
				out.status='group id \''+group_id+'\' does not exist. A546256165432';
				server.respond_json(res,out);
				return ;
			}
			group.items=group.items || {};
			var item=group.items[item_id];
			if(!item)
			{
				out.status='group item id \''+item_id+'\' does not exist. A65465146354';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_up(group.items,item_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'configs_down_item':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var group_id=data.group_id;
			var item_id=data.item_id;
			var groups=project.data.config.groups;
			var group=groups[group_id];
			if(!group)
			{
				out.status='group id \''+group_id+'\' does not exist. A65816324122';
				server.respond_json(res,out);
				return ;
			}
			group.items=group.items || {};
			var item=group.items[item_id];
			if(!item)
			{
				out.status='group item id \''+item_id+'\' does not exist. A6584135432';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_down(group.items,item_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'configs_up_group':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var group_name=data.group_name;
			var group_id=data.group_id;
			var groups=project.data.config.groups;
			var group=groups[group_id];
			if(!group)
			{
				out.status='group id \''+group_id+'\' does not exist. A68412646';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_up(groups,group_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'configs_down_group':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var group_name=data.group_name;
			var group_id=data.group_id;
			var groups=project.data.config.groups;
			var group=groups[group_id];
			if(!group)
			{
				out.status='group id \''+group_id+'\' does not exist. A34265421';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_down(groups,group_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'config_remove_group':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var groups=project.data.config.groups;
			var group_id=data.group_id;
			var group=groups[group_id];
			if(!group)
			{
				out.status='config group id \''+group_id+'\' does not exist. A34926439523';
				server.respond_json(res,out);
				return ;
			}
			delete groups[group_id]; 
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'config_remove_group_item':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var groups=project.data.config.groups;
			var group_id=data.group_id;
			var group=groups[group_id];
			if(!group)
			{
				out.status='config group id \''+group_id+'\' does not exist. A34926439523';
				server.respond_json(res,out);
				return ;
			}
			var item_id=data.item_id;
			var item=group.items[item_id];
			if(!item)
			{
				out.status='config item id \''+item_id+'\' does not exist. A324872738';
				server.respond_json(res,out);
				return ;
			}
			delete group.items[item_id]; 
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'config_edit_group_item':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var group_id=data.group_id;
			var item_id=data.item_id;
			var groups=project.data.config.groups;
			var group=groups[group_id];
			if(!group)
			{
				out.status='config group id \''+group_id+'\' does not exist. A3476293429';
				server.respond_json(res,out);
				return ;
			}
			group.items=group.items || {};
			var item=group.items[item_id];
			if(!item)
			{
				out.status='config item id \''+item_id+'\' does not exist. A324872738';
				server.respond_json(res,out);
				return ;
			}
			var item_name=data.name;
			if(algorithm.name_exists(group.items,item_name,item_id))
			{
				out.status='config group item \''+item_name+'\' already exists. A346923649';
				server.respond_json(res,out);
				return ;
			}
			item.name=item_name;
			item.type=data.type;
			item.length=data.length;
			item.value=data.value;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'config_toggle_group_dynamic':
			project.data.config = project.data.config || {};
			project.data.config.groups = project.data.config.groups || {};
			var group_id=data.group_id;
			var groups=project.data.config.groups;
			var group=groups[group_id];
			if(!group)
			{
				out.status='config group id \''+group_id+'\' does not exist. A3476293429';
				server.respond_json(res,out);
				return ;
			}
			group.dynamic=!group.dynamic;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		default:
			out.status='Request \''+data.request+'\' has no handler candidate. A4762348702347';
			server.respond_json(res,out);
	}


}

function initialize(project)
{
	project.data.config=project.data.config || {};
	project.data.config.groups=project.data.config.groups || {};
}

module.exports.handle_request=handle_request;
module.exports.initialize=initialize;
