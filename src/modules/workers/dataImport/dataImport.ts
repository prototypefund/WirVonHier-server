/* eslint-disable */
// import * as fs from 'fs';
// import * as path from 'path';
import { Business } from 'persistance/models';

export const dataImport = async function (allData?: any): Promise<void> {
  // const rawData = fs.readFileSync(path.resolve(__dirname, './dummyData.json'));
  // let data = JSON.parse(rawData as unknown as string);
  for (const data of allData) {
    const transformed = {
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
        ['ja','Ja','JA'].indexOf(data.deliveryCollect) !== -1 && 'collect',
        ['ja','Ja','JA'].indexOf(data.deliveryByOwner) !== -1 && 'deliveryByOwner',
        ['ja','Ja','JA'].indexOf(data.deliveryByService) !== -1 && 'deliveryByService',
      ].filter(Boolean),
      category: data.category,
      paymentMethods: [
        ['ja','Ja','JA'].indexOf(data.paymentInvoice) !== -1 && 'invoice',
        ['ja','Ja','JA'].indexOf(data.paymentPaypal) !== -1 && 'paypal',
        ['ja','Ja','JA'].indexOf(data.paymentCreditcard) !== -1 && 'creditcard',
        ['ja','Ja','JA'].indexOf(data.paymentCash) !== -1 && 'cash',
        ['ja','Ja','JA'].indexOf(data.paymentOnDelivery) !== -1 && 'ondelivery',
        ['ja','Ja','JA'].indexOf(data.paymentSofort) !== -1 && 'sofort',
        ['ja','Ja','JA'].indexOf(data.paymentAmazon) !== -1 && 'amazon',
      ].filter(Boolean),
    }

    try {
      await Business.create(transformed)
    } catch (e) {
      console.log("Error in DataImport: ", e);
    }
  };
};
