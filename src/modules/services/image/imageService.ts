import { ImageType } from './imageService.types';
import { jobs } from 'modules';
import mongoose from 'mongoose';

class ImageService {
  public cleanupImage(imageId: string, businessId: mongoose.Types.ObjectId, imageType: ImageType): void {
    if (!jobs) return;
    jobs.agenda.schedule('15 minutes from now', 'image-cleanup', { imageId, businessId, imageType });
  }
  public cancelCleanupImage(imageId: string): void {
    jobs.agenda.cancel({ name: 'image-cleanup', 'data.imageId': imageId });
  }
}

export const imageService = new ImageService();
