/******************************************************/
/* Path: ./hand-coded/systems/chensys/plant_model.cpp */
/* Generator mark: G54168791813                       */
/******************************************************/
#include <auto-coded/systems/chensys/plant_model.hpp>
#include <stdexcept>

using std::runtime_error;

void ChenSys_plant_init_states(double /*t*/,position& /*states0*/)
{
	/* additional opportunity to change the initial states */
	/* set the initial states here. */
	/* The current variable is already reset. */
	/* So, you can skip this function. */
}

void ChenSys_plant_manual_inits(
		ChenSys_manager& system)
{
	// initialize the ChenSys plant here.
	(void)system;
}

void ChenSys_plant_manual_finalize(
		ChenSys_manager& system)
{
	// finalize the ChenSys plant here.
	(void)system;
}

void ChenSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/)
{
	// add your plant dynamic here.
	(void)state;
	(void)state_dot;
	throw std::runtime_error("Not implemented. Tag353831213.");
}

void ChenSys_plant_observer(
		bool &/*simulation_continue*/,
		const position &state,
		const double t,
		const double /*observed_t*/,
		position &output)
{
	// add your plant output calculation here.
	(void)state;
	(void)t;
	(void)output;
	throw std::runtime_error("Not implemented. Tag767430889.");
}

