#include "window.hpp"
#include "keyboard.hpp"
// #include <GL/glut.h>
// #include <GL/freeglut.h>
#include <GL/gl.h>
#include <GL/glu.h>
#include <iostream> /*  to be removed */
#include <GL/glut.h>
#include <GL/freeglut.h>
// #include <Shape.hpp>

Window::Window():
	intialized(false),
	video_writer(),
	plotter_refresh(true),
	sf_window(),
	screenshot(29.0),
	video_record(30.0),
	title("untitled"), width(1280), height(720),
	to_close(false),
	full_screen(false),
	foreground({0.0,0.0,0.0}),
	background({1.0,1.0,1.0}),
	screenshot_folder("screenshots"), screenshot_prefix("img-"),
	video_file_name("video.mp4"),
	fast_render(true)
{
}

void empty_function(int,int)
{
	// For passing it to GLUT
}

void empty_function()
{
	// For passing it to GLUT
}

void Window::init_glut()
{
	static bool glut_inited=false;
	if(!glut_inited)
	{
		int argc=1;
		char *argv[1] = {(char*)"something"};
		glutInit(&argc, argv);
		glutSetOption(GLUT_MULTISAMPLE, 8);
		glutInitDisplayMode(GLUT_RGBA | GLUT_DEPTH | GLUT_DOUBLE | GLUT_MULTISAMPLE);
		glutReshapeFunc(empty_function);
		glutDisplayFunc(empty_function);
	}
	glut_inited=true;
}

void Window::init()
{
	if(intialized)
		return ;

	glEnable (GL_DEPTH_TEST);
	init_glut();

	if(TRUST_SFML)
	{
		sf::ContextSettings settings;
		settings.antialiasingLevel = 8;
		sf_window.create(sf::VideoMode(width, height),title, sf::Style::Default, settings);
		sf_window.setPosition(sf::Vector2i(10,10));
		sf_window.clear();
		sf_window.setKeyRepeatEnabled(false);
		win_id=glutGetWindow();
	}
	else
	{
		char *argv[1] = {(char*)"something"};
		glutInitWindowSize(width,height);
		glutInitWindowPosition(10, 10);
		win_id = glutCreateWindow(argv[0]);
		glutSetWindowTitle(title.c_str());
		glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA);
		glEnable(GL_BLEND);
	}
	if(full_screen)
		glutFullScreen();
	glutKeyboardFunc(keyboard_glut);
}

void Window::set_screenshot(double t_now,double rate)
{
	screenshot.set_rate(t_now,rate);
}

void Window::set_videorecord(double t_now,int rate)
{
	video_record.set_rate(t_now,(double)rate);

	video_writer.filename=video_file_name;
	video_writer.fps=rate;
	video_writer.width=width;
	video_writer.height=height;
	video_writer.init();
}

// void Window::set_plotter_refresh(double t_now,bool on_off)
// {
// 	screenshot.set_plotter_refresh(t_now,on_off);
// 	video_record.set_plotter_refresh(t_now,on_off);
// }

void Window::set_plotter_refresh(double t_now,bool on_off)
{
	plotter_refresh=on_off;
	screenshot.set_plotter_refresh(t_now,on_off);
	video_record.set_plotter_refresh(t_now,on_off);
	// set_plotter_refresh(t,on_off);
}

bool Window::is_plotter_refresh()
{
	return plotter_refresh;
}

void Window::refresh(double t)
{
	bool render_graphic=!fast_render;

	if(!screenshot.is_activated() && !video_record.is_activated())
		render_graphic=true; /* render the all graphics if not recorded */
	screenshot.observe(t);
	if(screenshot.is_capture_time())
		render_graphic=true;
	video_record.observe(t);
	if(video_record.is_capture_time())
		render_graphic=true;
	if(render_graphic)
	{
		graphic_loop();
	}
	if(screenshot.is_capture_time())
	{
		{
			fs::create_directory(screenshot_folder);
			std::string number=std::to_string(screenshot.step_frame_index());
			std::string zeros=std::string(5-number.length(),'0');
			fs::path candidate_file;
			candidate_file=screenshot_folder/(screenshot_prefix+zeros+number+".png");
			screen_shot(candidate_file);			
		}
		screenshot.captured();
	}
	if(video_record.is_capture_time())
	{
		if(TRUST_SFML)
		{
			sf::Image image = sf_window.capture();
			video_writer.capture_frame(image);
			video_record.captured();
		}
		else
		{
			SDL_Surface * surface = SDL_CreateRGBSurface(SDL_SWSURFACE, width, height, 24, 0x000000FF, 0x0000FF00, 0x00FF0000, 0);
			glReadBuffer(GL_FRONT);
			glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, surface->pixels);
			video_writer.capture_frame(surface);
			SDL_FreeSurface(surface);
			video_record.captured();
		}
	}
	if(to_close && isOpen())
	{
		if(TRUST_SFML)
			sf_window.close();
		else
			glutDestroyWindow(win_id);
	}
}

bool Window::isOpen()
{
	if(to_close)
		return false;
	if(TRUST_SFML)
		return sf_window.isOpen();
	else
	{
		if(!glutGetWindow())
			return false;
		glutSetWindow(win_id);
		int cw=glutGetWindow();
		return cw&&(win_id==cw);
	}
}

int Window::get_win_id()
{
	return win_id;
}

