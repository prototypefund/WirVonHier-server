import https from 'https';
import { IBusiness, Business } from '../../../persistance/models';
import { IGeoResponseSearch } from './geolocation.types';

//GET https://nominatim.openstreetmap.org/search?format=json&email=e.rom@gmx.net&addressdetails=1&q=55+gostenhofer+hauptstrasse+nuernberg

export class GeoService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: IBusiness[] = [];
  private nominatimURL = 'https://nominatim.openstreetmap.org';
  private getCoordsURL =
    this.nominatimURL +
    '/search?' +
    'format=json&' +
    'email=wirvonhier.direktzudir@googlemail.com&' +
    'limit=1&' +
    'addressdetails=1&' +
    'q=';

  public async init(): Promise<void> {
    const businessesWithoutLocation = await Business.where('location').equals(undefined);
    this.queue.push(...businessesWithoutLocation);
  }

  public get nextItem(): IBusiness {
    return this.queue[0];
  }
  public queueForGeolocation(businesses: IBusiness[]): void {
    this.queue.push(...businesses);
  }

  public async locateAndUpdate(business: IBusiness): Promise<void> {
    if (!business || !business.address) {
      return;
    }
    const url = this.getGeolocationURL(business);
    const res = await this.sendQuery(url);
    this.updateData(res, business._id);
  }

  private getGeolocationURL(business: IBusiness): string {
    const { street, streetNumber, zip, city, state, country } = business.address;

    let url = `${this.getCoordsURL}`;
    if (street && streetNumber) url += `${this.normalizeString(street)}+${parseFloat(streetNumber)}`;
    url += ',+';
    if (zip) url += `${zip}+`;
    if (city) url += `${this.normalizeString(city)}`;
    url += ',+';
    if (state) url += `${this.normalizeString(state)}`;
    url += ',+';
    if (country) url += `${this.normalizeString(country)}`;

    return url.trim().replace(/\s/g, '+');
  }

  // ! ===============================================
  // Request Handler
  sendQuery(queryURL: string): Promise<IGeoResponseSearch[]> {
    return new Promise((resolve, reject) => {
      https
        .get(queryURL, {}, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        })
        .on('error', (error): void => {
          // eslint-disable-next-line no-console
          console.error(error);
          reject('failed');
        });
    });
  }

  // ! ===============================================
  updateData(response: IGeoResponseSearch[], businessId: string): void {
    const loc = response[0];
    if (loc) {
      const location = {
        type: 'Point',
        coordinates: [parseFloat(loc.lon), parseFloat(loc.lat)],
      };
      Business.findOne({ _id: businessId }).update({ location });
    }

    const newQueue = this.queue.filter((business) => business._id !== businessId);
    this.queue = newQueue;
  }

  private normalizeString(string: string): string {
    const forbidden = ['/', '_', '#', '%', '&', '$', '§', '?'];
    const indexes = forbidden.map((forbiddenCharacter) => {
      return string.indexOf(forbiddenCharacter);
    });
    const sorted = indexes.filter((i) => i !== -1).sort();
    const splitHere = sorted[0];
    return string.split('').slice(0, splitHere).join('');
  }
}

export const geoService = new GeoService();
