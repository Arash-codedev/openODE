
function build_init(content,info,is_header)
{
	var device=info.device;
	var htab=(is_header?'\t':'');
	var hend=(is_header?';':'');
	var classprefix=(is_header?'':device.name+'::');
	content.push(htab+'void '+classprefix+'init()'+hend);
	if(!is_header)
	{
		content.push('{');
		content.push('\t// initialize the device here');
		content.push('}');
	}
	content.push('');
}

function build_observe(content,info,is_header)
{
	var device=info.device;
	var htab=(is_header?'\t':'');
	var hend=(is_header?';':'');
	var classprefix=(is_header?'':device.name+'::');
	content.push(htab+'void '+classprefix+'observe(/*arguments*/)'+hend);
	if(!is_header)
	{
		content.push('{');
		content.push('\t// observe the arguments here');
		content.push('}');
	}
	content.push('');
}

function build_finalize(content,info,is_header)
{
	var device=info.device;
	var htab=(is_header?'\t':'');
	var hend=(is_header?';':'');
	var classprefix=(is_header?'':device.name+'::');
	content.push(htab+'void '+classprefix+'finalize()'+hend);
	if(!is_header)
	{
		content.push('{');
		content.push('\t// finalize the device here');
		content.push('}');
	}
	content.push('');
}

function build_device(built,info)
{
	var device=info.device;
	[true,false].forEach(function(is_header){
		var includes_global=[];
		var includes_local=[];
		var content=[];
		var htab=(is_header?'\t':'');
		if(!is_header)
			includes_global.push('hand-coded/devices/'+device.filebase+'.hpp');
		if(is_header)
		{
			content.push('class '+device.name);
			content.push('{');
			content.push('public:');
			content.push('');
		}
		build_init(content,info,is_header);
		build_observe(content,info,is_header);
		build_finalize(content,info,is_header);
		if(is_header)
			content.push('};');

		built.files.push({
				path: 'hand-coded/devices/'+device.filebase+'.'+(is_header?'hpp':'cpp'),
				overwrite: false,
				is_json: false,
				is_header: is_header,
				autogen_preamble: false,
				generator_mark: 'G3546187161',
				includes_global: includes_global,
				includes_local: includes_local,
				content: content,
			});
	});
}

function build_devices(project,built)
{
	built.files=built.files || [];
	built.respond=built.respond || [];
	var devices=project.data.devices.items;
	for(var device_id in devices)
		if(devices.hasOwnProperty(device_id))
		{
			var device=devices[device_id];
			var info={};
			info.project=project;
			info.device=device;
			build_device(built,info);
		}
	return ;
}

module.exports.build_devices=build_devices;
