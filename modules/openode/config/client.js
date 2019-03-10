var modules=modules || {};

modules.config={};

var config_type_options=[
	'int','bool','char','float','double','string',
	'int[]','bool[]','char[]','float[]','double[]','string[]',
	'vector<int>','vector<bool>','vector<char>','vector<float>','vector<double>','vector<string>',
		];

modules.config.update=function(project)
{
	$("#config-group-contents").html('');

	var groups=project.data.config.groups;
	for(var property in groups)
		if (groups.hasOwnProperty(property))
		{
			$("#config-group-contents").append(render_config_group(groups,property));
		}
}

function config_item_to_html(item)
{
	var type_part=item.type;
	var name_part=item.name;
	var value_part=item.value;
	var length=item.length || 10;
	var equality_part='';
	if(type_part.search('[]')>=0)
	{
		type_part=type_part.replace('[]','');
		name_part+='['+length+']';
	}
	type_part=type_part.replace('vector','std::vector');
	type_part=type_part.replace('string','std::string');
	type_part='<span class="modifier-type">'+html_escape(type_part)+'</span>';
	equality_part='<span class="modifier-equality">=</span>';
	name_part='<span class="modifier-name">'+html_escape(name_part)+'</span>';
	value_part='<span class="modifier-value">'+html_escape(value_part)+'</span>';
	return type_part+' '+name_part+' '+equality_part+' '+value_part+';';
}

function edit_config_item(button,group_id,item_id,submit)
{
	if(!submit)
	{
		get_project(
			function(project)
			{
				var group=project.data.config.groups[group_id];
				var item=group.items[item_id];
				var element=$(button).parent();
				var onclick='edit_config_item($(this),\''+group_id+'\',\''+item_id+'\',true)';
				var html=''+
					html_options(config_type_options,item.type)+
					'<input type="text" name="length" value="'+html_escape(item.length)+'" size="3">'+
					'<input type="text" name="name" value="'+html_escape(item.name)+'" size="10"> = '+
					'<input type="text" name="value" value="'+html_escape(item.value)+'" size="10">';
				var title='edit config item';
				edit_element(element,onclick,html,title);
			}
			);
	}
	else
	{
		main.standard_post("/module",{
			request: "config_edit_group_item",
			module: "config",
			project_id: project_id,
			group_id: group_id,
			item_id: item_id,
			type: $(button).parent().find('select').val(),
			length: $(button).parent().find('input[name=length]').val(),
			name: $(button).parent().find('input[name=name]').val(),
			value: $(button).parent().find('input[name=value]').val(),
					},
			function(output)
			{
				update_project();
			}
			);
	}
}

function render_config_item(group,item_id)
{
	var item=group.items[item_id];
	var group_id=group.id;
	return ''+
		'<div class="set-item">'+
			'<button class="glyphicon glyphicon-remove btn btn-danger btn-xs" title="remove config item" onclick="remove_config_group_item($(this),\''+group_id+'\',\''+item_id+'\');" style="margin-right:5px;float:right"></button>'+
			'<button class="glyphicon glyphicon-edit btn btn-primary btn-xs" title="edit config item" onclick="edit_config_item($(this),\''+group_id+'\',\''+item_id+'\',false);" style="margin-right:3px"></button>'+
			'<button class="glyphicon glyphicon-arrow-up btn btn-primary btn-xs" title="bring item up" onclick="configs_up_item($(this),\''+group_id+'\',\''+item_id+'\');" style="margin-right: 3px"></button>'+
			'<button class="glyphicon glyphicon-arrow-down btn btn-primary btn-xs" title="bring item down" onclick="configs_down_item($(this),\''+group_id+'\',\''+item_id+'\');" style="margin-right: 30px"></button>'+
			config_item_to_html(item)+
		'</div>'+
		'';
}

