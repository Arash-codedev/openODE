/******************************************************/
/* Warning: Autogenerated and subjected to change     */
/* Sun May 06 2014 13:32:46 GMT+1000 (AEST)           */
/* Path: ./auto-coded/systems/halvorsensys/solver.hpp */
/* Generator mark: G68514641                          */
/******************************************************/
#pragma once

#include <limits>
#include <auto-coded/types/general_types.hpp>


class HalvorsenSys_solver
{
private:
	HalvorsenSys_manager &usersystem;
	static constexpr double epsilon=std::numeric_limits<double>::epsilon();
	static constexpr double m_eps_abs=1.0e-6;
	static constexpr double m_eps_rel=1.0e-8;
	static constexpr double m_a_x=1.0;
	static constexpr double m_a_dxdt=1.0;
	static constexpr double min_dt=0.0;
	const unsigned short stepper_order_value = 5;
	const unsigned short error_order_value = 4;
	position plant_m_dxdt;
	position plant_m_xerr;
	position plant_m_xnew;
	position plant_m_dxdtnew;
	bool plant_m_first_call;
	position plant_m_x_tmp;
	position plant_m_k2;
	position plant_m_k3;
	position plant_m_k4;
	position plant_m_k5;
	position plant_m_k6;

	bool less_with_sign(double t1,double t2,double dt);

	bool less_eq_with_sign(double t1,double t2,double dt);

	void plant_do_step(
			HalvorsenSys_manager &usersystem,
			position &plant_x,
			double &t,
			double &dt);

	void plant_do_step2(
		HalvorsenSys_manager &usersystem,
		const position &x_in,
		const position &dxdt_in,
		double t,
		position &x_out,
		position &dxdt_out,
		double &dt);

	double plant_error(const position &plant_x_old,const position &plant_dxdt_old,position &plant_x_err,double dt) const;

public:
	HalvorsenSys_solver(HalvorsenSys_manager &usersystem);

	std::size_t integrate(
			position &plant_start_state,
			double start_time,
			double end_time,
			double dt);

};
