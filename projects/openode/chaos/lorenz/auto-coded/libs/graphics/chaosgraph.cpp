#include "chaosgraph.hpp"

#include <GL/glut.h>
#include <GL/freeglut.h>
#include <cstdlib>
#include <cmath>
#include <sstream>
#include <SDL2/SDL.h>

bool chaosgraph::intialized=false;
std::vector<GPoint3D> chaosgraph::g_points;
std::vector<double> chaosgraph::times;
std::string chaosgraph::title;
double chaosgraph::screenshot_rate=0.0;
int chaosgraph::videorecord_rate=0;
float chaosgraph::axis_size=20.0;
float chaosgraph::camera_radius=2.0f;
float chaosgraph::line_width=4.0f;
float chaosgraph::sphere_radius=0.1f;
float chaosgraph::camera_radius_target=-1.0f;
bool  chaosgraph::auto_zoom_out=true;
// int chaosgraph::palette_size=17;
double chaosgraph::color_scale=1.0;
std::vector<Point3D> chaosgraph::focuses{{0.0,0.0,0.0}};
std::vector<ColorRGB> chaosgraph::palette {
	{0.0,0.0,0.0},
	{0.2,0.2,0.1},
	{0.1,0.0,0.1},
	{0.0,0.0,0.2},
	{0.0,0.0,0.3},
	{0.0,0.0,0.4},
	{0.0,0.2,0.5},
	{0.1,0.3,0.7},
	{0.2,0.5,0.8},
	{0.5,0.7,0.9},
	{0.8,0.9,1.0},
	{0.9,0.9,0.7},
	{1.0,0.8,0.4},
	{1.0,0.7,0.0},
	{0.8,0.5,0.0},
	{0.6,0.3,0.0},
	{0.4,0.2,0.0}
};
double chaosgraph::x_sum=0.0;
double chaosgraph::y_sum=0.0;
double chaosgraph::z_sum=0.0;
double chaosgraph::max_r2=0.0;
double chaosgraph::count=0;


void chaosgraph::init()
{
	g_points.clear();
	g_points.reserve(100000);
	times.clear();
	times.reserve(100000);
	easygraph::windows.emplace_back(
		chaosgraph::chaotic_init,
		chaosgraph::chaotic_display,
		chaosgraph::chaotic_reshape,
		chaosgraph::chaotic_keyboard);
	Window &w=easygraph::windows.back();
	w.title=title;
	if(screenshot_rate>0.0)
		w.set_screenshot(screenshot_rate);
	if(videorecord_rate>0.0)
		w.set_videorecord(videorecord_rate);
	// easygraph::windows.push_back(w);
	easygraph::init();

	intialized=true;
}

