var modules=modules || {};

modules.systems={};

modules.systems.update=function(project)
{
	if( !project.data.systems ||
		!project.data.systems.items || 
		$.isEmptyObject(project.data.systems.items))
	{
		$("#systems-contents").html('No system is defined yet.');
		return ;
	}
	$("#systems-contents").html('');
	var systems=project.data.systems.items;
	for(var system_id in systems)
		if (systems.hasOwnProperty(system_id))
		{
			var system=systems[system_id];
			$("#systems-contents").append(render_system_display(project,system,system_id));
		}
}

function render_system_field_options(project,field,selected_id='')
{
	var html='<select name="'+field+'">';
	var structs=project.data.structures.structs;
	html+='<option name="none" value=""'+(selected_id==''?' selected':'')+'>(None)</option>';
	for(var struct_id in structs)
		if(structs.hasOwnProperty(struct_id))
		{
			var struct=structs[struct_id];
			html+='<option value="'+struct_id+'"'+(selected_id==struct_id?' selected':'')+'>'+html_escape(struct.name)+'</option>';
		}
	html+='</select>';
	return html;
}

function render_device_options(project,selected_id='')
{
	var html='<select name="device">';
	var devices=project.data.devices.items;
	html+='<option name="none" value=""'+(selected_id==''?' selected':'')+'>(None)</option>';
	for(var device_id in devices)
		if(devices.hasOwnProperty(device_id))
		{
			var device=devices[device_id];
			html+='<option value="'+device_id+'"'+(selected_id==device_id?' selected':'')+'>'+html_escape(device.name)+'</option>';
		}
	html+='</select>';
	return html;
}

function render_system_type_display(field,system,project)
{
	var structs=project.data.structures.structs;
	var struct_name=(system[field]?structs[system[field]].name:'-');
	var html='<div>'+field+': '+struct_name+'</div>';
	return html;
}

function render_system_device(proj_device,sys_device,system,project)
{
	var is_active=sys_device.active;
	var html='';
	html+='<div class="set-item" style="padding-left:20px">';
	var span_style='';
	if(!is_active)
		span_style=' style="color: #888"';
	html+='<span'+span_style+'>'+proj_device.name+'</span>';
	if(is_active)
		html+='<span style="margin-left:40px"></span>(<span style="color:#005;">dev_'+proj_device.name.toLowerCase()+'</span>)';
	html+='<button class="glyphicon glyphicon-remove btn btn-danger btn-xs" title="remove config group" onclick="system_device_detach('+in_quote(system.id)+','+in_quote(sys_device.id)+');" style="float:right;margin-right:30px;margin-bottom:3px"></button>';
	html+='<button class="btn btn-'+(is_active?'success':'warning')+' btn-xs" title="is'+(is_active?'':' not')+' active" onclick="system_device_activation('+in_quote(system.id)+','+in_quote(sys_device.id)+','+(is_active?'false':'true')+');" style="float:right;margin-right:30px;margin-bottom:3px">';
	if(!is_active)
		html+='<del>';
	html+='active';
	if(!is_active)
		html+='</del>';
	html+='</button>';
	html+='</div>';
	return html;
}

function render_system_display(project,system,system_id)
{
	var html='';
	html+='<button class="glyphicon glyphicon-remove btn btn-danger btn-xs" title="remove config group" onclick="systems_remove($(this),'+in_quote(system_id)+');" style="float:right;margin-right:30px"></button>';
	html+='<button class="glyphicon glyphicon-edit btn btn-primary btn-xs" title="edit config group name" onclick="systems_edit($(this),'+in_quote(system_id)+',false);" style="margin-right:30px"></button>';
	html+='<span>'+system.name+'</span>';
	// html+='<button class="btn btn-primary btn-xs" style="margin-left:50px" onclick="config_toggle_group_dynamic($(this),'+in_quote(system_id)+')">static</button>';
	html='<h3>'+html+'</h3>';
	html+='<div class="system-group" style="text-align: center;">';
	html+='<span class="glyphicon glyphicon-file"></span> <span style="color:#444;">'+system.filebase+'</span>';
	html+='</div>';
	html+='<div class="system-group'+(system.has_controller?'':' inactive')+'">';
	html+='<span class="panel-title">Controller</span>';
	[
		'controller_input_type',
		'controller_state_type',
		'controller_wire_type',
		'controller_output_type',
	].forEach(
		function(field){
			html+=render_system_type_display(field,system,project);
		});
	html+='</div>';
	html+='<div class="system-group'+(system.has_plant?'':' inactive')+'">';
	html+='<span class="panel-title">Plant</span>';
	[
		'plant_input_type',
		'plant_state_type',
		'plant_wire_type',
		'plant_output_type',
	].forEach(
		function(field){
			html+=render_system_type_display(field,system,project);
		});
	html+='</div>';
	html+='<div class="system-group">';
	html+='<span class="panel-title">Devices</span>';
	html+='<div style="margin-bottom: 30px;">';
	html+='Attach a device:';
	html+=render_device_options(project,'');
	// html+='<input placeholder="eg. my_system1" type="text">';
	html+='<button class="glyphicon glyphicon-plus btn btn-success" onclick="systems_device_attach('+in_quote(system.id)+',$(this).parent().find(\'select\'));"></button>';
	html+='</div>';
	var devices=system.devices||{};
	var has_device=false;
	for(var device_id in devices)
		if(devices.hasOwnProperty(device_id))
		{
			var proj_device=project.data.devices.items[device_id];
			var sys_device=devices[device_id];
			html+=render_system_device(proj_device,sys_device,system,project);
			has_device=true;
		}
	if(!has_device)
		html+='<div style="padding: 10px 0px 20px 40px;color: #777;">No device attached.</div>';
	html+='</div>';
	html='<div class="set-group">'+html+'</div>';
	return html;
}


