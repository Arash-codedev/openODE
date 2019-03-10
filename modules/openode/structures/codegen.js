var odeMRoot     = global.appRoot+'/modules/openode';
var build_codegen=require(odeMRoot+'/build/codegen.js');

function build_struct_item(content,prerequisites,info)
{
	var item=info.item;
	var line='\t';
	switch(item.type_group)
	{
		case 'basic':
			line+=item.type+' '+item.name;
			break;
		case 'array[]':
			line+=item.type+' '+item.name+'['+item.length+']';
			break;
		case 'vector<>':
			line+='vector<'+item.type+'> '+item.name;
			break;
		case 'array<>':
			line+='array<'+item.type+','+item.length+'> '+item.name;
			break;
		default:
			console.log('Code should not reach here. A5876565876');
	}
	line+=';';
	content.push(line);
	if(info.is_header)
	{
		if(info.other_structs.includes(item.type))
			prerequisites.type_dependency.push(item.type);
		if(item.type=='string')
			prerequisites.has_string=true;
		if(item.type_group=='vector<>')
			prerequisites.has_vector=true;
		if(item.type_group=='array<>')
			prerequisites.has_stdarray=true;
	}
}

function build_reset(content,info)
{
	var struct=info.struct;
	var is_header=info.is_header;
	var class_prefix=(is_header?'':struct.name+'::');
	var htab=(is_header?'\t':'');
	var func_header=htab+'void '+class_prefix+'reset()'+(is_header?';':'');

	content.push(func_header);
	if(!is_header)
	{
		content.push('{');
		for(var item_id in struct.items)
			if(struct.items.hasOwnProperty(item_id))
			{
				var item=struct.items[item_id];
				if(item.init_value && item.init_value!='?')
				{
					switch(item.type_group)
					{
						case 'basic':
							content.push('\t'+item.name+'='+item.init_value+';');
							break;
						case 'array[]':
							content.push('\t'+'for(int i=0;i<'+item.length+';i++)');
							content.push('\t\t'+item.name+'[i]='+item.init_value+';');
							break;
						case 'vector<>':
						case 'array<>':
							content.push('\t'+'for(int i=0;i<(int)'+item.name+'.size();i++)');
							content.push('\t\t'+item.name+'[i]='+item.init_value+';');
							break;
						default:
							alert('Unkown type_group \''+item.type_group+'\' A87964324656546');
					}
				}
				else
					content.push('\t/* skipped '+item.name+' */');
			}
		content.push('}');
		content.push('');
	}
}

function build_constructor1(content,info)
{
	var is_header=info.is_header;
	if(!is_header)
		return;
	var struct=info.struct;
	var htab=(is_header?'\t':'');
	var func_header=htab+struct.name+'()=default;';
	content.push(func_header);
}

function build_constructor2(content,info)
{
	var struct=info.struct;
	var is_header=info.is_header;
	var class_prefix=(is_header?'':struct.name+'::');
	var htab=(is_header?'\t':'');
	var func_header=htab+class_prefix+struct.name+'(';
	func_header+=struct.name+' const& value';
	func_header+=')'+(is_header?';':':');
	content.push(func_header);
	if(!is_header)
	{
		var inits=[]
		for(var item_id in struct.items)
			if(struct.items.hasOwnProperty(item_id))
			{
				var item=struct.items[item_id];
				inits.push('\t\t'+item.name+'(value.'+item.name+')');
			}
		content.push(inits.join(',\n'));
		content.push('{');
		content.push('\t// constructor');
		content.push('}');
		content.push('');
	}
}

