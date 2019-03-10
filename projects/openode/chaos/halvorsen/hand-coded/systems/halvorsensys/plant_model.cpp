/***********************************************************/
/* Path: ./hand-coded/systems/HalvorsenSys/plant_model.cpp */
/* Generator mark: G54168791813                            */
/***********************************************************/
#include <auto-coded/systems/halvorsensys/plant_model.hpp>
#include <stdexcept>
#include <iostream>
#include <auto-coded/libs/graphics/chaosgraph.hpp>

using std::runtime_error;
using std::cout;
using std::endl;

void HalvorsenSys_plant_init_states(double /*t*/,position& /*states0*/)
{
	/* additional opportunity to change the initial states */
	/* set the initial states here. */
	/* The current variable is already reset. */
	/* So, you can skip this function. */
}

Chaosgraph chaosgraph;

void HalvorsenSys_plant_manual_inits(
		HalvorsenSys_manager& system)
{
	bool test_mode=true;

	// initialize the HalvorsenSys plant here.
	(void)system;
	chaosgraph.title="Halvorsen system";
	// chaosgraph.screenshot_rate=30.0;
	chaosgraph.videorecord_rate=30.0;
	float camera_r0=20.0f;
	chaosgraph.camera_radius=camera_r0;
	chaosgraph.sphere_radius=0.012f*camera_r0;
	chaosgraph.axis_size=3.0f;
	chaosgraph.line_width=2.0f;
	chaosgraph.color_scale=14.0;
	chaosgraph.focuses.clear();
	chaosgraph.focuses.push_back({0.0,0.0,0.0});
	// chaosgraph.focuses.push_back({+0.4,-1.0,0.0});
	chaosgraph.fovy=80.0;
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
	double audio_stage1=36.0; // first transition
	double audio_stage2=56.0; // second transition
	double audio_stage3=67.0; // zoom in
	double audio_length=83.0; // length of audio

	double hide1=audio_stage1-intro+2.0;
	double show2=(test_mode?100.0:200.0);
	double hide3=audio_stage2-audio_stage1+show2+1.0;
	double show4=(test_mode?200.0:4000.0);
	double zmin5=audio_stage3-audio_stage2+show4;
	double stop6=audio_length-final-audio_stage3+zmin5;

	std::stringstream ssco1,ssco2,sscr;
	ssco1<<(hide1-1.0-show2); // -181
	ssco2<<(hide3-1.0-show4); // -3780
	sscr<<(camera_r0*0.1f);

	chaosgraph.events={
		{hide1,"hide",""},
		{hide1,"ct_rel_offset",ssco1.str()},
		{show2,"show",""},
		{hide3,"hide",""},
		{show4,"ct_rel_offset",ssco2.str()},
		{show4,"show",""},
		{zmin5,"camera_rt",sscr.str()+",5.0"},
		{stop6,"stop",""},
	};
}

void HalvorsenSys_plant_manual_finalize(
		HalvorsenSys_manager& system)
{
	// finalize the HalvorsenSys plant here.
	{
		double avg_x,avg_y,avg_z,max_r;
		chaosgraph.get_avg(avg_x,avg_y,avg_z);
		max_r=sqrt(chaosgraph.get_avg_max_r2());
		cout<<"Average point: ("<<avg_x<<","<<avg_y<<","<<avg_z<<")"<<endl;
		cout<<"Max r: "<<max_r<<endl;
	}
	(void)system;
}

void HalvorsenSys_plant_rhs(
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

	const double a = 1.4;

	// x_dot=-a*(x-3.0)-4.0*(y-3.0)-4.0*(z-3.0)-(y-3.0)*(y-3.0);
	// y_dot=-a*(y-3.0)-4.0*(z-3.0)-4.0*(x-3.0)-(z-3.0)*(z-3.0);
	// z_dot=-a*(z-3.0)-4.0*(x-3.0)-4.0*(y-3.0)-(x-3.0)*(x-3.0);

	x_dot=-a*x+2.0*y-4.0*z-y*y+(3.0*a+15.0);
	y_dot=-a*y+2.0*z-4.0*x-z*z+(3.0*a+15.0);
	z_dot=-a*z+2.0*x-4.0*y-x*x+(3.0*a+15.0);

	// x_dot=-a*x-4.0*y-4.0*z-y*y;
	// y_dot=-a*y-4.0*z-4.0*x-z*z;
	// z_dot=-a*z-4.0*x-4.0*y-x*x;

}

void HalvorsenSys_plant_observer(
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