function config_toggle_group_dynamic(button,group_id)
{
	main.standard_post("/module",{
		request: "config_toggle_group_dynamic",
		module: "config",
		project_id: project_id,
		group_id: group_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function render_config_group(groups,group_id)
{
	var group=groups[group_id];
	var html= ''+
		'<div class="set-group">'+
			'<h3>'+
				'<button class="glyphicon glyphicon-remove btn btn-danger btn-xs" title="remove config group" onclick="remove_config_group($(this),\''+group_id+'\');" style="float:right;margin-right:30px"></button>'+
				'<button class="glyphicon glyphicon-edit btn btn-primary btn-xs" title="edit config group name" onclick="edit_config_group_title($(this),\''+group_id+'\',false);" style="margin-right:3px"></button>'+
				'<button class="glyphicon glyphicon-arrow-up btn btn-primary btn-xs" title="bring group up" onclick="configs_up_group($(this),\''+group_id+'\');" style="margin-right: 3px"></button>'+
				'<button class="glyphicon glyphicon-arrow-down btn btn-primary btn-xs" title="bring group down" onclick="configs_down_group($(this),\''+group_id+'\');" style="margin-right: 30px"></button>'+
				'<span>'+
					group.name+
				'</span>'+
				'<button class="btn btn-'+(group.dynamic?'success':'primary')+' btn-xs" style="margin-left:50px" onclick="config_toggle_group_dynamic($(this),\''+group_id+'\')">'+(group.dynamic?'dynamic':'static')+'</button>'+
			'</h3>'+
			'<div>'+
				'<button class="glyphicon glyphicon-plus btn btn-xs btn-success" onclick="config_new_group_item(\''+group.id+'\',$(this).parent().find(\'input\'));"></button>'+
				'<input type="text" placeholder="eg. myoption">'+
			'</div>'+
			'<div class="set-items-box">';
	for (var property in group.items)
		if (group.items.hasOwnProperty(property))
		{
			html+=render_config_item(group,property);
		}
		html+='</div>'; //item-box
	html+='</div>';
	return html;
}

function configs_up_item(button_element,group_id,item_id)
{
	main.standard_post("/module",{
		request: "configs_up_item",
		module: "config",
		project_id: project_id,
		group_id: group_id,
		item_id: item_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function configs_down_item(button_element,group_id,item_id)
{
	main.standard_post("/module",{
		request: "configs_down_item",
		module: "config",
		project_id: project_id,
		group_id: group_id,
		item_id: item_id,
				},
		function(output)
		{
			update_project();
		}
		);
}


function configs_up_group(button_element,group_id)
{
	main.standard_post("/module",{
		request: "configs_up_group",
		module: "config",
		project_id: project_id,
		group_id: group_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function configs_down_group(button_element,group_id)
{
	main.standard_post("/module",{
		request: "configs_down_group",
		module: "config",
		project_id: project_id,
		group_id: group_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function edit_config_group_title(button_element,group_id,submit)
{
	if(!submit)
	{
		var group_name=$(button_element).parent().find('span').html();
		var element=$(button_element).parent();
		var onclick='edit_config_group_title($(this),\''+group_id+'\',true)';
		var html='<input type="text" placeholder="eg. new config name" value="'+group_name+'">';
		var title='edit config group name';
		edit_element(element,onclick,html,title);
	}
	else
	{
		var group_name=$(button_element).parent().find('input').val();
		main.standard_post("/module",{
			request: "config_edit_group_name",
			module: "config",
			project_id: project_id,
			group_id: group_id,
			group_name: group_name,
					},
			function(output)
			{
				update_project();
			}
			);
	}
}

function config_new_group(input_tag)
{
	var group_name=input_tag.val();
	main.standard_post("/module",{
		request: "config_new_group",
		module: "config",
		project_id: project_id,
		group_name: group_name,
				},
		function(output)
		{
			update_project();
			input_tag.val('');
		}
		);
}

function config_new_group_item(group_id,item_input_tag)
{
	var item_name=item_input_tag.val()
	main.standard_post("/module",{
		request: "config_new_group_item",
		module: "config",
		project_id: project_id,
		group_id: group_id,
		item_name: item_name,
				},
		function(output)
		{
			update_project();
		}
		);
}


function remove_config_group(button,group_id)
{
	get_project(
		function(project)
		{
			var group_name=project.data.config.groups[group_id].name;
			if(!confirm('Are you sure to delete config group \''+group_name+'\'?'))
				return ;
			main.standard_post("/module",{
				request: "config_remove_group",
				module: "config",
				project_id: project_id,
				group_id: group_id,
						},
				function(output)
				{
					update_project();
				}
				);
		}
		);
}

function remove_config_group_item(button,group_id,item_id)
{
	get_project(
		function(project)
		{
			var item_name=project.data.config.groups[group_id].items[item_id].name;
			var group_name=project.data.config.groups[group_id].name;
			if(!confirm('Are you sure to delete config item \''+item_name+'\' from group \''+group_name+'\'?'))
				return ;
			main.standard_post("/module",{
				request: "config_remove_group_item",
				module: "config",
				project_id: project_id,
				group_id: group_id,
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