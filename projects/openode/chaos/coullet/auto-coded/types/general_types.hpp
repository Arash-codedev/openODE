/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Sat Sep 08 2014 15:11:09 GMT+1000 (AEST)       */
/* Path: ./auto-coded/types/general_types.hpp     */
/* Generator mark: G38541642654                   */
/**************************************************/
#pragma once

enum class controlled_step_result
{
	success , // < The trial step was successful, hence the state and the time have been advanced.
	fail	  // < The step was not successful and might possibly be repeated with a small step size.
};
