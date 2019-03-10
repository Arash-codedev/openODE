// var express    = require('express');
// var path       = require('path');
// var app        = express();
var security      = require('./security.js');
var project_meta  = require('./projects_meta.js');
var modules       = require('./modules.js');
var projects      = require('./projects.js');

module.exports = {
	setup: function (app)
	{
		security.routing_security(app);
		project_meta.routing_project_meta(app);
		modules.routing_modules(app);
		modules.routing_module_js(app);
		modules.routing_module_css(app);
		projects.routing_project(app);
	},
};
