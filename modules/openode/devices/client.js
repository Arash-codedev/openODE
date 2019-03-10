var modules=modules || {};

modules.devices={};

modules.devices.update=function(project)
{
	if( !project.data.devices ||
		!project.data.devices.items || 
		$.isEmptyObject(project.data.devices.items))
	{
		$("#devices-contents").html('No device is defined yet.');
		return ;
	}
	$("#devices-contents").html('');
	var devices=project.data.devices.items;
	for(var device_id in devices)
		if (devices.hasOwnProperty(device_id))
		{
			var device=devices[device_id];
			$("#devices-contents").append(render_device_display(project,device,device_id));
		}
}

// function render_device_field_options(project,field,selected_id='')
// {
// 	var html='<select name="'+field+'">';
// 	var structs=project.data.structures.structs;
// 	html+='<option name="none" value=""'+(selected_id==''?' selected':'')+'>(None)</option>';
// 	for(var struct_id in structs)
// 		if(structs.hasOwnProperty(struct_id))
// 		{
// 			var struct=structs[struct_id];
// 			html+='<option value="'+struct_id+'"'+(selected_id==struct_id?' selected':'')+'>'+html_escape(struct.name)+'</option>';
// 		}
// 	html+='</select>';
// 	return html;
// }

// function render_device_type_display(field,device,project)
// {
// 	var structs=project.data.structures.structs;
// 	var struct_name=(device[field]?structs[device[field]].name:'-');
// 	var html='<div>'+field+': '+struct_name+'</div>';
// 	return html;
// }

function render_device_display(project,device,device_id)
{
	var html='';
	html+='<button class="glyphicon glyphicon-remove btn btn-danger btn-xs" title="remove config group" onclick="devices_remove($(this),'+in_quote(device_id)+');" style="float:right;margin-right:30px"></button>';
	html+='<button class="glyphicon glyphicon-edit btn btn-primary btn-xs" title="edit config group name" onclick="devices_edit($(this),'+in_quote(device_id)+',false);" style="margin-right:3px"></button>';
	html+='<button class="glyphicon glyphicon-arrow-up btn btn-primary btn-xs" title="bring device up" onclick="devices_up_device($(this),\''+device_id+'\');" style="margin-right: 3px"></button>';
	html+='<button class="glyphicon glyphicon-arrow-down btn btn-primary btn-xs" title="bring device down" onclick="devices_down_device($(this),\''+device_id+'\');" style="margin-right: 30px"></button>';

	html+='<span>'+device.name+'</span>';
	html='<h3>'+html+'</h3>';
	html+='<div class="device-group" style="text-align: center;">';
	html+='<span class="glyphicon glyphicon-file"></span> <span style="color:#444;">'+device.filebase+'</span>';
	html+='</div>';
	if(device.notes)
	{
		html+='<div class="device-notes">';
		html+=main.ln2br($('<div>').text(device.notes).html());
		html+='</div>';
	}

	// html+='<div class="device-group'+(device.has_controller?'':' inactive')+'">';
	// [
	// 	'controller_input_type',
	// 	'controller_state_type',
	// 	'controller_wire_type',
	// 	'controller_output_type',
	// ].forEach(
	// 	function(field){
	// 		html+=render_device_type_display(field,device,project);
	// 	});
	// html+='</div>';
	// html+='<div class="device-group'+(device.has_plant?'':' inactive')+'">';
	// [
	// 	'plant_input_type',
	// 	'plant_state_type',
	// 	'plant_wire_type',
	// 	'plant_output_type',
	// ].forEach(
	// 	function(field){
	// 		html+=render_device_type_display(field,device,project);
	// 	});
	// html+='</div>';
	html='<div class="set-group">'+html+'</div>';
	return html;
}


function render_device_type_edit(field,device,project)
{
	var html='<div>'+field+': '+
		render_device_field_options(project,field,device[field])+
		'</div>';
	return html;
}

