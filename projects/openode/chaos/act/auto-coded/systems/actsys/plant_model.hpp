/*****************************************************/
/* Warning: Autogenerated and subjected to change    */
/* Sun May 27 2014 14:57:49 GMT+1000 (AEST)          */
/* Path: ./auto-coded/systems/actsys/plant_model.hpp */
/* Generator mark: G54168791813                      */
/*****************************************************/
#pragma once

#include <auto-coded/systems/actsys/manager.hpp>


void actSys_plant_init_states(double /*t*/,position& /*states0*/);

void actSys_plant_manual_inits(
		actSys_manager& system);

void actSys_plant_manual_finalize(
		actSys_manager& system);

void actSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/);

void actSys_plant_observer(
		bool &/*simulation_continue*/,
		const position &state,
		const double t,
		const double /*observed_t*/,
		position &output);

