/******************************************************/
/* Warning: Autogenerated and subjected to change     */
/* Sun May 27 2014 15:53:17 GMT+1000 (AEST)           */
/* Path: ./auto-coded/systems/chuasys/plant_model.hpp */
/* Generator mark: G54168791813                       */
/******************************************************/
#pragma once

#include <auto-coded/systems/chuasys/manager.hpp>


void ChuaSys_plant_init_states(double /*t*/,position& /*states0*/);

void ChuaSys_plant_manual_inits(
		ChuaSys_manager& system);

void ChuaSys_plant_manual_finalize(
		ChuaSys_manager& system);

void ChuaSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/);

void ChuaSys_plant_observer(
		bool &/*simulation_continue*/,
		const position &state,
		const double t,
		const double /*observed_t*/,
		position &output);

