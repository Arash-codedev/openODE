#include "chaosgraph.hpp"
#include "keyboard.hpp"

#include <cstdlib>
#include <cmath>
#include <iostream>
#include <sstream>

#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
#include <GL/freeglut.h>

using std::cout;
using std::endl;

constexpr double pi=3.1415926;
const GLenum current_lighting=GL_LIGHT1;

Chaosgraph::Chaosgraph():
	View3D(),
	chaos_intialized(false),
	g_points({}),
	times({}),
	// dt(0.0f),
	axis_size(20.0),
	camera_angle2_max_deg(30.0f),
	sphere_radius(0.1f),
	line_width(4.0f),
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
	focuses({{0.0,0.0,0.0}})
{
	// constructor
}


void Chaosgraph::init()
{
	g_points.clear();
	g_points.reserve(100000);
	// times.clear();
	// times.reserve(100000);
	// look_at_target_x=look_at_x;
	// look_at_target_y=look_at_y;
	// look_at_target_z=look_at_z;
	// if(screenshot_rate>0.0)
	// 	set_screenshot(0.0,screenshot_rate);
	// if(videorecord_rate>0)
	// 	set_videorecord(0.0,videorecord_rate);
	// Window::init();
	View3D::init();
	glutReshapeFunc(chaos_reshape);
	init_lights();
	chaos_intialized=true;
}

/*static*/ void Chaosgraph::chaos_reshape(int x,int y)
{
	if(!x || !y)
		return ;
	View3D::view3d_reshape(x,y);
	// glMatrixMode(GL_PROJECTION); // select the projection matrix 
	// glLoadIdentity(); // reset the projection matrix to identity
	// const double near_plane=0.01f;
	// const double far_plane=1000.0f;
	// const double ratio=(GLdouble)x/(GLdouble)y;
	// gluPerspective(fovy,ratio,near_plane,far_plane);
	// glMatrixMode(GL_MODELVIEW);
	// glViewport(0,0,x,y);

    glEnable(current_lighting);
    glColorMaterial( GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE );
    glEnable( GL_COLOR_MATERIAL );
}

void Chaosgraph::chaotic_display()
{
	if(!is_plotter_refresh())
		return ;

	if(!isOpen())
		return ;

	events_handle();

	double t=0.0;
	if(times.size()>0)
		t=times.back();


    glMatrixMode(GL_MODELVIEW);//clears the identity matrix
	glLoadIdentity();
    glClearColor(1.0f,1.0f,1.0f, 1.0f );
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);//clears the buffer drawing
    glMatrixMode(GL_MODELVIEW);
  
	double t_cam=t+camera_time_offset;
	float cam_angle1=float(t_cam*10.0+20.0);
	float cam_angle2=float(sin((t_cam+20.0)*0.03))*camera_angle2_max_deg;
	const float deg2rad=3.1415926f/180.0f;
	float cam_x=look_at_x+camera_radius*float(cos(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_y=look_at_y+camera_radius*float(sin(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_z=look_at_z+camera_radius*float(sin(cam_angle2*deg2rad));
	gluLookAt(cam_x,cam_y,cam_z,  look_at_x, look_at_y, look_at_z, 0, 0, 1);

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
		glDisable(GL_LIGHTING);
		/* string */
		glColor3f(0,0,0);
		glMatrixMode( GL_PROJECTION );
		glPushMatrix();
		glLoadIdentity();
		gluOrtho2D( 0, 100, 0, 100 );
		glMatrixMode( GL_MODELVIEW );
		glPushMatrix();
		glLoadIdentity();

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
			// glColor3f(0,0,0);
			draw_text2d(text_item,5.0,text_y);
			text_y-=5;
		}
		glPopMatrix();
		glMatrixMode(GL_PROJECTION);
		glPopMatrix();
		glEnable(current_lighting); 
	}
	Window::refresh(t);
}

void Chaosgraph::init_lights()
{
	// lighting
	GLfloat LightAmbient[] = { 0.2f, 0.2f, 0.2f, 1.0f };
	GLfloat LightDiffuse[] = { 0.5f, 0.5f, 0.5f, 1.0f };
	GLfloat LightPosition[] = { 5.0f, 5.0f, -10.0f, 1.0f };

	glShadeModel(GL_SMOOTH); // How the object color will be rendered smooth or flat
	glEnable(GL_DEPTH_TEST); // Check depth when rendering
	glLightfv(current_lighting, GL_AMBIENT, LightAmbient);
	glLightfv(current_lighting, GL_DIFFUSE, LightDiffuse);
	glLightfv(current_lighting, GL_POSITION, LightPosition);
	glEnable(current_lighting); // Turn on light 1
}

void Chaosgraph::events_handle()
{
	vector<int> keys=keyboard_manager.pop_keys(get_win_id());
	keyboard_process(keys);
}

void Chaosgraph::keyboard_process(const vector<int> &keys)
{
	for(int key:keys)
	{
		if(!View3D::keyboard_process(key))
		{
			// local process
		}
		// switch (key)
		// {
		// 	case 27: // Escape key
		// 		to_close=true;
		// 		break;
		// 	case '+':
		// 		zoomin();
		// 		break;
		// 	case '-':
		// 		zoomout();
		// 		break;
		// }
	}
}

void Chaosgraph::process_event(double t,const gEvent &e)
{
	if(!View3D::process_event(t,e))
		cout<<"Warning: unknow event command: "<<e.cmd<<endl;
}

void Chaosgraph::observe(double t,double x,double y,double z)
{
	if(!chaos_intialized)
		init();
	View3D::observe_camera(t);

	double abs_x=std::abs(x)+1.0;
	double abs_y=std::abs(y)+1.0;
	double abs_z=std::abs(z)+1.0;
	double particle_R2=abs_x*abs_x+abs_y*abs_y+abs_z*abs_z;
	double cam_R=double(camera_radius_target);
	if(auto_zoom_out && particle_R2>cam_R*cam_R)
		camera_radius_target=float(sqrt(particle_R2));

	////////////////////////
	// if(times.size()>0 && dt==0.0f)
	// {
	// dt=float(t-times.back());
	// 	if(dt==0.0f)
	// 		std::cout<<"warning: time has stuck. A038475023"<<std::endl;
	// }
	// if(get_dt()==0.0)
	// 	std::cout<<"warning: time has stuck. A038475023"<<std::endl;

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
	////////////////////////
	observe_events(t);
	chaotic_display();
}

void Chaosgraph::observe_events(double t)
{
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

unsigned char processed_color(double c,double max_color)
{
	double noise_scale=0.01;
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
	point.r=processed_color(r,max_color);
	point.g=processed_color(g,max_color);
	point.b=processed_color(b,max_color);
	point.a=255;
}
