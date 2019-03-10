/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Thu Oct 18 2014 22:29:06 GMT+1100 (AEDT)       */
/* Path: ./auto-coded/types/star.cpp              */
/* Generator mark: G541654196                     */
/**************************************************/
#include <cstdlib>
#include <algorithm>
#include <auto-coded/types/star.hpp>


Star::Star(Star const& value):
		x(value.x),
		y(value.y),
		z(value.z),
		vx(value.vx),
		vy(value.vy),
		vz(value.vz),
		mass(value.mass),
		r(value.r),
		g(value.g),
		b(value.b)
{
	// constructor
}

void Star::reset()
{
	x=0.0;
	y=0.0;
	z=0.0;
	vx=0.0;
	vy=0.0;
	vz=0.0;
	mass=0.0;
	r=0;
	g=0;
	b=0;
}

Star Star::operator= (Star const& value)
{
	this->x=value.x; /* G159567927 */
	this->y=value.y; /* G159567927 */
	this->z=value.z; /* G159567927 */
	this->vx=value.vx; /* G159567927 */
	this->vy=value.vy; /* G159567927 */
	this->vz=value.vz; /* G159567927 */
	this->mass=value.mass; /* G159567927 */
	this->r=value.r; /* G159567927 */
	this->g=value.g; /* G159567927 */
	this->b=value.b; /* G159567927 */
	return {*this};
}

Star Star::operator= (Star&& value)
{
	this->x=value.x; /* G159567927 */
	this->y=value.y; /* G159567927 */
	this->z=value.z; /* G159567927 */
	this->vx=value.vx; /* G159567927 */
	this->vy=value.vy; /* G159567927 */
	this->vz=value.vz; /* G159567927 */
	this->mass=value.mass; /* G159567927 */
	this->r=value.r; /* G159567927 */
	this->g=value.g; /* G159567927 */
	this->b=value.b; /* G159567927 */
	return {*this};
}

Star Star::abs() const
{
	Star result;
	result.x=std::abs(this->x);/* G541654354 */
	result.y=std::abs(this->y);/* G541654354 */
	result.z=std::abs(this->z);/* G541654354 */
	result.vx=std::abs(this->vx);/* G541654354 */
	result.vy=std::abs(this->vy);/* G541654354 */
	result.vz=std::abs(this->vz);/* G541654354 */
	result.mass=this->mass;
	result.r=this->r;
	result.g=this->g;
	result.b=this->b;
	return result;
}

double Star::min() const
{
	double total_min=this->x; /* G564654669 */
	total_min=std::min(total_min,this->y); /* G564654669 */
	total_min=std::min(total_min,this->z); /* G564654669 */
	total_min=std::min(total_min,this->vx); /* G564654669 */
	total_min=std::min(total_min,this->vy); /* G564654669 */
	total_min=std::min(total_min,this->vz); /* G564654669 */
	return total_min;
}

double Star::max() const
{
	double total_max=this->x; /* G564654669 */
	total_max=std::max(total_max,this->y); /* G564654669 */
	total_max=std::max(total_max,this->z); /* G564654669 */
	total_max=std::max(total_max,this->vx); /* G564654669 */
	total_max=std::max(total_max,this->vy); /* G564654669 */
	total_max=std::max(total_max,this->vz); /* G564654669 */
	return total_max;
}

Star Star::operator+= (const Star &right)
{
	this->x+=right.x; /* G156478346 */
	this->y+=right.y; /* G156478346 */
	this->z+=right.z; /* G156478346 */
	this->vx+=right.vx; /* G156478346 */
	this->vy+=right.vy; /* G156478346 */
	this->vz+=right.vz; /* G156478346 */
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return {*this};
}

Star Star::operator+= (const double &value)
{
	this->x+=value; /* G156478346 */
	this->y+=value; /* G156478346 */
	this->z+=value; /* G156478346 */
	this->vx+=value; /* G156478346 */
	this->vy+=value; /* G156478346 */
	this->vz+=value; /* G156478346 */
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return {*this};
}