function render_devices_edit(project,device,device_id)
{
	var html='';
	html+='<input type="text" value="'+(device.name)+'" name="device_name"></input>';
	// html+='<input type="text" value="'+(device.filebase)+'" name="device_filebase"></input>';
	html='<h3>'+html+'</h3>';
	var has_controller_chk=(device.has_controller?' checked':'');
	html+='<div class="device-group">';
	html+='File base: <input type="text" value="'+(device.filebase)+'" name="device_filebase"></input>';
	html+='</div>';
	html+='<div class="device-group">';
	// html+='Notes: <input type="text" value="'+(device.filebase)+'" name="device_filebase"></input>';
	html+='<textarea rows="4" cols="50" name="device_notes">'+(device.notes)+'</textarea>';
	html+='</div>';
	// html+='<div class="device-group">';
	// html+='<label><input type="checkbox" name="has_controller"'+has_controller_chk+'> has controller</label><br>';
	// [
	// 	'controller_input_type',
	// 	'controller_state_type',
	// 	'controller_wire_type',
	// 	'controller_output_type',
	// ].forEach(
	// 	function(field){
	// 		html+=render_device_type_edit(field,device,project);
	// 	});
	// var has_plant_chk=(device.has_plant?' checked':'');
	// html+='</div>';
	// html+='<div class="device-group">';
	// html+='<label><input type="checkbox" name="has_plant"'+has_plant_chk+'> has plant</label><br>';
	// [
	// 	'plant_input_type',
	// 	'plant_state_type',
	// 	'plant_wire_type',
	// 	'plant_output_type',
	// ].forEach(
	// 	function(field){
	// 		html+=render_device_type_edit(field,device,project);
	// 	});
	// html+='</div>';
	html='<div class="set-group">'+html+'</div>';
	return html;
}

function devices_up_device(button_element,device_id)
{
	main.standard_post("/module",{
		request: "devices_up_device",
		module: "devices",
		project_id: project_id,
		device_id: device_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function devices_down_device(button_element,device_id)
{
	main.standard_post("/module",{
		request: "devices_down_device",
		module: "devices",
		project_id: project_id,
		device_id: device_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function devices_edit(button,device_id,submit)
{
	if(!submit)
	{
		get_project(
			function(project)
			{
				var devices=project.data.devices.items;
				var device=devices[device_id];
				var element=$(button).parent().parent();
				var onclick='devices_edit($(this),\''+device_id+'\',true)';
				var html=render_devices_edit(project,device,device_id);
				var title='edit device';
				edit_element(element,onclick,html,title);
			}
			);
	}
	else
	{
		main.standard_post("/module",{
			request: "devices_edit",
			module: "devices",
			project_id: project_id,
			device_id: device_id,
			name: $(button).parent().find('input[name=device_name]').val(),
			filebase: $(button).parent().find('input[name=device_filebase]').val(),
			device_type: 'generic',
			notes: $(button).parent().find('[name=device_notes]').val(),
			// controller_state_type: $(button).parent().find('[name=controller_state_type]').val(),
			// controller_wire_type: $(button).parent().find('[name=controller_wire_type]').val(),
			// controller_output_type: $(button).parent().find('[name=controller_output_type]').val(),
			// plant_input_type: $(button).parent().find('[name=plant_input_type]').val(),
			// plant_state_type: $(button).parent().find('[name=plant_state_type]').val(),
			// plant_wire_type: $(button).parent().find('[name=plant_wire_type]').val(),
			// plant_output_type: $(button).parent().find('[name=plant_output_type]').val(),
			// has_controller: $(button).parent().find('input[name=has_controller]').prop('checked'),
			// has_plant: $(button).parent().find('input[name=has_plant]').prop('checked'),
			},
			function(output)
			{
				update_project();
			}
			);
	}
}

function devices_new_type(input_tag)
{
	var device_name=input_tag.val();
	main.standard_post("/module",{
		request: "devices_new_type",
		module: "devices",
		project_id: project_id,
		device_name: device_name,
				},
		function(output)
		{
			update_project();
			input_tag.val('');
		}
		);
}

function devices_remove(button,device_id)
{
	get_project(
		function(project)
		{
			var device_name=project.data.devices.items[device_id].name;
			if(!confirm('Are you sure to delete device \''+device_name+'\'?'))
				return ;
			main.standard_post("/module",{
				request: "devices_remove",
				module: "devices",
				project_id: project_id,
				device_id: device_id,
						},
				function(output)
				{
					update_project();
				}
				);
		}
		);
}

function devices_remove_item(button,device_id,item_id)
{
	get_project(
		function(project)
		{
			var item_name=project.data.devices[device_id].items[item_id].name;
			var device_name=project.data.devices[device_id].name;
			if(!confirm('Are you sure to delete item \''+item_name+'\' from device \''+device_name+'\'?'))
				return ;
			main.standard_post("/module",{
				request: "devices_devices_remove_item",
				module: "devices",
				project_id: project_id,
				device_id: device_id,
				item_id: item_id,
						},
				function(output)
				{
					update_project();
				}
				);
		}
		);
}
