/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Sun Aug 12 2014 18:47:20 GMT+1000 (AEST)       */
/* Path: ./auto-coded/types/general_types.hpp     */
/* Generator mark: G38541642654                   */
/**************************************************/
#pragma once

enum class controlled_step_result
{
	success , // < The trial step was successful, hence the state and the time have been advanced.
	fail	  // < The step was not successful and might possibly be repeated with a small step size.
};
