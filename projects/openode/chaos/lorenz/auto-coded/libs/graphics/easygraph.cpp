// #pragma once
#include "easygraph.hpp"

#include <GL/glut.h>
#include <GL/freeglut.h>
#include <cstdlib>
#include <cmath>
#include <SDL2/SDL.h>
#include <boost/thread/thread.hpp>
#include <functional>


Window::Window(
			void (*init)(),
			void (*display)(),
			void (*reshape)(int,int),
			void (*keyboard) (unsigned char key, int x, int y)
		):
	video_writer(),
	init(init), display(display), reshape(reshape), keyboard(keyboard),
	title("untitled"), width(1280), height(720),
	screenshot_folder("screenshots"), screenshot_prefix("img-")
{
}

void Window::set_screenshot(double rate)
{
	record_screenshots=true;
	screenshot_rate=rate;
	record_screenshot_started=false;
}

void Window::set_videorecord(int rate)
{
	record_video=true;
	videorecord_rate=rate;
	record_videorecord_started=false;
	
	video_writer.filename="video"+std::to_string(id)+".mp4";
	video_writer.fps=rate;
	video_writer.width=width;
	video_writer.height=height;
	video_writer.init();
}

Window::~Window()
{
	if(record_videorecord_started)
		video_writer.finalize();
}

bool easygraph::intialized=false;
bool easygraph::to_close_window=false;
bool easygraph::to_reopen_window=true;
std::vector<Window> easygraph::windows;

void easygraph::save_screenshot_frame(Window &win)
{
	fs::create_directory(win.screenshot_folder);
	std::string number=std::to_string(win.screen_shot_frame_index++);
	std::string zeros=std::string(5-number.length(),'0');
	fs::path candidate_file;
	candidate_file=win.screenshot_folder/(win.screenshot_prefix+zeros+number+".bmp");
	screen_shot(win.id,candidate_file);
}

void easygraph::record_video_frame(Window &win)
{
	win.video_writer.capture_frame();
}

void easygraph::timer_event(int value)
{
	if(!intialized)
		throw std::runtime_error("Not initialized. A54617496814");

	if(to_reopen_window)
		glutLeaveMainLoop();

	if(!glutGetWindow())
		return ;
	
	for(Window &w:windows)
	{
		glutSetWindow(w.id);
		glutPostRedisplay();
	}
    glutTimerFunc(value, easygraph::timer_event, value);
}

void easygraph::init()
{
	if(intialized)
		return ;

	int argc=1;
	char *argv[1] = {(char*)"something"};
	glutInit(&argc, argv);
	glutSetOption(GLUT_MULTISAMPLE, 8);
	glutInitDisplayMode(GLUT_RGBA | GLUT_DEPTH | GLUT_DOUBLE | GLUT_MULTISAMPLE);

    glutTimerFunc(30,easygraph::timer_event, 1);

	for(Window &w:windows)
	{
		glutInitWindowSize(w.width,w.height);
		glutInitWindowPosition(10, 10);
		w.id = glutCreateWindow(argv[0]);
		glutSetWindowTitle(w.title.c_str());
		glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA);
		glEnable(GL_BLEND);

		if(w.init!=nullptr)
			w.init();
		if(w.display!=nullptr)
			glutDisplayFunc(w.display);
		if(w.reshape!=nullptr)
			glutReshapeFunc(w.reshape);
		if(w.keyboard!=nullptr)
			glutKeyboardFunc(w.keyboard);	

		glutSetOption(GLUT_ACTION_ON_WINDOW_CLOSE,
			GLUT_ACTION_GLUTMAINLOOP_RETURNS);
	}

	glutMainLoopEvent();
	intialized=true;
}

void easygraph::screen_shot(int win_id,const fs::path &filename)
{
	glutSetWindow(win_id);

	int width = glutGet(GLUT_WINDOW_WIDTH);
	int height = glutGet(GLUT_WINDOW_HEIGHT);

	SDL_Surface * image = SDL_CreateRGBSurface(SDL_SWSURFACE, width, height, 24, 0x000000FF, 0x0000FF00, 0x00FF0000, 0);

	glReadBuffer(GL_FRONT);
	glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, image->pixels);

	invert_surface_vertical(image);
	SDL_SaveBMP(image, filename.c_str());
	SDL_FreeSurface(image);
}

void easygraph::refresh(double t)
{
	if(to_close_window)
	{
		to_close_window=false;
		while(glutGetWindow())
			glutDestroyWindow(glutGetWindow());
		glutMainLoopEvent();
		glutMainLoopEvent(); 
	}
	if(to_reopen_window)
	{
		// ????????????????????????????
		// if(!glutGetWindow())
		// {
		// 	glutMainLoop();
		// 	init();
		// }
		// to_reopen_window=false;
	}

	for(Window &w:windows)
	{
		glutSetWindow(w.id);
		glutPostRedisplay();
	}
	glutMainLoopEvent();
	for(Window &w:windows)
	{
		glutSetWindow(w.id);
		if(w.record_screenshots)
		{
			if(!w.record_screenshot_started || t-w.last_screenshot_time>1.0/w.screenshot_rate)
			{
				w.last_screenshot_time+=1.0/w.screenshot_rate;
				easygraph::save_screenshot_frame(w);
				if(!w.record_screenshot_started)
				{
					w.record_screenshot_started=true;
					w.last_screenshot_time=t;
				}
			}
		}
		if(w.record_video)
		{
			if(!w.record_videorecord_started || t-w.last_videorecord_time>1.0/w.videorecord_rate)
			{
				w.last_videorecord_time+=1.0/w.videorecord_rate;
				easygraph::record_video_frame(w);
				if(!w.record_videorecord_started)
				{
					w.record_videorecord_started=true;
					w.last_videorecord_time=t;
				}
			}
		}
	}
	// boost::this_thread::sleep(boost::posix_time::milliseconds(10));
}



#define SDL_LOCKIFMUST(s) (SDL_MUSTLOCK(s) ? SDL_LockSurface(s) : 0)
#define SDL_UNLOCKIFMUST(s) { if(SDL_MUSTLOCK(s)) SDL_UnlockSurface(s); }
// http://stackoverflow.com/questions/41443911/
int easygraph::invert_surface_vertical(SDL_Surface *surface)
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


