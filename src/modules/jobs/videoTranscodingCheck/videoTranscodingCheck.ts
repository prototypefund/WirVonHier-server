/* eslint-disable no-console */
import Agenda from 'agenda';
import { Business, IVideo, Video } from 'persistance/models';
import mongoose from 'mongoose';
import { config } from 'config';
import axios from 'axios';
import { IVimeoDeleteVideoResponse } from 'modules/services/video/videoService.types';

interface IVideoTranscodingOptions {
  businessId: mongoose.Types.ObjectId;
  vimeoId: string;
}

const jobHandler = async (job: Agenda.Job<IVideoTranscodingOptions>): Promise<void> => {
  const { businessId, vimeoId } = job.attrs.data;

  const business = await Business.findById(businessId);
  if (!business) {
    return job.remove();
  }
  // TODO: make vimeoId a secondary Index and query directly for Video
  const videos = await Video.find({ _id: { $in: business.media.stories.videos } });
  const index = videos.findIndex((video: IVideo) => {
    return video.vimeoId === vimeoId;
  });
  if (index === -1) {
    return job.remove();
  }
  const video = videos[index];

  if (video.status === 'complete') {
    return job.remove();
  }

  // Delete Video if upload failed for more than one hour
  if (new Date(video.createdAt) < new Date(Date.now() - 1000 * 60 * 60)) {
    await axios.delete<IVimeoDeleteVideoResponse>(`https://api.vimeo.com${vimeoId}`, {
      headers: {
        Authorization: `Bearer ${config.vimeo.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
    });
    await video.remove();
    return job.remove();
  }

  try {
    const url = `https://api.vimeo.com${vimeoId}?fields=files,uri,width,height,status,transcode.status,upload.status`;
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        Authorization: `Bearer ${config.vimeo.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
    });
    if (response.data.transcode.status === 'complete' && response.data.status === 'available') {
      video.status = 'complete';
      await video.save();
      job.remove();
    }
    // eslint-disable-next-line no-empty
  } catch (error) {
    console.log('Encountered errror during job', error);
  }
};

export function videoTranscodingCheckJob(agenda: Agenda): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agenda.define<IVideoTranscodingOptions>(
    'video-transcoding-check',
    { priority: 'highest', concurrency: 1000 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobHandler as any,
  );
}
