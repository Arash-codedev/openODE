

function build_meta(project,built,respond)
{
	var content=[
		'int main()',
		'{',
		'\treturn 0;',
		'}',
		];
	var main_file={
			path: 'main.cpp',
			overwrite: false,
			is_json: false,
			is_header: false,
			autogen_preamble: false,
			generator_mark: 'G8749146546',
			includes_global: ['iostream'],
			includes_local: [],
			content: content,
		};
	built.files=built.files || [];
	built.files.push(main_file);
	return ;
}

module.exports.build_meta=build_meta;
