#include "universegraph.hpp"
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

Universegraph::Universegraph():
	View3D(),
	universe_intialized(false),
	auto_center(false),
	N_trace(0),
	transparency_base(125)
{
	// constructor
}


void Universegraph::init()
{
	View3D::init();
	// glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	// glEnable(GL_BLEND);
 	glutReshapeFunc(universe_reshape);
	// glEnable(GL_ALPHA_TEST);
	// glEnable(GL_BLEND);
	// glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	init_lights();
	universe_intialized=true;
}

/*static*/ void Universegraph::universe_reshape(int x,int y)
{
	if(!x || !y)
		return ;
	View3D::view3d_reshape(x,y);

    glEnable(current_lighting);
    glColorMaterial( GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE );
    glEnable( GL_COLOR_MATERIAL );
}

void Universegraph::append_traces(vector<GraphicStar> &stars)
{
	if(N_trace<=0)
		return ;
	for(auto& star:stars)
	{
		if(star.N_trace_filled>N_trace)
			throw std::runtime_error("Something is wrong. A687654321324");
		if(star.N_trace_filled<0)
			throw std::runtime_error("Something is wrong. A657416543136");
		if(star.N_trace_filled<N_trace)
			star.N_trace_filled++;
		for(int i=star.N_trace_filled-1;(i-1)>=0;i--)
			star.traces[i]=star.traces[i-1];
		if(star.N_trace_filled>=1)
			star.traces[0]=star.position;
	}
}

