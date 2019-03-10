// g++ -I ./FFmpeg/ -std=c++11 video_sdl.cpp -L fflibs -lavdevice -lavfilter -lavformat -lavcodec -lrt -ldl -lXfixes -lXext -lX11 -lasound -lSDL -lz -lrt -lswresample -lswscale -lavutil -lm -llzma -lbz2 -lswresample -ldl -lpthread
// e.g.  ./a.out robot.mp4

#include "video_writer.hpp"

#include <GL/glew.h> // sudo apt-get install libglew-dev
#include <GL/glut.h>
#include <SDL2/SDL.h> // sudo apt install libsdl2-dev
#include <SDL2/SDL_video.h> 

VideoWriter::VideoWriter():
	filename("video.mp4"),
	// codec_name("mpeg4"),
	bit_rate(4000000),
	width(640),
	height(480),
	fps(29),
	verbose(false),
	initialized(false)
{
}

void VideoWriter::init()
{
	if(!VideoWriter::avcodec_registered)
	{
		VideoWriter::avcodec_registered=true;
		avcodec_register_all();
		av_register_all();
	}

	// codec = avcodec_find_encoder_by_name(codec_name.c_str());
	// codec_name
	// codec = avcodec_find_encoder_by_name(codec_name.c_str());
	codec = avcodec_find_encoder(AV_CODEC_ID_PNG);
	if(!codec)
		throw std::runtime_error("Codec not found");
		// throw std::runtime_error("Codec '"+codec_name+"' not found");

	contex = avcodec_alloc_context3(codec);
	
	if(!contex)
		throw std::runtime_error("Could not allocate video codec context");

	pkt = av_packet_alloc();
	if(!pkt)
		throw std::runtime_error("Packet allocation failed");

	if(codec->id == AV_CODEC_ID_H264)
		av_opt_set(contex->priv_data, "preset", "slow", 0);

	contex->bit_rate = bit_rate;
	contex->width = width;
	contex->height = height;
	/* frames per second */
	contex->time_base = (AVRational){1, fps};
	contex->framerate = (AVRational){fps, 1};
	contex->gop_size = 10;
	contex->max_b_frames = 1;
	contex->pix_fmt = AV_PIX_FMT_RGBA; //AV_PIX_FMT_YUV420P;

	// https://gist.github.com/araml/7585226593c8803cb7f2d77445a25953

	avformat_alloc_output_context2(&formatContext,nullptr,nullptr,filename.c_str());
	if (formatContext == nullptr)
		throw std::runtime_error("Could not allocate output context");
	av_dict_set(&av_dict_opts, "preset", "lossless",0); /// hq ll lossless losslesshq
	av_dict_set(&av_dict_opts, "level", "4.1", 0);
	av_dict_set(&av_dict_opts, "rc", "vbr", 0);
	av_dict_set(&av_dict_opts, "gpu", "1", 0);
	av_dict_set(&av_dict_opts, "b", "5M", 0);
	av_dict_set(&av_dict_opts, "qmin", "1", 0);
	av_dict_set(&av_dict_opts, "qmax", "20", 0);
	av_dict_set(&av_dict_opts, "delay", "0", 0);

	stream = avformat_new_stream(formatContext,codec);

	if(!stream)
		throw std::runtime_error("ERROR:avformat_new_stream");

	unsigned int tag = 0;
	if(av_codec_get_tag2(formatContext->oformat->codec_tag,
						  AV_CODEC_ID_PNG, &tag) == 0)
		throw std::runtime_error("could not find codec tag for codec id "+std::to_string(codec->id)+", default to 0");
	stream->codecpar->codec_tag = tag;
	av_stream_set_r_frame_rate(stream, AVRational{fps, 1});

	if (avcodec_parameters_from_context(stream->codecpar, contex) < 0)
		throw std::runtime_error("ERROR:avcodec_parameters_from_context");

	if(avcodec_open2(contex, codec, &av_dict_opts) < 0)
		throw std::runtime_error("Could not open codec");
	if(formatContext->oformat->flags & AVFMT_GLOBALHEADER)
		formatContext->flags |= CODEC_FLAG_GLOBAL_HEADER;

	av_dump_format(formatContext, 0, filename.c_str(), 1);

	if(!(formatContext->oformat->flags & AVFMT_NOFILE))
		if(avio_open(&formatContext->pb, filename.c_str(), AVIO_FLAG_WRITE) < 0)
			throw std::runtime_error("ERROR:avio_open:");

	if(avformat_write_header(formatContext, &av_dict_opts) < 0)
		throw std::runtime_error("ERROR:avformat_write_header:");

	av_init_packet(pkt);
	pkt->data = nullptr;
	pkt->size = 0;

	frame = av_frame_alloc();
	if(!frame)
		throw std::runtime_error("Could not allocate video frame.");

	frame->format = contex->pix_fmt;
	frame->width  = contex->width;
	frame->height = contex->height;

	if(av_frame_get_buffer(frame, 32) < 0)
		throw std::runtime_error("Could not allocate the video frame data.");

	initialized=true;
}