Star Star::operator-= (const Star &right)
{
	this->x-=right.x; /* G156478346 */
	this->y-=right.y; /* G156478346 */
	this->z-=right.z; /* G156478346 */
	this->vx-=right.vx; /* G156478346 */
	this->vy-=right.vy; /* G156478346 */
	this->vz-=right.vz; /* G156478346 */
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return {*this};
}

Star Star::operator*= (const Star &right)
{
	this->x*=right.x; /* G156478346 */
	this->y*=right.y; /* G156478346 */
	this->z*=right.z; /* G156478346 */
	this->vx*=right.vx; /* G156478346 */
	this->vy*=right.vy; /* G156478346 */
	this->vz*=right.vz; /* G156478346 */
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return {*this};
}

Star Star::operator*= (const double &value)
{
	this->x*=value; /* G156478346 */
	this->y*=value; /* G156478346 */
	this->z*=value; /* G156478346 */
	this->vx*=value; /* G156478346 */
	this->vy*=value; /* G156478346 */
	this->vz*=value; /* G156478346 */
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return {*this};
}

Star Star::operator/= (const Star &right)
{
	this->x/=right.x; /* G156478346 */
	this->y/=right.y; /* G156478346 */
	this->z/=right.z; /* G156478346 */
	this->vx/=right.vx; /* G156478346 */
	this->vy/=right.vy; /* G156478346 */
	this->vz/=right.vz; /* G156478346 */
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return {*this};
}

Star operator+ (const Star &left,const Star &right)
{
	Star result{left};
	result.x+=right.x /* G456789264 */;
	result.y+=right.y /* G456789264 */;
	result.z+=right.z /* G456789264 */;
	result.vx+=right.vx /* G456789264 */;
	result.vy+=right.vy /* G456789264 */;
	result.vz+=right.vz /* G456789264 */;
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return result;
}

Star operator+ (const Star &left,const double &value)
{
	Star result{left};
	result.x+=value /* G456789264 */;
	result.y+=value /* G456789264 */;
	result.z+=value /* G456789264 */;
	result.vx+=value /* G456789264 */;
	result.vy+=value /* G456789264 */;
	result.vz+=value /* G456789264 */;
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return result;
}

Star operator+ (const double &value,const Star &right)
{
	Star result{right};
	result.x+=value /* G456789264 */;
	result.y+=value /* G456789264 */;
	result.z+=value /* G456789264 */;
	result.vx+=value /* G456789264 */;
	result.vy+=value /* G456789264 */;
	result.vz+=value /* G456789264 */;
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return result;
}

Star operator- (const Star &left,const Star &right)
{
	Star result{left};
	result.x-=right.x /* G456789264 */;
	result.y-=right.y /* G456789264 */;
	result.z-=right.z /* G456789264 */;
	result.vx-=right.vx /* G456789264 */;
	result.vy-=right.vy /* G456789264 */;
	result.vz-=right.vz /* G456789264 */;
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return result;
}

Star operator* (const double &value,const Star &right)
{
	Star result{right};
	result.x*=value /* G456789264 */;
	result.y*=value /* G456789264 */;
	result.z*=value /* G456789264 */;
	result.vx*=value /* G456789264 */;
	result.vy*=value /* G456789264 */;
	result.vz*=value /* G456789264 */;
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return result;
}

Star operator* (const Star &left,const Star &right)
{
	Star result{left};
	result.x*=right.x /* G456789264 */;
	result.y*=right.y /* G456789264 */;
	result.z*=right.z /* G456789264 */;
	result.vx*=right.vx /* G456789264 */;
	result.vy*=right.vy /* G456789264 */;
	result.vz*=right.vz /* G456789264 */;
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return result;
}

Star operator/ (const Star &left,const Star &right)
{
	Star result{left};
	result.x/=right.x /* G456789264 */;
	result.y/=right.y /* G456789264 */;
	result.z/=right.z /* G456789264 */;
	result.vx/=right.vx /* G456789264 */;
	result.vy/=right.vy /* G456789264 */;
	result.vz/=right.vz /* G456789264 */;
	/* skipped mass */
	/* skipped r */
	/* skipped g */
	/* skipped b */
	return result;
}