void chaosgraph::chaotic_display()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glClearColor(1.0f, 1.0f, 1.0f, 1.0f);

	const float ratio = (float) glutGet(GLUT_SCREEN_WIDTH) / (float) glutGet(GLUT_SCREEN_HEIGHT);
	double t=0.0;
	if(times.size()>0)
		t=times.back();
	float cam_angle1=float(t*10.0+20.0);
	float cam_angle2=float(sin((t+20.0)*0.03)*50.0);

	const float deg2rad=3.1415926f/180.0f;
	float cam_x=chaosgraph::camera_radius*float(cos(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_y=chaosgraph::camera_radius*float(sin(cam_angle1*deg2rad))*float(cos(cam_angle2*deg2rad));
	float cam_z=chaosgraph::camera_radius*float(sin(cam_angle2*deg2rad));

	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective (90, ratio, 0.01, 10000);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	gluLookAt (cam_x, cam_y, cam_z,  0, 0, 0, 0, 0, 1);

	/* Draw axes */
	const float cone_size=axis_size*0.2f;
	/* axis lines*/
	// glLoadIdentity();

	glColor4ub(0, 0, 0, 255);
	glLineWidth(chaosgraph::line_width);
	glBegin(GL_LINE_STRIP);
	glVertex3f(0.0f, 0.0f, 0.0f);
	glVertex3f(axis_size, 0.0f, 0.0f);
	glBegin(GL_LINE_STRIP);
	glVertex3f(0.0f, 0.0f, 0.0f);
	glVertex3f(0.0f, axis_size, 0.0f);
	glEnd();
	glBegin(GL_LINE_STRIP);
	glVertex3f(0.0f, 0.0f, 0.0f);
	glVertex3f(0.0f, 0.0f, axis_size);
	glEnd();
	/* axis cones */
	// x
	// glMatrixMode(GL_MODELVIEW);
	// glLoadIdentity();
	glPushMatrix();
	glTranslatef(axis_size,0,0);
	glRotatef(90,0,1,0);
	glutSolidCone(0.25*cone_size,cone_size,16,8);
	glPopMatrix();
	// y
	// glMatrixMode(GL_MODELVIEW);
	// glLoadIdentity();
	glPushMatrix();
	glTranslatef(0,axis_size,0);
	glRotatef(-90,1,0,0);
	glutSolidCone(0.25*cone_size,cone_size,16,8);
	glPopMatrix();
	// z
	// glMatrixMode(GL_MODELVIEW);
	// glLoadIdentity();
	glPushMatrix();
	glTranslatef(0,0,axis_size);
	glRotatef(0,1,0,0);
	glutSolidCone(0.25*cone_size,cone_size,16,8);
	glPopMatrix();
	/* axis labels*/
	glColor4ub(0, 0, 0, 255);
	glRasterPos3f(1.1f, 0.0f, 0.0f);

	// glMatrixMode(GL_MODELVIEW);
	// glLoadIdentity();
	float axis_label_distance=axis_size+cone_size*1.7f;
	glPushMatrix();
	glRasterPos3f(axis_label_distance, 0.0f, 0.0f);
	glutBitmapCharacter(GLUT_BITMAP_HELVETICA_18, 'x');
	glRasterPos3f(0.0f, axis_label_distance, 0.0f);
	glutBitmapCharacter(GLUT_BITMAP_HELVETICA_18, 'y');
	glRasterPos3f(0.0f, 0.0f, axis_label_distance);
	glutBitmapCharacter(GLUT_BITMAP_HELVETICA_18, 'z');
	glPopMatrix();

	// draw
	if(g_points.size()>0)
	{
		glPushMatrix();
		glColor3ub(255,255,255);
		glEnableClientState( GL_VERTEX_ARRAY );
		glEnableClientState( GL_COLOR_ARRAY );
		glVertexPointer(3, GL_DOUBLE, sizeof(GPoint3D), &g_points[0].x );
		glColorPointer( 4, GL_UNSIGNED_BYTE, sizeof(GPoint3D), &g_points[0].r );
		glPointSize( 3.0 );
		glLineWidth(chaosgraph::line_width);
		glDrawArrays( GL_LINE_STRIP, 0, int(g_points.size()) );
		glDisableClientState( GL_VERTEX_ARRAY );
		glDisableClientState( GL_COLOR_ARRAY );
		glLineWidth(2.0f);
		glPopMatrix();

		/* sphere */
		glPushMatrix();
		glColor3ub(255,0,0);
		glTranslated(
			g_points.back().x,
			g_points.back().y,
			g_points.back().z);
		glutSolidSphere(sphere_radius,20,20);
		glPopMatrix();
		
	}

	if(times.size()>0)
	{
		/* string */
		glColor3f(0,0,0);	
		glMatrixMode( GL_PROJECTION );
		glLoadIdentity();
		glMatrixMode( GL_MODELVIEW );
		glLoadIdentity();
		gluOrtho2D( 0, 100, 0, 100 );

		std::stringstream ss_t,ss_x,ss_y,ss_z;
		ss_t.precision(3);
		ss_x.precision(4);
		ss_y.precision(4);
		ss_z.precision(4);
		ss_t<<"t= "<<std::fixed<<times.back();
		ss_x<<"x= "<<std::fixed<<(g_points.back().x>0?" ":"")<<g_points.back().x;
		ss_y<<"y= "<<std::fixed<<(g_points.back().y>0?" ":"")<<g_points.back().y;
		ss_z<<"z= "<<std::fixed<<(g_points.back().z>0?" ":"")<<g_points.back().z;

		std::vector<std::string> text_items = {
			ss_t.str(),
			ss_x.str(),
			ss_y.str(),
			ss_z.str()};

		int height=90;

		for(const std::string &text_item:text_items)
		{
			glRasterPos2i(5,height);  // move in 10 pixels from the left and bottom edges
			glutBitmapString(GLUT_BITMAP_HELVETICA_18, (const unsigned char*)text_item.c_str());
			// GLUT_BITMAP_TIMES_ROMAN_24
			// GLUT_BITMAP_HELVETICA_24
			// GLUT_BITMAP_9_BY_15
			height-=5;
		}
	}

	glFlush();
	glutSwapBuffers();
}

void chaosgraph::chaotic_init()
{
	// lighting
	GLfloat LightAmbient[] = { 0.2f, 0.2f, 0.2f, 1.0f };
	GLfloat LightDiffuse[] = { 0.5f, 0.5f, 0.5f, 1.0f };
	GLfloat LightPosition[] = { 5.0f, 5.0f, -10.0f, 1.0f };
	// GLfloat mat_specular[] = { 0.2f, 0.2f, 0.2f, 1.0f };

	glClearColor(0.0, 0.0, 0.0, 0.0); // When screen cleared, use black.
	glShadeModel(GL_SMOOTH); // How the object color will be rendered smooth or flat
	glEnable(GL_DEPTH_TEST); // Check depth when rendering
	// Lighting is added to scene
	glLightfv(GL_LIGHT1, GL_AMBIENT, LightAmbient);
	glLightfv(GL_LIGHT1, GL_DIFFUSE, LightDiffuse);
	glLightfv(GL_LIGHT1, GL_POSITION, LightPosition);
	// glEnable(GL_LIGHTING); // Turn on lighting
	glEnable(GL_LIGHT1); // Turn on light 1
}

void chaosgraph::chaotic_reshape(int w, int h)
{
	glViewport(0, 0, (GLsizei)w, (GLsizei)h);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
}

void chaosgraph::chaotic_keyboard(unsigned char key, int /*x*/, int /*y*/)
{
	switch (key)
	{
		case 27: // Escape key
			exit(0);
			break;
		case '+':
			camera_radius_target/=2.0f;
			auto_zoom_out=false;
			break;
		case '-':
			camera_radius_target*=2.0f;
			auto_zoom_out=false;
			break;
	}
	glutPostRedisplay();
}

void chaosgraph::observe(double t,double x,double y,double z)
{
	if(!intialized)
		init();

	// camera zooming
	if(camera_radius_target<0.0f)
	{
		camera_radius_target=camera_radius;
		std::cout<<"Camera radius set to: "<<camera_radius_target<<std::endl;
	}
	if(camera_radius>camera_radius_target)
	{
		camera_radius/=1.05f;
		if(camera_radius<=camera_radius_target)
			camera_radius=camera_radius_target;
	}
	if(camera_radius<camera_radius_target)
	{
		camera_radius*=1.05f;
		if(camera_radius>=camera_radius_target)
			camera_radius=camera_radius_target;
	}
	double abs_x=std::abs(x)+1.0;
	double abs_y=std::abs(y)+1.0;
	double abs_z=std::abs(z)+1.0;
	double particle_R2=abs_x*abs_x+abs_y*abs_y+abs_z*abs_z;
	double cam_R=double(camera_radius_target);
	if(auto_zoom_out && particle_R2>cam_R*cam_R)
	{
		camera_radius_target=float(sqrt(particle_R2));
		std::cout<<"Camera radius set to: "<<camera_radius_target<<std::endl;
	}

	// adding new point
	GPoint3D g_point;
	g_point.r=0;
	g_point.g=0;
	g_point.b=255;
	g_point.x=x;
	g_point.y=y;
	g_point.z=z;
	colorize(t,g_point);
	g_points.push_back(g_point);
	times.push_back(t);
	easygraph::refresh(t);
}

void chaosgraph::push_point(double x,double y,double z)
{
	x_sum+=x;
	y_sum+=y;
	z_sum+=z;
	count+=1.0;
}

void chaosgraph::get_avg(double &x_avg,double &y_avg,double &z_avg)
{
	x_avg=x_sum/count;
	y_avg=y_sum/count;
	z_avg=z_sum/count;
}

double chaosgraph::location_to_color_index_ratio(double x,double y,double z)
{
	double invers_sum=0.0;
	for(const Point3D &p:focuses)
	{
		double rr2=(x-p.x)*(x-p.x)+(y-p.y)*(y-p.y)+(z-p.z)*(z-p.z);
		if(rr2<=0)
			rr2=1e-6;
		invers_sum+=1/rr2;
	}
	double rr2=double(focuses.size())/invers_sum;
	max_r2=std::max(max_r2,rr2);
	double r=sqrt(rr2);
	return r;
}

double chaosgraph::get_avg_max_r2()
{
	return max_r2;
}

unsigned char processed(double c)
{
	c+=0.2*(rand()%100-50);
	if(c<0.0)
		c=0.0;
	if(c>255.0)
		c=255.0;
	return (unsigned char)c;
}

void chaosgraph::colorize(double /*t*/,GPoint3D& point)
{
	push_point(point.x,point.y,point.z);
	int palette_size=int(palette.size());
	double idx=location_to_color_index_ratio(point.x,point.y,point.z)*double(palette_size)/color_scale;
	int idx1=((int)floor(idx))%palette_size;
	int idx2=(idx1+1)%palette_size;
	double idx_rem=idx-floor(idx);

	double r=0.05*(rand()%100)+((1.0-idx_rem)*palette[idx1].r+idx_rem*palette[idx2].r)*255.0;
	double g=0.05*(rand()%100)+((1.0-idx_rem)*palette[idx1].g+idx_rem*palette[idx2].g)*255.0;
	double b=0.05*(rand()%100)+((1.0-idx_rem)*palette[idx1].b+idx_rem*palette[idx2].b)*255.0;
	point.r=processed(r);
	point.g=processed(g);
	point.b=processed(b);
	point.a=255;
}