#!/bin/bash
####################################################
#  Warning: Autogenerated and subjected to change  #
#  Sat Sep 08 2014 15:11:09 GMT+1000 (AEST)        #
#  Path: ./release_build.sh                        #
#  Generator mark: G6416149813                     #
####################################################

cmake -DCMAKE_BUILD_TYPE=Release -H. -B_built_r && cd _built_r && make && cp ./chaos_coullet ../
