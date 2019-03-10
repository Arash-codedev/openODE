#include "keyboard.hpp"

KeyboardManager keyboard_manager;

void KeyboardManager::push_key(int win_id,int key)
{
	Keyboard k;
	k.win_id=win_id;
	k.key=key;
	keys.push_back(k);
}

vector<int> KeyboardManager::pop_keys(int win_id)
{
	vector<int> result;
	// for(auto it=keys.begin();it!=keys.end();/* do nothing */)
	for(int i=0;i<(int)keys.size();i++)
	{
		if(keys[i].win_id==win_id)
		{
			// result.push_back(it->key);
			result.push_back(keys[i].key);
			keys.erase(keys.begin()+i);
			i--;
		}
		// if(it->win_id==win_id)
		// {
		// 	result.push_back(it->key);
		// 	it=keys.erase(it);
		// }
		// else 
		// 	++it;
	}
	return result;
}