function build_assigning(content,info)
{
	var struct=info.struct;
	var is_header=info.is_header;
	var class_prefix=(is_header?'':struct.name+'::');
	var htab=(is_header?'\t':'');
	[true,false].forEach(function(arg_const){
		var func_header=htab+struct.name+' '+class_prefix+'operator= (';
		if(arg_const)
		{
			// func_header+=struct.name+' & left,';
			func_header+=struct.name+' const& value';
		}
		else
		{
			// func_header+=struct.name+' & left,';
			func_header+=struct.name+'&& value';
		}
		func_header+=')'+(is_header?';':'');
		content.push(func_header);
		if(!is_header)
		{
			content.push('{');
			for(var item_id in struct.items)
				if(struct.items.hasOwnProperty(item_id))
				{
					var item=struct.items[item_id];
					switch(item.type_group)
					{
						case 'basic':
							content.push('\tthis->'+item.name+'=value.'+item.name+';'+' /* G159567927 */');
							break;
						case 'array[]':
							content.push('\t'+'for(int i=0;i<'+item.length+';i++)');
							content.push('\t\tthis->'+item.name+'[i]=value.'+item.name+'[i];'+' /* G496846543 */');
							break;
						case 'vector<>':
						case 'array<>':
							content.push('\tthis->'+item.name+'=value.'+item.name+';'+' /* G456546523 */');
							break;
						default:
							alert('Unkown type_group \''+item.type_group+'\' A6897465143546');
					}
				}
			content.push('\treturn {*this};');
			content.push('}');
			content.push('');
		}
	});
}

function build_opr1(content,info,recipe)
{
	var struct=info.struct;
	var is_header=info.is_header;
	var classprefix=(is_header?'':struct.name+'::');
	var func_header=(is_header?'\t':'');
	func_header+=struct.name+' '+(is_header?'':classprefix)+'operator'+recipe.opr+'='+' (';
	func_header+=recipe.op1_type+recipe.op1_name;
	func_header+=')'+(is_header?';':'');
	content.push(func_header);
	if(!is_header)
	{
		content.push('{');
		var add_by_scalar=recipe.op1_scalar;
		for(var item_id in struct.items)
			if(struct.items.hasOwnProperty(item_id))
			{
				var item=struct.items[item_id];
				if(item.state)
				{
					switch(item.type_group)
					{
						case 'basic':
							content.push('\t'+'this->'+item.name+recipe.opr+'='+recipe.op1_name+(add_by_scalar?'':'.'+item.name)+';'+' /* G156478346 */');
							break;
						case 'array[]':
							content.push('\t'+'for(int i=0;i<'+item.length+';i++)');
							content.push('\t\t'+'this->'+item.name+'[i]'+recipe.opr+'='+recipe.op1_name+(add_by_scalar?'':'.'+item.name+'[i]')+';'+' /* G486137661 */');
							break;
						case 'vector<>':
						case 'array<>':
							content.push('\t'+'for(int i=0;i<(int)'+item.name+'.size();i++)');
							content.push('\t\t'+'this->'+item.name+'[i]'+recipe.opr+'='+recipe.op1_name+(add_by_scalar?'':'.'+item.name+'[i]')+';'+' /* G788656216 */');
							break;
						default:
							alert('Unkown type_group \''+item.type_group+'\' A68517681354654');
					}
				}
				else
					content.push('\t/* skipped '+item.name+' */');
			}
		content.push('\t'+'return {*this};');
		content.push('}');
		content.push('');
	}
}

function build_opr2(content,info,recipe)
{
	var struct=info.struct;
	var is_header=info.is_header;
	var func_header=struct.name+' operator'+recipe.opr+' (';
	func_header+=recipe.op1_type+recipe.op1_name+',';
	func_header+=recipe.op2_type+recipe.op2_name;
	func_header+=')'+(is_header?';':'');
	content.push(func_header);
	if(!is_header)
	{
		content.push('{');
		var init_by='';
		var add_by='';
		var add_by_scalar=(recipe.op1_scalar||recipe.op2_scalar);
		if(!recipe.op1_scalar)
		{
			init_by=recipe.op1_name;
			add_by=recipe.op2_name;
		}
		else
		{
			init_by=recipe.op2_name;
			add_by=recipe.op1_name;
		}
		content.push('\t'+struct.name+' result{'+init_by+'};');
		for(var item_id in struct.items)
			if(struct.items.hasOwnProperty(item_id))
			{
				var item=struct.items[item_id];
				if(item.state)
				{
					switch(item.type_group)
					{
						case 'basic':
							content.push('\tresult.'+item.name+recipe.opr+'='+add_by+(add_by_scalar?'':'.'+item.name)+' /* G456789264 */'+';');
							break;
						case 'array[]':
							content.push('\t'+'for(int i=0;i<'+item.length+';i++)');
							content.push('\t\tresult.'+item.name+'[i]'+recipe.opr+'='+add_by+(add_by_scalar?'':'.'+item.name+'[i]')+';'+' /* G487656913 */'); 
							break;
						case 'vector<>':
						case 'array<>':
							content.push('\t'+'for(int i=0;i<(int)'+init_by+'.'+item.name+'.size();i++)');
							content.push('\t\tresult.'+item.name+'[i]'+recipe.opr+'='+add_by+(add_by_scalar?'':'.'+item.name+'[i]')+';'+' /* G565469852 */');
							break;
						default:
							alert('Unkown type_group \''+item.type_group+'\' A45984965469');
					}
				}
				else
					content.push('\t/* skipped '+item.name+' */');
			}
		content.push('\treturn result;');
		content.push('}');
		content.push('');
	}
}

