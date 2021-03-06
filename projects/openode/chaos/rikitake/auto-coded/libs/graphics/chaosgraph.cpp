#include "chaosgraph.hpp"
#include "keyboard.hpp"

#include <cstdlib>
#include <cmath>
#include <iostream>
#include <sstream>

// #include <SDL2/SDL.h>
#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
#include <GL/freeglut.h>

using std::cout;
using std::endl;

constexpr double pi=3.1415926;

Chaosgraph::Chaosgraph():
	Window(),
	chaos_intialized(false),
	// plotter_refresh(true),
	g_points({}),
	times({}),
	dt(0.0f),
	camera_zoom_rate(1.07f),
	events({}),
	screenshot_rate(0.0),
	videorecord_rate(0),
	axis_size(20.0),
	camera_time_offset(0.0f),
	camera_angle2_max_deg(30.0f),
	camera_radius(2.0f),
	camera_radius_target(-1.0f),
	sphere_radius(0.1f),
	line_width(4.0f),
	auto_zoom_out(true),
	color_scale(1.0),
	x_sum(0.0),
	y_sum(0.0),
	z_sum(0.0),
	max_r2(0.0),
	count(0),
	palette({
		{0.0,0.0,0.0},
		{0.2,0.2,0.1},
		{0.1,0.0,0.1},
		{0.0,0.0,0.2},
		{0.0,0.0,0.3},
		{0.0,0.0,0.4},
		{0.0,0.2,0.5},
		{0.1,0.3,0.7},
		{0.2,0.5,0.8},
		{0.5,0.7,0.9},
		{0.8,0.9,1.0},
		{0.9,0.9,0.7},
		{1.0,0.8,0.4},
		{1.0,0.7,0.0},
		{0.8,0.5,0.0},
		{0.6,0.3,0.0},
		{0.4,0.2,0.0}
	}),
	focuses({{0.0,0.0,0.0}}),
	fovy(80.0)
{
	// constructor
}


void Chaosgraph::init()
{
	g_points.clear();
	g_points.reserve(100000);
	times.clear();
	times.reserve(100000);
	if(screenshot_rate>0.0)
		set_screenshot(0.0,screenshot_rate);
	if(videorecord_rate>0)
		set_videorecord(0.0,videorecord_rate);
	Window::init();
	init_lights();
	chaos_intialized=true;
}

void Chaosgraph::set_zoom_rate(double magnification,double duration)
{
	if(magnification<=0.0)
		magnification=2.0;
	if(magnification<=1.0)
		magnification=1.0/magnification;
	camera_zoom_rate=(float)exp(dt/duration*log(magnification));
}

