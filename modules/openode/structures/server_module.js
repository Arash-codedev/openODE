var odeMRoot    = global.appRoot+'/modules/openode';
var projects  = require(global.appRoot+'/js/projects.js');
var server  = require(global.appRoot+'/js/server.js');
var algorithm  = require(global.appRoot+'/js/algorithm.js');


function handle_request(data,user_id,project,res)
{
	var out={};
	out.status='ok';
	out.data={};
	switch(data.request)
	{
		case 'structures_new_type':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var structs=project.data.structures.structs;
			var struct_name=data.struct_name;
			var id=algorithm.new_id(structs,'id_strct_type_');
			if(algorithm.name_exists(structs,struct_name,id))
			{
				out.status='structures struct \''+struct_name+'\' already exists. A62936493';
				server.respond_json(res,out);
				return ;
			}
			if(!struct_name)
			{
				out.status='Invalid name \''+struct_name+'\'. A753087553';
				server.respond_json(res,out);
				return ;
			}
			structs[id]={
				id:id,
				name:struct_name,
				items:{},
			};
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_new_type_item':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var item_name=data.item_name;
			var struct_id=data.struct_id;
			var struct=project.data.structures.structs[struct_id];
			if(!struct)
			{
				out.status='structures struct id \''+struct_id+'\' does not exist. A2967597845';
				server.respond_json(res,out);
				return ;
			}
			if(!item_name)
			{
				out.status='Invalid name \''+item_name+'\'. A736797323257';
				server.respond_json(res,out);
				return ;
			}
			struct.items=struct.items || {};			var id=algorithm.new_id(struct.items,'id_strct_itm_');
			if(algorithm.name_exists(struct.items,item_name,id))
			{
				out.status='structures struct item \''+item_name+'\' already exists in \''+struct.name+'\'. A879556753';
				server.respond_json(res,out);
				return ;
			}
			struct.items[id]={
				id:id,
				type_group:'basic',/* array, vector */
				type:'double',
				name:item_name,
				length:1,
				init_value:'0.0',
				state: true,
			};
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_edit_struct_name':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var struct_name=data.struct_name;
			var struct_id=data.struct_id;
			var structs=project.data.structures.structs;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structure id \''+struct_id+'\' does not exist. A64248697879';
				server.respond_json(res,out);
				return ;
			}
			if(!struct_name)
			{
				out.status='Invalid name \''+struct_name+'\'. A49832659643';
				server.respond_json(res,out);
				return ;
			}
			struct.items=struct.items || {};
			if(algorithm.name_exists(structs,struct_name,struct_id))
			{
				out.status='structures struct name \''+struct_name+'\' already exists. A7646542648';
				server.respond_json(res,out);
				return ;
			}
			struct.name=struct_name;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_up_struct':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var struct_name=data.struct_name;
			var struct_id=data.struct_id;
			var structs=project.data.structures.structs;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structure id \''+struct_id+'\' does not exist. A4565163546';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_up(structs,struct_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_down_struct':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var struct_name=data.struct_name;
			var struct_id=data.struct_id;
			var structs=project.data.structures.structs;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structure id \''+struct_id+'\' does not exist. A682468728';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_down(structs,struct_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_edit_struct_item':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var struct_id=data.struct_id;
			var item_id=data.item_id;
			var structs=project.data.structures.structs;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structures struct id \''+struct_id+'\' does not exist. A85345698984';
				server.respond_json(res,out);
				return ;
			}
			struct.items=struct.items || {};
			var item=struct.items[item_id];
			if(!item)
			{
				out.status='structures item id \''+item_id+'\' does not exist. A7565356427';
				server.respond_json(res,out);
				return ;
			}
			var item_name=data.name;
			if(algorithm.name_exists(struct.items,item_name,item_id))
			{
				out.status='structures struct item \''+item_name+'\' already exists. A547539870';
				server.respond_json(res,out);
				return ;
			}
			item.name=item_name;
			item.type_group=data.type_group;
			item.type=data.type;
			item.length=data.length;
			item.init_value=data.init_value;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_up_item':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var struct_id=data.struct_id;
			var item_id=data.item_id;
			var structs=project.data.structures.structs;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structure id \''+struct_id+'\' does not exist. A65416541322';
				server.respond_json(res,out);
				return ;
			}
			struct.items=struct.items || {};
			var item=struct.items[item_id];
			if(!item)
			{
				out.status='structure item id \''+item_id+'\' does not exist. A3541654296';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_up(struct.items,item_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_down_item':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var struct_id=data.struct_id;
			var item_id=data.item_id;
			var structs=project.data.structures.structs;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structure id \''+struct_id+'\' does not exist. A65416541322';
				server.respond_json(res,out);
				return ;
			}
			struct.items=struct.items || {};
			var item=struct.items[item_id];
			if(!item)
			{
				out.status='structure item id \''+item_id+'\' does not exist. A3541654296';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_down(struct.items,item_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'toggle_structures_item_state':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var struct_id=data.struct_id;
			var structs=project.data.structures.structs;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structures struct id \''+struct_id+'\' does not exist. A346523098';
				server.respond_json(res,out);
				return ;
			}
			struct.items=struct.items||{};
			var item=struct.items[data.item_id]
			if(!item)
			{
				out.status='structures item id \''+item_id+'\' does not exist in structure \''+struct.name+'\'. A3406523987';
				server.respond_json(res,out);
				return ;
			}
			item.state=!item.state;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_remove_struct':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var structs=project.data.structures.structs;
			var struct_id=data.struct_id;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structure struct id \''+struct_id+'\' does not exist. A34926439523';
				server.respond_json(res,out);
				return ;
			}
			delete structs[struct_id]; 
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'structures_remove_struct_item':
			project.data.structures = project.data.structures || {};
			project.data.structures.structs = project.data.structures.structs || {};
			var structs=project.data.structures.structs;
			var struct_id=data.struct_id;
			var struct=structs[struct_id];
			if(!struct)
			{
				out.status='structure struct id \''+struct_id+'\' does not exist. A34926439523';
				server.respond_json(res,out);
				return ;
			}
			var item_id=data.item_id;
			var item=struct.items[item_id];
			if(!item)
			{
				out.status='structure item id \''+item_id+'\' does not exist. A324872738';
				server.respond_json(res,out);
				return ;
			}
			delete struct.items[item_id]; 
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		default:
			out.status='Request \''+data.request+'\' has no handler candidate. A7658653459';
			server.respond_json(res,out);
	}
}

function initialize(project)
{
	project.data.structures=project.data.structures || {};
	project.data.structures.structs=project.data.structures.structs || {};
}

module.exports.handle_request=handle_request;
module.exports.initialize=initialize;
