#!/bin/bash
####################################################
#  Warning: Autogenerated and subjected to change  #
#  Sun May 27 2014 14:57:49 GMT+1000 (AEST)        #
#  Path: ./release_build.sh                        #
#  Generator mark: G6416149813                     #
####################################################

cmake -DCMAKE_BUILD_TYPE=Release -H. -B_built_r && cd _built_r && make && cp ./chaos_act ../