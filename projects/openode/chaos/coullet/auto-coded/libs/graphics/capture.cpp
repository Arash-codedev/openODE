#include "capture.hpp"
#include <iostream>
using std::cout;

Capture::Capture(double rate):
	rate(rate),
	plotter_refresh_mode(true),
	capture_activated(false),
	last_observed_time(0.0),
	not_captured_time(0.0),
	frame_index(0)
{
}

void Capture::set_rate(double t,double rate)
{
	if(!plotter_refresh_mode)
		std::cout<<"Warning: set capture rate in hidden mode. A2161849621"<<std::endl;
	set_plotter_refresh(t,true);
	set_activation(t,true);
	this->rate=rate;
}

void Capture::set_plotter_refresh(double t,bool on_off)
{
	if(!plotter_refresh_mode && on_off)
	{
		last_observed_time=t;
		not_captured_time=0.0;
	}
	plotter_refresh_mode=on_off;
}

void Capture::set_activation(double t,bool on_off)
{
	if(!capture_activated && on_off)
	{
		last_observed_time=t;
		not_captured_time=0.0;
	}
	capture_activated=on_off;
}

bool Capture::is_activated()
{
	return capture_activated;
}

void Capture::observe(double t)
{
	if(!capture_activated)
		return ;
	if(!plotter_refresh_mode)
	{
		// last_observed_time=t;
		// not_captured_time=0.0;
		return ;
	}
	double dt=t-last_observed_time;
	last_observed_time=t;
	not_captured_time+=dt;
}

bool Capture::is_capture_time()
{
	if(!capture_activated)
		return false;
	if(!plotter_refresh_mode)
		return false;
	if(not_captured_time<0.0)
		return false;
	return true;
}

void Capture::captured()
{
	if(!plotter_refresh_mode)
		std::cout<<"Warning: captured in hidden mode. A54164165212"<<std::endl;
	not_captured_time-=1.0/rate;
}

int Capture::step_frame_index()
{
	return frame_index++;
}

