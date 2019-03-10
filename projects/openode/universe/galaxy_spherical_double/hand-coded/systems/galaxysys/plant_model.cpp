/********************************************************/
/* Path: ./hand-coded/systems/galaxysys/plant_model.cpp */
/* Generator mark: G54168791813                         */
/********************************************************/
#include <auto-coded/systems/galaxysys/plant_model.hpp>
#include <auto-coded/libs/graphics/universegraph.hpp>
#include <stdexcept>
#include <iostream>
#include <thread>
#include <random>
#include <array>
#include <cassert>
#include <algorithm>
#include <fstream>

using std::runtime_error;
using std::cout;
using std::endl;
using std::vector;
using std::array;
using std::stringstream;

constexpr double G=0.0001*10;
constexpr int N_stars=10000;

std::mt19937_64 rng; // random generator
std::uniform_real_distribution<double> unif_dist(0.0,1.0);

void rand_seed()
{
	std::random_device device;
	auto seed = (static_cast<uint64_t>(device()) << 32) | device();
	rng.seed(seed);
}

double rand01()
{
	return unif_dist(rng);
}

double star_radius(double mass)
{
	return exp(1.0/3.0*log(mass))*0.025;
}

void random_color(unsigned char &r,unsigned char &g,unsigned char &b)
{
	const int N_palette=7;
	const unsigned char palette[N_palette][3] {
		{0xAF,0xC9,0xFF},
		{0xC7,0xD8,0xFF},
		{0xFF,0xF4,0xF3},
		{0xFF,0xE5,0xCF},
		{0xFF,0xD9,0xB2},
		{0xFF,0xC7,0x8E},
		{0xFF,0xA6,0x51}		
	};
	double x=rand01()*7.0;
	int before=(int)x;
	int after=before+1;
	if(before<0)
	{
		r=palette[0][0];
		g=palette[0][1];
		b=palette[0][2];
	}
	else if(after>N_palette-1)
	{
		r=palette[N_palette-1][0];
		g=palette[N_palette-1][1];
		b=palette[N_palette-1][2];
	}
	else
	{
		/* before>=0 and after<N_palette; */
		double remain=x-before;
		r=(unsigned char)(palette[before][0]*remain+palette[after][0]*(1.0-remain));
		g=(unsigned char)(palette[before][1]*remain+palette[after][1]*(1.0-remain));
		b=(unsigned char)(palette[before][2]*remain+palette[after][2]*(1.0-remain));
	}
}

template<class T>
void set_container_size(vector<T> &data,int N)
{
	if((int)data.size()!=N)
		data.assign(N,T());
}

template<class T,int N>
void set_container_size(array<T,N> &data,int _N)
{
	assert((int)std::size(data)>=_N);
	(void)_N;
	(void)data;
}

template<class T,int N>
void set_container_size(T (&data)[N],int _N)
{
	assert(N>=_N);
	(void)_N;
	(void)data;
}

template<class STARLIST>
void load_external_stars(STARLIST &stars,int &index,int N,string filename,const Star &offset)
{
	assert((int)std::size(stars)>=index+N);
	std::ifstream myfile;
	myfile.open(filename);
	for(int i=0;i<N;i++)
	{
		Star star;
		myfile
			>>star.x>>star.y>>star.z
			>>star.vx>>star.vy>>star.vz
			>>star.mass
			>>star.r>>star.g>>star.b;
		stars[index++]=(star+offset);
	}
	myfile.close();
}

void GalaxySys_plant_init_states(double /*t*/,Galaxy& states0)
{
	// rand_seed();
	set_container_size(states0.stars,N_stars);

	int index=0;
	Star offset;
	offset.reset();
	offset.x=-2.0;
	offset.y=-40.0;
	offset.vx=2.0;
	load_external_stars(states0.stars,index,N_stars/2,"galaxy_a.txt",offset);
	offset.x*=-1.0;
	offset.y*=-1.0;
	offset.vx*=-1.0;
	load_external_stars(states0.stars,index,(N_stars+1)/2,"galaxy_b.txt",offset);
}

Universegraph universegraph;

void GalaxySys_plant_manual_inits(
		GalaxySys_manager& system)
{
	// initialize the GalaxySys plant here.
	bool test_mode=false;
	if(!test_mode)
	{
		universegraph.width=1920;
		universegraph.height=1080;
		universegraph.full_screen=true;
	}
	else
	{
		universegraph.width=640;
		universegraph.height=480;
	}
	(void)system;
	universegraph.title="Universe system";
	// // universegraph.screenshot_rate=30.0;
	universegraph.videorecord_rate=30;
	const float camera_r0=250.0f;
	universegraph.camera_radius=camera_r0;
	universegraph.transparency_base=16;
	universegraph.cam_angle2_deg=25.0;
	universegraph.auto_center=false;
	std::stringstream sscr;
	sscr<<(camera_r0*0.2f)<<",8.0";
	universegraph.events={
		{3*60,"camera_rt",sscr.str()+",0.0,0.0,0.0"},
	};
}

