var fs = require('fs');
var session = require('express-session');
var user_db_file='./data/users.json';
var user_list=[];
var server   = require('./server.js');
var logger   = require('./log.js');
var express    = require('express');
// var app        = express();



function load_users()
{
	fs.readFile(user_db_file, function (err, json_txt) {
		if (err)
		{
			throw err; 
		}
		user_list=JSON.parse(json_txt);
	});
}

function authenticate(username,password)
{
	for(var i=0;i<user_list.length;i++)
	{
		var element=user_list[i];
		if(element.username==username && element.password==password)
			return element.id;
	}
	return false;
}

function verify_authentication(req,res)
{
	var ssn = req.session; 
	if(ssn.userid)
		return true;
	else
	{
		res.redirect('/login');
		return false;
	}
}

function user_id(req)
{
	return req.session.userid;
}

function is_admin(userid)
{
	for(var i=0;i<user_list.length;i++)
	{
		var element=user_list[i];
		if(element.id==userid)
		{
			if(element.is_admin=="true")
				return true;
			else
				return false;
		}
	}
	return false;
}

function routing_security(app)
{
	app.get('/login',function(req,res)
	{
		server.write_private_page(res,'login.html');
	});

	app.post('/login',function(req,res){
		var ssn = req.session;
		var data=JSON.parse(req.body.data);
		var username=data.username;
		var password=data.password;
		var userid=module.exports.authenticate(username,password);
		if(userid)
		{
			ssn.username=username;
			ssn.userid=Number(userid);
			var obj={status:'ok'};
			server.respond_json(res,obj);
			logger.info('user "'+username+'":'+userid+' has logged in.');
		}
		else
		{
			logger.info('user '+username+' log in failed.');
			var obj={status:'user name or password does not match'};
			server.respond_json(res,obj);
		}
	});

	app.get('/logout',function(req,res)
	{
		var username = req.session.username; 
		var userid = req.session.userid; 
		if(username && userid)
			logger.info('user "'+username+'":'+userid+' has logged out.');
		req.session.destroy(function(err)
		{
			if(err)
			{
				console.log(err);
			}
			else
			{
				res.redirect('/');
			}
		});
	});
}


module.exports.load_users=load_users;
module.exports.authenticate=authenticate;
module.exports.verify_authentication=verify_authentication;
module.exports.user_id=user_id;
module.exports.is_admin=is_admin;
module.exports.routing_security=routing_security;