void Chaosgraph::chaotic_display()
{
	if(!is_plotter_refresh())
		return ;

	if(!isOpen())
		return ;

	events_handle();
	clear(background);

	double t=0.0;
	if(times.size()>0)
		t=times.back();
	double t_cam=t+camera_time_offset;
	float cam_angle1=float(t_cam*10.0+20.0);
	float cam_angle2=float(sin((t_cam+20.0)*0.03))*camera_angle2_max_deg;

	const float deg2rad=3.1415926f/180.0f;
	// const float rad2deg=1.0f/deg2rad;
	float cam_x=camera_radius*float(cos(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_y=camera_radius*float(sin(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_z=camera_radius*float(sin(cam_angle2*deg2rad));

	// glViewport(0, 0, (GLsizei)GLUT_SCREEN_WIDTH, (GLsizei)GLUT_SCREEN_HEIGHT);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	float width=(float) glutGet(GLUT_SCREEN_WIDTH);
	float height=(float) glutGet(GLUT_SCREEN_HEIGHT);
	const float ratio = width / height;

// fovy = 2*atan(halfwidth/aspect_ratio);
	const float near_plane=0.01f;
	// const float  fovy=2.0f*atanf(height/2.0f/(3.0*camera_radius))*rad2deg;
	const float  fovy=90.0;
// std::cout<<"fovy: "<<fovy<<std::endl;
	gluPerspective(fovy,ratio,near_plane,1000.0f);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	gluLookAt(cam_x,cam_y,cam_z,  0, 0, 0, 0, 0, 1);

	/* Draw axes */
	const float cone_size=axis_size*0.2f;
	/* axis lines*/

	glColor4ub(0,0,0,255);
	glLineWidth(line_width);
	glBegin(GL_LINE_STRIP);
	glVertex3f(0.0f,0.0f,0.0f);
	glVertex3f(axis_size,0.0f,0.0f);
	glEnd();
	glBegin(GL_LINE_STRIP);
	glVertex3f(0.0f,0.0f,0.0f);
	glVertex3f(0.0f,axis_size,0.0f);
	glEnd();
	glBegin(GL_LINE_STRIP);
	glVertex3f(0.0f,0.0f,0.0f);
	glVertex3f(0.0f,0.0f,axis_size);
	glEnd();

	/* axis cones */
	// x
	glPushMatrix();
	glTranslatef(axis_size,0,0);
	glRotatef(90,0,1,0);
	draw_cone(0.25*cone_size,cone_size);
	glPopMatrix();
	// y
	glPushMatrix();
	glTranslatef(0,axis_size,0);
	glRotatef(-90,1,0,0);
	draw_cone(0.25*cone_size,cone_size);
	glPopMatrix();
	// z
	glPushMatrix();
	glTranslatef(0,0,axis_size);
	glRotatef(0,1,0,0);
	draw_cone(0.25*cone_size,cone_size);
	glPopMatrix();
	/* axis labels*/
	glColor4ub(0, 0, 0, 255);
	glRasterPos3f(1.1f, 0.0f, 0.0f);
	double axis_label_distance=axis_size+cone_size*1.7;
	glPushMatrix();
	draw_text3d('x',axis_label_distance, 0.0, 0.0);	
	draw_text3d('y',0.0,axis_label_distance,0.0);	
	draw_text3d('z',0.0,0.0,axis_label_distance);	
	glPopMatrix();

	// draw
	if(g_points.size()>0)
	{
		glPushMatrix();
		glColor3ub(255,255,255);
		glEnableClientState(GL_VERTEX_ARRAY);
		glEnableClientState(GL_COLOR_ARRAY);
		glVertexPointer(3,GL_DOUBLE,sizeof(GPoint3D),&g_points[0].x);
		glColorPointer(4,GL_UNSIGNED_BYTE,sizeof(GPoint3D),&g_points[0].r);
		glPointSize(3.0);
		glLineWidth(line_width);
		glDrawArrays(GL_LINE_STRIP,0,int(g_points.size()));
		glDisableClientState(GL_VERTEX_ARRAY);
		glDisableClientState(GL_COLOR_ARRAY);
		glLineWidth(2.0f);
		glPopMatrix();

		/* sphere */
		glPushMatrix();
		glColor3ub(255,0,0);
		draw_sphere(
			g_points.back().x,
			g_points.back().y,
			g_points.back().z,
			sphere_radius
			);
		glPopMatrix();
	}

	if(times.size()>0)
	{
		/* string */
		glColor3f(0,0,0);	
		glMatrixMode( GL_PROJECTION );
		glLoadIdentity();
		glMatrixMode( GL_MODELVIEW );
		glLoadIdentity();
		gluOrtho2D( 0, 100, 0, 100 );
		// gluOrtho2D(-width,+width,-height,+height);

		std::stringstream ss_t,ss_x,ss_y,ss_z;
		ss_t.precision(3);
		ss_x.precision(4);
		ss_y.precision(4);
		ss_z.precision(4);
		ss_t<<"t= "<<std::fixed<<times.back();
		ss_x<<"x= "<<std::showpos<<std::fixed<<(g_points.back().x>0?" ":"")<<g_points.back().x;
		ss_y<<"y= "<<std::showpos<<std::fixed<<(g_points.back().y>0?" ":"")<<g_points.back().y;
		ss_z<<"z= "<<std::showpos<<std::fixed<<(g_points.back().z>0?" ":"")<<g_points.back().z;

		std::vector<std::string> text_items = {
			ss_t.str(),
			ss_x.str(),
			ss_y.str(),
			ss_z.str()};

		int text_y=90;

		for(const std::string &text_item:text_items)
		{
			draw_text2d(text_item,5.0,text_y);
			text_y-=5;
		}
	}
	Window::refresh(t);
}

void Chaosgraph::init_lights()
{
	// lighting
	GLfloat LightAmbient[] = { 0.2f, 0.2f, 0.2f, 1.0f };
	GLfloat LightDiffuse[] = { 0.5f, 0.5f, 0.5f, 1.0f };
	GLfloat LightPosition[] = { 5.0f, 5.0f, -10.0f, 1.0f };

	// glClearColor(0.0, 0.0, 0.0, 0.0); // When screen cleared, use black.
	glShadeModel(GL_SMOOTH); // How the object color will be rendered smooth or flat
	glEnable(GL_DEPTH_TEST); // Check depth when rendering
	// Lighting is added to scene
	glLightfv(GL_LIGHT1, GL_AMBIENT, LightAmbient);
	glLightfv(GL_LIGHT1, GL_DIFFUSE, LightDiffuse);
	glLightfv(GL_LIGHT1, GL_POSITION, LightPosition);
	// glEnable(GL_LIGHTING); // Turn on lighting
	glEnable(GL_LIGHT1); // Turn on light 1
}

// void Chaosgraph::chaotic_reshape(int w, int h)
// {
// 	glViewport(0, 0, (GLsizei)w, (GLsizei)h);
// 	glMatrixMode(GL_PROJECTION);
// 	glLoadIdentity();
// }

void Chaosgraph::events_handle()
{
	// if(TRUST_SFML)
	// {
	// 	sf::Event event;
	// 	while (sf_window.pollEvent(event))
	// 	{
	// 		if (event.type == sf::Event::Closed)
	// 		{
	// 			to_close=true;
	// 		}
	// 		// else if(event.type == sf::Event::KeyPressed)
	// 		// {
	// 		// 	chaotic_keyboard(event.key.code);
	// 		// }
	// 	}
	// }
	// else
	// {
	// 	// ????????????????
	// 	// do nothing at the moment
	// }
	vector<int> keys=keyboard_manager.pop_keys(get_win_id());
	keyboard_process(keys);
}


void Chaosgraph::keyboard_process(const vector<int> &keys)
{
	for(int key:keys)
	{
		switch (key)
		{
			case 27: // Escape key
				to_close=true;
				break;
			case '+':
				zoomin();
				break;
			case '-':
				zoomout();
				break;
		}
	}
	// glutPostRedisplay();
}

void Chaosgraph::zoomin()
{
	set_zoom_rate(2.0,1.0);
	camera_radius_target/=2.0f;
	auto_zoom_out=false;
}

void Chaosgraph::zoomout()
{
	set_zoom_rate(2.0,1.0);
	camera_radius_target*=2.0f;
	auto_zoom_out=false;
}

// void Chaosgraph::chaotic_keyboard(sf::Keyboard::Key key)
// {
// 	if(sf::Keyboard::isKeyPressed(sf::Keyboard::Escape))
// 	{
// 		sf_window.close();
// 	}
// 	else if(key==sf::Keyboard::Add || key==sf::Keyboard::Equal)
// 	{ /* + */
// 		zoomin();
// 	}
// 	else if(key==sf::Keyboard::Dash || key==sf::Keyboard::Subtract)
// 	{ /* - */
// 		zoomout();
// 	}
// }

vector<string> Chaosgraph::event_args(const string& line)
{
	vector<string> params;
	if(line.size()==0)
		return params;
	std::size_t last_pos=0,next_pos=0;
	do
	{
		next_pos=line.find(',',last_pos);
		if(next_pos!=std::string::npos)
		{
			params.push_back(line.substr(last_pos,next_pos-last_pos));
			last_pos=next_pos+1;
		}
		else
			params.push_back(line.substr(last_pos));
	}
	while(next_pos!=std::string::npos);
	return params;
}

void Chaosgraph::process_event(double t,gEvent e)
{
	if(t<e.t)
		return ;
	vector<string> params=event_args(e.params);
	if(e.cmd=="show")
		set_plotter_refresh(t,true);
	else if(e.cmd=="hide")
		set_plotter_refresh(t,false);
	else if(e.cmd=="camera_rt")
	{
		if(params.size()>=1)
		{
			camera_radius_target=std::stof(params[0].c_str());
			if(params.size()>=2)
			{
				double duration=std::stod(params[1].c_str());
				double magnification=double(camera_radius_target/camera_radius);
				set_zoom_rate(magnification,duration);
			}
		}
		auto_zoom_out=false;
	}
	else if(e.cmd=="ct_offset")
	{
		if(params.size()>=1)
			camera_time_offset=std::stof(params[0].c_str());
	}
	else if(e.cmd=="ct_rel_offset")
	{
		if(params.size()>=1)
			camera_time_offset+=std::stof(params[0].c_str());
	}
	else if(e.cmd=="stop")
	{
		to_close=true;
	}
	else
		cout<<"Warning: unknow event command: "<<e.cmd<<endl;
}

void Chaosgraph::observe(double t,double x,double y,double z)
{
	if(!chaos_intialized)
		init();

	constexpr float zm_min=std::numeric_limits<float>::epsilon()*10.0f;
	constexpr float zm_max=std::numeric_limits<float>::max()/100.0f;

	if(times.size()>0 && dt==0.0f)
	{
		dt=float(t-times.back()); /* calculate sample time once without asking it from user */
		if(dt==0.0f)
			std::cout<<"warning: time has stuck. A038475023"<<std::endl;
	}
	// camera zooming
	if(camera_radius_target<0.0f)
	{
		camera_radius_target=camera_radius;
		// std::cout<<"Camera radius set to: "<<camera_radius_target<<std::endl;
	}
	if(camera_radius>camera_radius_target)
	{
		camera_radius=float(double(camera_radius)/camera_zoom_rate);
		if(camera_radius<=camera_radius_target)
			camera_radius=camera_radius_target;
	}
	if(camera_radius<camera_radius_target)
	{
		camera_radius=float(double(camera_radius)*camera_zoom_rate);
		if(camera_radius>=camera_radius_target)
			camera_radius=camera_radius_target;
	}
	camera_radius_target=std::max(zm_min,std::min(zm_max,camera_radius_target));
	camera_radius=std::max(zm_min,std::min(zm_max,camera_radius));
	double abs_x=std::abs(x)+1.0;
	double abs_y=std::abs(y)+1.0;
	double abs_z=std::abs(z)+1.0;
	double particle_R2=abs_x*abs_x+abs_y*abs_y+abs_z*abs_z;
	double cam_R=double(camera_radius_target);
	if(auto_zoom_out && particle_R2>cam_R*cam_R)
	{
		camera_radius_target=float(sqrt(particle_R2));
	}
	// adding new point
	GPoint3D g_point;
	g_point.r=0;
	g_point.g=0;
	g_point.b=255;
	g_point.x=x;
	g_point.y=y;
	g_point.z=z;
	colorize(t,g_point);
	g_points.push_back(g_point);
	times.push_back(t);
	for(auto it=events.begin();it!=events.end();/* do not increase */)
	{
		if(t >= it->t)
		{
			process_event(t,*it);
			it = events.erase(it);
		}
		else 
			++it;
	}
	chaotic_display();
}

void Chaosgraph::push_point(double x,double y,double z)
{
	x_sum+=x;
	y_sum+=y;
	z_sum+=z;
	count+=1.0;
}

void Chaosgraph::get_avg(double &x_avg,double &y_avg,double &z_avg)
{
	x_avg=x_sum/count;
	y_avg=y_sum/count;
	z_avg=z_sum/count;
}

double Chaosgraph::location_to_color_index_ratio(double x,double y,double z)
{
	double invers_sum=0.0;
	for(const Point3D &p:focuses)
	{
		double rr2=(x-p.x)*(x-p.x)+(y-p.y)*(y-p.y)+(z-p.z)*(z-p.z);
		if(rr2<=0)
			rr2=1e-6;
		invers_sum+=1/rr2;
	}
	double rr2=double(focuses.size())/invers_sum;
	max_r2=std::max(max_r2,rr2);
	double r=sqrt(rr2);
	return r;
}

double Chaosgraph::get_avg_max_r2()
{
	return max_r2;
}

unsigned char processed(double c,double max_color)
{
	double noise_scale=0.1;
	if(max_color<100.0)
		noise_scale*=max_color/100.0;
	c+=noise_scale*((rand()%100)-(rand()%100));
	if(c<0.0)
		c=0.0;
	if(c>255.0)
		c=255.0;
	return (unsigned char)c;
}

void Chaosgraph::colorize(double /*t*/,GPoint3D& point)
{
	push_point(point.x,point.y,point.z);
	int palette_size=int(palette.size());
	double idx=location_to_color_index_ratio(point.x,point.y,point.z)*double(palette_size)/color_scale;
	int idx1=((int)floor(idx))%palette_size;
	int idx2=(idx1+1)%palette_size;
	double idx_rem=idx-floor(idx);

	double r=((1.0-idx_rem)*palette[idx1].r+idx_rem*palette[idx2].r)*255.0;
	double g=((1.0-idx_rem)*palette[idx1].g+idx_rem*palette[idx2].g)*255.0;
	double b=((1.0-idx_rem)*palette[idx1].b+idx_rem*palette[idx2].b)*255.0;

	double max_color=r;
	max_color=std::max(max_color,g);
	max_color=std::max(max_color,b);
	// double noise_scale=0.05;
	// if(max_color<100.0)
	// 	noise_scale*=max_color/100.0;
	// r+=noise_scale*(rand()%100);
	// g+=noise_scale*(rand()%100);
	// b+=noise_scale*(rand()%100);
	point.r=processed(r,max_color);
	point.g=processed(g,max_color);
	point.b=processed(b,max_color);
	point.a=255;
}
