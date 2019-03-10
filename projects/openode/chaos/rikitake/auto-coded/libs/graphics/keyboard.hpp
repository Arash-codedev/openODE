#pragma once
#include <vector>
using std::vector;

struct Keyboard
{
	int win_id;
	int key;
};

struct KeyboardManager
{
	// KeyboardManager();
	vector<Keyboard> keys;
	void push_key(int win_id,int key);
	vector<int> pop_keys(int win_id);
};

extern KeyboardManager keyboard_manager;
