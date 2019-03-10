// server.js

// var html       = require('html');
var express    = require('express');
var session    = require('express-session');
var bodyParser = require('body-parser');
var fs         = require('fs');
var path       = require('path');
var app        = express();
// var engines    = require('consolidate');
global.appRoot = path.resolve(__dirname);
global.moduleGroup = process.argv[2];
var argv = require('minimist')(process.argv.slice(2));

if(!global.moduleGroup)
{
	console.log('No module group is given.\n Try: node openode <modulegroup>');
	process.exit(1);
}

if(!fs.existsSync('./modules/'+global.moduleGroup))
{
	console.log('Module group "'+global.moduleGroup+'" not found in the module folder.');
	process.exit(1);
}
else
	global.module_group_path = path.join(global.appRoot,'modules',global.moduleGroup);


// app.set('view engine','jade'); 
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var port = process.env.PORT || argv.port || 8081;
var router = express.Router();
// var ssn;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var cookie_secret=require('crypto').randomBytes(64).toString('hex');
app.use(session({
	// secret:'arsnetkoarenstanwhdiabhisrdhbarsn',
	// secret:require('crypto').randomBytes(64).toString('hex'),
	secret: cookie_secret,
	// resave: true,
	// saveUninitialized:true
	resave: false,
	saveUninitialized: true,
	// cookie: { secure: true }
	name: 'session1_'+global.moduleGroup,
}));
// app.use(express.cookieParser());
// var cookieParser = require('cookie-parser');
// app.use(cookieParser(cookie_secret));

/* ******************************* */
var security      = require('./js/security.js');
var server        = require('./js/server.js');
var logger        = require('./js/log.js');
var routing       = require('./js/routing.js');
var project_meta  = require('./js/projects_meta.js');
var projects      = require('./js/projects.js');
// var algorithm     = require('./algorithm.js');
/* ******************************* */

routing.setup(app);
security.load_users();

// router.get('/aaa', function(req, res) {
//     res.json({ message: 'welcome to our api!' });   
// });

// app.use('/api', router);

app.get('/',function(req,res)
{ 
	if(!security.verify_authentication(req,res))
		return ;
	res.render('index.html');
});

app.get('/project/:project_id',function(req,res)
{ 
	if(!security.verify_authentication(req,res))
		return ;
	var project_id = req.params.project_id;
	var user_id=security.user_id(req);
	projects.browse(project_id,user_id,res);
});

app.get('/project_json/:project_id',function(req,res)
{ 
	if(!security.verify_authentication(req,res))
		return ;
	var project_id = req.params.project_id;
	var user_id=security.user_id(req);
	projects.show_json(project_id,user_id,res);
});


app.get('/admin',function(req,res){
  var ssn = req.session;
  if(ssn.email) {
    res.write('<h1>Hello '+ssn.email+'</h1>');
    res.end('<a href="+">Logout</a>');
  } else {
    res.write('<h1>login first.</h1>');
    res.end('<a href="+">Login</a>');
  }
});

app.use(express.static(path.join(__dirname, 'public')));

var mg_config = require(path.join(global.module_group_path,'mg_config.js'));
mg_config.extra_routing(app);

var production = process.env.NODE_ENV === 'production'
if(!production) {
	var chokidar = require('chokidar')
	var watcher = chokidar.watch('.')

	watcher.on('ready', function()
	{
		watcher.on('all', function()
		{
			var count=0;
			Object.keys(require.cache).forEach(function(id)
			{
				if (/[\/\\]modules[\/\\]/.test(id))
				{
					delete require.cache[id]
					count++;
				}
				// console.log("cache id: "+id)
			})
			if(count>0)
			console.log('Clearing '+count+' modules cache from server')
		})
	})
}

app.listen(port);
console.log('http://localhost:'+port);
logger.info('server started.');
