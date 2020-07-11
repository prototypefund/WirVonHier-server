import { jobs } from 'modules/jobs';
import {
  ICreateVideoOptions,
  ICreateVideoResponse,
  IVimeoRequestDownloadURLResponse,
  IRequestUploadURLOptions,
  IVimeoRequestUploadURLResponse,
  IUpdateVideoResponse,
  IDeleteVideoResponse,
} from './videoService.types';
import mongoose from 'mongoose';
import { Video, IVideo } from 'persistance/models';
import { config } from 'config';
import axios from 'axios';

class VideoService {
  public async createVideo(options: ICreateVideoOptions): Promise<ICreateVideoResponse> {
    const { uri, title, description, businessId } = options;
    try {
      const video = new Video({
        vimeoURI: uri,
        title,
        description,
        status: 'init',
        type: 'story',
        businessId,
      });
      await video.save();
      return { status: 200, video };
    } catch (e) {
      if (e.response) {
        return { status: 500, error: { ...e.response.data, code: 'A5' } };
      }
      return { status: 500, error: { ...e, code: 'A5' } };
    }
  }

  public async requestUploadURL(options: IRequestUploadURLOptions): Promise<IVimeoRequestUploadURLResponse> {
    const { size, title, description } = options;
    const res = await axios.post<IVimeoRequestUploadURLResponse>(
      'https://api.vimeo.com/me/videos/',
      {
        upload: {
          approach: 'tus',
          size,
        },
        name: title,
        description: description,
        privacy: {
          view: 'unlisted',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.vimeo.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      },
    );
    return res.data;
  }

  public async updateVideo(videoId: string, updates: { [key: string]: unknown }): Promise<IUpdateVideoResponse> {
    const video = await Video.findById(videoId);
    if (!video) {
      return { status: 404, error: { code: 'A2', message: 'Image not found.' } };
    }
    const adjustedUpdates = Object.keys(updates).reduce((res, key) => {
      if (typeof updates[key] === 'undefined' || updates[key] === null) return res;
      return { ...res, [key]: updates[key] };
    }, {} as Partial<IVideo>);
    await video.updateOne(adjustedUpdates).exec();
    return { status: 200 };
  }

  public async deleteVideo(videoId: mongoose.Types.ObjectId | string): Promise<IDeleteVideoResponse> {
    const video = await Video.findById(videoId);
    if (video === null) {
      return { status: 404, error: { code: 'A2', message: 'Video not found.' } };
    }
    return this.removeVideoFromVimeo(video);
  }

  private async removeVideoFromVimeo(video: IVideo): Promise<IDeleteVideoResponse> {
    const uri = video.vimeoURI;
    try {
      await axios.delete<void>(`https://api.vimeo.com${uri}`, {
        headers: {
          Authorization: `Bearer ${config.vimeo.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });
      await video.remove();
      return { status: 204 };
    } catch (e) {
      return { status: 500, error: { code: 'D0', ...e } };
    }
  }

  public async setDownloadURL(video: IVideo): Promise<void> {
    try {
      if (!video || video.url) return;
      const { data } = await axios.get<IVimeoRequestDownloadURLResponse>(`https://api.vimeo.com${video.vimeoURI}`, {
        headers: {
          Authorization: `Bearer ${config.vimeo.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      if (data.maxContentLength === -1) {
        // video does not exist
        await this.deleteVideo(video._id);
        return;
      }
      video.url = data.files[0].link;
      await video.save();
    } catch (e) {
      console.log(e);
    }
  }

  public startTranscodingCheck(videoId: string | mongoose.Types.ObjectId): void {
    jobs.agenda.every('10 seconds', 'video-transcoding-check', { videoId });
  }
}

export const videoService = new VideoService();
