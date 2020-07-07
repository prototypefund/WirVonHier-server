import { Schema, Types, Query } from 'mongoose';
import { IVideo } from '.';
import { videoService } from 'modules/services';

export const VideoSchema = new Schema<IVideo>({
  createdAt: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  modifiedAt: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  title: {
    type: String,
    required: true,
  },
  businessId: {
    type: Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  description: String,
  vimeoURI: String,
  status: {
    type: String,
    enum: ['complete', 'uploaded', 'transcoding', 'error', 'init'],
  },
  url: {
    type: String,
    default: '',
  },
});

VideoSchema.pre<IVideo>(/save/, function () {
  this.modifiedAt = new Date(Date.now()).toUTCString();
});
// We are casting this to any since the Typings are not complete!
// eslint-disable-next-line @typescript-eslint/no-explicit-any
VideoSchema.post<IVideo>(/updateOne|findOneAndUpdate/, function (this: Query<unknown> & any) {
  const newStatus = this.get('status');
  if (newStatus === 'uploaded') {
    const videoId = this.getFilter()._id;
    videoService.startTranscodingCheck(videoId);
  }
});
VideoSchema.post<IVideo>(/save/, function (this: IVideo) {
  if (this.status === 'complete') {
    videoService.setDownloadURL(this);
  }
});
