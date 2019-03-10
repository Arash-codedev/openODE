#pragma once
#include <string>
using std::string;
#include <SFML/Graphics.hpp> // sudo apt-get install libsfml-dev

#define TRUST_SFML 0

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
    operator sf::Color() const { return {(unsigned char)(r*255), (unsigned char)(g*255), (unsigned char)(b*255)}; }
};

struct Point3D
{
	double x,y,z;
	Point3D(double x,double y,double z): x(x),y(y),z(z) {};
};

struct gEvent
{
	double t;
	string cmd;
	string params;
};
