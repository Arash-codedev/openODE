#!/bin/bash
####################################################
#  Warning: Autogenerated and subjected to change  #
#  Sun Apr 15 2014 20:03:52 GMT+1000 (AEST)        #
#  Path: ./debug_build.sh                          #
#  Generator mark: G54168428419                    #
####################################################

cmake -DCMAKE_BUILD_TYPE=Debug -H. -B_built_d && cd _built_d && make && cp ./chaos_arneodo ../
