import Agenda from 'agenda';
import { Business, IVideo } from 'persistance/models';
//import { ImageType } from 'modules/services/image/imageService.types';
import mongoose from 'mongoose';
import { config } from 'config';
import axios from 'axios';

interface IVideoTranscodingOptions {
  businessId: mongoose.Types.ObjectId;
  videoId: string;
}

const jobHandler = async (job: Agenda.Job<IVideoTranscodingOptions>): Promise<void> => {
  const { businessId, videoId } = job.attrs.data;
  const business = await Business.findById(businessId);
  if (!business) {
    return;
  }
  const index = business.media.stories.videos.findIndex((video: IVideo) => {
    return video.src === videoId;
  });
  if (index === -1) {
    return;
  }

  const video = business.media.stories.videos[index];
  if (video.status === 'complete') {
    return;
  }

  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.vimeo.com${videoId}?fields=files,uri,width,height,status,transcode.status,upload.status`,
      headers: {
        Authorization: `Bearer ${config.vimeo.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
    });
    if (response.data.transcode.status === 'complete' && response.data.status === 'available') {
      video.status = 'complete';
      await business.save();
    }
    // eslint-disable-next-line no-empty
  } finally {
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
