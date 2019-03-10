/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Sun May 27 2014 15:53:17 GMT+1000 (AEST)       */
/* Path: ./auto-coded/systems/chuasys/solver.cpp  */
/* Generator mark: G68514641                      */
/**************************************************/
#include <auto-coded/systems/chuasys/manager.hpp>
#include <auto-coded/systems/chuasys/solver.hpp>
#include <auto-coded/systems/chuasys/plant_model.hpp>


bool ChuaSys_solver::less_with_sign(double t1,double t2,double dt)
{
	if(dt>0.0)
		//return t1 < t2;
		return t2-t1 > epsilon;
	else
		//return t1 > t2;
		return t1-t2 > epsilon;
}

bool ChuaSys_solver::less_eq_with_sign(double t1,double t2,double dt)
{
	if(dt>0.0)
		return t1-t2 <= epsilon;
	else
		return t2-t1 <= epsilon;
}

void ChuaSys_solver::plant_do_step(
		ChuaSys_manager &usersystem,
		position &plant_x,
		double &t,
		double &dt)
{
	if(plant_m_first_call)
	{
		// initialize
		usersystem.plant_rhs(plant_x,plant_m_dxdt,t);
		plant_m_first_call=false;
	}
	plant_do_step2(usersystem,plant_x,plant_m_dxdt,t,plant_x,plant_m_dxdt,dt);
}

void ChuaSys_solver::plant_do_step2(
		ChuaSys_manager &usersystem,
		const position &x_in,
		const position &dxdt_in,
		double t,
		position &x_out,
		position &dxdt_out,
		double &dt)
{
	const double a2=double(1)/double(5);
	const double a3=double(3)/double(10);
	const double a4=double(4)/double(5);
	const double a5=double(8)/double(9);

	const double b21=double(1)/double(5);

	const double b31=double(3)/double(40);
	const double b32=double(9)/double(40);

	const double b41=double(44)/double(45);
	const double b42=double(-56)/double(15);
	const double b43=double(32)/double(9);

	const double b51=double(19372)/double(6561);
	const double b52=double(-25360)/double(2187);
	const double b53=double(64448)/double(6561);
	const double b54=double(-212)/double(729);

	const double b61=double(9017)/double(3168);
	const double b62=double(-355)/double(33);
	const double b63=double(46732)/double(5247);
	const double b64=double(49)/double(176);
	const double b65=double(-5103)/double(18656);

	const double c1=double(35)/double(384);
	const double c3=double(500)/double(1113);
	const double c4=double(125)/double(192);
	const double c5=double(-2187)/double(6784);
	const double c6=double(11)/double(84);

	plant_m_x_tmp= x_in+dt*b21*dxdt_in;

	usersystem.plant_rhs(plant_m_x_tmp,plant_m_k2,t+dt*a2);
	plant_m_x_tmp= x_in+dt*b31*dxdt_in+dt*b32*plant_m_k2;

	usersystem.plant_rhs(plant_m_x_tmp,plant_m_k3,t+dt*a3);
	plant_m_x_tmp=x_in+dt*b41*dxdt_in+dt*b42*plant_m_k2+dt*b43*plant_m_k3;

	usersystem.plant_rhs(plant_m_x_tmp, plant_m_k4,t+dt*a4);
	plant_m_x_tmp=x_in+dt*b51*dxdt_in+dt*b52*plant_m_k2+ dt*b53*plant_m_k3+dt*b54*plant_m_k4;

	usersystem.plant_rhs(plant_m_x_tmp,plant_m_k5,t+dt*a5);
	plant_m_x_tmp=x_in+dt*b61*dxdt_in+dt*b62*plant_m_k2+dt*b63*plant_m_k3+dt*b64*plant_m_k4+dt*b65*plant_m_k5 ;

	usersystem.plant_rhs(plant_m_x_tmp,plant_m_k6,t+dt);
	x_out= x_in+dt*c1*dxdt_in+dt*c3*plant_m_k3+dt*c4*plant_m_k4+dt*c5*plant_m_k5+dt*c6*plant_m_k6;

	// the new derivative
	usersystem.plant_rhs(x_out,dxdt_out,t+dt);
}

double ChuaSys_solver::plant_error(const position &plant_x_old,const position &plant_dxdt_old,position &plant_x_err,double dt) const
{
	plant_x_err=plant_x_err.abs()/(m_eps_abs+m_eps_rel*(m_a_x*plant_x_old.abs()+m_a_dxdt*dt*plant_dxdt_old.abs()));
	return plant_x_err.max();
}

ChuaSys_solver::ChuaSys_solver(ChuaSys_manager &usersystem):
		usersystem(usersystem),
		plant_m_first_call(true)
{
	// constructor
}

std::size_t ChuaSys_solver::integrate(
		position &plant_start_state,
		double start_time,
		double end_time,
		double dt)
{
	double time=start_time;
	std::size_t step=0;
	// removed(R65416546) usersystem.plant_observer(plant_start_state,time,dt);
	// cast time+dt explicitely in case of expression templates (e.g. multiprecision)
	while(less_eq_with_sign(time+dt,end_time,dt)&&usersystem.simulation_continue)
	{
		usersystem.plant_observer(plant_start_state,time,dt);
		plant_do_step(usersystem,plant_start_state,time,dt);
		// direct computation of the time avoids error propagation happening when using time += dt
		// we need clumsy type analysis to get boost units working here
		++step;
		time=start_time+double(step)*dt;
	}
	return step;
}

