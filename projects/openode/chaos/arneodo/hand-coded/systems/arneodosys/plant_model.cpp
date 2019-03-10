/*********************************************************/
/* Path: ./hand-coded/systems/arneodosys/plant_model.cpp */
/* Generator mark: G54168791813                          */
/*********************************************************/
#include <auto-coded/systems/arneodosys/plant_model.hpp>
#include <stdexcept>
#include <iostream>
#include <auto-coded/libs/graphics/chaosgraph.hpp>

using std::runtime_error;
using std::cout;
using std::endl;

void ArneodoSys_plant_init_states(double /*t*/,position& /*states0*/)
{
	/* additional opportunity to change the initial states */
	/* set the initial states here. */
	/* The current variable is already reset. */
	/* So, you can skip this function. */
}

Chaosgraph chaosgraph;

void ArneodoSys_plant_manual_inits(
		ArneodoSys_manager& system)
{
	// initialize the ArneodoSys plant here.
	(void)system;
	chaosgraph.title="Arneodo system";
	// chaosgraph.screenshot_rate=30.0;
	chaosgraph.videorecord_rate=30;
	chaosgraph.camera_radius=125.0f;
	chaosgraph.sphere_radius=0.1f;
	chaosgraph.axis_size=10.0f;
	chaosgraph.line_width=2.0f;
	chaosgraph.color_scale=100.0;
	chaosgraph.focuses.clear();
	chaosgraph.focuses.push_back({1.3,0.0,0.0});
	// chaosgraph.focuses.push_back({+6.68858,+7.08654,26.6822});

	chaosgraph.events={
		{21.0,"hide",""},
		{199.0,"ct_offset","-180"},
		{199.0,"show",""},
		{226,"hide",""},
		{15000.0,"ct_offset","-14980"},
		{15000.0,"show",""},
		{15020.0,"camera_rt","10.0,5.0"},
	};
}

void ArneodoSys_plant_manual_finalize(
		ArneodoSys_manager& system)
{
	// finalize the ArneodoSys plant here.
	{
		double avg_x,avg_y,avg_z,max_r;
		chaosgraph.get_avg(avg_x,avg_y,avg_z);
		max_r=sqrt(chaosgraph.get_avg_max_r2());
		cout<<"Average point: ("<<avg_x<<","<<avg_y<<","<<avg_z<<")"<<endl;
		cout<<"Max r: "<<max_r<<endl;
	}
	(void)system;
}

void ArneodoSys_plant_rhs(
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

	const double a = 5.5;
	const double b = 3.5;
	const double c = 0.01;

	x_dot=y;
	y_dot=z;
	z_dot=a*x-b*y-z-c*x*x*x;
}

void ArneodoSys_plant_observer(
		bool &simulation_continue,
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
	chaosgraph.observe(t,x,y,z);
	if(!chaosgraph.isOpen())
		simulation_continue=false;
}
