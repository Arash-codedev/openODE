var modules=modules || {};

modules.structures={};

var structures_typegroup_options=['basic','array[]','vector<>','array<>'];

modules.structures.update=function(project)
{
	$("#structures-struct-contents").html('');

	var structs=project.data.structures.structs;
	for (var property in structs)
		if (structs.hasOwnProperty(property))
		{
			$("#structures-struct-contents").append(render_structures_struct(structs,property));
		}
}

function structures_item_to_html(item)
{
	var type_part='';
	var name_part='';
	var array_mark='';
	var value_part=item.init_value;
	var equality_part='';
	switch(item.type_group)
	{
		case 'basic':
			type_part=html_escape(item.type);
			name_part=html_escape(item.name);
			array_mark='';
			break;
		case 'array[]':
			type_part=html_escape(item.type);
			name_part=html_escape(item.name);
			array_mark=''+
				'<span class="modifier-array-sign">[</span>'+
				'<span class="modifier-array-number">'+html_escape(item.length)+'</span>'+
				'<span class="modifier-array-sign">]</span>';
			break;
		case 'vector<>':
			type_part='std::vector<'+html_escape(item.type)+'>';
			name_part=html_escape(item.name);
			array_mark='';
			break;
		case 'array<>':
			type_part='std::array'+
				'<span class="modifier-array-sign">&lt;</span>'+
				html_escape(item.type)+
				'<span class="modifier-array-sign">,</span>'+
				'<span class="modifier-array-number">'+html_escape(item.length)+'</span>'+
				'<span class="modifier-array-sign">&gt;</span>';
			name_part=html_escape(item.name);
			array_mark='';
			break;
		default:
			alert('Unkown type_group \''+item.type_group+'\'');
	}
	type_part='<span class="modifier-type">'+type_part+'</span>';
	name_part='<span class="modifier-name">'+name_part+'</span>';
	value_part='<span class="modifier-value">'+value_part+'</span>';
	equality_part='<span class="modifier-equality">=</span>';
	var after_name=(item.init_value==''?'':' '+equality_part+' '+value_part);
	return type_part+' '+name_part+array_mark+after_name+';';
}

