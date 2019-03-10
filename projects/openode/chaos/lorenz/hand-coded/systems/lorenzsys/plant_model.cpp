/********************************************************/
/* Path: ./hand-coded/systems/lorenzsys/plant_model.cpp */
/* Generator mark: G54168791813                         */
/********************************************************/
#include <auto-coded/systems/lorenzsys/plant_model.hpp>
#include <stdexcept>
#include <iostream>
#include <auto-coded/libs/graphics/chaosgraph.hpp>

using std::runtime_error;
using std::cout;
using std::endl;

void LorenzSys_plant_init_states(double /*t*/,position& /*states0*/)
{
	/* additional opportunity to change the initial states */
	/* set the initial states here. */
	/* The current variable is already reset. */
	/* So, you can skip this function. */
}

void LorenzSys_plant_manual_inits(
		LorenzSys_manager& system)
{
	// initialize the LorenzSys plant here.
	(void)system;
	chaosgraph::title="Lorenz system";
	// chaosgraph::screenshot_rate=30.0;
	chaosgraph::videorecord_rate=30.0;
	chaosgraph::camera_radius=100.0f;
	chaosgraph::sphere_radius=0.1f;
	chaosgraph::axis_size=10.0f;
	chaosgraph::line_width=2.0f;
	chaosgraph::color_scale=25.0;
	chaosgraph::focuses.clear();
	chaosgraph::focuses.push_back({-6.68858,-7.08654,26.6822});
	chaosgraph::focuses.push_back({+6.68858,+7.08654,26.6822});
}

void LorenzSys_plant_manual_finalize(
		LorenzSys_manager& system)
{
	// finalize the LorenzSys plant here.
	{
		double avg_x,avg_y,avg_z,max_r;
		chaosgraph::get_avg(avg_x,avg_y,avg_z);
		max_r=sqrt(chaosgraph::get_avg_max_r2());
		cout<<"Average point: ("<<avg_x<<","<<avg_y<<","<<avg_z<<")"<<endl;
		cout<<"Max r: "<<max_r<<endl;
	}
	(void)system;
}

void LorenzSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/)
{
	const double &x=state.x;
	const double &y=state.y;
	const double &z=state.z;
	double &x_dot=state_dot.x;
	double &y_dot=state_dot.y;
	double &z_dot=state_dot.z;

	const double sigma = 10.0;
	const double R = 28.0;
	const double b = 8.0 / 3.0;

	x_dot=sigma*(y-x);
	y_dot=R*x-y-x*z;
	z_dot=-b*z+x*y;
}

void LorenzSys_plant_observer(
		const position &state,
		const double t,
		const double /*observed_t*/,
		position &output)
{
	const double &x=state.x;
	const double &y=state.y;
	const double &z=state.z;
	output.x=x;
	output.y=y;
	output.z=z;
	using namespace std;
	// cout<<x<<"\t"<<y<<"\t"<<z<<endl;
	chaosgraph::observe(t,x,y,z);
}
