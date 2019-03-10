#pragma once
#include "window.hpp"
#include <vector>
using std::vector;

class View3D: public Window
{
protected:
	bool keyboard_process(int key);

public:
	void set_zoom_rate(double magnification,double duration);
	void zoomin();
	void zoomout();

	double camera_zoom_rate;
	float look_at_target_x;
	float look_at_target_y;
	float look_at_target_z;
	long count_observe;
	double last_t;
	double dt;

public:
	View3D();
	vector<gEvent> events;
	double screenshot_rate;
	int videorecord_rate;
	float look_at_x;
	float look_at_y;
	float look_at_z;
	bool auto_zoom_out;
	float camera_radius;
	float camera_radius_target;
	float camera_time_offset;
	
	static double fovy;
	static void view3d_reshape(int x,int y);
	void init();
	vector<string> event_args(const string& line);
	bool process_event(double t,const gEvent &e);
	void observe_camera(double t);
	double get_dt();
};
