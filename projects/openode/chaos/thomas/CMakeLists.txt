####################################################
#  Warning: Autogenerated and subjected to change  #
#  Sat Sep 08 2014 11:58:27 GMT+1000 (AEST)        #
#  Path: ./CMakeLists.txt                          #
#  Generator mark: G5416829841                     #
####################################################

cmake_minimum_required(VERSION 2.8.9)

project(chaos_thomas)

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
set(CMAKE_CXX_FLAGS_DEBUG   "-Og -g3")
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

add_executable(chaos_thomas
	main.cpp
	auto-coded/types/position.cpp
	hand-coded/systems/thomas-sys/plant_model.cpp
	auto-coded/systems/thomas-sys/manager.cpp
	auto-coded/systems/thomas-sys/solver.cpp
	# transferred libraries
	auto-coded/libs/graphics/chaosgraph.cpp
	auto-coded/libs/graphics/capture.cpp
	auto-coded/libs/graphics/video_writer.cpp
	auto-coded/libs/graphics/window.cpp
	auto-coded/libs/graphics/keyboard.cpp
)

# Link
target_link_libraries(chaos_thomas ${Boost_LIBRARIES})
target_link_libraries(chaos_thomas ${CMAKE_THREAD_LIBS_INIT})
target_link_libraries(chaos_thomas avdevice)
target_link_libraries(chaos_thomas avfilter)
target_link_libraries(chaos_thomas avformat)
target_link_libraries(chaos_thomas avcodec)
target_link_libraries(chaos_thomas rt)
target_link_libraries(chaos_thomas dl)
target_link_libraries(chaos_thomas Xfixes)
target_link_libraries(chaos_thomas Xext)
target_link_libraries(chaos_thomas X11)
target_link_libraries(chaos_thomas asound)
target_link_libraries(chaos_thomas z)
target_link_libraries(chaos_thomas swresample)
target_link_libraries(chaos_thomas swscale)
target_link_libraries(chaos_thomas avutil)
target_link_libraries(chaos_thomas m)
target_link_libraries(chaos_thomas lzma)
target_link_libraries(chaos_thomas bz2)
target_link_libraries(chaos_thomas pthread)
target_link_libraries(chaos_thomas ${OPENGL_LIBRARIES})
target_link_libraries(chaos_thomas ${GLUT_LIBRARY})
target_link_libraries(chaos_thomas ${SFML_LIBRARIES} ${SFML_DEPENDENCIES})
target_link_libraries(chaos_thomas ${SDL2_LIBRARIES})
target_link_libraries(chaos_thomas stdc++fs)
