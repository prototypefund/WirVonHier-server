import { Schema, Types } from 'mongoose';
import { IVideo } from '.';
import { videoService } from 'modules';

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

  // TODO: Should we save the owner here?
  businessId: {
    type: Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  description: String,
  vimeoURI: String,
  status: {
    type: String,
    enum: ['complete', 'uploaded', 'transcoding', 'error'],
  },
  url: {
    type: String,
    default: '',
  },
});

// Document post Hook
VideoSchema.post<IVideo>('save', function (doc) {
  doc.modifiedAt = new Date(Date.now()).toUTCString();

  if (doc.status === 'uploaded') {
    videoService.startTranscodingCheck(doc._id);
  }
  if (doc.status === 'complete' && !doc.url) {
    videoService.setDownloadURL(doc);
  }
});
