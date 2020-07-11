/* eslint-disable no-console */
import { IBusiness, User, Business, Location } from 'persistance/models';
import cryptoRandomString from 'crypto-random-string';
import Joi from '@hapi/joi';
// import { mailService } from '../../services/mail';
import { transformDataService } from '../../services/transformData';
import { IDataImportBody, IDataImportResponse } from './dataImportService.types';
import { Types } from 'mongoose';

export class DataImportService {
  public async businessImport(body: IDataImportBody): Promise<IDataImportResponse> {
    const schema = Joi.object({
      type: Joi.string().allow(['csv', 'json']),
      businesses: Joi.required(),
    });
    const { error, value } = schema.validate(body);
    if (error) {
      return { status: 400, message: error.details[0].message };
    }
    const { businesses, type } = value;
    switch (type) {
      case 'csv': {
        return this.handleCSVImport(businesses);
      }
      case 'json': {
        return this.handleJSONImport(businesses);
      }
      default: {
        return { status: 400, message: `Request not understood.` };
      }
    }
  }

  public async handleCSVImport(businesses: unknown): Promise<IDataImportResponse> {
    let jsonBusinesses: Array<{ [key: string]: string }> = [];
    try {
      jsonBusinesses = await transformDataService.parseCSV(businesses as string);
    } catch (e) {
      return {
        status: 400,
        message:
          'Body could not be paresed. Ensure "businesses" are valid CSV with separator "\t" if type: "csv" is passed.',
      };
    }
    if (!(jsonBusinesses instanceof Array)) jsonBusinesses = [jsonBusinesses];

    const transformedBusinesses: Partial<IBusiness>[] = jsonBusinesses.map((data) => {
      return {
        id: data.id,
        name: data.name,
        ownerFirstName: data['owner.firstName'],
        ownerLastName: data['owner.lastName'],
        website: data.homepage,
        onlineShop: data.onlineShop,
        phone: data.phone,
        whatsApp: data.whatsApp !== 'nein' ? data.whatsApp : '',
        instagram: data.instagram !== 'nein' ? `${data.instagram}` : '',
        facebook: data.facebook !== 'nein' ? `https://web.facebook.de/${data.facebook}` : '',
        email: data.email,
        otherContacts: data.otherContacts,
        address: {
          street: data.street,
          streetNumber: data.streetNumber,
          zip: data.zip,
          city: data.city,
          state: data.state,
          country: data.country || 'DE',
        },
        dataProtStatement: data['DSGVO Bestätigung'] === 'OK',
        coordinates: data.coordinates.split(','),
        description: data.description,
        delivery: [
          ['ja', 'Ja', 'JA'].includes(data['delivery.collect']) && 'collect',
          ['ja', 'Ja', 'JA'].includes(data['delivery.byOwner']) && 'deliveryByOwner',
          ['ja', 'Ja', 'JA'].includes(data['delivery.byService']) && 'deliveryByService',
        ].filter(Boolean) as string[],
        category: data.category.split(','),
        paymentMethods: [
          ['ja', 'Ja', 'JA'].includes(data['paymentMethods.invoice']) && 'invoice',
          ['ja', 'Ja', 'JA'].includes(data['paymentMethods.paypal']) && 'paypal',
          ['ja', 'Ja', 'JA'].includes(data['paymentMethods.creditcard']) && 'creditcard',
          ['ja', 'Ja', 'JA'].includes(data['paymentMethods.cash']) && 'cash',
          ['ja', 'Ja', 'JA'].includes(data['paymentMethods.onDelivery']) && 'ondelivery',
          ['ja', 'Ja', 'JA'].includes(data['paymentMethods.sofort']) && 'sofort',
          ['ja', 'Ja', 'JA'].includes(data['paymentMethods.amazon']) && 'amazon',
        ].filter(Boolean) as string[],
      };
    });

    return this.handleImport(transformedBusinesses);
  }

  async handleJSONImport(businesses: unknown): Promise<IDataImportResponse> {
    let jsonBusinesses = businesses as IBusiness[];
    try {
      if (typeof jsonBusinesses === 'string') jsonBusinesses = JSON.parse(businesses as string);
    } catch (e) {
      return {
        status: 400,
        message: 'Body could not be paresed. Ensure "businesses" are valid JSON if type: "json" is passed.',
      };
    }
    if (!(jsonBusinesses instanceof Array)) jsonBusinesses = [jsonBusinesses];

    return this.handleImport(jsonBusinesses);
  }

  public async handleImport(jsonBusinesses: Partial<IBusiness>[]): Promise<IDataImportResponse> {
    const ownerEmails = jsonBusinesses.map((business) => business.email) as string[];
    const ownerIds = await this.getOwnerIds(ownerEmails);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const coordinates = jsonBusinesses.map((business) => (business as any).coordinates);
    // const locations = await this.getLocations(coordinates);
    const newBusinesses = jsonBusinesses.map((business, i) => {
      business.owner = ownerIds[i];
      // business.location = locations[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (business as any).coordinates;
      return business;
    }) as IBusiness[];
    try {
      for (const business of newBusinesses) {
        let b = await Business.findOne({ id: business.id });
        if (!b) {
          b = await Business.create(business);
        }
        if (b) {
          const owner = await User.findById(b.owner);
          if (owner && !owner.businesses.includes(business._id)) {
            owner.businesses.push(b._id);
            owner.save();
          }
        }
      }
      return { status: 201 };
    } catch (e) {
      console.log('Error: ', e);
      return { status: 400, message: e.message };
    }
  }

  async getOwnerIds(emails: string[]): Promise<Types.ObjectId[]> {
    const ownerIds = [];
    for (const email of emails) {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          password: cryptoRandomString({ length: 16 }),
          acceptedDataProtStatements: ['5e8c68d554213b1c0beb61dc'],
        });
        user.save();
      }
      ownerIds.push(user._id);
    }
    return ownerIds;
  }
  async getLocations(coordinates: number[][]): Promise<Types.ObjectId[]> {
    const locations = [];
    for (const pair of coordinates) {
      let location = await Location.findOne({ geo: { type: 'Point', coordinates: [pair[1], pair[0]] } });
      if (!location) {
        location = new Location({ geo: { type: 'Point', coordinates: [pair[1], pair[0]] } });
        await location.save();
      }
      locations.push(location._id);
    }
    return locations;
  }
}

export const dataImportService = new DataImportService();
