var fs        = require('fs');
var path      = require('path');


function content_html_path(module_element)
{
	return path.join(global.module_group_path,module_element.folder_path,'content.html');
}

function content_js_path(js_name,module_element)
{
	return path.join(global.module_group_path,module_element.folder_path,js_name);
}

function content_css_path(css_name,module_element)
{
	return path.join(global.module_group_path,module_element.folder_path,css_name);
}

function render_div_content(module_element,project)
{
	var html_path=content_html_path(module_element);
	var content=fs.readFileSync(html_path,'utf8');
	content=content.replace(/##title##/g,project.title);
	return content;
}

function render_js(js_name,module_element)
{
	if(js_name=='client.js')
	{
		var js_path=content_js_path(js_name,module_element);
		var content=fs.readFileSync(js_path,'utf8');
		return content;
	}
	else
	{
		return 'file not found or there is no access. 547968713A';
	}
}

function render_css(css_name,module_element)
{
	if(css_name=='themes.css')
	{
		var css_path=content_css_path(css_name,module_element);
		var content=fs.readFileSync(css_path,'utf8');
		return content;
	}
	else
	{
		return 'file not found or there is no access. A465164565';
	}
}

function js_link(module_element)
{
	return '<script src="/js/module/'+module_element.id+'/client.js"></script>\n';
}

function css_link(module_element)
{
	return '<link href="/css/module/'+module_element.id+'/themes.css" rel="stylesheet">\n'
}

module.exports.render_div_content=render_div_content;
module.exports.render_js=render_js;
module.exports.render_css=render_css;
module.exports.js_link=js_link;
module.exports.css_link=css_link;
