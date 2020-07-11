import { ICreateImagePayload, UpdateImagePayload } from './imageService.types';
import { jobs } from 'modules/jobs';
import { config } from 'config';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import { Image, Business, IImage } from 'persistance/models';

const cloud = cloudinary.v2;
cloud.config({
  cloud_name: config.cloudinary.cloudName, // eslint-disable-line @typescript-eslint/camelcase
  api_key: config.cloudinary.apiKey, // eslint-disable-line @typescript-eslint/camelcase
  api_secret: config.cloudinary.apiSecret, // eslint-disable-line @typescript-eslint/camelcase
});

class ImageService {
  public async createImage(newImageData: ICreateImagePayload): Promise<IImage | null> {
    try {
      const image = new Image(newImageData);
      await image.save();
      jobs.agenda.schedule('5 minutes from now', 'image-cleanup', {
        imageId: image._id,
      });
      return image;
    } catch (e) {
      return null;
    }
  }

  public async updateImage(
    imageId: string,
    updates: UpdateImagePayload,
  ): Promise<{ status: number; message?: string }> {
    const image = await Image.findById(imageId);
    if (!image) {
      return { status: 404, message: 'Image not found.' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...adjustedUpdates } = updates;
    await image.updateOne(adjustedUpdates).exec();
    return { status: 200 };
  }

  public async deleteImage(imageId: mongoose.Types.ObjectId | string): Promise<{ status: number; message?: string }> {
    const image = await Image.findById(imageId);
    if (!image) {
      return { status: 404, message: 'Image not found.' };
    }

    return this.deleteImageFromCloudinary(image);
  }

  public async createImages(
    userId: mongoose.Types.ObjectId | string,
    newImages: ICreateImagePayload[],
  ): Promise<{ status: number; message?: string; images?: IImage[] }> {
    try {
      const cachedBusinesses = new Map();
      const images = [];
      for (const newImage of newImages) {
        const cachedBusiness = cachedBusinesses.get(newImage.businessId);
        const business = cachedBusiness || (await Business.findById(newImage.businessId));
        if (!cachedBusiness) cachedBusinesses.set(newImage.businessId, business);
        if (!business.owner.equals(userId)) {
          return { status: 403, message: 'User not authorized.' };
        }
        const img = new Image(newImage);
        await img.save();
        jobs.agenda.schedule('15 minutes from now', 'image-cleanup', {
          imageId: img._id,
          businessId: img.businessId,
          imageType: img.imageType,
        });
        images.push(img);
      }
      return { status: 200, images };
    } catch (e) {
      return { status: 500, message: e.message };
    }
  }

  private deleteImageFromCloudinary(image: IImage): Promise<{ status: number; message?: string }> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cloud.uploader.destroy(image.publicId, async function (error: unknown, result: any) {
        if (error) reject({ status: 500, message: error });
        if (result.result === 'ok') {
          await image.remove();
          resolve({ status: 200 });
        }
        if (result.result === 'not found') {
          resolve({ status: 200 });
        }
        reject({ status: 400, message: 'Unknown error when trying to delete image from Cloudinary.' });
      });
    });
  }
}

export const imageService = new ImageService();
