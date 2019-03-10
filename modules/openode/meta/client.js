var modules=modules || {};

modules.meta={};

modules.meta.update=function(project)
{
	$('#project-title').html(project.title+(project.status.modified?'<span style="color: #f93838"> *</span>':''));
	var edit_title_button='<button class="glyphicon glyphicon-edit btn btn-primary btn-xs" title="edit project title" onclick="edit_project_title(false);" style="margin-right: 30px"></button>';
	$('#meta-title h2').html(edit_title_button+'<span>'+project.title+'</span>');
}

function edit_project_title(submit)
{
	if(!submit)
	{
		var html='<input type="text" id="meta-title-edit-input" value="'+$('#meta-title h2 span').html()+'">';
		edit_element('#meta-title h2','edit_project_title(true)',html,'edit title project');
	}
	else
	{
		main.standard_post("/module",{
			request: "edit_project_title",
			module: "meta",
			project_id: project_id,
			new_title: $("#meta-title-edit-input").val(),
					},
			function(output)
			{
				update_project();
			}
			);
	}
}

