import { Business, IBusiness, IUser, User } from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';
import { mailService } from 'modules/services';
import { IFilterResult } from 'modules/services/filter/Base/filter.types';

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
    fieldsToUpdate: Partial<IBusiness> = {},
  ): Promise<{ status: number; message: string; updatedBusiness?: IBusiness }> {
    const user = await User.findById(userId);
    if (!user) return { status: 401, message: 'User not found.' };
    if (!user.hasOneRole(['admin', 'businessowner'])) return { status: 403, message: 'User not authorized' };
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...businessData } = fieldsToUpdate;
      const business = await Business.findById(businessId);
      if (!business) return { status: 401, message: `Business with id "${businessId}" does not exist.` };
      const updatedBusiness = await business.updateOne(businessData);
      return { status: 200, updatedBusiness, message: 'Business updated.' };
    } catch (e) {
      return { status: 500, message: e.message };
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
}

export const businessesService = new BusinessesService();
