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
		case 'devices_new_type':
			project.data.devices = project.data.devices || {};
			project.data.devices.items = project.data.devices.items || {};
			var devices=project.data.devices.items;
			var device_name=data.device_name;
			var id=algorithm.new_id(devices,'id_dev_');
			if(algorithm.name_exists(devices,device_name,id))
			{
				out.status='device \''+device_name+'\' already exists. A85165416154';
				server.respond_json(res,out);
				return ;
			}
			if(!device_name)
			{
				out.status='Invalid name \''+device_name+'\'. A35814314541385';
				server.respond_json(res,out);
				return ;
			}
			devices[id]={
				id:id,
				name:device_name,
				filebase:device_name.toLowerCase(),
				device_type:'generic'
,				notes:''
				// controller_input_type: '',
				// controller_state_type: '',
				// controller_wire_type: '',
				// controller_output_type: '',
				// plant_input_type: '',
				// plant_state_type: '',
				// plant_wire_type: '',
				// plant_output_type: '',
				// has_controller: true,
				// has_plant: true,
				// controller_device_imports: [],
				// controller_device_exports: [],
				// plant_device_imports: [],
				// plant_device_exports: [],
			};
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'devices_edit':
			project.data.devices = project.data.devices || {};
			project.data.devices.items = project.data.devices.items || {};
			var device_name=data.device_name;
			var device_id=data.device_id;
			var devices=project.data.devices.items;
			var device=devices[device_id];
			if(!device)
			{
				out.status='devices device id \''+device_id+'\' does not exist. A35143874698';
				server.respond_json(res,out);
				return ;
			}
			device.filebase=data.filebase;
			device.device_type=data.device_type;
			device.notes=data.notes;
			// device.controller_input_type=data.controller_input_type;
			// device.controller_state_type=data.controller_state_type;
			// device.controller_wire_type=data.controller_wire_type;
			// device.controller_output_type=data.controller_output_type;
			// device.plant_input_type=data.plant_input_type;
			// device.plant_state_type=data.plant_state_type;
			// device.plant_wire_type=data.plant_wire_type;
			// device.plant_output_type=data.plant_output_type;
			// device.has_controller=data.has_controller;
			// device.has_plant=data.has_plant;
			project.status.modified=true;
			var device_name=data.name;
			if(!device_name)
			{
				out.status='Invalid name \''+device_name+'\'. A5461546514';
				server.respond_json(res,out);
				return ;
			}
			device.items=device.items || {};
			if(algorithm.name_exists(devices,device_name,device_id))
			{
				out.status='devices name \''+device_name+'\' already exists. A64168713213';
				server.respond_json(res,out);
				return ;
			}
			device.name=device_name;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'devices_up_device':
			project.data.devices = project.data.devices || {};
			project.data.devices.items = project.data.devices.items || {};
			var device_name=data.device_name;
			var device_id=data.device_id;
			var devices=project.data.devices.items;
			var device=devices[device_id];
			if(!device)
			{
				out.status='device id \''+device_id+'\' does not exist. A6541654292';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_up(devices,device_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'devices_down_device':
			project.data.devices = project.data.devices || {};
			project.data.devices.items = project.data.devices.items || {};
			var device_name=data.device_name;
			var device_id=data.device_id;
			var devices=project.data.devices.items;
			var device=devices[device_id];
			if(!device)
			{
				out.status='device id \''+device_id+'\' does not exist. A46143113852';
				server.respond_json(res,out);
				return ;
			}
			var modified=algorithm.field_down(devices,device_id);
			if(modified)
				project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'devices_remove':
			project.data.devices = project.data.devices || {};
			project.data.devices.items = project.data.devices.items || {};
			var devices=project.data.devices.items;
			var device_id=data.device_id;
			var device=devices[device_id];
			if(!device)
			{
				out.status='device id \''+device_id+'\' does not exist. A5416213216';
				server.respond_json(res,out);
				return ;
			}
			delete devices[device_id]; 
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		default:
			out.status='Request \''+data.request+'\' has no handler candidate. A634163214643';
			server.respond_json(res,out);
	}
}

function initialize(project)
{
	project.data.devices=project.data.devices || {};
	project.data.devices.items=project.data.devices.items || {};

}

module.exports.handle_request=handle_request;
module.exports.initialize=initialize;
