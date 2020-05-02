/* eslint-disable @typescript-eslint/camelcase */
import { Filter } from '../Base';
import { IBusiness, Location } from 'persistance/models';
import { Model, MongooseFilterQuery, Aggregate } from 'mongoose';
import { IFilterResult, ILocationWithDistance } from '../Base/filter.types';

export class BusinessFilter extends Filter<IBusiness> {
  public async exec(model: Model<IBusiness>): Promise<IFilterResult> {
    const locations = this.query.location.coords[0] ? await this.getLocations() : null;
    let { query } = this.interpretFilters(model, this.query.filters);
    if (locations) {
      const locationIds = locations.map((loc) => loc._id);
      query = query.where('location').in(locationIds);
    }
    const count = await model.countDocuments((query as unknown) as MongooseFilterQuery<IBusiness>).exec();
    const list = await query
      .where({ active: true })
      .sort(this.query.sorting)
      .skip(this.query.page * this.query.limit)
      .limit(this.query.limit);

    if (locations) {
      for (const entry of list) {
        const location = locations.find((loc) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return loc._id.toString() === (entry as any).location.toString();
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (location) ((entry as unknown) as IBusiness).setDistance(location.distance);
      }
    }

    return {
      total: count,
      page: this.query.page,
      perPage: this.query.limit,
      lastPage: Math.ceil(count / this.query.limit),
      list,
    };
  }

  private getLocations(): Aggregate<ILocationWithDistance[]> {
    const lngLat = this.query.location.coords;
    const maxDistance = this.query.location.maxDistance;
    return Location.aggregate<ILocationWithDistance>().near({
      spherical: true,
      near: lngLat,
      distanceField: 'distance',
      maxDistance: maxDistance / 6371000, // meters to radians
      distanceMultiplier: 6371, // radians to kilometers
    });
  }
}
