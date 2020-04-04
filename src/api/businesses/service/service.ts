import { Business, IBusiness } from 'persistance/models';
import { BusinessFilter } from 'modules/services/filter';

class BusinessesService {
  createBusinesses(businesses: IBusiness[]): Promise<IBusiness[]> {
    // TODO: Validate Docs in Controller!
    return Business.create(businesses);
  }

  async deleteOneBusiness(id: string): Promise<void> {
    await Business.deleteOne({ _id: id });
  }

  async updateOneBusiness(id: string, fieldsToUpdate: Partial<IBusiness>): Promise<IBusiness | null> {
    // TODO: Validate fields in Controller!
    return await Business.findByIdAndUpdate(id, fieldsToUpdate, { new: true });
  }

  getOneBusinessById(id: string): Promise<IBusiness | null> {
    return Business.findById(id).exec();
  }

  getFilteredBusinesses(query: { [key: string]: string }): Promise<IBusiness[]> {
    const bf = new BusinessFilter(Business.find());
    bf.parseQueryString(query);
    return bf.applyFilter().exec();
  }
}

export const businessesService = new BusinessesService();
