import Agenda from 'agenda';
import { Business, Image } from 'persistance/models';
import { ImageType } from 'modules/services/image';

interface IImageCleanupOptions {
  businessId: string;
  imageId: string;
  imageType: ImageType;
}

const jobHandler = async (job: Agenda.Job<IImageCleanupOptions>): Promise<void> => {
  const { imageId } = job.attrs.data;
  const image = await Image.findById(imageId);
  if (!image) return;
  if (image.uploadVerified) return;
  const { businessId, imageType } = image;
  const business = await Business.findById(businessId);
  if (!business) {
    await Image.findByIdAndDelete(imageId);
    return;
  }
  switch (imageType) {
    case 'logo': {
      if (business.media.logo && business.media.logo.equals(imageId)) business.media.logo = null;
      break;
    }
    case 'profile': {
      if (business.media.profile && business.media.profile.equals(imageId)) business.media.logo = null;
      break;
    }
    case 'story': {
      business.media.stories.images = business.media.stories.images.filter((imgId) => !imgId.equals(imageId));
    }
  }
  await business.save();
  await Image.findByIdAndDelete(imageId);
};

export function imageCleanupJob(agenda: Agenda): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agenda.define<IImageCleanupOptions>('image-cleanup', { priority: 'highest', concurrency: 1000 }, jobHandler as any);
}
