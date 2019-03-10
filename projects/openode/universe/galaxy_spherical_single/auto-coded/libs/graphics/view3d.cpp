#include "view3d.hpp"

#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
#include <GL/freeglut.h>

double View3D::fovy=45.0;

/*static*/ void View3D::view3d_reshape(int x,int y)
{
	if(!x || !y)
		return ;
	glMatrixMode(GL_PROJECTION); // select the projection matrix 
	glLoadIdentity(); // reset the projection matrix to identity
	const double near_plane=0.01f;
	const double far_plane=1000.0f;
	const double ratio=(GLdouble)x/(GLdouble)y;
	gluPerspective(fovy,ratio,near_plane,far_plane);
	glMatrixMode(GL_MODELVIEW);
	glViewport(0,0,x,y);

    // glEnable(current_lighting);
    // glColorMaterial( GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE );
    // glEnable( GL_COLOR_MATERIAL );
}


void View3D::set_zoom_rate(double magnification,double duration)
{
	if(magnification<=0.0)
		magnification=2.0;
	if(magnification<=1.0)
		magnification=1.0/magnification;
	camera_zoom_rate=(float)exp(get_dt()/duration*log(magnification));
}

void View3D::init()
{
	// g_points.clear();
	// g_points.reserve(100000);
	look_at_target_x=look_at_x;
	look_at_target_y=look_at_y;
	look_at_target_z=look_at_z;
	if(screenshot_rate>0.0)
		set_screenshot(0.0,screenshot_rate);
	if(videorecord_rate>0)
		set_videorecord(0.0,videorecord_rate);
	Window::init();
	// glutReshapeFunc(chaos_reshape);
	// init_lights();
	// chaos_intialized=true;
}

View3D::View3D():
	Window(),
	camera_zoom_rate(1.07f),
	look_at_target_x(0.0f),
	look_at_target_y(0.0f),
	look_at_target_z(0.0f),
	count_observe(0),
	last_t(0.0),
	dt(0.0),
	events({}),
	screenshot_rate(0.0),
	videorecord_rate(0),
	look_at_x(0.0f),
	look_at_y(0.0f),
	look_at_z(0.0f),
	auto_zoom_out(true),
	camera_radius(2.0f),
	camera_radius_target(-1.0f),
	camera_time_offset(0.0f)
{

}


void View3D::zoomin()
{
	set_zoom_rate(2.0,1.0);
	camera_radius_target/=2.0f;
	auto_zoom_out=false;
}

void View3D::zoomout()
{
	set_zoom_rate(2.0,1.0);
	camera_radius_target*=2.0f;
	auto_zoom_out=false;
}

vector<string> View3D::event_args(const string& line)
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

bool View3D::process_event(double t,const gEvent &e)
{
	if(t<e.t)
		return true;
	vector<string> params=event_args(e.params);
	if(e.cmd=="show")
	{
		set_plotter_refresh(t,true);
		return true;
	}
	else if(e.cmd=="hide")
	{
		set_plotter_refresh(t,false);
		return true;
	}
	else if(e.cmd=="camera_rt")
	{
		if(params.size()>=1)
		{ // camera_radius_target
			camera_radius_target=std::stof(params[0].c_str());
			if(params.size()>=2)
			{ // duration
				double duration=std::stod(params[1].c_str());
				double magnification=double(camera_radius_target/camera_radius);
				set_zoom_rate(magnification,duration);
				if(params.size()>=5)
				{ // final target point
					look_at_target_x=std::stof(params[2].c_str());
					look_at_target_y=std::stof(params[3].c_str());
					look_at_target_z=std::stof(params[4].c_str());
				}
			}
		}
		auto_zoom_out=false;
		return true;
	}
	else if(e.cmd=="ct_offset")
	{
		if(params.size()>=1)
			camera_time_offset=std::stof(params[0].c_str());
		return true;
	}
	else if(e.cmd=="ct_rel_offset")
	{
		if(params.size()>=1)
			camera_time_offset+=std::stof(params[0].c_str());
		return true;
	}
	else if(e.cmd=="stop")
	{
		to_close=true;
		return true;
	}
	else
		return false;
}


void follow_target(float &x,float x_target,double rate)
{
	if(x>x_target)
	{
		float x1=float(double(x)/rate);
		float x2=x+(x_target-x)*(1.0f-1.0f/float(rate));
		if(std::abs(x1-x_target)<std::abs(x1-x_target))
			x=x1;
		else
			x=x2;
		if(x<=x_target)
			x=x_target;
	}
	if(x<x_target)
	{
		float x1=float(double(x)*rate);
		float x2=x+(x_target-x)*(1.0f-1.0f/float(rate));
		if(std::abs(x1-x_target)<std::abs(x1-x_target))
			x=x1;
		else
			x=x2;
		if(x>=x_target)
			x=x_target;
	}
}

void View3D::observe_camera(double t)
{
	count_observe++;
	dt=t-last_t;
	last_t=t;
	if(count_observe>1 && dt==0.0)
		std::cout<<"warning: time has stuck. A038475023"<<std::endl;
	constexpr float zm_min=std::numeric_limits<float>::epsilon()*10.0f;
	constexpr float zm_max=std::numeric_limits<float>::max()/100.0f;
	// camera zooming
	if(camera_radius_target<0.0f)
	{
		camera_radius_target=camera_radius;
	}
	follow_target(camera_radius,camera_radius_target,camera_zoom_rate);
	follow_target(look_at_x,look_at_target_x,camera_zoom_rate); /* use the same rate*/
	follow_target(look_at_y,look_at_target_y,camera_zoom_rate); /* use the same rate*/
	follow_target(look_at_z,look_at_target_z,camera_zoom_rate); /* use the same rate*/
	camera_radius_target=std::max(zm_min,std::min(zm_max,camera_radius_target));
	camera_radius=std::max(zm_min,std::min(zm_max,camera_radius));
}

bool View3D::keyboard_process(int key)
{
	switch (key)
	{
		case 27: // Escape key
			to_close=true;
			return true;
		case '+':
			zoomin();
			return true;
		case '-':
			zoomout();
			return true;
	}
	return false;
}

double View3D::get_dt()
{
	return (count_observe>1?dt:0.001);
}
