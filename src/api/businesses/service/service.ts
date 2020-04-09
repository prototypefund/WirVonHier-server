import { Business, IBusiness, IUser } from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';
import { geoService, mailService } from 'modules/services';
import { IFilteredBusinesses } from './service.types';

class BusinessesService {
  async createBusinesses(
    user: IUser,
    businesses: IBusiness[],
  ): Promise<{ status: number; message?: string; businesses?: IBusiness[] }> {
    try {
      for (const business of businesses) {
        business.owner = user._id;
      }
      const newBusinesses = await Business.create(businesses);
      mailService.send({
        from: 'info',
        to: user.email,
        subject: this.getEmailSubject('businessesCreated', newBusinesses),
        html: this.getEmailBody('businessesCreated', newBusinesses, user),
      });
      geoService.queueForGeolocation(newBusinesses);
      return { status: 200, businesses: newBusinesses };
    } catch (e) {
      return { status: 500, message: e.message };
    }
  }

  async deleteOneBusiness(id: string): Promise<void> {
    await Business.deleteOne({ _id: id });
  }

  async updateOneBusiness(id: string, fieldsToUpdate: Partial<IBusiness>): Promise<IBusiness | null> {
    // TODO: Validate fields in Controller!
    return await Business.findByIdAndUpdate(id, fieldsToUpdate, { new: true });
  }

  getOneBusinessById(id: string): Promise<IBusiness | null> {
    return Business.findOne({ id }).exec();
  }

  async getFilteredBusinesses(requestQuery: { [key: string]: string }): Promise<IFilteredBusinesses | Error> {
    const filter = new BusinessFilter();
    const { error } = filter.addQuery(requestQuery);
    if (error) return error;
    const { limit, page, sort, asc } = requestQuery;
    const normalizedLimit = this.normalizeNumber(limit, 25);
    const normalizedPage = this.normalizeNumber(page, 0);
    const query = filter.getQuery(Business);
    try {
      const businesses = await query
        .sort({ [sort || 'modified']: asc ? 1 : -1 })
        .skip(normalizedPage * normalizedLimit)
        .limit(normalizedLimit)
        .exec();

      await Business.populate(businesses, [
        { path: 'owner', model: 'User' },
        { path: 'location', model: 'Location' },
        { path: 'media.logo', model: 'Image' },
        { path: 'media.cover.image', model: 'Image' },
        { path: 'media.stories.images', model: 'Image' },
      ]);
      const count = await Business.countDocuments(query).exec();
      return {
        total: count,
        page: normalizedPage,
        perPage: normalizedLimit,
        lastPage: Math.ceil(count / normalizedLimit),
        businesses,
      };
    } catch (e) {
      return e;
    }
  }

  private getEmailSubject(type: string, businesses: IBusiness[]): string {
    return `${type} ${businesses}`;
  }
  private getEmailBody(type: string, businesses: IBusiness[], user: IUser): string {
    return `${businesses} ${type} ${user}`;
  }

  normalizeNumber(number: string, fallback: number): number {
    const num = parseInt(number, 10);
    if (num === 0) return fallback;
    if (!num) return fallback;
    return num;
  }
}

export const businessesService = new BusinessesService();
