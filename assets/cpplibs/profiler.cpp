#include "profiler.hpp"


cronometer::cronometer() : 
		initialized(false),
		_last_toc(-1),
		print_toc_once_called(false),
		tic_once_called(false)
{
	// constructor
}

void cronometer::tic()
{
	initialized=true;
	using Clock = std::chrono::high_resolution_clock;
	time_start=Clock::now();
}

double cronometer::toc()
{
	if(!initialized)
		throw std::runtime_error("cronometer is not initialized!");
	using Clock = std::chrono::high_resolution_clock;
	time_stop=Clock::now();
	double time_diff=double(std::chrono::duration_cast<std::chrono::microseconds>(time_stop-time_start).count())/1000000.0;
	_last_toc=time_diff;
	return time_diff;
}

double cronometer::last_toc()
{
	return _last_toc;
}

void cronometer::tic_once()
{
	if(tic_once_called)
		return ;
	tic_once_called=true;
	tic();
}

void cronometer::print_toc_once(std::string text)
{
	if(print_toc_once_called)
		return ;
	print_toc_once_called=true;
	std::cout<<text<<": "<<toc()<<std::endl;
}

