#pragma once
#include <vector>
#include "easygraph.hpp"

class chaosgraph
{
	static bool intialized;
	static std::vector<GPoint3D> g_points;
	static std::vector<double> times;

	static void init();

	static void chaotic_display();
	static void chaotic_init();
	static void chaotic_reshape(int w, int h);
	static void chaotic_keyboard(unsigned char key, int x, int y);

	static void push_point(double x,double y,double z);
	static double location_to_color_index_ratio(double x,double y,double z);

public:

	static std::string title;
	static double screenshot_rate;
	static int videorecord_rate;
	static float axis_size;
	static float camera_radius;
	static float camera_radius_target;
	static bool auto_zoom_out;
	static float sphere_radius;
	static float line_width;
	static double color_scale;

	static constexpr double pi=3.1415926;
	static double x_sum;
	static double y_sum;
	static double z_sum;
	static double max_r2;
	static double count;

	static std::vector<ColorRGB> palette;
	static std::vector<Point3D> focuses;
	static void observe(double t,double x,double y,double z);

	static void get_avg(double &x_avg,double &y_avg,double &z_avg);
	static double get_avg_max_r2();
	static void colorize(double t,GPoint3D& point);
};
