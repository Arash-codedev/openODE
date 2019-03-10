#include "filesystem.hpp"

#include <fstream>
#include <sstream>
#include <stdexcept> 

using std::runtime_error;

// NS_FILESYSTEM_BEGIN

vector<string> folder_list(const fs::path &folder_path)
{
	vector<string> flist;
	fs::directory_iterator end_iter;
	if(fs::exists(folder_path)&&fs::is_directory(folder_path))
		for(fs::directory_iterator dir_iter(folder_path);dir_iter!=end_iter;++dir_iter)
			if(fs::is_directory(dir_iter->status()))
				flist.push_back(dir_iter->path().filename().string());
	return flist;
}

vector<string> file_list(const fs::path &folder_path)
{
	vector<string> flist;
	fs::directory_iterator end_iter;
	if(fs::exists(folder_path)&&fs::is_directory(folder_path))
		for(fs::directory_iterator dir_iter(folder_path);dir_iter!=end_iter;++dir_iter)
			if(!fs::is_directory(dir_iter->status()))
				flist.push_back(dir_iter->path().filename().string());
	return flist;
}

// void ensure_folder(const fs::path &filepath)
// {
// 	if(!fs::exists(filepath))
// 		fs::create_directories(filepath);
// }

// bool exists(const fs::path &filepath)
// {
// 	return fs::exists(filepath);
// }

string read_file(const fs::path &filepath)
{
	if(!fs::exists(filepath))
		throw runtime_error(string("file \"")+filepath.string()+"\" does not exist!");
	string data;
	ifstream in(filepath.string().c_str());
	getline(in, data, string::traits_type::to_char_type(
					  string::traits_type::eof()));
	return data;
}

void write_file(const fs::path &filepath, const string &text)
{
	ofstream out(filepath.string().c_str());
	out << text;
	out.close();
}

void copy_file(const fs::path &from,const fs::path &to)
{
	ifstream stream_from(from.string(), ios::binary);
	ofstream stream_to(to.string(), ios::binary);
	stream_to << stream_from.rdbuf();
}

void copy_folder(const fs::path &from,const fs::path &to,const bool is_merged/*=true*/)
{
	if(!fs::exists(from))
		throw runtime_error(string("Folder ")+from.string()+" does not exist.");
	if(!fs::is_directory(from) )
		throw runtime_error(string("")+from.string()+" is not a folder.");
	if(!is_merged && fs::exists(to))
		throw runtime_error(string("")+to.string()+" already does exist.");
	if(!fs::exists(to) && !fs::create_directory(to))
		throw runtime_error(string("Cannot create ")+to.string()+" .");

	for(fs::directory_iterator file_it(from);file_it != fs::directory_iterator(); ++file_it)
		if(fs::is_directory(file_it->path()))
			copy_folder(file_it->path(),to/file_it->path().filename(),is_merged);
		else
		{
			// there is a bug in fs 
			// causing this error: undefined reference to `fs::detail::copy_file ...
			// fs::copy_file(file_it->path(),to/file_it->path().filename());

			copy_file(file_it->path(),to/file_it->path().filename());
		}

}

// NS_FILESYSTEM_END