function structures_up_item(button_element,struct_id,item_id)
{
	main.standard_post("/module",{
		request: "structures_up_item",
		module: "structures",
		project_id: project_id,
		struct_id: struct_id,
		item_id: item_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function structures_down_item(button_element,struct_id,item_id)
{
	main.standard_post("/module",{
		request: "structures_down_item",
		module: "structures",
		project_id: project_id,
		struct_id: struct_id,
		item_id: item_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function edit_structures_item(button,struct_id,item_id,submit)
{
	if(!submit)
	{
		get_project(
			function(project)
			{
				var struct=project.data.structures.structs[struct_id];
				var item=struct.items[item_id];
				var element=$(button).parent();
				var onclick='edit_structures_item($(this),\''+struct_id+'\',\''+item_id+'\',true)';
				var html=''+
					html_options(structures_typegroup_options,item.type_group)+
					'<input type="text" name="type" value="'+html_escape(item.type)+'" size="4">'+
					'<input type="text" name="length" value="'+html_escape(item.length)+'" size="3">'+
					'<input type="text" name="name" value="'+html_escape(item.name)+'" size="10"> = '+
					'<input type="text" name="init_value" value="'+html_escape(item.init_value)+'" size="10">';
				var title='edit structure field';
				edit_element(element,onclick,html,title);
			}
			);
	}
	else
	{
		main.standard_post("/module",{
			request: "structures_edit_struct_item",
			module: "structures",
			project_id: project_id,
			struct_id: struct_id,
			item_id: item_id,
			type_group: $(button).parent().find('select').val(),
			type: $(button).parent().find('input[name=type]').val(),
			length: $(button).parent().find('input[name=length]').val(),
			name: $(button).parent().find('input[name=name]').val(),
			init_value: $(button).parent().find('input[name=init_value]').val(),
					},
			function(output)
			{
				update_project();
			}
			);
	}
}

function render_structures_item(struct,item_id)
{
	var item=struct.items[item_id];
	var struct_id=struct.id;
	return ''+
		'<div class="set-item">'+
			'<button class="glyphicon glyphicon-remove btn btn-danger btn-xs" title="remove structures item" onclick="remove_structures_struct_item($(this),\''+struct_id+'\',\''+item_id+'\');" style="margin-right:5px;float:right"></button>'+
			'<button class="glyphicon glyphicon-edit btn btn-primary btn-xs" title="edit structures item" onclick="edit_structures_item($(this),\''+struct_id+'\',\''+item_id+'\',false);" style="margin-right: 5px"></button>'+
			'<button class="glyphicon glyphicon-arrow-up btn btn-primary btn-xs" title="bring item up" onclick="structures_up_item($(this),\''+struct_id+'\',\''+item_id+'\');" style="margin-right: 3px"></button>'+
			'<button class="glyphicon glyphicon-arrow-down btn btn-primary btn-xs" title="bring item down" onclick="structures_down_item($(this),\''+struct_id+'\',\''+item_id+'\');" style="margin-right: 3px"></button>'+
			'<button class="btn btn-'+(item.state?'success':'warning')+' btn-xs" title="is state" onclick="toggle_structures_item_state($(this),\''+struct_id+'\',\''+item_id+'\');" style="margin-right: 30px">'+(item.state?'state':'<del>state</del>')+'</button>'+
			structures_item_to_html(item)+
		'</div>'+
		'';
}

function render_structures_struct(structs,struct_id)
{
	var struct=structs[struct_id];
	var html= ''+
		'<div class="set-group">'+
			'<h3>'+
				'<button class="glyphicon glyphicon-remove btn btn-danger btn-xs" title="remove structures struct" onclick="remove_structures_struct($(this),\''+struct_id+'\');" style="float:right;margin-right:30px"></button>'+
				'<button class="glyphicon glyphicon-edit btn btn-primary btn-xs" title="edit structure name" onclick="structures_edit_struct_name($(this),\''+struct_id+'\',false);" style="margin-right: 3px"></button>'+
				'<button class="glyphicon glyphicon-arrow-up btn btn-primary btn-xs" title="bring structure up" onclick="structures_up_struct($(this),\''+struct_id+'\');" style="margin-right: 3px"></button>'+
				'<button class="glyphicon glyphicon-arrow-down btn btn-primary btn-xs" title="bring structure down" onclick="structures_down_struct($(this),\''+struct_id+'\');" style="margin-right: 30px"></button>'+
				'<span>'+
					struct.name+
				'</span>'+
			'</h3>'+
			'<div>'+
				'<button class="glyphicon glyphicon-plus btn btn-xs btn-success" onclick="structures_new_type_item(\''+struct.id+'\',$(this).parent().find(\'input\'));"></button>'+
				'<input type="text" placeholder="eg. planet_velocity">'+
			'</div>'+
			'<div class="set-items-box">';
	for (var property in struct.items)
		if (struct.items.hasOwnProperty(property))
		{
			html+=render_structures_item(struct,property);
		}
		html+='</div>';
	html+='</div>';
	return html;
}

function toggle_structures_item_state(button_element,struct_id,item_id)
{
	var struct_name=$(button_element).parent().find('input').val();
	main.standard_post("/module",{
		request: "toggle_structures_item_state",
		module: "structures",
		project_id: project_id,
		struct_id: struct_id,
		item_id: item_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function structures_up_struct(button_element,struct_id)
{
	main.standard_post("/module",{
		request: "structures_up_struct",
		module: "structures",
		project_id: project_id,
		struct_id: struct_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function structures_down_struct(button_element,struct_id)
{
	main.standard_post("/module",{
		request: "structures_down_struct",
		module: "structures",
		project_id: project_id,
		struct_id: struct_id,
				},
		function(output)
		{
			update_project();
		}
		);
}

function structures_edit_struct_name(button_element,struct_id,submit)
{
	if(!submit)
	{
		var struct_name=$(button_element).parent().find('span').html();
		var element=$(button_element).parent();
		var onclick='structures_edit_struct_name($(this),\''+struct_id+'\',true)';
		var html='<input type="text" placeholder="eg. new structures name" value="'+struct_name+'">';
		var title='edit structures struct name';
		edit_element(element,onclick,html,title);
	}
	else
	{
		var struct_name=$(button_element).parent().find('input').val();
		main.standard_post("/module",{
			request: "structures_edit_struct_name",
			module: "structures",
			project_id: project_id,
			struct_id: struct_id,
			struct_name: struct_name,
					},
			function(output)
			{
				update_project();
			}
			);
	}
}

function structures_new_type(input_tag)
{
	var struct_name=input_tag.val();
	main.standard_post("/module",{
		request: "structures_new_type",
		module: "structures",
		project_id: project_id,
		struct_name: struct_name,
				},
		function(output)
		{
			update_project();
			input_tag.val('');
		}
		);
}

function structures_new_type_item(struct_id,item_input_tag)
{
	var item_name=item_input_tag.val()
	main.standard_post("/module",{
		request: "structures_new_type_item",
		module: "structures",
		project_id: project_id,
		struct_id: struct_id,
		item_name: item_name,
				},
		function(output)
		{
			update_project();
		}
		);
}

function remove_structures_struct(button,struct_id)
{
	get_project(
		function(project)
		{
			var struct_name=project.data.structures.structs[struct_id].name;
			if(!confirm('Are you sure to delete structure \''+struct_name+'\'?'))
				return ;
			main.standard_post("/module",{
				request: "structures_remove_struct",
				module: "structures",
				project_id: project_id,
				struct_id: struct_id,
						},
				function(output)
				{
					update_project();
				}
				);
		}
		);
}

function remove_structures_struct_item(button,struct_id,item_id)
{
	get_project(
		function(project)
		{
			var item_name=project.data.structures.structs[struct_id].items[item_id].name;
			var struct_name=project.data.structures.structs[struct_id].name;
			if(!confirm('Are you sure to delete item \''+item_name+'\' from struct \''+struct_name+'\'?'))
				return ;
			main.standard_post("/module",{
				request: "structures_remove_struct_item",
				module: "structures",
				project_id: project_id,
				struct_id: struct_id,
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
