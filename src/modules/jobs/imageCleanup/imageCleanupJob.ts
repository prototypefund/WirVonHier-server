import Agenda from 'agenda';
import { Business, Image } from 'persistance/models';
import { ImageType } from 'modules/services/image/imageService.types';
import mongoose from 'mongoose';

interface IImageCleanupOptions {
  businessId: string;
  imageId: string;
  imageType: ImageType;
}

const jobHandler = async (job: Agenda.Job<IImageCleanupOptions>): Promise<void> => {
  const { businessId, imageId, imageType } = job.attrs.data;
  const business = await Business.findById(businessId);
  if (business) {
    if (imageType === 'story') {
      const index = business.media.stories.images.findIndex((imageId: mongoose.Types.ObjectId) =>
        imageId.equals(imageId),
      );
      business.media.stories.images.splice(index, 1);
    } else if (imageType === 'logo') {
      if (business.media.logo && business.media.logo.equals(imageId)) business.media.logo = null;
    } else {
      const image = business.media[imageType].image;
      if (image && image.equals(imageId)) business.media[imageType].image = undefined;
    }
    await business.save();
  }
  await Image.findByIdAndDelete(imageId);
};

export function imageCleanupJob(agenda: Agenda): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agenda.define<IImageCleanupOptions>('image-cleanup', { priority: 'highest', concurrency: 1000 }, jobHandler as any);
}
