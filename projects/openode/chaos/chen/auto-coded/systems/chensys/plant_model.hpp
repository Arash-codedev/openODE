/******************************************************/
/* Warning: Autogenerated and subjected to change     */
/* Sun May 27 2014 17:03:06 GMT+1000 (AEST)           */
/* Path: ./auto-coded/systems/chensys/plant_model.hpp */
/* Generator mark: G54168791813                       */
/******************************************************/
#pragma once

#include <auto-coded/systems/chensys/manager.hpp>


void ChenSys_plant_init_states(double /*t*/,position& /*states0*/);

void ChenSys_plant_manual_inits(
		ChenSys_manager& system);

void ChenSys_plant_manual_finalize(
		ChenSys_manager& system);

void ChenSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/);

void ChenSys_plant_observer(
		bool &/*simulation_continue*/,
		const position &state,
		const double t,
		const double /*observed_t*/,
		position &output);

