import {
  Business,
  IBusiness,
  IUser,
  User,
  IBusinessPopulated,
  IBusinessMedia,
  Image,
  IImage,
  IVideo,
  IBusinessMediaPopulated,
} from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';
import { /*mailService,*/ imageService } from 'modules/services';
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
      { path: 'media.stories.videos', model: 'Video' },
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
        { path: 'media.stories.videos', model: 'Video' },
      ]);
      return result;
    } catch (e) {
      return e;
    }
  }

  // TODO: create correct email
  // private getEmailSubject(type: string, businesses: IBusiness[]): string {
  //   return `${type} ${businesses}`;
  // }

  // // TODO: create correct email
  // private getEmailBody(type: string, businesses: IBusiness[], user: IUser): string {
  //   return `${businesses} ${type} ${user}`;
  // }

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

  /*
   * Adds AND Deletes documents / fields
   * All keys that contain values in the client-side document are created IF they DON'T exist in the DB
   * All keys that are empty | null in the client-side document are deleted IF they DO exist in the DB
   * All keys that are EQUAL in the client-side document and DB are ignored
   *
   * TODO: Update Image Upload logic to work directly with Image Collection
   */
  private async processMedia(newMedia: unknown, business: IBusiness): Promise<IBusinessMedia> {
    const { logo: oldLogo, cover: oldCover, profile: oldProfile, stories: oldStories } = business.media;
    const {
      logo: newLogo,
      cover: newCover,
      profile: newProfile,
      stories: newStories,
    } = newMedia as IBusinessMediaPopulated;
    const resultMedia = {} as IBusinessMedia;

    resultMedia.logo = await this.updateLogo(oldLogo, newLogo, business._id);
    resultMedia.cover = await this.updateCover(oldCover, newCover, business._id);
    resultMedia.profile = await this.updateProfile(oldProfile, newProfile, business._id);
    resultMedia.stories = await this.updateStories(oldStories, newStories, business._id);
    return resultMedia;
  }

  private async updateLogo(
    oldLogo: mongoose.Types.ObjectId | null | undefined,
    newLogo: IImage | null | undefined,
    businessId: mongoose.Types.ObjectId,
  ): Promise<mongoose.Types.ObjectId | null> {
    if (newLogo === null || typeof newLogo === undefined) {
      if (oldLogo) this.deleteImage(oldLogo);
      return null;
    }
    if (typeof newLogo !== 'object') {
      // Invalid input; keep old logo
      return oldLogo || null;
    }
    const newImage = await this.putImage(newLogo, businessId, 'logo');
    if (newImage) return newImage._id;
    return oldLogo || null;
  }

  private async updateCover(
    oldCover: {
      image?: mongoose.Types.ObjectId | null | undefined;
      video?: mongoose.Types.ObjectId | null | undefined;
    } = {},
    newCover: { image?: IImage | undefined; video?: IVideo | undefined } = {},
    businessId: mongoose.Types.ObjectId,
  ): Promise<{ image: mongoose.Types.ObjectId | null; video: mongoose.Types.ObjectId | null }> {
    return {
      image: await this.updateCoverImage(oldCover.image, newCover.image, businessId),
      video: await this.updateCoverVideo(oldCover.video, newCover.video, businessId),
    };
  }
  private async updateCoverImage(
    oldCoverImage: mongoose.Types.ObjectId | null | undefined,
    newCoverImage: IImage | null | undefined,
    businessId: mongoose.Types.ObjectId,
  ): Promise<mongoose.Types.ObjectId | null> {
    if (newCoverImage === null || typeof newCoverImage === undefined) {
      if (oldCoverImage) this.deleteImage(oldCoverImage);
      return null;
    }
    if (typeof newCoverImage !== 'object') {
      // Invalid input; keep old logo
      return oldCoverImage || null;
    }
    const newImage = await this.putImage(newCoverImage, businessId, 'cover');
    if (newImage) return newImage._id;
    return oldCoverImage || null;
  }
  private async updateCoverVideo(
    _oldCoverImage: mongoose.Types.ObjectId | null | undefined, // eslint-disable-line
    _newCoverImage: IVideo | null | undefined, // eslint-disable-line
    _businessId: mongoose.Types.ObjectId, // eslint-disable-line
  ): Promise<mongoose.Types.ObjectId | null> {
    return new Promise((resolve) => resolve(null));
  }

  private async updateProfile(
    oldProfile: {
      image?: mongoose.Types.ObjectId | null | undefined;
      video?: mongoose.Types.ObjectId | null | undefined;
    } = {},
    newProfile: { image?: IImage | undefined; video?: IVideo | undefined } = {},
    businessId: mongoose.Types.ObjectId,
  ): Promise<{ image: mongoose.Types.ObjectId | null; video: mongoose.Types.ObjectId | null }> {
    return {
      image: await this.updateProfileImage(oldProfile.image, newProfile.image, businessId),
      video: await this.updateProfileVideo(oldProfile.video, newProfile.video, businessId),
    };
  }
  private async updateProfileImage(
    oldProfileImage: mongoose.Types.ObjectId | null | undefined,
    newProfileImage: IImage | null | undefined,
    businessId: mongoose.Types.ObjectId,
  ): Promise<mongoose.Types.ObjectId | null> {
    if (newProfileImage === null || typeof newProfileImage === undefined) {
      if (oldProfileImage) this.deleteImage(oldProfileImage);
      return null;
    }
    if (typeof newProfileImage !== 'object') {
      // Invalid input; keep old logo
      return oldProfileImage || null;
    }
    const newImage = await this.putImage(newProfileImage, businessId, 'cover');
    if (newImage) return newImage._id;
    return oldProfileImage || null;
  }
  private async updateProfileVideo(
    _oldProfileVideo: mongoose.Types.ObjectId | null | undefined, // eslint-disable-line
    _newProfileVideo: IVideo | null | undefined, // eslint-disable-line
    _businessId: mongoose.Types.ObjectId, // eslint-disable-line
  ): Promise<mongoose.Types.ObjectId | null> {
    return new Promise((resolve) => resolve(null));
  }

  private async updateStories(
    oldStories: { images: mongoose.Types.ObjectId[]; videos: mongoose.Types.ObjectId[] },
    newStories: {
      images?: IImage[] | null;
      videos?: IVideo[] | mongoose.Types.ObjectId[] | string[];
    } = {},
    businessId: mongoose.Types.ObjectId,
  ): Promise<{ images: mongoose.Types.ObjectId[]; videos: mongoose.Types.ObjectId[] }> {
    return {
      images: await this.updateStoryImages(oldStories.images, newStories.images, businessId),
      videos: await this.updateStoryVideos(oldStories.videos, newStories.videos, businessId),
    };
  }
  private async updateStoryImages(
    oldStoryImages: mongoose.Types.ObjectId[],
    newStoryImages: IImage[] | null | undefined,
    businessId: mongoose.Types.ObjectId,
  ): Promise<mongoose.Types.ObjectId[]> {
    if (!newStoryImages || !(newStoryImages instanceof Array)) return oldStoryImages;

    const newImages = [];
    for (const oldImage of oldStoryImages) {
      const exists = newStoryImages.some((image: unknown) => {
        if (!image || typeof image !== 'object') return false;
        if (typeof (image as IImage)._id !== 'string') return false;
        if ((image as IImage)._id == oldImage) return true;
        if (oldImage.equals((image as IImage)._id)) return true;
      });
      if (exists) {
        newImages.push(oldImage);
      } else {
        await this.deleteImage(oldImage);
      }
    }

    for (const newImage of newStoryImages) {
      if (!newImage) continue;
      if (typeof newImage !== 'object') continue;
      const img = await this.putImage(newImage, businessId, 'story');
      if (img) newImages.push(img._id);
    }
    return newImages;
  }
  private async updateStoryVideos(
    _oldStoryVideos: mongoose.Types.ObjectId[], // eslint-disable-line
    _newStoryVideos: IVideo[] | mongoose.Types.ObjectId[] | string[] | undefined, // eslint-disable-line
    _businessId: mongoose.Types.ObjectId, // eslint-disable-line
  ): Promise<mongoose.Types.ObjectId[]> {
    return new Promise((resolve) => resolve([]));
  }

  private async putImage(image: unknown, businessId: mongoose.Types.ObjectId, type: ImageType): Promise<IImage | null> {
    if (!image) return null;
    if (typeof image !== 'object') return null;
    if ((image as IImage)._id && typeof (image as IImage)._id === 'string') {
      const { _id, ...data } = image as IImage;
      try {
        await Image.findByIdAndUpdate(_id, data);
        return null;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Failed to update Image: ${image}. Error: `, e);
      }
    } else if (!(image as IImage)._id) {
      if (!(image as IImage).title) return null;
      delete (image as IImage)._id;
      try {
        const newImage = await Image.create(image);
        imageService.cleanupImage(newImage.id, businessId, type);
        return newImage;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Failed to create Image: ${image}. Error: `, e);
      }
    }
    return null;
  }

  private async deleteImage(imageId: mongoose.Types.ObjectId): Promise<void> {
    try {
      if (!imageId || typeof imageId !== 'object') return;
      const img = await Image.findById(imageId);
      if (img) await img.remove();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Failed to delete Image: ${imageId}. Error: `, e);
    }
  }
}

export const businessesService = new BusinessesService();
