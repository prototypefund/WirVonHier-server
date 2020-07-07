/* eslint-disable no-console */
import Agenda from 'agenda';
import { Video } from 'persistance/models';
import mongoose from 'mongoose';
import { config } from 'config';
import axios from 'axios';
import { videoService } from 'modules';

interface IVideoTranscodingOptions {
  videoId: string | mongoose.Types.ObjectId;
}

const jobHandler = async (job: Agenda.Job<IVideoTranscodingOptions>): Promise<void> => {
  const { videoId } = job.attrs.data;

  const video = await Video.findById(videoId);
  if (!video || video.status === 'complete') return job.remove();

  // Delete Video if upload failed for more than one hour
  if (new Date(video.createdAt) < new Date(Date.now() - 1000 * 60 * 60)) {
    await videoService.deleteVideo(videoId);
    await video.remove();
    return job.remove();
  }

  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.vimeo.com${video.vimeoURI}?fields=status,transcode.status`,
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
  } catch (error) {
    console.log('Encountered errror during job', error);
  }
};

export function videoTranscodingCheckJob(agenda: Agenda): void {
  agenda.define<IVideoTranscodingOptions>(
    'video-transcoding-check',
    { priority: 'highest', concurrency: 1000 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobHandler as any,
  );
}
