/****************************************************/
/* Warning: Autogenerated and subjected to change   */
/* Wed Mar 21 2014 10:49:03 GMT+1100 (AEDT)         */
/* Path: ./auto-coded/systems/lorenzsys/manager.hpp */
/* Generator mark: G7692348073                      */
/****************************************************/
#pragma once

#include <cstddef>
#include <auto-coded/types/position.hpp>

using std::size_t;

class LorenzSys_manager
{
public:
	// fields
	double observed_t;
	position plant_output;

	// methods
	LorenzSys_manager();

	size_t integrate();

	void plant_rhs(
		const position &state,
		position &state_dot,
		const double t);

	void plant_observer(
		const position &state,
		const double t,
		const double dt);

};

