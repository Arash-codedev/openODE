/**************************************************/
/* Warning: Autogenerated and subjected to change */
/* Thu Oct 18 2014 22:29:06 GMT+1100 (AEDT)       */
/* Path: ./auto-coded/types/general_types.hpp     */
/* Generator mark: G38541642654                   */
/**************************************************/
#pragma once

enum class controlled_step_result
{
	success , // < The trial step was successful, hence the state and the time have been advanced.
	fail	  // < The step was not successful and might possibly be repeated with a small step size.
};
