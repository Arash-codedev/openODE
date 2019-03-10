#pragma once
#include "video_writer.hpp"
#include <SDL2/SDL.h>
#include <string>
#include <functional>
#include <experimental/filesystem>
namespace fs = std::experimental::filesystem;

struct GPoint2D
{
	double x, y;
	unsigned char r, g, b, a=255;
};

struct GPoint3D
{
	double x, y, z;
	unsigned char r, g, b, a=255;
};

struct ColorRGB
{
	double r,g,b;
	ColorRGB(double r,double g,double b): r(r),g(g),b(b) {};
};

struct Point3D
{
	double x,y,z;
	Point3D(double x,double y,double z): x(x),y(y),z(z) {};
};

class Window
{
	int id=0;
	double last_screenshot_time=0.0;
	bool record_screenshots=false;
	bool record_screenshot_started=false;
	double screenshot_rate=30.0;
	int screen_shot_frame_index=0;

	double last_videorecord_time=0.0;
	bool record_video=false;
	bool record_videorecord_started=false;
	int videorecord_rate=29.0;

	VideoWriter video_writer;
	friend class easygraph;

public:
	void (*init)();
	void (*display)();
	void (*reshape)(int,int);
	void (*keyboard) (unsigned char key, int x, int y);

	std::string title;
	int width, height;
	fs::path screenshot_folder;
	std::string screenshot_prefix;

	Window(
			void (*init)(),
			void (*display)(),
			void (*reshape)(int,int),
			void (*keyboard) (unsigned char key, int x, int y)
			);

    Window(Window&&)=default;
    
	~Window();

	void set_screenshot(double rate);
	void set_videorecord(int rate);

};

class easygraph
{
	// int width, height;
	static bool intialized;

public:

	static bool to_close_window;
	static bool to_reopen_window;
	static std::vector<Window> windows;

	// methods
	static void init();
	static void refresh(double t);
	static void save_screenshot_frame(Window &win);
	static void record_video_frame(Window &win);
	static void timer_event(int value);
	static void screen_shot(int win_id,const fs::path &filename);
	static int invert_surface_vertical(SDL_Surface *surface);
};
