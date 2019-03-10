/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Sat Sep 08 2014 11:53:59 GMT+1000 (AEST)       */
/* Path: ./auto-coded/types/position.cpp          */
/* Generator mark: G541654196                     */
/**************************************************/
#include <cstdlib>
#include <algorithm>
#include <auto-coded/types/position.hpp>


position::position(position const& value):
		x(value.x),
		y(value.y),
		z(value.z)
{
	// constructor
}

void position::reset()
{
	x=1.0;
	y=0.0;
	z=0.0;
}

position position::operator= (position const& value)
{
	this->x=value.x;
	this->y=value.y;
	this->z=value.z;
	return {*this};
}

position position::operator= (position&& value)
{
	this->x=value.x;
	this->y=value.y;
	this->z=value.z;
	return {*this};
}

position position::abs() const
{
	position result;
	result.x=std::abs(this->x);/* G541654354 */
	result.y=std::abs(this->y);/* G541654354 */
	result.z=std::abs(this->z);/* G541654354 */
	return result;
}

double position::min() const
{
	double total_max=this->x;
	total_max=std::min(total_max,this->y);
	total_max=std::min(total_max,this->z);
	return total_max;
}

double position::max() const
{
	double total_max=this->x;
	total_max=std::max(total_max,this->y);
	total_max=std::max(total_max,this->z);
	return total_max;
}

position operator+ (const position &left,const position &value)
{
	position result{left};
	result.x+=value.x;
	result.y+=value.y;
	result.z+=value.z;
	return result;
}

position operator+ (const position &left,const double &value)
{
	position result{left};
	result.x+=value;
	result.y+=value;
	result.z+=value;
	return result;
}

position operator+ (const double &value,const position &right)
{
	position result{right};
	result.x+=value;
	result.y+=value;
	result.z+=value;
	return result;
}

position operator- (const position &left,position const& value)
{
	position result{left};
	result.x-=value.x;
	result.y-=value.y;
	result.z-=value.z;
	return result;
}

position operator/ (const position &left,position const& value)
{
	position result{left};
	result.x/=value.x;
	result.y/=value.y;
	result.z/=value.z;
	return result;
}

position operator* (double const& scale,position const& rhs_val)
{
	position result{rhs_val};
	result.x*=scale;
	result.y*=scale;
	result.z*=scale;
	return result;
}

