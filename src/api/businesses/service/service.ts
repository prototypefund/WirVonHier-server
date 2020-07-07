import { Business, IBusiness, IUser, User, IBusinessPopulated, Location, IImage } from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';
import { IFilterResult } from 'modules/services/filter/Base/filter.types';
import mongoose from 'mongoose';
import { imageService, videoService } from 'modules/services';
import {
  ICreateBusinessImagePayload,
  IUpdateBusinessImagePayload,
  ICreateBusinessVideoOptions,
  ICreateBusinessVideoResult,
  IUpdateBusinessVideoResult,
  IUpdateBusinessVideoOptions,
  IDeleteBusinessVideoResult,
} from './service.types';

class BusinessesService {
  async getOneBusinessById(id: string): Promise<{ status: number; business?: IBusiness }> {
    const business = await Business.findById(id);
    if (!business) return { status: 400 };
    // TODO: expect coordinates from client - add distance to response
    await business
      .populate({ path: 'owner', model: 'User' })
      .populate({ path: 'location', model: 'Location' })
      .populate({ path: 'media.logo', match: { uploadVerified: true }, model: 'Image' })
      .populate({ path: 'media.profile', match: { uploadVerified: true }, model: 'Image' })
      .populate({ path: 'media.stories.images', match: { uploadVerified: true }, model: 'Image' })
      .populate({ path: 'media.stories.videos', model: 'Video' })
      .execPopulate();

    return { status: 200, business };
  }

  async createBusinesses(
    userId: string,
    businesses: IBusiness[] = [],
  ): Promise<{ status: number; message: string; createdBusinesses?: IBusiness[] }> {
    const user = await User.findById(userId);
    if (!user) return { status: 401, message: 'User not found.' };
    if (!user.hasOneRole(['admin', 'businessowner'])) return { status: 403, message: 'User not authorized' };
    if (user.hasOneRole(['businessowner']) && user.businesses.length >= 5)
      return { status: 403, message: 'Max allowed businesses per user reached (5).' };

    const newBusinesses = [];
    try {
      for (const business of businesses) {
        const validatedBusiness = new Business({
          ...(business && typeof business === 'object' ? business : {}),
          owner: user._id,
          active: false,
        });
        const newBusiness = await validatedBusiness.save();
        newBusinesses.push(newBusiness);
      }

      const businessIds = newBusinesses.map((business) => business._id);
      user.businesses.push(...businessIds);
      await user.save();

      // mailService.send({
      //   from: 'info',
      //   to: user.email,
      //   subject: this.getEmailSubject('businessesCreated', newBusinesses),
      //   html: this.getEmailBody('businessesCreated', newBusinesses, user),
      // });

      return { status: 200, createdBusinesses: newBusinesses, message: 'All businesses created.' };
    } catch (e) {
      return { status: 500, message: e.message, createdBusinesses: [] };
    }
  }

  async deleteOneBusiness(business: IBusiness, user: IUser): Promise<{ status: number; message?: string }> {
    try {
      if (business.owner.toString() !== user._id.toString())
        return { status: 403, message: 'User is not owner of this business.' };

      if (!user.roles.includes('businessowner'))
        return { status: 403, message: 'User does not have the privilege to delete businesses.' };

      await business.remove();
      return { status: 204 };
    } catch (e) {
      return { status: 500, message: e.message };
    }
  }

