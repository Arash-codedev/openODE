/*****************************************************/
/* Warning: Autogenerated and subjected to change    */
/* Sun Apr 15 2014 20:03:52 GMT+1000 (AEST)          */
/* Path: ./auto-coded/systems/arneodosys/manager.hpp */
/* Generator mark: G7692348073                       */
/*****************************************************/
#pragma once

#include <cstddef>
#include <auto-coded/types/position.hpp>

using std::size_t;

class ArneodoSys_manager
{
public:
	// fields
	bool simulation_continue;
	double observed_t;
	position plant_output;

	// methods
	ArneodoSys_manager();

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

