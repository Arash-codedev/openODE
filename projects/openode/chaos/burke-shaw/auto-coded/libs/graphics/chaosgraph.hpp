#pragma once
#include <vector>
using std::vector;
#include "window.hpp"

class Chaosgraph: public Window
{
	bool chaos_intialized;
	vector<GPoint3D> g_points;
	vector<double> times;
	double dt;
	double camera_zoom_rate;

	void chaotic_display();
	// void chaotic_init();
	// void chaotic_reshape(int w, int h);
	void zoomin();
	void zoomout();
	// void chaotic_keyboard_sfml(sf::Keyboard::Key key);
	// void chaotic_keyboard_glut(unsigned char key, int /*x*/, int /*y*/);
	void keyboard_process(const vector<int> &keys);
	void events_handle();
	void push_point(double x,double y,double z);
	double location_to_color_index_ratio(double x,double y,double z);
	void set_zoom_rate(double magnification,double duration);
	void init_lights();
public:

	vector<gEvent> events;
	double screenshot_rate;
	int videorecord_rate;
	float axis_size;
	float camera_time_offset;
	float camera_angle2_max_deg;
	float camera_radius;
	float camera_radius_target;
	float sphere_radius;
	float line_width;
	bool auto_zoom_out;
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
	void observe(double t,double x,double y,double z);
	void get_avg(double &x_avg,double &y_avg,double &z_avg);
	double get_avg_max_r2();
	void colorize(double t,GPoint3D& point);
	void process_event(double t,gEvent e);
	vector<string> event_args(const string& line);
};