void Universegraph::universe_display(double t,vector<GraphicStar> &stars)
{
	if(!is_plotter_refresh())
		return ;

	if(!isOpen())
		return ;

	events_handle();

    glMatrixMode(GL_MODELVIEW);//clears the identity matrix
	glLoadIdentity();
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);//clears the buffer drawing
    glMatrixMode(GL_MODELVIEW);
    glClearColor(0.0f,0.0f,0.0f,0.0f );
  
	// double t_cam=t+camera_time_offset;
	// float cam_angle1=float(t_cam*10.0+20.0);
	// float cam_angle2=float(sin((t_cam+20.0)*0.03))*camera_angle2_max_deg;
	if(auto_center)
	{
		double target_x=0.0;
		double target_y=0.0;
		double target_z=0.0;
		float count=0.1f;
		for(const auto& star:stars)
		{
			double r2=star.position.x*star.position.x+star.position.y*star.position.y+star.position.z*star.position.z;
			const double N_out=10.0;
			if(r2<camera_radius*camera_radius*N_out*N_out)
			{
				target_x+=star.position.x;
				target_y+=star.position.y;
				target_z+=star.position.z;
				count+=1.0f;
			}
		}
		target_x/=count;
		target_y/=count;
		target_z/=count;
		float adaptation_rate=0.001f;
		look_at_x=look_at_x*(1.0f-adaptation_rate)+adaptation_rate*float(target_x);
		look_at_y=look_at_y*(1.0f-adaptation_rate)+adaptation_rate*float(target_y);
		look_at_z=look_at_z*(1.0f-adaptation_rate)+adaptation_rate*float(target_z);
	}
	float cam_angle1=45.0;
	float cam_angle2=45.0;
	const float deg2rad=3.1415926f/180.0f;
	float cam_x=look_at_x+camera_radius*float(cos(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_y=look_at_y+camera_radius*float(sin(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_z=look_at_z+camera_radius*float(sin(cam_angle2*deg2rad));
	gluLookAt(cam_x,cam_y,cam_z,  look_at_x, look_at_y, look_at_z, 0, 0, 1);

	// draw
	glDepthMask(GL_FALSE);
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA);
	for(const auto& star:stars)
	{
		// double radius=exp(1.0/3.0*log(star.mass))*0.000375;
		// double vx=star.velocity.x;
		// double vy=star.velocity.y;
		// double vz=star.velocity.z;
		// double v=sqrt(vx*vx+vy*vy+vz*vz+0.0001);
		// double shadow_x=star.position.x-vx/v*star.radius*camera_radius;
		// double shadow_y=star.position.y-vy/v*star.radius*camera_radius;
		// double shadow_z=star.position.z-vz/v*star.radius*camera_radius;

		// const int resolution=5;
		// double radius=star.radius;

		const int N_blur=4;
		for(int k=0;k<N_blur;k++)
		{
			double rate=double(N_blur-k)/double(N_blur);
			// double pos_x=rate*star.position.x+(1-rate)*shadow_x;
			// double pos_y=rate*star.position.y+(1-rate)*shadow_y;
			// double pos_z=rate*star.position.z+(1-rate)*shadow_z;
			double pos_x=star.position.x;
			double pos_y=star.position.y;
			double pos_z=star.position.z;

			double r=star.radius*sqrt(k+1)/sqrt(N_blur+1);
			double alpha=transparency_base;
			// double alpha=125*(double(resolution-i)*double(resolution-i)/double(resolution)/double(resolution));
			glColor4ub(
				(unsigned char)star.r,
				(unsigned char)star.g,
				(unsigned char)star.b,
				(unsigned char)(alpha*rate*rate)
				);
			draw_sphere(
				pos_x,
				pos_y,
				pos_z,
				r
				);
		}
		if(N_trace==1)
		{
			double vx=star.velocity.x;
			double vy=star.velocity.y;
			double vz=star.velocity.z;
			double v=sqrt(vx*vx+vy*vy+vz*vz+0.0001);

			// double radius=star.radius*camera_radius;
			// radius=std::max(radius,0.00001);
			double last_move_x=star.position.x-star.traces[0].x;
			double last_move_y=star.position.y-star.traces[0].y;
			double last_move_z=star.position.z-star.traces[0].z;
			double proposed_r=sqrt(last_move_x*last_move_x+last_move_y*last_move_y+last_move_z*last_move_z);
			// double proposed_r2=last_move_r2;
			// if(proposed_r2>star.radius*star.radius)
			// 	proposed_r2=star.radius*star.radius;
			proposed_r=std::min(proposed_r,star.radius*0.5);
			// proposed_r=std::max(proposed_r,0.000000001);
			// double proposed_r=sqrt(proposed_r2);
			double dx=-vx/v*proposed_r;
			double dy=-vy/v*proposed_r;
			double dz=-vz/v*proposed_r;


			double alpha=85;
			glColor4ub(
				(unsigned char)star.r,
				(unsigned char)star.g,
				(unsigned char)star.b,
				(unsigned char)(alpha)
				);
			draw_sphere(
				star.position.x+dx,
				star.position.y+dy,
				star.position.z+dz,
				star.radius*0.5
				);


			// last_move_r2=std::max(last_move_r2,0.00001);
			// if(proposed_r2>radius*radius)
			// 	proposed_r2=radius*radius;

			// {
			// 	dx*=sqrt(last_move_r2/radius);
			// }
			// 	star.traces[0].x=;


			// star.traces[0]=star.position;
		}
		else if(N_trace>1)
		{
			throw std::runtime_error("Not implemented. A5454635436546");
		}


		// for(int i=0;i<traces.size();i++)
		// {
		// 	double r=radius*i/resolution;
		// 	double alpha=125*(double(resolution-i)*double(resolution-i)/double(resolution)/double(resolution));
		// 	glColor4ub(
		// 		(unsigned char)star.r,
		// 		(unsigned char)star.g,
		// 		(unsigned char)star.b,
		// 		(unsigned char)(alpha*rate*rate)
		// 		);
		// 	draw_sphere(
		// 		pos_x,
		// 		pos_y,
		// 		pos_z,
		// 		r
		// 		);
		// }
	}
	glDisable(GL_BLEND);
	glDepthMask(GL_TRUE);
	
	if(t>0)
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

		std::stringstream ss_t;
	// 	std::stringstream ss_t,ss_x,ss_y,ss_z;
	// 	ss_t.precision(3);
	// 	ss_x.precision(4);
	// 	ss_y.precision(4);
	// 	ss_z.precision(4);
		ss_t.precision(3);
		ss_t<<"t= "<<std::fixed<<t;
	// 	ss_x<<"x= "<<std::showpos<<std::fixed<<(g_points.back().x>0?" ":"")<<g_points.back().x;
	// 	ss_y<<"y= "<<std::showpos<<std::fixed<<(g_points.back().y>0?" ":"")<<g_points.back().y;
	// 	ss_z<<"z= "<<std::showpos<<std::fixed<<(g_points.back().z>0?" ":"")<<g_points.back().z;

	// 	std::vector<std::string> text_items = {
	// 		ss_t.str(),
	// 		ss_x.str(),
	// 		ss_y.str(),
	// 		ss_z.str()};

	int text_y=90;

	glColor3f(1.0,1.0,1.0);
	draw_text2d(ss_t.str(),5.0,text_y);


	// 	for(const std::string &text_item:text_items)
	// 	{
	// 		// glColor3f(0,0,0);
	// 		draw_text2d(text_item,5.0,text_y);
	// 		text_y-=5;
	// 	}
		glPopMatrix();
		glMatrixMode(GL_PROJECTION);
		glPopMatrix();
		glEnable(current_lighting); 
	}

	append_traces(stars);

	Window::refresh(t);
}

void Universegraph::init_lights()
{
	// lighting
	float k=1.0f;
	GLfloat LightAmbient[] = { 0.2f*k, 0.2f*k, 0.2f*k, 1.0f*k };
	GLfloat LightDiffuse[] = { 0.5f*k, 0.5f*k, 0.5f*k, 1.0f*k };
	GLfloat LightPosition[] = { 5.0f*k, 5.0f*k, 0.0f*k, 1.0f*k };

	glShadeModel(GL_SMOOTH); // How the object color will be rendered smooth or flat
	glEnable(GL_DEPTH_TEST); // Check depth when rendering
	glLightfv(current_lighting, GL_AMBIENT, LightAmbient);
	glLightfv(current_lighting, GL_DIFFUSE, LightDiffuse);
	glLightfv(current_lighting, GL_POSITION, LightPosition);
	glEnable(current_lighting); // Turn on light 1
}

void Universegraph::events_handle()
{
	vector<int> keys=keyboard_manager.pop_keys(get_win_id());
	keyboard_process(keys);
}

void Universegraph::keyboard_process(const vector<int> &keys)
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

void Universegraph::process_event(double t,const gEvent &e)
{
	if(!View3D::process_event(t,e))
		cout<<"Warning: unknow event command: "<<e.cmd<<endl;
}

void Universegraph::observe(double t,vector<GraphicStar> &stars)
{
	if(!universe_intialized)
		init();
	View3D::observe_camera(t);

	// double abs_x=std::abs(x)+1.0;
	// double abs_y=std::abs(y)+1.0;
	// double abs_z=std::abs(z)+1.0;
	// double particle_R2=abs_x*abs_x+abs_y*abs_y+abs_z*abs_z;
	// double cam_R=double(camera_radius_target);
	// if(auto_zoom_out && particle_R2>cam_R*cam_R)
	// 	camera_radius_target=float(sqrt(particle_R2));

	////////////////////////
	observe_events(t);
	universe_display(t,stars);
}

void Universegraph::observe_events(double t)
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
