import { IBusiness, User, Business } from 'persistance/models';
import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';
import { transformDataService } from '../transformData';
import { IDataImportBody, IDataImportResponse } from './dataImportService.types';
import { Types } from 'mongoose';

export class DataImportService {
  async businessImport(body: IDataImportBody): Promise<IDataImportResponse> {
    const schema = Joi.object().keys({
      type: Joi.string().allow(['csv', 'json']),
      businesses: Joi.required(),
    });
    const { error, value } = Joi.validate<IDataImportBody>(body, schema);
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

  async handleCSVImport(businesses: unknown): Promise<IDataImportResponse> {
    let jsonBusinesses: Array<{ [key: string]: string }>;
    try {
      jsonBusinesses = transformDataService.parseCSV(businesses as string);
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
        id: data.name.toLowerCase().split(' ').join(),
        name: data.name,
        ownerFirstName: data.ownerFirstName,
        ownerLastName: data.ownerLastName,
        website: data.homepage,
        onlineShop: data.onlineShop,
        phone: data.phone,
        whatsApp: data.whatsapp,
        instagram: data.instagram,
        facebook: data.facebook,
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
        description: data.description,
        delivery: [
          ['ja', 'Ja', 'JA'].includes(data.deliveryCollect) && 'collect',
          ['ja', 'Ja', 'JA'].includes(data.deliveryByOwner) && 'deliveryByOwner',
          ['ja', 'Ja', 'JA'].includes(data.deliveryByService) && 'deliveryByService',
        ].filter(Boolean) as string[],
        category: data.category,
        paymentMethods: [
          ['ja', 'Ja', 'JA'].includes(data.paymentInvoice) && 'invoice',
          ['ja', 'Ja', 'JA'].includes(data.paymentPaypal) && 'paypal',
          ['ja', 'Ja', 'JA'].includes(data.paymentCreditcard) && 'creditcard',
          ['ja', 'Ja', 'JA'].includes(data.paymentCash) && 'cash',
          ['ja', 'Ja', 'JA'].includes(data.paymentOnDelivery) && 'ondelivery',
          ['ja', 'Ja', 'JA'].includes(data.paymentSofort) && 'sofort',
          ['ja', 'Ja', 'JA'].includes(data.paymentAmazon) && 'amazon',
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

  async handleImport(jsonBusinesses: Partial<IBusiness>[]): Promise<IDataImportResponse> {
    const ownerEmails = jsonBusinesses.map((business) => business.email).filter(Boolean) as string[];
    const ownerIds = await this.getOwnerIds(ownerEmails);
    const newBusinesses = jsonBusinesses.map((business, i) => {
      business.owner = ownerIds[i];
      return business;
    }) as IBusiness[];
    try {
      const createdBusinesses = await Business.create(newBusinesses);
      const failed = newBusinesses.filter(
        (business) => !createdBusinesses.some((item) => item.email === business.email),
      );
      return { status: 201, successful: createdBusinesses, failed };
    } catch (e) {
      return { status: 400, message: e.message };
    }
  }

  async getOwnerIds(emails: string[]): Promise<Types.ObjectId[]> {
    const ownerIds = [];
    for (const email of emails) {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email, password: cryptoRandomString({ length: 16 }) });
      }
      ownerIds.push(user._id);
    }
    return ownerIds;
  }
}

export const dataImportService = new DataImportService();
