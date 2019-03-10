var odeMRoot     = global.appRoot+'/modules/openode';
var build_codegen=require(odeMRoot+'/build/codegen.js');

function build_config_item(content,prerequisites,info)
{
	var item=info.item;
	var line='\t';
	if(info.is_header)
		line+='extern ';
	line+='const '+item.type+' '+item.name;
	if(item.length>1)
		line+='['+item.length+']';
	if(!info.is_header)
	{
		if(item.value && item.value!='?')
			line+='='+item.value;
		else
			line+='/* warning not initialized */';
	}
	line+=';';
	content.push(line);
	if(info.is_header)
	{
		if(item.type=='string'||item.type=='vector<string>')
			prerequisites.has_string=true;
			// build_codegen.ensure_included(includes_global,'string');
		if(item.type.startsWith('vector'))
			prerequisites.has_vector=true;
			// build_codegen.ensure_included(includes_global,'vector');
	}
}

function build_group(groups,group_id,is_header)
{
	var group=groups[group_id];
	var group_files=[];
	if(group.dynamic)
	{
		var json_obj={};
		for(var item_id in group.items)
			if(group.items.hasOwnProperty(item_id))
			{
				var item=group.items[item_id];
				json_obj[item.name]=item.value;
			}
		group_files.push({
				path: 'config/'+group.name.toLowerCase()+'.json',
				overwrite: true,
				is_json: true,
				is_header: false,
				autogen_preamble: false,
				generator_mark: 'G564165418',
				includes_global: [],
				includes_local: [],
				content: [JSON.stringify(json_obj,null,2)],
			});
		group_files.push({
				path: 'config/'+group.name.toLowerCase()+'.'+(is_header?'hpp':'cpp'),
				overwrite: true,
				is_json: false,
				is_header: is_header,
				autogen_preamble: true,
				generator_mark: 'G6879196815',
				includes_global: [],
				includes_local: [],
				content: ['not implemented A8685741687416'],
			});
	}
	else
	{
		var content=[];
		var config_content=[
			'namespace config::'+group.name,
			'{',
			];
		var includes_global=[];
		var includes_local=[];
		var item_counts=0;
		var prerequisites={};
		prerequisites.has_string=false;
		prerequisites.has_vector=false;
		for(var item_id in group.items)
			if(group.items.hasOwnProperty(item_id))
			{
				var info={};
				info.item=group.items[item_id];
				info.is_header=is_header;
				build_config_item(config_content,prerequisites,info);
				item_counts++;
			}

		config_content.push('}'+(item_counts<10?'':' // namespace config::'+group.name));
		if(prerequisites.has_string)
			includes_global.push('string');
		if(prerequisites.has_vector)
			includes_global.push('vector');
		config_content.forEach(function(line){
			content.push(line);
		});
		if(!is_header)
			build_codegen.ensure_included(includes_global,'config/'+group.name.toLowerCase()+'.hpp');
		group_files.push({
				path: 'config/'+group.name.toLowerCase()+'.'+(is_header?'hpp':'cpp'),
				overwrite: true,
				is_json: false,
				is_header: is_header,
				autogen_preamble: true,
				generator_mark: 'G65816892',
				includes_global: includes_global,
				includes_local: includes_local,
				content: content,
			});
	}
	return group_files;
}

function build_configs(project,built,respond)
{
	built.files=built.files || [];
	var groups=project.data.config.groups;
	[true,false].forEach(function(is_header){
		for(var group_id in groups)
			if(groups.hasOwnProperty(group_id))
			{
				var code_files=build_group(groups,group_id,is_header)
				code_files.forEach(function(code_file){
					built.files.push(code_file);
				});
			}
	});
}

module.exports.build_configs=build_configs;
