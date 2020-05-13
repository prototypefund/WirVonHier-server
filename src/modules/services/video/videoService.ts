import { jobs } from 'modules';

class VideoService {
  public checkVideoTranscodingStatus(videoId: string, businessId: string): void {
    if (!jobs) return;
    // TODO: maybe in 15 minutes, every 5 minutes? 15 minutes is about the time vimeo needs
    jobs.agenda.every('5 minutes', 'video-transcoding-check', { videoId, businessId });
    // eslint-disable-next-line no-console
    console.log(`video-transcoding-check: Start job for businessId=${businessId} videoId=${videoId}`);
  }
}

export const videoService = new VideoService();
