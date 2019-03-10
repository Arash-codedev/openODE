#include <chrono>
#include <boost/thread/thread.hpp> 
#include <boost/chrono.hpp>

class Easysync
{
	typedef std::chrono::high_resolution_clock::time_point ClockType;
	typedef std::chrono::time_point<std::chrono::high_resolution_clock> nowType;
	// using Clock=std::chrono::high_resolution_clock;
	// typedef std::chrono::high_resolution_clock Clock;
	double step_size;
	std::size_t current_step;
	ClockType sync_start, sync_now;

public:

	static nowType now()
	{
		return std::chrono::high_resolution_clock::now();
	}

	Easysync(double step_size):
		step_size(step_size),
		current_step(0),
		sync_start(Easysync::now()),
		sync_now(Easysync::now())
	{
	}

	void step()
	{
		++current_step;
		// time=start_time+double(current_step)*dt;
		sync_now=now();
		double time_elapsed=double(std::chrono::duration_cast<std::chrono::microseconds>(sync_now-sync_start).count())/1000000.0;
		double remained=step_size*double(current_step)-time_elapsed;
		if(remained>0)
			boost::this_thread::sleep_for(boost::chrono::microseconds(long(remained*1000000)));
	}
};
