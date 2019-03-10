var fs = require('fs');

function write_private_page(res,filename)
{
	fs.readFile('./public/private/'+filename, function (err, html) {
		if (err)
		{
			throw err; 
		}
		res.writeHeader(200, {"Content-Type": "text/html"});  
		res.write(html);  
		res.end();  
	});
}

function wrapp_html(title,head,body)
{
	var html=
		'<!DOCTYPE html>'+
		'<html>'+
		'<head>'+
			'<title>'+title+'</title>'+
			'<meta charset="UTF-8">'+
			head+
			'<link href="/css/theme.css" rel="stylesheet">'+
		'</head>'+
		'<body>'+
		body+
		'</body>'+
		'</html>';
	return html;
}

function write_error_page(res,content,title=null)
{
	title=title||"error";
	var body='<div class="error" text-align="center">'+content+'</div>';
	var html=wrapp_html(title,'',body);
	res.writeHeader(200, {"Content-Type": "text/html"});  
	res.write(html);  
	res.end();  
}

function respond_json(res,obj)
{
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(obj));
}

function respond_permission_error_json(res)
{
	var obj={status:'not authorized.'};
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(obj));
}

module.exports.write_private_page=write_private_page;
module.exports.write_error_page=write_error_page;
module.exports.wrapp_html=wrapp_html;
module.exports.respond_json=respond_json;
module.exports.respond_permission_error_json=respond_permission_error_json;