void Window::screen_shot(const fs::path &filename)
{
	if(TRUST_SFML)
	{
		sf::Image image = sf_window.capture();
		image.saveToFile( filename.c_str() );
	}
	else
	{
		glutSetWindow(win_id);

		// int width = glutGet(GLUT_WINDOW_WIDTH);
		// int height = glutGet(GLUT_WINDOW_HEIGHT);

		SDL_Surface * image = SDL_CreateRGBSurface(SDL_SWSURFACE, width, height, 24, 0x000000FF, 0x0000FF00, 0x00FF0000, 0);

		glReadBuffer(GL_FRONT);
		glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, image->pixels);

		invert_surface_vertical(image);
		SDL_SaveBMP(image, filename.c_str());
		SDL_FreeSurface(image);
	}
}

void Window::graphic_loop()
{
	if(TRUST_SFML)
	{
		if(sf_window.isOpen())
		{
			sf_window.display();
		}
	}
	else
	{
		glFlush();
		glutSwapBuffers();
		glutMainLoopEvent();
	}
}

void Window::draw_cylinder(double base,double top,double height,int slices/*=16*/,int stacks/*=8*/)
{
	GLUquadricObj *quad_obj = gluNewQuadric();
	gluCylinder(quad_obj,base,top,height,slices,stacks);
}

void Window::draw_cone(double base,double height,int slices/*=16*/,int stacks/*=8*/)
{
	draw_cylinder(base,0.0,height,slices,stacks);
}

void Window::draw_text2d(
		string txt,
		double x,double y,
		ColorRGB color,
		sf::Text::Style style/*=sf::Text::Style::Regular*/
	)
{
	if(TRUST_SFML)
	{
		static bool font_loaded=false;
		const std::string font_name="arial.ttf";
		static sf::Font font;
		if(!font_loaded)
		{
			if(!font.loadFromFile(font_name))
				throw std::runtime_error("Unable to load "+font_name);
			font_loaded=true;
		}
		sf::Text text;
		text.setFont(font);
		text.setString(txt);
		// sf::Color sfml_color{color.r,color.g,color.b};
		text.setColor(color);
		text.setPosition((float)x,(float)y);
		text.setStyle(style);
		sf_window.draw(text);
	}
	else
	{
		(void)color;
		(void)style;
		glRasterPos2d(x,y); // from left button
		glutBitmapString(GLUT_BITMAP_HELVETICA_18, (const unsigned char*)txt.c_str());
		// GLUT_BITMAP_TIMES_ROMAN_24
		// GLUT_BITMAP_HELVETICA_24
		// GLUT_BITMAP_9_BY_15
	}
}

void Window::draw_text2d(
		string txt,
		double x,double y,
		sf::Text::Style style/*=sf::Text::Style::Regular*/
	)
{
	draw_text2d(txt,x,y,foreground,style);	
}

void Window::draw_text3d(
	char ch,
	double x,double y,double z,
	ColorRGB color)
{
	(void)color;
	glRasterPos3d(x,y,z);
	glutBitmapCharacter(GLUT_BITMAP_HELVETICA_18, ch);
}

void Window::draw_text3d(
	char ch,
	double x,double y,double z)
{
	// sf::Color fcolor{foreground.r,foreground.g,foreground.b};
	draw_text3d(ch,x,y,z,foreground);
}

void Window::clear(ColorRGB bkColor)
{
	if(TRUST_SFML)
	{
		sf_window.clear(bkColor);
	}
	else
	{
		glClearColor((float)bkColor.r,(float)bkColor.g,(float)bkColor.b, 1.0f );
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	}
}

void Window::draw_sphere(double x,double y,double z,double radius,int slices/*=20*/,int stacks/*=20*/)
{
	glTranslated(x,y,z);
	GLUquadricObj *quad_obj = gluNewQuadric();
	gluSphere(quad_obj,radius,slices,stacks);
}

Window::~Window()
{
	if(video_writer.initialized)
		video_writer.finalize();
}

void keyboard_glut(unsigned char key, int /*x*/, int /*y*/)
{
	keyboard_manager.push_key(glutGetWindow(),(int)key);
}

#define SDL_LOCKIFMUST(s) (SDL_MUSTLOCK(s) ? SDL_LockSurface(s) : 0)
#define SDL_UNLOCKIFMUST(s) { if(SDL_MUSTLOCK(s)) SDL_UnlockSurface(s); }
// http://stackoverflow.com/questions/41443911/
int invert_surface_vertical(SDL_Surface *surface)
{
	Uint8 *t;
	Uint8 *a, *b; // register
	Uint8 *last;
	Uint16 pitch; // register

	if( SDL_LOCKIFMUST(surface) < 0 )
		return -2;

	/* do nothing unless at least two lines */
	if(surface->h < 2) {
		SDL_UNLOCKIFMUST(surface);
		return 0;
	}

	/* get a place to store a line */
	pitch = (Uint16) surface->pitch;
	t = (Uint8*)malloc(pitch);

	if(t == NULL) {
		SDL_UNLOCKIFMUST(surface);
		return -2;
	}

	/* get first line; it's about to be trampled */
	memcpy(t,surface->pixels,pitch);

	/* now, shuffle the rest so it's almost correct */
	a = (Uint8*)surface->pixels;
	last = a + pitch * (surface->h - 1);
	b = last;

	while(a < b) {
		memcpy(a,b,pitch);
		a += pitch;
		memcpy(b,a,pitch);
		b -= pitch;
	}

	/* in this shuffled state, the bottom slice is too far down */
	memmove( b, b+pitch, last-b );

	/* now we can put back that first row--in the last place */
	memcpy(last,t,pitch);

	/* everything is in the right place; close up. */
	free(t);
	SDL_UNLOCKIFMUST(surface);

	return 0;
}
#undef SDL_LOCKIFMUST
#undef SDL_UNLOCKIFMUST
