#pragma once

// bug problem of BOOST: http://stackoverflow.com/questions/15634114/c#17988317
// #define BOOST_NO_CXX11_SCOPED_ENUMS
// #include <boost/filesystem.hpp>
// #undef BOOST_NO_CXX11_SCOPED_ENUMS

#include <string>
#include <vector>
#include <experimental/filesystem>
namespace fs = std::experimental::filesystem;
using std::string;
using std::vector;

// #define NS_FILESYSTEM_BEGIN namespace filesystem{
// #define NS_FILESYSTEM_END }

// typedef fs::path fs_path;

// NS_FILESYSTEM_BEGIN

vector<string> folder_list(const fs::path &folder_path);
vector<string> file_list(const fs::path &folder_path);
// void ensure_folder(const fs::path &filepath);
// bool exists(const fs::path &filepath);
string read_file(const fs::path &filepath);
void write_file(const fs::path &filepath, const string &text);
void copy_file(const fs::path &from,const fs::path &to);
void copy_folder(const fs::path &from,const fs::path &to,const bool is_merged=true);

// NS_FILESYSTEM_END