function build_abs(content,info)
{
	var struct=info.struct;
	var is_header=info.is_header;
	var class_prefix=(is_header?'':struct.name+'::');
	var htab=(is_header?'\t':'');
	var func_header=htab+struct.name+' '+class_prefix+'abs(';
	func_header+=') const'+(is_header?';':'');
	content.push(func_header);
	if(!is_header)
	{
		content.push('{');
		content.push('\t'+struct.name+' result;');
		for(var item_id in struct.items)
			if(struct.items.hasOwnProperty(item_id))
			{
				var item=struct.items[item_id];
				var primary_type=!info.other_structs.includes(item.type);
				switch(item.type_group)
				{
					case 'basic':
						if(item.state)
						{
							if(primary_type)
								content.push('\t'+'result.'+item.name+'=std::abs(this->'+item.name+');/* G541654354 */');
							else
								content.push('\t'+'result.'+item.name+'=this->'+item.name+'.abs();/* G541686285 */');
						}
						else
							content.push('\t'+'result.'+item.name+'=this->'+item.name+';');
						break;
					case 'array[]':
						content.push('\t'+'for(int i=0;i<'+item.length+';i++)');
						if(item.state)
						{
							if(primary_type)
								content.push('\t\t'+'result.'+item.name+'[i]=std::abs(this->'+item.name+'[i]);/* G541654354 */');
							else
								content.push('\t\t'+'result.'+item.name+'[i]=this->'+item.name+'[i].abs();/* G541686285 */');
						}
						else
							content.push('\t\t'+'result.'+item.name+'[i]=this->'+item.name+'[i];');
						break;
					case 'vector<>':
					case 'array<>':
						content.push('\t'+'for(int i=0;i<(int)this->'+item.name+'.size();i++)');
						if(item.state)
						{
							if(primary_type)
								content.push('\t\t'+'result.'+item.name+'[i]=std::abs(this->'+item.name+'[i]);/* G541654354 */');
							else
								content.push('\t\t'+'result.'+item.name+'[i]=this->'+item.name+'[i].abs();/* G541686285 */');
						}
						else
							content.push('\t\t'+'result.'+item.name+'[i]=this->'+item.name+'[i];');
						break;
					default:
						alert('Unkown type_group \''+item.type_group+'\' A654986465163');
				}

			}
		content.push('\treturn result;');
		content.push('}');
		content.push('');
	}
}

