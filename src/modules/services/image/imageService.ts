import { ImageType } from './imageService.types';
import { jobs } from 'modules';
import { config } from 'config';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
const cloud = cloudinary.v2;
cloud.config({
  cloud_name: config.cloudinary.cloudName, // eslint-disable-line @typescript-eslint/camelcase
  api_key: config.cloudinary.apiKey, // eslint-disable-line @typescript-eslint/camelcase
  api_secret: config.cloudinary.apiSecret, // eslint-disable-line @typescript-eslint/camelcase
});
class ImageService {
  public cleanupImage(imageId: string, businessId: mongoose.Types.ObjectId, imageType: ImageType): void {
    if (!jobs) return;
    jobs.agenda.schedule('15 minutes from now', 'image-cleanup', { imageId, businessId, imageType });
  }
  public cancelCleanupImage(imageId: string): void {
    jobs.agenda.cancel({ name: 'image-cleanup', 'data.imageId': imageId });
  }
  public async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cloud.uploader.destroy(publicId, function (error: unknown, result: any) {
        if (error) reject(error);
        if (result.result === 'ok') resolve();
        reject();
      });
    });
  }
}

export const imageService = new ImageService();
