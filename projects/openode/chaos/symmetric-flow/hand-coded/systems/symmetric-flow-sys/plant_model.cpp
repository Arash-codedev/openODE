/***********************************************************/
/* Path: ./hand-coded/systems/SymmetricFlowSys/plant_model.cpp */
/* Generator mark: G54168791813                            */
/***********************************************************/
#include <auto-coded/systems/symmetric-flow-sys/plant_model.hpp>
#include <stdexcept>
#include <iostream>
#include <auto-coded/libs/graphics/chaosgraph.hpp>

using std::runtime_error;
using std::cout;
using std::endl;

void SymmetricFlowSys_plant_init_states(double /*t*/,position& /*states0*/)
{
	/* additional opportunity to change the initial states */
	/* set the initial states here. */
	/* The current variable is already reset. */
	/* So, you can skip this function. */
}

Chaosgraph chaosgraph;

void SymmetricFlowSys_plant_manual_inits(
		SymmetricFlowSys_manager& system)
{
	bool test_mode=false;

	// initialize the SymmetricFlowSys plant here.
	(void)system;
	chaosgraph.title="Symmetric flow system";
	// chaosgraph.screenshot_rate=30.0;
	chaosgraph.videorecord_rate=30.0;
	float camera_r0=20.0f;
	chaosgraph.camera_radius=camera_r0*2;
	chaosgraph.sphere_radius=0.012f*camera_r0;
	chaosgraph.axis_size=3.0f/7.0f*camera_r0;
	chaosgraph.line_width=2.0f;///7.0f*camera_r0;
	chaosgraph.color_scale=15.0;
	chaosgraph.focuses.clear();
	chaosgraph.focuses.push_back({0.0,0.0,0.0});
	chaosgraph.fovy=45.0;
	if(!test_mode)
	{
		chaosgraph.width=1920;
		chaosgraph.height=1080;
		chaosgraph.full_screen=true;
	}
	else
	{
		chaosgraph.width=640;
		chaosgraph.height=480;
	}


	double intro=5.0; // introduction
	double final=intro; // introduction
	double audio_stage1=45.0; // first transition
	double audio_stage2=133.0; // second transition
	double audio_stage3=218.0; // zoom in
	double audio_length=237.0; // length of audio

	double hide1=audio_stage1-intro+2.0;
	double show2=(test_mode?100.0:200.0);
	double hide3=audio_stage2-audio_stage1+show2+1.0;
	double show4=(test_mode?500.0:4000.0);
	double zmin5=audio_stage3-audio_stage2+show4;
	double stop6=audio_length-final-audio_stage3+zmin5;
	std::stringstream ssco1,ssco2,sscr;
	ssco1<<(hide1-1.0-show2); // -181
	ssco2<<(hide3-1.0-show4); // -3780
	sscr<<(camera_r0*0.1f)<<",8.0";

	chaosgraph.events={
		// {0.1,"hide",""},
		{hide1,"hide",""},
		{show2,"ct_rel_offset",ssco1.str()},
		{show2,"show",""},
		{hide3,"hide",""},
		{show4,"ct_rel_offset",ssco2.str()},
		{show4,"show",""},
		{zmin5,"camera_rt",sscr.str()+",0.0,0.0,0.0"},
		{stop6,"stop",""},
		// {zmin5,"show",""},
	};
}

void SymmetricFlowSys_plant_manual_finalize(
		SymmetricFlowSys_manager& system)
{
	// finalize the SymmetricFlowSys plant here.
	{
		double avg_x,avg_y,avg_z,max_r;
		chaosgraph.get_avg(avg_x,avg_y,avg_z);
		max_r=sqrt(chaosgraph.get_avg_max_r2());
		cout<<"Average point: ("<<avg_x<<","<<avg_y<<","<<avg_z<<")"<<endl;
		cout<<"Max r: "<<max_r<<endl;
	}
	(void)system;
}

void SymmetricFlowSys_plant_rhs(
		const position &state,
		position &state_dot,
		const double /*t*/,
		const double /*observed_t*/)
{
	// const double &x=state.x;
	// const double &y=state.y;
	// const double &z=state.z;

	double x=state.x-3.0;
	double y=state.y-3.0;
	double z=state.z-3.0;

	double &x_dot=state_dot.x;
	double &y_dot=state_dot.y;
	double &z_dot=state_dot.z;

	const double a = 1.28;
	// const double a = 1.3;

	x_dot=-a*x-4.0*y-4.0*z-y*y;
	y_dot=-a*y-4.0*z-4.0*x-z*z;
	z_dot=-a*z-4.0*x-4.0*y-x*x;
}

void SymmetricFlowSys_plant_observer(
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
	chaosgraph.observe(t,x,y,z);
	if(!chaosgraph.isOpen())
		simulation_continue=false;
}
