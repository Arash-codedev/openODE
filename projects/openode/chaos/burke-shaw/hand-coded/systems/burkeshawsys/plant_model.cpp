/*********************************************************/
/* Path: ./hand-coded/systems/burkeshawsys/plant_model.cpp */
/* Generator mark: G54168791813                          */
/*********************************************************/
#include <auto-coded/systems/burkeshawsys/plant_model.hpp>
#include <stdexcept>
#include <iostream>
#include <auto-coded/libs/graphics/chaosgraph.hpp>

using std::runtime_error;
using std::cout;
using std::endl;

void BurkeShawSys_plant_init_states(double /*t*/,position& /*states0*/)
{
	/* additional opportunity to change the initial states */
	/* set the initial states here. */
	/* The current variable is already reset. */
	/* So, you can skip this function. */
}

Chaosgraph chaosgraph;

void BurkeShawSys_plant_manual_inits(
		BurkeShawSys_manager& system)
{
	// initialize the BurkeShawSys plant here.
	(void)system;
	chaosgraph.title="Burkeshaw system";
	// chaosgraph.screenshot_rate=30.0;
	chaosgraph.videorecord_rate=30.0;
	float camera_r0=6.36f;
	chaosgraph.camera_radius=camera_r0;
	chaosgraph.sphere_radius=0.1f;
	chaosgraph.axis_size=3.0f;
	chaosgraph.line_width=2.0f;
	chaosgraph.color_scale=4.2;
	chaosgraph.focuses.clear();
	chaosgraph.focuses.push_back({-0.4,+1.0,0.0});
	chaosgraph.focuses.push_back({+0.4,-1.0,0.0});


	double intro=5.0; // introduction
	double final=intro; // introduction
	double audio_stage1=22.0; // first transition
	double audio_stage2=42.0; // second transition
	double audio_stage3=66.0; // zoom in
	double audio_length=83.0; // length of audio

	/*
		*** equations *** 
		len_part1=hide1=stage1-intro+2
		len_part2=hide3-show2+1=stage2-stage1+1
		len_part3=zmin5-show4=stage3-stage2
		len_part4=stop6-zmin5=audio_len-(final-1)-stage3
	*/

	double hide1=audio_stage1-intro+2.0;
	double show2=200.0;
	double hide3=audio_stage2-audio_stage1+show2;
	double show4=4000.0;
	double zmin5=audio_stage3-audio_stage2+show4;
	double stop6=audio_length-(final-1.0)-audio_stage3+zmin5;

	std::stringstream ssco1,ssco2,sscr;
	ssco1<<(hide1-show2); // -181
	ssco2<<(hide3-show4); // -3780
	sscr<<(camera_r0*0.1f);

	chaosgraph.events={
		{hide1+1.0,"hide",""},
		{hide1+1.0,"ct_rel_offset",ssco1.str()},
		{show2    ,"show",""},
		{hide3+1.0,"hide",""},
		{show4    ,"ct_rel_offset",ssco2.str()},
		{show4    ,"show",""},
		{zmin5    ,"camera_rt",sscr.str()+",5.0"},
		{stop6    ,"stop",""},
	};

	// chaosgraph.events={
	// 	{0.0,"hide",""},
	// 	{zmin5    ,"ct_rel_offset",ssco2.str()},
	// 	{zmin5    ,"show",""},
	// 	{zmin5    ,"camera_rt","0.636,5.0"},
	// 	{stop6    ,"stop",""},
	// };
}

void BurkeShawSys_plant_manual_finalize(
		BurkeShawSys_manager& system)
{
	// finalize the BurkeShawSys plant here.
	{
		double avg_x,avg_y,avg_z,max_r;
		chaosgraph.get_avg(avg_x,avg_y,avg_z);
		max_r=sqrt(chaosgraph.get_avg_max_r2());
		cout<<"Average point: ("<<avg_x<<","<<avg_y<<","<<avg_z<<")"<<endl;
		cout<<"Max r: "<<max_r<<endl;
	}
	(void)system;
}

void BurkeShawSys_plant_rhs(
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

	const double a = 7.5;
	const double b = 4.3;
	// const double c = -1;

	x_dot=-a*(x+y);
	y_dot=-y-a*x*z;
	z_dot=a*x*y+b;
}

void BurkeShawSys_plant_observer(
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
