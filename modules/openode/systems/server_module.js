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
		case 'systems_new_type':
			project.data.systems = project.data.systems || {};
			project.data.systems.items = project.data.systems.items || {};
			var systems=project.data.systems.items;
			var system_name=data.system_name;
			var id=algorithm.new_id(systems,'id_sys_');
			if(algorithm.name_exists(systems,system_name,id))
			{
				out.status='System \''+system_name+'\' already exists. A541651465';
				server.respond_json(res,out);
				return ;
			}
			if(!system_name)
			{
				out.status='Invalid name \''+system_name+'\'. A5416541654169';
				server.respond_json(res,out);
				return ;
			}
			systems[id]={
				id:id,
				name:system_name,
				filebase:system_name.toLowerCase(),
				controller_input_type: '',
				controller_state_type: '',
				controller_wire_type: '',
				controller_output_type: '',
				plant_input_type: '',
				plant_state_type: '',
				plant_wire_type: '',
				plant_output_type: '',
				has_controller: true,
				has_plant: true,
				controller_device_imports: [],
				controller_device_exports: [],
				plant_device_imports: [],
				plant_device_exports: [],
			};
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'systems_edit':
			project.data.systems = project.data.systems || {};
			project.data.systems.items = project.data.systems.items || {};
			var system_name=data.system_name;
			var system_id=data.system_id;
			var systems=project.data.systems.items;
			var system=systems[system_id];
			if(!system)
			{
				out.status='Systems system id \''+system_id+'\' does not exist. A5416541645';
				server.respond_json(res,out);
				return ;
			}
			system.filebase=data.filebase;
			system.controller_input_type=data.controller_input_type;
			system.controller_state_type=data.controller_state_type;
			system.controller_wire_type=data.controller_wire_type;
			system.controller_output_type=data.controller_output_type;
			system.plant_input_type=data.plant_input_type;
			system.plant_state_type=data.plant_state_type;
			system.plant_wire_type=data.plant_wire_type;
			system.plant_output_type=data.plant_output_type;
			system.has_controller=data.has_controller;
			system.has_plant=data.has_plant;
			project.status.modified=true;
			var system_name=data.name;
			if(!system_name)
			{
				out.status='Invalid name \''+system_name+'\'. A645165435435';
				server.respond_json(res,out);
				return ;
			}
			// system.items=system.items || {};
			if(algorithm.name_exists(systems,system_name,system_id))
			{
				out.status='Systems name \''+system_name+'\' already exists. A354165416';
				server.respond_json(res,out);
				return ;
			}
			system.name=system_name;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'systems_device_attach':
			project.data.systems = project.data.systems || {};
			project.data.systems.items = project.data.systems.items || {};
			project.data.devices.items = project.data.devices.items || {};
			var system_id=data.system_id;
			var device_id=data.device_id;
			var systems=project.data.systems.items;
			var system=systems[system_id];
			system.devices = system.devices || {};
			var devices=project.data.devices.items;
			var device=devices[device_id];
			if(!system)
			{
				out.status='Systems id \''+system_id+'\' does not exist. A654164224635';
				server.respond_json(res,out);
				return ;
			}
			if(!device)
			{
				out.status='Device id \''+device_id+'\' does not exist. A5146515421';
				server.respond_json(res,out);
				return ;
			}
			if(system.devices[device_id])
			{
				out.status='System device id \''+system_id+'\' (\''+device.name+'\') already exists. A65416231564';
				server.respond_json(res,out);
				return ;
			}
			system.devices[device_id]={
				id: device_id,
				active: true
			};
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'systems_device_detach':
			project.data.systems = project.data.systems || {};
			project.data.systems.items = project.data.systems.items || {};
			var system_id=data.system_id;
			var device_id=data.device_id;
			var systems=project.data.systems.items;
			var system=systems[system_id];
			system.devices = system.devices || {};
			if(!system)
			{
				out.status='Systems id \''+system_id+'\' does not exist. A5416212449';
				server.respond_json(res,out);
				return ;
			}
			// var index=system.devices.indexOf(device_id);
			if(!system.devices[device_id])
			{
				out.status='System device id \''+device_id+'\' does not exists. A8791431583';
				server.respond_json(res,out);
				return ;
			}
			// system.devices.splice(index, 1);
			delete system.devices[device_id];
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'system_device_activation':
			project.data.systems = project.data.systems || {};
			project.data.systems.items = project.data.systems.items || {};
			var system_id=data.system_id;
			var device_id=data.device_id;
			var active=data.active;
			var systems=project.data.systems.items;
			var system=systems[system_id];
			system.devices = system.devices || {};
			if(!system)
			{
				out.status='Systems id \''+system_id+'\' does not exist. A5416212449';
				server.respond_json(res,out);
				return ;
			}
			if(!system.devices[device_id])
			{
				out.status='System device id \''+device_id+'\' does not exists. A8791431583';
				server.respond_json(res,out);
				return ;
			}
			system.devices[device_id].active=active;
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		case 'systems_remove':
			project.data.systems = project.data.systems || {};
			project.data.systems.items = project.data.systems.items || {};
			var systems=project.data.systems.items;
			var system_id=data.system_id;
			var system=systems[system_id];
			if(!system)
			{
				out.status='System id \''+system_id+'\' does not exist. A546154651';
				server.respond_json(res,out);
				return ;
			}
			delete systems[system_id]; 
			project.status.modified=true;
			server.respond_json(res,out);
			break;
		default:
			out.status='Request \''+data.request+'\' has no handler candidate. A46514651416';
			server.respond_json(res,out);
	}
}

function initialize(project)
{
	project.data.systems=project.data.systems || {};
	project.data.systems.items=project.data.systems.items || {};

}

module.exports.handle_request=handle_request;
module.exports.initialize=initialize;
