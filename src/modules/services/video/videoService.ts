import { jobs } from 'modules';
import {
  ICreateVideoOptions,
  IVimeoCreateVideoResponse,
  IDeleteVideoOptions,
  IVimeoDeleteVideoResponse,
  IGetVideoUrlResponse,
  IVimeoGetVideoResponse,
} from './videoService.types';
import { Business, Video, User } from 'persistance/models';
import { config } from 'config';
import axios from 'axios';
import { IServiceResponse } from '../services.types';

class VideoService {
  public async createVideo(options: ICreateVideoOptions): Promise<IServiceResponse<string>> {
    const { businessId, title, description, size, userId } = options;

    const user = await User.findById(userId);
    if (!user) {
      return { status: 403, error: { code: 'A0', message: 'Not authenticated.' } };
    }
    if (!user.hasOneRole(['businessowner', 'admin'])) {
      return { status: 403, error: { code: 'A1', message: 'Not authorized.' } };
    }
    const business = await Business.findById(businessId);
    if (business === null) {
      return { status: 404, error: { code: 'A1', message: 'Business not found.' } };
    }
    if (user.hasOneRole(['businessowner']) && !business.owner.equals(user._id)) {
      return { status: 404, error: { code: 'A1', message: 'Not authorized.' } };
    }

    try {
      // TODO: Outgoing API-Interface should be separate Service
      const announceResponse = await axios.post<IVimeoCreateVideoResponse>(
        'https://api.vimeo.com/me/videos/',
        {
          upload: {
            approach: 'tus',
            size,
          },
          name: title,
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${config.vimeo.accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
          },
        },
      );

      const videoId = announceResponse.data.uri;
      const uploadLink = announceResponse.data.upload.upload_link;

      const newVideo = await Video.create({
        videoId,
        title: title,
        description: description,
        status: 'transcoding',
        type: 'story',
        owner: business._id,
      });
      business.media.stories.videos.push(newVideo._id);
      await business.save();

      // Start video service to check for video transcoding status.
      // The video will be ready when vimeo reports it as being transcoded
      this.checkVideoTranscodingStatus(videoId, businessId);
      return { status: 200, data: uploadLink };
    } catch (e) {
      if (e.response) {
        return { status: 500, error: { ...e.response.data, code: 'A5' } };
      }
      return { status: 500, error: { ...e, code: 'A5' } };
    }
  }

  public async deleteVideo(options: IDeleteVideoOptions): Promise<IServiceResponse<void>> {
    const { userId, businessId, videoId } = options;
    const user = await User.findById(userId);
    if (!user) {
      return { status: 403, error: { code: 'A0', message: 'Not authenticated.' } };
    }
    if (!user.hasOneRole(['businessowner', 'admin'])) {
      return { status: 403, error: { code: 'A1', message: 'Not authorized.' } };
    }
    const business = await Business.findById(businessId);
    if (business === null) {
      return { status: 404, error: { code: 'A1', message: 'Business not found.' } };
    }
    if (user.hasOneRole(['businessowner']) && !business.owner.equals(user._id)) {
      return { status: 404, error: { code: 'A1', message: 'Not authorized.' } };
    }

    // TODO: Move find store to Repositiory
    const videoIndex = business.media.stories.videos.findIndex((id) => id.equals(videoId));
    if (videoIndex === -1) {
      return { status: 404, error: { code: 'E0', message: 'Video not found.' } };
    }
    const video = await Video.findById(videoId);
    if (video === null) {
      return { status: 500, error: { code: 'E1', message: 'Database miss-match.' } };
    }

    const vimeoVideoId = video.videoId;
    try {
      const deleteResponse = await axios.delete<IVimeoDeleteVideoResponse>(`https://api.vimeo.com/${vimeoVideoId}`, {
        headers: {
          Authorization: `Bearer ${config.vimeo.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      // eslint-disable-next-line no-console
      console.log('Delete Vimeo Response: ', deleteResponse);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Delete Vimeo video failed but we dont care for now');
    }

    business.media.stories.videos.splice(videoIndex, 1);
    const promise1 = business.save();
    const promise2 = Video.findByIdAndDelete(videoId);
    const res = await Promise.all([promise1, promise2]);
    if (res[1] === null) {
      return { status: 500, error: { code: 'D0', message: 'Undefined Database error.' } };
    }
    return { status: 204, data: undefined };
  }

  public async getVideoUrl(videoId: string): Promise<IServiceResponse<IGetVideoUrlResponse>> {
    try {
      const getVideoResponse = await axios.get<IVimeoGetVideoResponse>(`https://api.vimeo.com/${videoId}`, {
        headers: {
          Authorization: `Bearer ${config.vimeo.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      // TODO: how to decide on which file to use?
      return { status: 200, data: { url: getVideoResponse.data.files[0].link } };
    } catch (e) {
      if (e.response) {
        return { status: 500, error: { ...e.response.data, code: 'A5' } };
      }
      return { status: 500, error: { ...e, code: 'A5' } };
    }
  }

  public checkVideoTranscodingStatus(videoId: string, businessId: string): void {
    if (!jobs) return;
    // TODO: maybe in 15 minutes, every 5 minutes? 15 minutes is about the time vimeo needs
    jobs.agenda.every('5 minutes', 'video-transcoding-check', { videoId, businessId });
    // eslint-disable-next-line no-console
    console.log(`video-transcoding-check: Start job for businessId=${businessId} videoId=${videoId}`);
  }
}

export const videoService = new VideoService();