void GalaxySys_plant_manual_finalize(
		GalaxySys_manager& system)
{
	// finalize the GalaxySys plant here.
	(void)system;
}

void interact(
		const Galaxy &state,
		Galaxy &state_dot,
		int begin,
		int end
		)
{
	for(int i=begin;i<end;i++)
		for(int j=0;j<N_stars;j++)
			{
				const double &x1=state.stars[i].x;
				const double &y1=state.stars[i].y;
				const double &z1=state.stars[i].z;
				const double &mass1=state.stars[i].mass;
				const double &x2=state.stars[j].x;
				const double &y2=state.stars[j].y;
				const double &z2=state.stars[j].z;
				const double &mass2=state.stars[j].mass;

				double rx=x1-x2;
				double ry=y1-y2;
				double rz=z1-z2;
				double r=sqrt(rx*rx+ry*ry+rz*rz);

				if(r>1.0e-1)
				{
					double k=G*mass1*mass2/(r*r*r);

					state_dot.stars[i].vx+=k*(-rx)/mass1;
					state_dot.stars[i].vy+=k*(-ry)/mass1;
					state_dot.stars[i].vz+=k*(-rz)/mass1;
				}
			}
}

void GalaxySys_plant_rhs(
		const Galaxy &state,
		Galaxy &state_dot,
		const double /*t*/,
		const double /*observed_t*/)
{
	// add your plant dynamic here.
	state_dot=state;
	for(int i=0;i<N_stars;i++)
	{
		state_dot.stars[i].x=0.0;
		state_dot.stars[i].y=0.0;
		state_dot.stars[i].z=0.0;
		state_dot.stars[i].vx=0.0;
		state_dot.stars[i].vy=0.0;
		state_dot.stars[i].vz=0.0;
	}
	constexpr int N_threads=30;

	std::thread threads[N_threads];
	for(int k=0;k<N_threads;k++)
		threads[k]=std::thread(interact,std::ref(state),std::ref(state_dot),N_stars*k/N_threads,N_stars*(k+1)/N_threads);

	for(int k=0;k<N_threads;k++)
		threads[k].join();

	for(int i=0;i<N_stars;i++)
	{
		state_dot.stars[i].x=state.stars[i].vx;
		state_dot.stars[i].y=state.stars[i].vy;
		state_dot.stars[i].z=state.stars[i].vz;
	}
	for(int i=N_stars;i<(int)std::size(state_dot.stars);i++)
	{
		state_dot.stars[i].x=0.0;
		state_dot.stars[i].y=0.0;
		state_dot.stars[i].z=0.0;
		state_dot.stars[i].vx=0.0;
		state_dot.stars[i].vy=0.0;
		state_dot.stars[i].vz=0.0;
	}
}

void GalaxySys_plant_observer(
		bool &simulation_continue,
		const Galaxy &state,
		const double t,
		const double /*observed_t*/,
		Galaxy &output)
{
	// add your plant output calculation here.
	(void)output;
	static Galaxy last_state=state;
	if(t>0.0)
	{
		Galaxy diff_state=(state-last_state).abs();
		double sum_vel_diff2=0.0;
		int count_vel_diff=0;
		for(const auto &star:diff_state.stars)
		{
			sum_vel_diff2+=(star.vx*star.vx+star.vy*star.vy+star.vz*star.vz);
			count_vel_diff++;
		}
		double avg_vel_diff=(sum_vel_diff2)/double(count_vel_diff?count_vel_diff:1);
		static vector<GraphicStar> gstars;
		if(gstars.size()==0)
			gstars.reserve(N_stars);
		while(gstars.size()<N_stars)
		{
			const Star &star=state.stars[gstars.size()];
			const Star &star_diff=diff_state.stars[gstars.size()];
			bool tracked=(star_diff.vx*star_diff.vx+star_diff.vy*star_diff.vy+star_diff.vz*star_diff.vz>avg_vel_diff);
			gstars.push_back(GraphicStar(
					star.x, star.y, star.z,
					star.vx, star.vy, star.vz,
					star.mass, star_radius(star.mass),
					star.r, star.g, star.b,
					tracked
				));
		}
		for(int i=0;i<N_stars;i++)
		{
			const Star &star=state.stars[i];
			GraphicStar &g_star=gstars[i];
			g_star.position.x=star.x;
			g_star.position.y=star.y;
			g_star.position.z=star.z;
			g_star.velocity.x=star.vx;
			g_star.velocity.y=star.vy;
			g_star.velocity.z=star.vz;
		}
		universegraph.observe(t,gstars);
	}
	else
	{
		static vector<GraphicStar> gstars_empty;
		universegraph.observe(t,gstars_empty);
		static double last_shown_t=-1.0e10;
		if(t-last_shown_t>1.0)
		{
			cout<<"t: "<<t<<endl;
			last_shown_t=t;
		}
	}
	if(!universegraph.isOpen())
		simulation_continue=false;
}

