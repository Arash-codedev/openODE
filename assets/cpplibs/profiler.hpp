#pragma once

#include <ctime>
#include <string>
#include <iostream>
#include <stdexcept>
#include <chrono>
 
class cronometer
{
protected:
	typedef std::chrono::high_resolution_clock::time_point ClockType;
	ClockType time_start, time_stop;
	bool initialized;
	double _last_toc;
	bool print_toc_once_called;
	bool tic_once_called;
public:

	cronometer();
	void tic();
	double toc();
	double last_toc();
	void tic_once();
	void print_toc_once(std::string text);

};