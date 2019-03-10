#pragma once
#include "window.hpp"
#include "view3d.hpp"

class Chaosgraph: public View3D
{
	bool chaos_intialized;
	vector<GPoint3D> g_points;
	vector<double> times;

	void chaotic_display();
	void keyboard_process(const vector<int> &keys);
	void events_handle();
	void push_point(double x,double y,double z);
	double location_to_color_index_ratio(double x,double y,double z);
	void init_lights();
public:
	float axis_size;
	float camera_angle2_max_deg;
	float sphere_radius;
	float line_width;
	double color_scale;
	double x_sum;
	double y_sum;
	double z_sum;
	double max_r2;
	double count;
	vector<ColorRGB> palette;
	vector<Point3D> focuses;

	Chaosgraph();
	void init();
	static void chaos_reshape(int x,int y);
	void observe(double t,double x,double y,double z);
	void get_avg(double &x_avg,double &y_avg,double &z_avg);
	double get_avg_max_r2();
	void colorize(double t,GPoint3D& point);
	void process_event(double t,const gEvent &e);
	void observe_events(double t);
};
