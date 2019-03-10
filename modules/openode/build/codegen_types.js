
function render_types(project,built)
{
	built.files=built.files || [];
	var content=[];

	content.push('enum class controlled_step_result');
	content.push('{');
	content.push('\tsuccess , // < The trial step was successful, hence the state and the time have been advanced.');
	content.push('\tfail	  // < The step was not successful and might possibly be repeated with a small step size.');
	content.push('};');

	built.files.push({
			path: 'auto-coded/types/general_types.hpp',
			overwrite: true,
			is_json: false,
			is_header: true,
			autogen_preamble: true,
			generator_mark: 'G38541642654',
			includes_global: [],
			includes_local: [],
			content: content,
		});
}

module.exports.render_types=render_types;