function build_minmax_item(content,item,minmax,first)
{
	var obj=item.obj;
	var type_part=(first?'double ':'');
	var result_part='total_'+minmax;
	var calc_begin=(first?'':'std::'+minmax+'(total_'+minmax+',');
	var opr='?';
	var calc_end=(first?'':')');
	switch(obj.type_group)
	{
		case 'basic':
			opr='this->'+obj.name;
			content.push('\t'+type_part+result_part+'='+calc_begin+opr+calc_end+'; /* G564654669 */');
			break;
		case 'array[]':
			var first_for_index=(first?'1':'0');
			// var index_part='[0]';
			opr='this->'+obj.name+'[0]'+(item.is_primary?'':'.'+minmax+'()');
			if(first)
				content.push('\t'+type_part+result_part+'='+calc_begin+opr+calc_end+';');
			content.push('\t'+'for(int i='+first_for_index+';i<'+obj.length+';i++)');
			opr='this->'+obj.name+'[i]'+(item.is_primary?'':'.'+minmax+'()');
			content.push('\t\t'+result_part+'='+calc_begin+opr+calc_end+'; /* G165419684 */');
			break;
		case 'vector<>':
		case 'array<>':
			var first_for_index='0';
			if(first)
			{
				if(minmax=='min')
					init_val='1.0e300';
				else if(minmax=='max')
					init_val='-1.0e300';
				else
					init_val='/* Error A687932516546 */';
				content.push('\t'+type_part+result_part+'='+init_val+';');
			}
			opr='this->'+obj.name+'[i]'+(item.is_primary?'':'.'+minmax+'()');
			content.push('\t'+'for(int i='+first_for_index+';i<(int)'+obj.name+'.size();i++)');
			content.push('\t\t'+result_part+'='+calc_begin+opr+calc_end+'; /* G165419684 */');
			break;
		default:
			alert('Unkown type_group \''+obj.type_group+'\' A5489854986569');
	}
}

function build_minmax(content,info)
{
	['min','max'].forEach(function(minmax){
		var struct=info.struct;
		var is_header=info.is_header;
		var class_prefix=(is_header?'':struct.name+'::');
		var htab=(is_header?'\t':'');
		var func_header=htab+'double '+class_prefix+minmax+'(';
		func_header+=') const'+(is_header?';':'');
		content.push(func_header);
		if(!is_header)
		{
			content.push('{');
			var minmax_items=[];
			for(var item_id in struct.items)
				if(struct.items.hasOwnProperty(item_id))
				{
					var item=struct.items[item_id];
					var primary_type=!info.other_structs.includes(item.type);
					if(item.state)
						minmax_items.push({
							obj: item,
							is_primary: primary_type});
				}
			if(minmax_items.length>0)
				build_minmax_item(content,minmax_items[0],minmax,true);
			else
				content.push('\twarning: no state found. B541681354165');
			for(var i=1;i<minmax_items.length;i++)
				build_minmax_item(content,minmax_items[i],minmax,false);
			content.push('\treturn total_'+minmax+';');
			content.push('}');
			content.push('');
		}
	});
}

function other_structs(structs,struct_id)
{
	var struct=structs[struct_id];
	var other_structs=[];
	for(var other_struct_id in structs)
		if(structs.hasOwnProperty(other_struct_id))
			if(structs[other_struct_id].name!=struct.name)
				other_structs.push(structs[other_struct_id].name);
	return other_structs;
}

