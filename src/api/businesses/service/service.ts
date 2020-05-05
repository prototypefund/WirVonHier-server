import {
  Business,
  IBusiness,
  IUser,
  User,
  IBusinessPopulated,
  IBusinessMedia,
  Image,
  IImage,
} from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';
import { mailService, imageService } from 'modules/services';
import { IFilterResult } from 'modules/services/filter/Base/filter.types';
import mongoose from 'mongoose';
import { ImageType } from 'modules/services/image/imageService.types';

class BusinessesService {
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
          email: user.email,
          name: `${user.email} - ${Date.now()}`,
          active: false,
        });

        const newBusiness = await Business.create(validatedBusiness);
        newBusinesses.push(newBusiness);
      }

      const businessIds = newBusinesses.map((business) => business._id);
      user.businesses.push(...businessIds);
      await user.save();

      mailService.send({
        from: 'info',
        to: user.email,
        subject: this.getEmailSubject('businessesCreated', newBusinesses),
        html: this.getEmailBody('businessesCreated', newBusinesses, user),
      });

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
    fieldsToUpdate: Partial<IBusinessPopulated> = {},
  ): Promise<{ status: number; message: string; updatedBusiness?: IBusiness }> {
    const user = await User.findById(userId);
    if (!user) return { status: 401, message: 'User not found.' };
    if (!user.hasOneRole(['admin', 'businessowner'])) return { status: 403, message: 'User not authorized' };
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...businessData } = fieldsToUpdate;
      const business = await Business.findById(businessId);
      if (!business) return { status: 401, message: `Business with id "${businessId}" does not exist.` };
      if (!business.owner.equals(user._id) && !user.hasAllRoles(['admin']))
        return { status: 401, message: `User is not owner of business.` };

      const processedBusinessData = await this.processUpdateData(businessData, business);
      const updatedBusiness = await business.updateOne(processedBusinessData);
      return { status: 200, updatedBusiness, message: 'Business updated.' };
    } catch (e) {
      return { status: 500, message: e.stack };
    }
  }

  async getOneBusinessById(id: string): Promise<{ status: number; business?: IBusiness }> {
    const business = await Business.findById(id);
    if (!business) return { status: 400 };
    // TODO: expect coordinates from client - add distance to response
    await Business.populate(business, [
      { path: 'owner', model: 'User' },
      { path: 'location', model: 'Location' },
      { path: 'media.logo', model: 'Image' },
      { path: 'media.cover.image', model: 'Image' },
      { path: 'media.stories.images', model: 'Image' },
    ]);
    return { status: 200, business };
  }

  async getFilteredBusinesses(requestQuery: { [key: string]: string }): Promise<IFilterResult | Error> {
    try {
      const filter = new BusinessFilter(requestQuery);
      const result = await filter.exec(Business);
      await Business.populate(result.list, [
        { path: 'owner', model: 'User' },
        { path: 'location', model: 'Location' },
        { path: 'media.logo', model: 'Image' },
        { path: 'media.cover.image', model: 'Image' },
        { path: 'media.stories.images', model: 'Image' },
      ]);
      return result;
    } catch (e) {
      return e;
    }
  }

  // TODO: create correct email
  private getEmailSubject(type: string, businesses: IBusiness[]): string {
    return `${type} ${businesses}`;
  }

  // TODO: create correct email
  private getEmailBody(type: string, businesses: IBusiness[], user: IUser): string {
    return `${businesses} ${type} ${user}`;
  }

  private async processUpdateData(updateData: unknown, business: IBusiness): Promise<Partial<IBusiness>> {
    if (typeof updateData !== 'object' || !updateData) return {};
    const data = updateData as Partial<IBusinessPopulated>;
    const processedData = {} as Partial<IBusiness>;
    if ('media' in data) {
      processedData.media = await this.processMedia(data.media, business);
    }
    if ('owner' in data) {
      const ownerId = await this.processOwner(data.owner);
      if (ownerId) processedData.owner = ownerId;
    }
    if ('members' in data) {
      processedData.members = [];
    }
    if ('address' in data) {
      // update location;
    }
    Object.keys(updateData).forEach((key) => {
      if (['media', 'owner', 'members', 'location'].includes(key)) return;
      processedData[key as Extract<keyof IBusiness, string>] = data[key as Extract<keyof IBusiness, string>];
    });
    return processedData;
  }

  private async processOwner(owner: unknown): Promise<mongoose.Types.ObjectId | null> {
    if (!owner) return null;
    if (typeof owner === 'string') {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(owner);
      if (!isValidObjectId) return null;
      const user = await User.findById(owner);
      if (user) return user._id;
      return null;
    }
    return null;
  }

  private async processMedia(newMedia: unknown, business: IBusiness): Promise<IBusinessMedia> {
    const oldMedia = business.media;
    const { logo, cover, profile, stories } = newMedia as IBusinessMedia;
    const processedMedia = {} as IBusinessMedia;
    if (logo !== undefined) {
      if (logo === null) {
        processedMedia.logo = undefined;
        this.deleteImage(oldMedia.logo);
      } else if (mongoose.Types.ObjectId.isValid(logo)) {
        // we dont allow changing objectIDs yet. New Logo has to be a newly uploaded logo.
        processedMedia.logo = oldMedia.logo;
      } else if (typeof logo === 'object') {
        const newImage = await this.createImage(logo, business._id, 'logo');
        processedMedia.logo = newImage._id;
      }
    } else {
      processedMedia.logo = oldMedia.logo;
    }

    if (cover) {
      processedMedia.cover = {
        image: undefined,
        video: undefined,
      };
      if (typeof cover !== 'object') {
        processedMedia.cover = oldMedia.cover;
      }
      if (!('video' in cover)) {
        // Video not handled yet
        processedMedia.cover.video = oldMedia.cover && oldMedia.cover.video;
      }
      if ('image' in cover) {
        if (cover.image === null) {
          processedMedia.cover.image = undefined;
          this.deleteImage(oldMedia.cover.image);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...imgData } = cover.image;
        const newImage = await this.createImage(imgData, business._id, 'cover');
        processedMedia.cover.image = newImage._id;
      } else {
        processedMedia.cover.image = oldMedia.cover && oldMedia.cover.image;
      }
    } else {
      processedMedia.cover = oldMedia.cover;
    }

    if (profile) {
      processedMedia.profile = {
        image: undefined,
        video: undefined,
      };
      if (typeof profile !== 'object') {
        processedMedia.profile = oldMedia.profile;
      }
      if (!('video' in profile)) {
        // Video not handled yet
        processedMedia.profile.video = oldMedia.profile && oldMedia.profile.video;
      }
      if ('image' in profile) {
        if (profile.image === null) {
          processedMedia.profile.image = undefined;
          this.deleteImage(oldMedia.profile.image);
        } else {
          const newImage = await this.createImage(profile.image, business._id, 'profile');
          processedMedia.profile.image = newImage._id;
        }
      } else {
        processedMedia.profile.image = oldMedia.profile && oldMedia.profile.image;
      }
    } else {
      processedMedia.profile = oldMedia.profile;
    }

    if (stories) {
      processedMedia.stories = {
        images: [],
        videos: [],
      };
      if (typeof stories !== 'object') {
        processedMedia.stories = oldMedia.stories;
      }
      if (!('videos' in stories)) {
        // Video not handled yet
        processedMedia.stories.videos = oldMedia.stories && oldMedia.stories.videos;
      }
      if ('images' in stories && stories.images instanceof Array) {
        const newIds: (string | mongoose.Types.ObjectId)[] = [];
        const newImages = stories.images.filter((image) => {
          if (!image) return false;
          const isExistingObjectId =
            typeof image === 'string' && oldMedia.stories.images.some((oldImage) => oldImage._id.equals(image));
          if (isExistingObjectId) return true;
          if (typeof image === 'object') return true;
          return false;
        });

        for (const image of newImages) {
          if (typeof image === 'string') newIds.push(image);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...imgData } = image;
          const newImage = await this.createImage(imgData, business._id, 'story');
          newIds.push(newImage._id);
        }
        processedMedia.stories.images = newIds;
      } else {
        processedMedia.stories.images = oldMedia.stories && oldMedia.stories.images;
      }
    } else {
      processedMedia.stories = oldMedia.stories;
    }
    return processedMedia;
  }

  private async createImage(image: unknown, businessId: mongoose.Types.ObjectId, type: ImageType): Promise<IImage> {
    const newImage = await Image.create(image);
    imageService.cleanupImage(newImage.id, businessId, type);
    return newImage;
  }

  private async deleteImage(imageId: string): Promise<IImage | null> {
    if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) return null;
    return Image.findByIdAndDelete(imageId).exec();
  }
}

export const businessesService = new BusinessesService();