  async updateOneBusiness(
    businessId: string,
    userId: string,
    updates: Partial<IBusinessPopulated> = {},
  ): Promise<{ status: number; message: string; updatedBusiness?: IBusiness }> {
    const user = await User.findById(userId);
    if (!user) return { status: 401, message: 'User not found.' };
    if (!user.hasOneRole(['admin', 'businessowner'])) return { status: 403, message: 'User not authorized' };
    try {
      const business = await Business.findById(businessId);
      if (!business) return { status: 401, message: `Business with id "${businessId}" does not exist.` };
      if (!business.owner.equals(user._id) && !user.hasAllRoles(['admin']))
        return { status: 401, message: `User is not owner of business.` };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...adjustedUpdates } = updates;
      const updatedBusinessData = await this.updateBusinessData(adjustedUpdates);
      const updatedBusiness = await business.updateOne(updatedBusinessData);
      return { status: 200, updatedBusiness, message: 'Business updated.' };
    } catch (e) {
      console.log(e);
      return { status: 500, message: e };
    }
  }

  async getFilteredBusinesses(requestQuery: { [key: string]: string }): Promise<IFilterResult | Error> {
    try {
      const filter = new BusinessFilter(requestQuery);
      const result = await filter.exec(Business);
      await Business.populate(result.list, [
        { path: 'owner', model: 'User' },
        { path: 'location', model: 'Location' },
        { path: 'media.logo', match: { uploadVerified: true }, model: 'Image' },
        { path: 'media.profile', match: { uploadVerified: true }, model: 'Image' },
        { path: 'media.stories.images', match: { uploadVerified: true }, model: 'Image' },
        { path: 'media.stories.videos', match: { url: /^(?!\s*$).+/ }, model: 'Video' }, // regex matches non-empty string
      ]);
      return result;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  /**
   * IMAGES
   */
  public async createBusinessImage(
    businessId: string,
    userId: string,
    newImageData: ICreateBusinessImagePayload,
  ): Promise<{ status: number; message?: string; image?: IImage }> {
    try {
      const business = await Business.findById(businessId);
      if (!business) return { status: 404, message: 'Business not found.' };
      if (!business.owner.equals(userId)) return { status: 403, message: 'User not authorized.' };
      const image = await imageService.createImage(newImageData);
      if (!image) return { status: 500, message: 'Could not create Image.' };
      this.addImageToBusiness(business, image);
      return { status: 200, image };
    } catch (e) {
      return { status: 500, message: e.message };
    }
  }

  public async deleteBusinessImage(
    businessId: string,
    userId: string,
    imageId: string,
  ): Promise<{ status: number; message?: string }> {
    const business = await Business.findById(businessId);
    if (!business) return { status: 404, message: 'Business not found.' };
    if (!business.owner.equals(userId)) {
      return { status: 403, message: 'User not authorized.' };
    }
    const res = await Promise.all([this.removeImageFromBusiness(business, imageId), imageService.deleteImage(imageId)]);
    return res[1];
  }

  public async updateBusinessImage(
    businessId: string,
    userId: string,
    imageId: string,
    value: IUpdateBusinessImagePayload,
  ): Promise<{ status: number; message?: string }> {
    const business = await Business.findById(businessId);
    if (!business) return { status: 404, message: 'Business not found.' };
    if (!business.owner.equals(userId)) return { status: 403, message: 'User not authorized.' };
    return imageService.updateImage(imageId, value);
  }

  /**
   * VIDEOS
   */
  public async createBusinessVideo(options: ICreateBusinessVideoOptions): Promise<ICreateBusinessVideoResult> {
    const { businessId, title, description = '', size, userId } = options;

    console.log('options in businessService: ', options);
    const user = await User.findById(userId);
    if (!user) {
      return { status: 403, error: { code: 'A0', message: 'Not authenticated.' } };
    }
    if (!user.hasOneRole(['businessowner', 'admin'])) {
      return { status: 403, error: { code: 'A1', message: 'Not authorized.' } };
    }
    const business = await Business.findById(businessId);
    if (business === null) {
      return { status: 404, error: { code: 'A2', message: 'Business not found.' } };
    }
    if (user.hasOneRole(['businessowner']) && !business.owner.equals(user._id)) {
      return { status: 404, error: { code: 'A1', message: 'Not authorized.' } };
    }
    const { uri, upload } = await videoService.requestUploadURL({ size, title, description });
    const result = await videoService.createVideo({ title, description, businessId, uri });
    if (result.status !== 200) {
      return { status: 500, error: result.error };
    }

    business.media.stories.videos.push(result.video._id);
    await business.save();
    return { status: 200, data: { uploadLink: upload.upload_link, video: result.video } };
  }

  public async updateBusinessVideo(options: IUpdateBusinessVideoOptions): Promise<IUpdateBusinessVideoResult> {
    const { businessId, videoId, title, description, status, userId } = options;
    const business = await Business.findById(businessId);
    if (!business) return { status: 404, error: { code: 'A2', message: 'Business not found.' } };
    if (!business.owner.equals(userId)) return { status: 403, error: { code: 'A1', message: 'Not authorized.' } };
    const updates = { title, description, status };
    return videoService.updateVideo(videoId, updates);
  }

  public async deleteBusinessVideo(
    businessId: string,
    userId: string,
    videoId: string,
  ): Promise<IDeleteBusinessVideoResult> {
    const business = await Business.findById(businessId);
    if (!business) return { status: 404, error: { code: 'A2', message: 'Business not found.' } };
    if (!business.owner.equals(userId)) {
      return { status: 403, error: { code: 'A1', message: 'User not authorized.' } };
    }
    const res = await Promise.all([this.removeVideoFromBusiness(business, videoId), videoService.deleteVideo(videoId)]);
    return res[1];
  }

  private async removeVideoFromBusiness(business: IBusiness, videoId: string): Promise<void> {
    const storyIndex = business.media.stories.videos.findIndex((id) => id.equals(videoId));
    if (storyIndex !== -1) {
      business.media.stories.videos.splice(storyIndex, 1);
    }
    await business.save();
  }

  private async removeImageFromBusiness(business: IBusiness, imageId: string): Promise<void> {
    if (business.media.logo && business.media.logo.equals(imageId)) business.media.logo = null;
    if (business.media.profile && business.media.profile.equals(imageId)) business.media.profile = null;
    const storyIndex = business.media.stories.images.findIndex((id) => id.equals(imageId));
    if (storyIndex !== -1) {
      business.media.stories.images.splice(storyIndex, 1);
    }
    await business.save();
  }

  private async addImageToBusiness(business: IBusiness, image: IImage): Promise<void> {
    const { imageType } = image;
    switch (imageType) {
      case 'logo': {
        business.media.logo = image._id;
        break;
      }
      case 'profile': {
        business.media.profile = image._id;
        break;
      }
      case 'story': {
        business.media.stories.images.push(image._id);
        break;
      }
    }
    await business.save();
  }

  private async updateBusinessData(updates: unknown): Promise<Partial<IBusiness>> {
    const data = {} as Partial<IBusiness>;
    if (!this.isValidUpdates(updates)) return data;
    const keys = Object.keys(updates) as Array<keyof Partial<IBusiness>>;
    for (const key of keys) {
      switch (key) {
        case 'media': {
          continue;
        }
        case 'owner': {
          const ownerId = await this.processOwner(data.owner);
          if (ownerId) data.owner = ownerId;
          break;
        }
        case 'location': {
          data.location = await this.processLocation((updates.location as unknown) as [number, number]);
          break;
        }
        default:
          data[key] = updates[key];
      }
    }
    return data;
  }

  private isValidUpdates(updates: unknown): updates is Partial<IBusiness> {
    let isValid = true;
    if (typeof updates !== 'object' || !updates) isValid = false;
    return isValid;
  }

  private async processLocation(lngLat: [number, number]): Promise<mongoose.Types.ObjectId | null> {
    const loc = await Location.create({
      geo: {
        type: 'Point',
        coordinates: lngLat,
      },
    });
    return loc._id;
  }

  private async processOwner(owner: unknown): Promise<mongoose.Types.ObjectId | null> {
    if (!owner) return null;
    if (typeof owner !== 'string') return null;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(owner);
    if (!isValidObjectId) return null;
    const user = await User.findById(owner);
    if (user) return user._id;
    return null;
  }
}

export const businessesService = new BusinessesService();