function build_struct(structs,struct_id)
{
	var struct_files=[];
	[true,false].forEach(function(is_header){
		var struct=structs[struct_id];
		var includes_global=[];
		var includes_local=[];
		var content=[];
		if(is_header)
		{
			var prerequisites={};
			prerequisites.has_string=false;
			prerequisites.has_vector=false;
			prerequisites.has_stdarray=false;
			prerequisites.type_dependency=[];
			var struct_content=[];
			struct_content.push('struct '+struct.name);
			struct_content.push('{');
			for(var item_id in struct.items)
				if(struct.items.hasOwnProperty(item_id))
				{
					var info={};
					info.item=struct.items[item_id];
					info.is_header=is_header;
					info.other_structs=other_structs(structs,struct_id);
					build_struct_item(struct_content,prerequisites,info);
				}
			if(prerequisites.has_string)
				includes_global.push('string');
			if(prerequisites.has_vector)
				includes_global.push('vector');
			if(prerequisites.has_stdarray)
				includes_global.push('array');
			for(var dep of prerequisites.type_dependency)
				build_codegen.ensure_included(includes_global,'auto-coded/types/'+dep.toLowerCase()+'.hpp');
			struct_content.forEach(function(line){
				content.push(line);
			});
		}
		else
		{
			includes_global.push('cstdlib');
			includes_global.push('algorithm');
			if(!is_header)
				build_codegen.ensure_included(includes_global,'auto-coded/types/'+struct.name.toLowerCase()+'.hpp');
			// includes_local.push(struct.name+'.hpp');
			content.push('');
			content.push('');
		}
		var f_info={};
		f_info.struct=struct;
		f_info.other_structs=other_structs(structs,struct_id)
		f_info.is_header=is_header;
		if(is_header)
			content.push('');
		build_constructor1(content,f_info);
		build_constructor2(content,f_info);
		build_reset(content,f_info);
		build_assigning(content,f_info);
		build_abs(content,f_info);
		build_minmax(content,f_info);
		build_opr1(content,f_info,{
				opr:'+',
				op1_type:'const '+struct.name+' &',
				op1_name:'right',
				op1_scalar:false,
			});
		build_opr1(content,f_info,{
				opr:'+',
				op1_type:'const double &',
				op1_name:'value',
				op1_scalar:true,
			});
		build_opr1(content,f_info,{
				opr:'-',
				op1_type:'const '+struct.name+' &',
				op1_name:'right',
				op1_scalar:false,
			});
		build_opr1(content,f_info,{
				opr:'*',
				op1_type:'const '+struct.name+' &',
				op1_name:'right',
				op1_scalar:false,
			});
		build_opr1(content,f_info,{
				opr:'*',
				op1_type:'const double &',
				op1_name:'value',
				op1_scalar:true,
			});
		build_opr1(content,f_info,{
				opr:'/',
				op1_type:'const '+struct.name+' &',
				op1_name:'right',
				op1_scalar:false,
			});
		if(is_header)
		{
			content.push('}; // struct '+struct.name);
			content.push('');
		}
		// end of the class
		build_opr2(content,f_info,{
				opr:'+',
				op1_type:'const '+struct.name+' &',
				op1_name:'left',
				op1_scalar:false,
				op2_type:'const '+struct.name+' &',
				op2_name:'right',
				op2_scalar:false
			});
		build_opr2(content,f_info,{
				opr:'+',
				op1_type:'const '+struct.name+' &',
				op1_name:'left',
				op1_scalar:false,
				op2_type:'const double &',
				op2_name:'value',
				op2_scalar:true
			});
		build_opr2(content,f_info,{
				opr:'+',
				op1_type:'const double &',
				op1_name:'value',
				op1_scalar:true,
				op2_type:'const '+struct.name+' &',
				op2_name:'right',
				op2_scalar:false
			});
		build_opr2(content,f_info,{
				opr:'-',
				op1_type:'const '+struct.name+' &',
				op1_name:'left',
				op1_scalar:false,
				op2_type:'const '+struct.name+' &',
				op2_name:'right',
				op2_scalar:false
			});
		build_opr2(content,f_info,{
				opr:'*',
				op1_type:'const double &',
				op1_name:'value',
				op1_scalar:true,
				op2_type:'const '+struct.name+' &',
				op2_name:'right',
				op2_scalar:false
			});
		build_opr2(content,f_info,{
				opr:'*',
				op1_type:'const '+struct.name+' &',
				op1_name:'left',
				op1_scalar:false,
				op2_type:'const '+struct.name+' &',
				op2_name:'right',
				op2_scalar:false
			});
		build_opr2(content,f_info,{
				opr:'/',
				op1_type:'const '+struct.name+' &',
				op1_name:'left',
				op1_scalar:false,
				op2_type:'const '+struct.name+' &',
				op2_name:'right',
				op2_scalar:false
			});
		struct_files.push({
				path: 'auto-coded/types/'+struct.name.toLowerCase()+'.'+(is_header?'hpp':'cpp'),
				overwrite: true,
				is_json: false,
				is_header: is_header,
				autogen_preamble: true,
				generator_mark: 'G541654196',
				includes_global: includes_global,
				includes_local: includes_local,
				content: content,
			});	
	});
	return struct_files;
}

function build_structures(project,built,respond)
{
	built.files=built.files || [];
	var structs=project.data.structures.structs;
	for(var struct_id in structs)
		if(structs.hasOwnProperty(struct_id))
		{
			var code_files=build_struct(structs,struct_id)
			code_files.forEach(function(code_file){
				built.files.push(code_file);
			});
		}
	return ;
}

module.exports.build_structures=build_structures;
