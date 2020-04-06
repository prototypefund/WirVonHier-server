import { IBusiness, Business } from '../../../persistance/models';
import { IGeoResponseSearch } from './geolocation.types';

// TODO Write Geolocation Service
//GET https://nominatim.openstreetmap.org/search?format=json&email=e.rom@gmx.net&addressdetails=1&q=55+gostenhofer+hauptstrasse+nuernberg

export class GeoService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _ID: any;
  private static validatedQuery = '';
  private static nominatimURL = 'https://nominatim.openstreetmap.org';
  private static getCoordsURL =
    GeoService.nominatimURL +
    '/search?' +
    'format=json&' +
    'email=wirvonhier.direktzudir@googlemail.com&' +
    'limit=1&' +
    'addressdetails=1&' +
    'q=';
  // private static getAddressURL =
  //   GeoService.nominatimURL +
  //   '/reverse?' +
  //   'format=json&' +
  //   'email=wirvonhier.direktzudir@googlemail.com&' +
  //   'addressdetails=1&' +
  //   'namedetails=1&' +
  //   'extratags=1&' +
  //   'zoom=18&';

  // * Update an array of businesses
  // - Convert adresses in coordinates, update db entries ////, send mail to subscribers
  static patchLocations(businesses: IBusiness[]): void {
    for (const business of businesses) {
      this._ID = business._id;
      // build query String
      const searchQuery =
        this.getCoordsURL +
        business.address.street +
        '+' +
        business.address.streetNumber +
        ',+' +
        business.address.zip +
        '+' +
        business.address.city +
        ',+' +
        business.address.state +
        ',+' +
        business.address.country;

      this.validatedQuery = searchQuery.trim().replace(/\s/g, '+');
      //// GlobalEventEmitter.emit('business_localized'); // Event for modules/subscribers
    }
  }
  // ! ===============================================
  static getSearchQuery(): string {
    return this.validatedQuery;
  }
  // ! ===============================================/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getBusinessID(): any {
    return this._ID;
  }

  // ! ===============================================
  // Request Handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static sendQuery(queryURL: any): IGeoResponseSearch[] {
    // send req 1 per sec
    const xhr = new XMLHttpRequest();

    xhr.onload = (): void => {
      if (xhr.status != 200) {
        // eslint-disable-next-line no-console
        console.error(`Error ${xhr.status}: ${xhr.statusText}`);
      } else {
        return JSON.parse(xhr.responseText);
      }
    };
    xhr.onerror = function (): void {
      // eslint-disable-next-line no-console
      console.error('Error ' + xhr.status + ': ' + 'xhr.statusText');
    };

    xhr.open('GET', queryURL);
    xhr.send();
    return JSON.parse('{}');
  }

  // ! ===============================================
  static updateData(response: IGeoResponseSearch[]): void {
    const location = {
      type: 'Point',
      coordinates: [parseFloat(response[0].lon), parseFloat(response[0].lat)],
    };
    Business.findOneAndUpdate({ _id: GeoService.getBusinessID() }, { location });
  }
}
