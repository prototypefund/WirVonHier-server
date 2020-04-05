import { Business, IBusiness } from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';
import { GeoService } from 'modules';

class BusinessesService {
  async createBusinesses(businesses: IBusiness[]): Promise<IBusiness[]> {
    // TODO: Validate Docs in Controller!
    const newBusinesses = await Business.create(businesses);
    GeoService.patchLocations(newBusinesses);
    return newBusinesses;
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

  getFilteredBusinesses(query: { [key: string]: string }): Promise<IBusiness[]> {
    const filter = new BusinessFilter();
    filter.addQuery(query);
    filter.limit(query.limit || 50);
    return filter.execOn(Business);
  }
}

export const businessesService = new BusinessesService();
