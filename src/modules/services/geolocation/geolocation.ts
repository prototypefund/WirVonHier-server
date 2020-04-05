import { IBusiness, Business } from '../../../persistance/models';

// TODO Write Geolocation Service
export class GeoService {
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
  static async patchLocations(businesses: IBusiness[]): Promise<void> {
    for (const business of businesses) {
      const coordinates = await this.addressToCoordinates(business.address);
      const location = {
        type: 'Point',
        coordinates,
      };
      Business.findOneAndUpdate({ _id: business._id }, { location });
      //// GlobalEventEmitter.emit('business_localized'); // Event for modules/subscribers
    }
  }
  // * Convert a address to coordinates; return [lat, lon];
  static async addressToCoordinates(address: Record<string, string>): Promise<number[]> {
    // 'street+streetNr,+zip+city,+state,+country'
    const query =
      address.street +
      '+' +
      address.streetNumber +
      ',+' +
      address.zip +
      '+' +
      address.city +
      ',+' +
      address.state +
      ',+' +
      address.country;
    // Regex Pattern /\s/g : Find all whitespace occurrences within a string
    const response = await this.sendQuery(this.getCoordsURL + query.trim().replace(/\s/g, '+'));
    const latLon = [response[0].lat, response[0].lon];

    // query latlng from response +
    // add lat,lng to IBusiness with id

    //
    return latLon;
  }
  // * Request Handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async sendQuery(queryURL: string): Promise<any[]> {
    // Add Job Request Handler for GeoService
    // send req 1 per sec
    const xhr = new XMLHttpRequest();

    xhr.open('GET', queryURL);
    xhr.send();

    // xhr.onload = (): void => {
    //   if (xhr.status == 200) {
    //     const data = JSON.parse(xhr.responseText);
    //     // search database for entry =name, add lat, lon
    //     data;
    //   }
    // };
    return await xhr.response;
  }
}

// ! Response of /search?q=
/* 

HTTP/1.1 200 OK
Date: Sun, 05 Apr 2020 00:52:27 GMT
Server: Apache/2.4.29 (Ubuntu)
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: OPTIONS,GET
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Expect-CT: max-age=0, report-uri="https://openstreetmap.report-uri.com/r/d/ct/reportOnly"
Upgrade: h2
Connection: Upgrade, close
Transfer-Encoding: chunked
Content-Type: application/json; charset=UTF-8

[
  {
    "place_id": 59126144,
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
    "osm_type": "node",
    "osm_id": 4924382183,
    "boundingbox": [
      "49.4460499",
      "49.4461499",
      "11.062586",
      "11.062686"
    ],
    "lat": "49.4460999",
    "lon": "11.062636",
    "display_name": "55, Gostenhofer Hauptstraße, Gostenhof, Nürnberg, Bayern, 90443, Deutschland",
    "class": "place",
    "type": "house",
    "importance": 0.21100000000000002,
    "address": {
      "house_number": "55",
      "road": "Gostenhofer Hauptstraße",
      "neighbourhood": "Gostenhof",
      "suburb": "Gostenhof",
      "city": "Nürnberg",
      "state": "Bayern",
      "postcode": "90443",
      "country": "Deutschland",
      "country_code": "de"
    }
  }
]


*/

// Worker job
/*
const sendRequestsToGeocoder = function (requestArr: string[]): void {
  requestArr.forEach((req) => {
    setTimeout(() => {
      const xhr = new XMLHttpRequest();
      xhr.onload = (): void => {
        if (xhr.status != 200) {
          // analyze HTTP status of the response
          console.error(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else {
          const data = JSON.parse(xhr.responseText);
          // search database for entry =name, add lat, lon
          data;
        }
      };
      // xhr.onprogress = function (event): void {
      //   // triggers periodically
      //   // event.loaded - how many bytes downloaded
      //   console.info(`Received ${event.loaded} bytes`);
      // };
      // only triggers if the request couldn't be made at all
      xhr.onerror = function (): void {
        console.error('Error ' + xhr.status + ': ' + 'xhr.statusText');
      };
      xhr.open('GET', req);
      xhr.send();
    }, 1000);
  });
};
*/
