#pragma once

class Capture
{
	double rate;
	bool plotter_refresh_mode;
	bool capture_activated;
	double last_observed_time;
	double not_captured_time;
	int frame_index;
	// friend class Window;
	// friend class easygraph;
public:
	Capture(double rate);
	void set_plotter_refresh(double t,bool on_off);
	void set_activation(double t,bool on_off);
	bool is_activated();
	void observe(double t);
	void set_rate(double t,double rate);
	bool is_capture_time();
	void captured();
	int step_frame_index();
};