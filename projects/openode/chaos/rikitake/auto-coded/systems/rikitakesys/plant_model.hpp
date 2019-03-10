/**********************************************************/
/* Warning: Autogenerated and subjected to change         */
/* Sun Aug 12 2014 18:47:20 GMT+1000 (AEST)               */
/* Path: ./auto-coded/systems/rikitakesys/plant_model.hpp */
/* Generator mark: G54168791813                           */
/**********************************************************/
#pragma once

#include <auto-coded/systems/rikitakesys/manager.hpp>


void RikitakeSys_plant_init_states(double /*t*/,position& /*states0*/);

void RikitakeSys_plant_manual_inits(
		RikitakeSys_manager& system);

void RikitakeSys_plant_manual_finalize(
		RikitakeSys_manager& system);

void RikitakeSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/);

void RikitakeSys_plant_observer(
		bool &/*simulation_continue*/,
		const position &state,
		const double t,
		const double /*observed_t*/,
		position &output);

