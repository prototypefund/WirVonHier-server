import { Request, Response } from 'express-serve-static-core';
import { Business, Video } from 'persistance/models';
import { videoService as vs } from 'modules/services';
import axios from 'axios';
import { config } from 'config';

export class VideosController {
  async uploadVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body.size) {
        throw 'Invalid parameters';
      }

      const videoTitle = req.body.title as string;
      const videoDescription = req.body.description as string;
      const videoSize = req.body.size as number;

      const businessId = req.params.businessId;
      const business = await Business.findById(businessId);
      if (business === null) {
        throw 'Invalid business';
      }

      // TODO: check if the user can write to this particular business. Is there a token set?

      if (videoSize <= 0) {
        throw 'Invalid file size';
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const announceResponse: any = await axios({
        method: 'POST',
        url: 'https://api.vimeo.com/me/videos/',
        headers: {
          Authorization: `Bearer ${config.vimeo.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
        data: {
          upload: {
            approach: 'tus',
            size: videoSize,
          },
          name: videoTitle,
          description: videoDescription,
          privacy: {
            view: 'unlisted',
          },
        },
      });
      const videoId = announceResponse.data.uri;
      const uploadLink = announceResponse.data.upload.upload_link;

      const newVideo = await Video.create({
        videoId: videoId,
        title: videoTitle,
        description: videoDescription,
        status: 'transcoding',
        type: 'story',
      });
      business.media.stories.videos.push(newVideo);
      business.save();

      // Start video service to check for video transcoding status.
      // The video will be ready when vimeo reports it as being transcoded
      vs.checkVideoTranscodingStatus(videoId, businessId);

      const answer = {
        _id: newVideo._id,
        videoId: videoId,
        uploadLink: uploadLink,
      };
      return res.status(200).json(answer).end();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return res.status(400).end();
    }
  }

  async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.params.businessId;
      const videoId = req.params.videoId;

      const business = await Business.findById(businessId);
      if (business === null) {
        throw 'Invalid business';
      }

      // TODO: check if the user can write to this particular business. Is there a token set?

      const videoIndex = business.media.stories.videos.findIndex((video: any) => {
        return video._id == videoId;
      });
      if (videoIndex === -1) {
        return res.status(404).end();
      }
      const video = await Video.findById(videoId);
      if (video === null) {
        return res.status(404).end();
      }

      const vimeoVideoId = video.videoId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deleteResponse: any = await axios({
        method: 'DELETE',
        url: `https://api.vimeo.com/me/videos/${vimeoVideoId}`,
        headers: {
          Authorization: `Bearer ${config.vimeo.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });
      // eslint-disable-next-line no-console
      console.log(deleteResponse);

      business.media.stories.videos.splice(videoIndex, 1);
      business.save();

      const success = await Video.findByIdAndDelete(videoId);
      if (success === null) {
        return res.status(404).end();
      }
      return res.status(200).end();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return res.status(400).end();
    }
  }
}

export const videosController = new VideosController();
