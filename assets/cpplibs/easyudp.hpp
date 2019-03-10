#pragma once

#include <ctime>
#include <iostream>
#include <stdio.h>
#include <string>
#include <boost/array.hpp>
#include <boost/asio.hpp>

struct UDP_options
{
	unsigned short local_port;
	std::string remote_ip;
	int remote_port;

	UDP_options():
		local_port(0),
		remote_ip("????"),
		remote_port(0)
	{
	}
};

template <typename T_send,typename T_receive>
class EasyUDP
{
	typedef boost::asio::io_service IO_Service;
	typedef boost::asio::ip::udp::socket Socket;
	typedef boost::asio::ip::udp::endpoint Endpoint;

protected:
	bool initialized;
	bool remote_endpoint_initialized;
	IO_Service io_service;
	IO_Service io_service_dummy;
	Socket socket;
	Endpoint local_endpoint;
	Endpoint remote_endpoint;

	void should_not_be_initialized(bool item,std::string item_txt)
	{
		if(item)
			throw std::runtime_error(item_txt+" is already initialized.");
	}

	void should_have_been_initialized(bool item,std::string item_txt)
	{
		if(!item)
			throw std::runtime_error(item_txt+" is not initialized.");
	}

	void initialize(int local_port)
	{
		should_not_be_initialized(initialized,"UDP");
		// using boost::asio::ip::udp;
		local_endpoint=Endpoint(
				boost::asio::ip::udp::v4(),
				(ushort) local_port);
		// io_service=IO_Service();
		socket=Socket(io_service,local_endpoint);
		boost::asio::socket_base::reuse_address option(true);
		socket.set_option(option);
		/*********************/
		initialized=true;
	}

public:

	EasyUDP():
		initialized(false),
		remote_endpoint_initialized(false),
		socket(io_service_dummy,Endpoint(boost::asio::ip::udp::v4(),0)) /* fill the socket with a dummy value*/
		// socket(io_service, udp::endpoint(udp::v4(), 0)),
	{
	}

	void initialize(
		// int local_port,
		// std::string remote_ip,
		// int remote_port
		UDP_options options)
	{
		initialize(options.local_port);
		should_not_be_initialized(remote_endpoint_initialized,"Remote point");
		boost::asio::ip::udp::resolver resolver(io_service);
		remote_endpoint = *resolver.resolve(
			{
				boost::asio::ip::udp::v4(),
				options.remote_ip,
				std::to_string(options.remote_port)
			});
		/*********************/
		remote_endpoint_initialized=true;
	}

	Endpoint receive(T_receive &message)
	{
		Endpoint sender_endpoint;
    	socket.receive_from(
        	boost::asio::buffer((char *)&message, sizeof(T_receive)),
        	sender_endpoint);
    	return sender_endpoint;
	}

	void send(
		const T_send &message,
		const Endpoint &client_endpoint)
	{
		socket.send_to(
			boost::asio::buffer((char *)&message, sizeof(T_send)),
			client_endpoint);
	}

	void send(const T_send &message)
	{
		should_have_been_initialized(remote_endpoint_initialized,"Remote point");
		send(message,remote_endpoint);
	}

};

// template <typename T>
// T endian_swap(T val) {
//     T retVal;
//     char *pVal = (char*) &val;
//     char *pRetVal = (char*)&retVal;
//     int size = sizeof(T);
//     for(int i=0; i<size; i++) {
//         pRetVal[size-1-i] = pVal[i];
//     }

//     return retVal;
// }
