// sudo apt-get install libavdevice-dev
// g++ -I ./FFmpeg/ -std=c++11 video_sdl.cpp -L fflibs -lavdevice -lavfilter -lavformat -lavcodec -lrt -ldl -lXfixes -lXext -lX11 -lasound -lSDL -lz -lrt -lswresample -lswscale -lavutil -lm -llzma -lbz2 -lswresample -ldl -lpthread
// e.g.  ./a.out robot.mp4

#pragma once

#include <string>
#include <iostream>
#include <fstream>

// #include <GL/glew.h>
// #include <GL/glut.h>
// #include <SDL2/SDL.h>
// #include <SDL2/SDL_video.h> 

extern "C" {
    #include <libavcodec/avcodec.h>
    #include <libavformat/avformat.h>
    #include <libavutil/opt.h>
    #include <libavutil/imgutils.h>
}

class VideoWriter
{
public:
    std::string filename;
    static bool avcodec_registered;
    const AVCodec *codec=nullptr;
    AVCodecContext *contex= nullptr;
    AVFrame *frame=nullptr;
    AVPacket *pkt=nullptr;
    struct AVStream* stream=nullptr;
    AVFormatContext* formatContext=nullptr;
    AVOutputFormat* outputFormat=nullptr;
    AVDictionary *av_dict_opts = nullptr;

    int bit_rate;
    int width,height;
    int fps;
    bool verbose;


    VideoWriter();
    VideoWriter(VideoWriter&&)=default;

    void init();

    void encode(AVFrame *enc_frame);

    void check_frame();


    inline int R(int x,int y)
    {
        int offset = 4 * (x + y *width);
        return int(frame->data[0][offset+0]);
    }

    inline void R(int x,int y,int colorR)
    {
        int offset = 4 * (x + y *width);
        frame->data[0][offset+0]=uint8_t(colorR);
    }

    inline int G(int x,int y)
    {
        int offset = 4 * (x + y *width);
        return int(frame->data[0][offset+1]);
    }

    inline void G(int x,int y,int colorG)
    {
        int offset = 4 * (x + y *width);
        frame->data[0][offset+1]=uint8_t(colorG);
    }

    inline int B(int x,int y)
    {
        int offset = 4 * (x + y *width);
        return int(frame->data[0][offset+2]);
    }

    inline void B(int x,int y,int colorB)
    {
        int offset = 4 * (x + y *width);
        frame->data[0][offset+2]=uint8_t(colorB);
    }

    inline void get_RGB(int x,int y,int &colorR,int &colorG,int &colorB)
    {
        int offset = 4 * (x + y *width);
        colorR=int(frame->data[0][offset+0]);
        colorG=int(frame->data[0][offset+1]);
        colorB=int(frame->data[0][offset+2]);
    }

    inline void set_RGB(int x,int y,int colorR,int colorG,int colorB)
    {
        int offset = 4 * (x + y *width);
        frame->data[0][offset+0]=uint8_t(colorR);
        frame->data[0][offset+1]=uint8_t(colorG);
        frame->data[0][offset+2]=uint8_t(colorB);
    }    
    void next_frame();

    inline int color_clip(int x)
    {
        return ((x)>255?255:(x)<0?0:x);
    }

    void capture_frame();

    void finalize();
};