function render_system_type_edit(field,system,project)
{
	var html='<div>'+field+': '+
		render_system_field_options(project,field,system[field])+
		'</div>';
	return html;
}

function render_systems_edit(project,system,system_id)
{
	var html='';
	html+='<input type="text" value="'+(system.name)+'" name="system_name"></input>';
	// html+='<input type="text" value="'+(system.filebase)+'" name="system_filebase"></input>';
	html='<h3>'+html+'</h3>';
	var has_controller_chk=(system.has_controller?' checked':'');
	html+='<div class="system-group">';
	html+='File base: <input type="text" value="'+(system.filebase)+'" name="system_filebase"></input>';
	html+='</div>';
	html+='<div class="system-group">';
	html+='<label><input type="checkbox" name="has_controller"'+has_controller_chk+'> has controller</label><br>';
	[
		'controller_input_type',
		'controller_state_type',
		'controller_wire_type',
		'controller_output_type',
	].forEach(
		function(field){
			html+=render_system_type_edit(field,system,project);
		});
	var has_plant_chk=(system.has_plant?' checked':'');
	html+='</div>';
	html+='<div class="system-group">';
	html+='<label><input type="checkbox" name="has_plant"'+has_plant_chk+'> has plant</label><br>';
	[
		'plant_input_type',
		'plant_state_type',
		'plant_wire_type',
		'plant_output_type',
	].forEach(
		function(field){
			html+=render_system_type_edit(field,system,project);
		});
	html+='</div>';
	html='<div class="set-group">'+html+'</div>';
	return html;
}

function systems_edit(button,system_id,submit)
{
	if(!submit)
	{
		get_project(
			function(project)
			{
				var systems=project.data.systems.items;
				var system=systems[system_id];
				var element=$(button).parent().parent();
				var onclick='systems_edit($(this),'+in_quote(system_id)+',true)';
				var html=render_systems_edit(project,system,system_id);
				var title='edit system';
				edit_element(element,onclick,html,title);
			}
			);
	}
	else
	{
		main.standard_post("/module",{
			request: "systems_edit",
			module: "systems",
			project_id: project_id,
			system_id: system_id,
			name: $(button).parent().find('input[name=system_name]').val(),
			filebase: $(button).parent().find('input[name=system_filebase]').val(),
			controller_input_type: $(button).parent().find('[name=controller_input_type]').val(),
			controller_state_type: $(button).parent().find('[name=controller_state_type]').val(),
			controller_wire_type: $(button).parent().find('[name=controller_wire_type]').val(),
			controller_output_type: $(button).parent().find('[name=controller_output_type]').val(),
			plant_input_type: $(button).parent().find('[name=plant_input_type]').val(),
			plant_state_type: $(button).parent().find('[name=plant_state_type]').val(),
			plant_wire_type: $(button).parent().find('[name=plant_wire_type]').val(),
			plant_output_type: $(button).parent().find('[name=plant_output_type]').val(),
			has_controller: $(button).parent().find('input[name=has_controller]').prop('checked'),
			has_plant: $(button).parent().find('input[name=has_plant]').prop('checked'),
			},
			function(output)
			{
				update_project();
			}
			);
	}
}

function systems_device_attach(system_id,input_tag)
{
	var device_id=input_tag.val();
	main.standard_post("/module",{
		request: "systems_device_attach",
		module: "systems",
		project_id: project_id,
		system_id: system_id,
		device_id: device_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function system_device_activation(system_id,device_id,active)
{
	main.standard_post("/module",{
		request: "system_device_activation",
		module: "systems",
		project_id: project_id,
		system_id: system_id,
		device_id: device_id,
		active: active,
				},
		function(output)
		{
			update_project();
		}
		);
}

function systems_new_type(input_tag)
{
	var system_name=input_tag.val();
	main.standard_post("/module",{
		request: "systems_new_type",
		module: "systems",
		project_id: project_id,
		system_name: system_name,
				},
		function(output)
		{
			update_project();
			input_tag.val('');
		}
		);
}

function systems_remove(button,system_id)
{
	get_project(
		function(project)
		{
			var system_name=project.data.systems.items[system_id].name;
			if(!confirm('Are you sure to delete system '+in_quote(system_name)+'?'))
				return ;
			main.standard_post("/module",{
				request: "systems_remove",
				module: "systems",
				project_id: project_id,
				system_id: system_id,
						},
				function(output)
				{
					update_project();
				}
				);
		}
		);
}

function system_device_detach(system_id,device_id)
{
	get_project(
		function(project)
		{
			var device_name=project.data.devices.items[device_id].name;
			if(!confirm('Are you sure to detach device '+in_quote(device_name)+'?'))
				return ;
			main.standard_post("/module",{
				request: "systems_device_detach",
				module: "systems",
				project_id: project_id,
				system_id: system_id,
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

function systems_remove_item(button,system_id,item_id)
{
	get_project(
		function(project)
		{
			var item_name=project.data.systems[system_id].items[item_id].name;
			var system_name=project.data.systems[system_id].name;
			if(!confirm('Are you sure to delete item '+in_quote(item_name)+' from system '+in_quote(system_name)+'?'))
				return ;
			main.standard_post("/module",{
				request: "systems_systems_remove_item",
				module: "systems",
				project_id: project_id,
				system_id: system_id,
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
