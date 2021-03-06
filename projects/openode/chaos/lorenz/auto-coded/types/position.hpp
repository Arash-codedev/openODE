/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Wed Mar 21 2014 10:49:03 GMT+1100 (AEDT)       */
/* Path: ./auto-coded/types/position.hpp          */
/* Generator mark: G541654196                     */
/**************************************************/
#pragma once

struct position
{
	double x;
	double y;
	double z;

	position()=default;
	position(position const& value);
	void reset();
	position operator= (position const& value);
	position operator= (position&& value);
	position abs() const;
	double min() const;
	double max() const;
}; // struct position

position operator+ (const position &left,const position &value);
position operator+ (const position &left,const double &value);
position operator+ (const double &value,const position &right);
position operator- (const position &left,position const& value);
position operator/ (const position &left,position const& value);
position operator* (double const& scale,position const& rhs_val);
