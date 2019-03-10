#pragma once
#include "window.hpp"
#include "view3d.hpp"

constexpr inline int N_race_max()
{
	return 10;
}

struct StarPosition
{
	double x,y,z;

	StarPosition(double x,double y,double z):
		x(x),y(y),z(z)
	{
	}

	StarPosition(){}
};

struct GraphicStar
{
	StarPosition position,velocity;
	double mass, radius;
	unsigned char r,g,b;
	StarPosition traces[N_race_max()];
	bool tracked;
	int N_trace_filled;

	GraphicStar(){}

	GraphicStar(
		double x,double y,double z,
		double vx,double vy,double vz,
		double mass,double radius,
		unsigned char r,unsigned char g,unsigned char b,bool tracked)
	:
		position(x,y,z),
		velocity(vx,vy,vz),
		mass(mass),radius(radius),
		r(r),g(g),b(b),tracked(tracked),N_trace_filled(0)
	{
	}
};

class Universegraph: public View3D
{
	bool universe_intialized;
	void append_traces(vector<GraphicStar> &stars);
	void universe_display(double t,vector<GraphicStar> &stars);
	void keyboard_process(const vector<int> &keys);
	void events_handle();
	void push_point(double x,double y,double z);
	double location_to_color_index_ratio(double x,double y,double z);
	void init_lights();
	// vector<vector<GraphicStar>> traces;

public:
	bool auto_center;
	int N_trace;
	int transparency_base;

	Universegraph();
	void init();
	static void universe_reshape(int x,int y);
	void observe(double t,vector<GraphicStar> &stars);
	void process_event(double t,const gEvent &e);
	void observe_events(double t);
};
