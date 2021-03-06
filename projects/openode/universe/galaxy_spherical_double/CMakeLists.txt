####################################################
#  Warning: Autogenerated and subjected to change  #
#  Fri Oct 19 2014 10:28:43 GMT+1100 (AEDT)        #
#  Path: ./CMakeLists.txt                          #
#  Generator mark: G5416829841                     #
####################################################

cmake_minimum_required(VERSION 2.8.9)

project(galaxy_spherical_double)

find_package(Threads)

include_directories(.)

# Detect operating system
if(${CMAKE_SYSTEM_NAME} STREQUAL "Linux")
    add_definitions(-DSYSTEM_LINUX)
endif()
if(${CMAKE_SYSTEM_NAME} MATCHES "FreeBSD")
    add_definitions(-DSYSTEM_FREEBSD)
endif()
if(${CMAKE_SYSTEM_NAME} MATCHES "Windows")
    add_definitions(-DSYSTEM_WINDOWS)
endif()

# settings
set(Boost_USE_STATIC_LIBS OFF)
set(Boost_USE_MULTITHREADED ON)
set(Boost_USE_STATIC_RUNTIME OFF)
set(BOOST_VERSION "1.65.0")
set(CMAKE_MODULE_PATH "/usr/share/SFML/cmake/Modules" ${CMAKE_MODULE_PATH})
# Libraries
find_package(Boost ${BOOST_VERSION} COMPONENTS filesystem regex system thread date_time wave)
find_package(OpenGL)
find_package(GLUT)
find_package(SFML 2.3 REQUIRED graphics window system)
find_package(SDL2)


# Flags
set(CMAKE_CXX_FLAGS         "${CMAKE_CXX_FLAGS} -std=c++17 -Wall -Wconversion -Wfatal-errors -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG   "-Og -g3 -fsanitize=address")
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")

include_directories(SYSTEM ${Boost_INCLUDE_DIR})
include_directories(${Boost_INCLUDE_DIRS})
include_directories(${OPENGL_INCLUDE_DIRS})
include_directories(${GLUT_INCLUDE_DIRS})
include_directories(${SFML_INCLUDE_DIR})
include_directories(${SDL2_INCLUDE_DIRS})

if(NOT Boost_FOUND)
	message(FATAL_ERROR "Boost ${BOOST_VERSION} not found." )
endif()

add_executable(galaxy_spherical_double
	main.cpp
	auto-coded/types/star.cpp
	auto-coded/types/galaxy.cpp
	hand-coded/systems/galaxysys/plant_model.cpp
	auto-coded/systems/galaxysys/manager.cpp
	auto-coded/systems/galaxysys/solver.cpp
	# transferred libraries
	auto-coded/libs/graphics/universegraph.cpp
	auto-coded/libs/graphics/view3d.cpp
	auto-coded/libs/graphics/capture.cpp
	auto-coded/libs/graphics/video_writer.cpp
	auto-coded/libs/graphics/window.cpp
	auto-coded/libs/graphics/keyboard.cpp
)

# Link
target_link_libraries(galaxy_spherical_double ${Boost_LIBRARIES})
target_link_libraries(galaxy_spherical_double ${CMAKE_THREAD_LIBS_INIT})
target_link_libraries(galaxy_spherical_double avdevice)
target_link_libraries(galaxy_spherical_double avfilter)
target_link_libraries(galaxy_spherical_double avformat)
target_link_libraries(galaxy_spherical_double avcodec)
target_link_libraries(galaxy_spherical_double rt)
target_link_libraries(galaxy_spherical_double dl)
target_link_libraries(galaxy_spherical_double Xfixes)
target_link_libraries(galaxy_spherical_double Xext)
target_link_libraries(galaxy_spherical_double X11)
target_link_libraries(galaxy_spherical_double asound)
target_link_libraries(galaxy_spherical_double z)
target_link_libraries(galaxy_spherical_double swresample)
target_link_libraries(galaxy_spherical_double swscale)
target_link_libraries(galaxy_spherical_double avutil)
target_link_libraries(galaxy_spherical_double m)
target_link_libraries(galaxy_spherical_double lzma)
target_link_libraries(galaxy_spherical_double bz2)
target_link_libraries(galaxy_spherical_double pthread)
target_link_libraries(galaxy_spherical_double ${OPENGL_LIBRARIES})
target_link_libraries(galaxy_spherical_double ${GLUT_LIBRARY})
target_link_libraries(galaxy_spherical_double ${SFML_LIBRARIES} ${SFML_DEPENDENCIES})
target_link_libraries(galaxy_spherical_double ${SDL2_LIBRARIES})
target_link_libraries(galaxy_spherical_double stdc++fs)
