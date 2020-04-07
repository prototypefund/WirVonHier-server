import { Business, IBusiness, IUser } from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';
import { GeoService, mailService } from 'modules/services';

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
      GeoService.patchLocations(newBusinesses);
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

  async getFilteredBusinesses(query: { [key: string]: string }): Promise<{ businesses?: IBusiness[]; error?: Error }> {
    const filter = new BusinessFilter();
    const { error } = filter.addQuery(query);
    if (error) return { error };
    filter.limit(query.limit || 50);
    const businesses = await filter.execOn(Business);
    return { businesses };
  }

  private getEmailSubject(type: string, businesses: IBusiness[]): string {
    return `${type} ${businesses}`;
  }
  private getEmailBody(type: string, businesses: IBusiness[], user: IUser): string {
    return `${businesses} ${type} ${user}`;
  }
}

export const businessesService = new BusinessesService();
