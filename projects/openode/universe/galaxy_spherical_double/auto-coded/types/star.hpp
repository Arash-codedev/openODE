/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Fri Oct 19 2014 10:28:43 GMT+1100 (AEDT)       */
/* Path: ./auto-coded/types/star.hpp              */
/* Generator mark: G541654196                     */
/**************************************************/
#pragma once

struct Star
{
	double x;
	double y;
	double z;
	double vx;
	double vy;
	double vz;
	double mass;
	unsigned char r;
	unsigned char g;
	unsigned char b;

	Star()=default;
	Star(Star const& value);
	void reset();
	Star operator= (Star const& value);
	Star operator= (Star&& value);
	Star abs() const;
	double min() const;
	double max() const;
	Star operator+= (const Star &right);
	Star operator+= (const double &value);
	Star operator-= (const Star &right);
	Star operator*= (const Star &right);
	Star operator*= (const double &value);
	Star operator/= (const Star &right);
}; // struct Star

Star operator+ (const Star &left,const Star &right);
Star operator+ (const Star &left,const double &value);
Star operator+ (const double &value,const Star &right);
Star operator- (const Star &left,const Star &right);
Star operator* (const double &value,const Star &right);
Star operator* (const Star &left,const Star &right);
Star operator/ (const Star &left,const Star &right);
