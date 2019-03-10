/*****************************************************/
/* Warning: Autogenerated and subjected to change    */
/* Sat Sep 08 2014 11:58:27 GMT+1000 (AEST)          */
/* Path: ./auto-coded/systems/thomas-sys/manager.hpp */
/* Generator mark: G7692348073                       */
/*****************************************************/
#pragma once

#include <cstddef>
#include <auto-coded/types/position.hpp>

using std::size_t;

class ThomasSys_manager
{
public:
	// fields
	bool simulation_continue;
	double observed_t;
	position plant_output;

	// methods
	ThomasSys_manager();

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