void VideoWriter::encode(AVFrame *enc_frame)
{

	if(enc_frame)
	{
		enc_frame->pts = contex->frame_number;
		if(verbose)
			std::cout<<"Send frame "<<(enc_frame->pts)<<std::endl;
	}

	if(avcodec_send_frame(contex, enc_frame) < 0)
		throw std::runtime_error("Error sending a frame forencoding.");

	int ret=0;
	while(ret>=0)
	{
		ret = avcodec_receive_packet(contex, pkt);
		if(ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
			return;
		else if (ret < 0)
			throw std::runtime_error("Error during encoding.");
		if(verbose)
			std::cout<<"Write packet "<<(pkt->pts)<<" (size="<<(pkt->size)<<")"<<std::endl;
		av_packet_rescale_ts(pkt, contex->time_base, stream->time_base);
		pkt->stream_index = stream->index;

		if(av_interleaved_write_frame(formatContext, pkt)<0)
			throw std::runtime_error("Error writing frame.");

		av_packet_unref(pkt);
	}
}

void VideoWriter::check_frame()
{
	if(av_frame_make_writable(frame) < 0)
		throw std::runtime_error("Frame is not writable.");
}

void VideoWriter::next_frame()
{
	encode(frame);
}

void VideoWriter::capture_frame(const sf::Image &image)
{
	check_frame();
	// SDL_Surface * surface = SDL_CreateRGBSurface(SDL_SWSURFACE, width, height, 24, 0x000000FF, 0x0000FF00, 0x00FF0000, 0);

	// glReadBuffer(GL_FRONT);
	// glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, surface->pixels);

	// int bpp = surface->format->BytesPerPixel;
	// const unsigned char* pixels = (unsigned char*)surface->pixels;
	for(int y = 0; y < height; y++)
		for(int x = 0; x < width; x++)
		{
			// unsigned char r= pixels[(height-y-1)*surface->pitch+(bpp*x)+0];
			// unsigned char g= pixels[(height-y-1)*surface->pitch+(bpp*x)+1];
			// unsigned char b= pixels[(height-y-1)*surface->pitch+(bpp*x)+2];

			sf::Color c=image.getPixel(x,y);

			unsigned char r=c.r;
			unsigned char g=c.g;
			unsigned char b=c.b;

			set_RGB(x,y,r,g,b);
		}
	// SDL_FreeSurface(surface);
	next_frame();
}


void VideoWriter::capture_frame(const SDL_Surface * surface)
{
	check_frame();
	int bpp = surface->format->BytesPerPixel;
	const unsigned char* pixels = (unsigned char*)surface->pixels;
	for(int y = 0; y < height; y++)
	for(int x = 0; x < width; x++)
	{
		unsigned char r= pixels[(height-y-1)*surface->pitch+(bpp*x)+0];
		unsigned char g= pixels[(height-y-1)*surface->pitch+(bpp*x)+1];
		unsigned char b= pixels[(height-y-1)*surface->pitch+(bpp*x)+2];

		set_RGB(x,y,r,g,b);
	}
	next_frame();
}

void VideoWriter::finalize()
{
	encode(nullptr);
	if(av_write_trailer(formatContext)<0)
		throw std::runtime_error("Error writing trailer.");
// if(av_free(contex))
//	 throw std::runtime_error("Error releasing codec contex.");


	/* flush the encoder */

	// uint8_t endcode[] = { 0, 0, 1, 0xb7 };
	// file_stream.write((char *) endcode, sizeof(endcode));
	// file_stream.close();
	avcodec_free_context(&contex);
	av_frame_free(&frame);

	if(formatContext &&
		!(formatContext->oformat->flags & AVFMT_NOFILE) &&
		formatContext->pb)
	{
		avio_close(formatContext->pb);
	}
	formatContext->pb = nullptr;
	if(formatContext) {
		avformat_free_context(formatContext);
		formatContext = nullptr;
	}
	av_packet_free(&pkt);	   
}

bool VideoWriter::avcodec_registered=false;
