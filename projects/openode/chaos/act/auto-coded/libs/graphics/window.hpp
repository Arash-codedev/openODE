#pragma once
// #define PREFER_SFML 0

#include "video_writer.hpp" 
#include "capture.hpp"
#include <experimental/filesystem>
namespace fs = std::experimental::filesystem;
#include <string>
using std::string;
#include <SDL2/SDL.h> // sudo apt install libsdl2-dev libxmu-dev libxi-dev
#include "graphic_types.hpp"


class Window
{
	bool intialized;
	VideoWriter video_writer;
	int win_id=-1;
	bool plotter_refresh;
	sf::RenderWindow sf_window;

public:
	Capture screenshot;
	Capture video_record;
	std::string title;
	int width, height;
	bool to_close;
	bool full_screen;
	ColorRGB foreground;
	ColorRGB background;

	fs::path screenshot_folder;
	std::string screenshot_prefix;
	std::string video_file_name;
	bool fast_render;

	Window();

	Window(Window&&)=default;

	~Window();

	void init();
	void init_glut();
	void set_screenshot(double t_now,double rate);
	void set_videorecord(double t_now,int rate);
	void set_plotter_refresh(double t_now,bool on_off);
	void screen_shot(const fs::path &filename);
	void refresh(double t);
	bool isOpen();
	int get_win_id();
	// void handle_events();
	void graphic_loop();
	// void set_plotter_refresh(double t,bool on_off);
	bool is_plotter_refresh();

	void clear(ColorRGB bkColor);
	void draw_sphere(double x,double y,double z,double radius,int slices=20,int stacks=20);
	void draw_cylinder(double base,double top,double height,int slices=16,int stacks=8);
	void draw_cone(double base,double height,int slices=16,int stacks=8);
	void draw_text2d(string txt,double x,double y,ColorRGB color,sf::Text::Style style=sf::Text::Style::Regular);
	void draw_text2d(string txt,double x,double y,sf::Text::Style style=sf::Text::Style::Regular);
	void draw_text3d(char ch,double x,double y,double z,ColorRGB color);
	void draw_text3d(char ch,double x,double y,double z);
};

int invert_surface_vertical(SDL_Surface *surface);
void keyboard_glut(unsigned char key, int /*x*/, int /*y*/);
