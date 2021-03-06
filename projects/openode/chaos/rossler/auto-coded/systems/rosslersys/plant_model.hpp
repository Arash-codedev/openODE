/*********************************************************/
/* Warning: Autogenerated and subjected to change        */
/* Sat Sep 08 2014 16:42:06 GMT+1000 (AEST)              */
/* Path: ./auto-coded/systems/rosslersys/plant_model.hpp */
/* Generator mark: G54168791813                          */
/*********************************************************/
#pragma once

#include <auto-coded/systems/rosslersys/manager.hpp>


void RosslerSys_plant_init_states(double /*t*/,position& /*states0*/);

void RosslerSys_plant_manual_inits(
		RosslerSys_manager& system);

void RosslerSys_plant_manual_finalize(
		RosslerSys_manager& system);

void RosslerSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/);

void RosslerSys_plant_observer(
		bool &/*simulation_continue*/,
		const position &state,
		const double t,
		const double /*observed_t*/,
		position &output);

