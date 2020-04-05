/* eslint-disable */
import * as fs from 'fs';
import * as path from 'path';
import { Business } from 'persistance/models';

export const dataImport = function (): void {
  console.log("hello Inside");
  const rawData = fs.readFileSync(path.resolve(__dirname, './dummyData.json'));
  let data = JSON.parse(rawData as unknown as string);
  data.forEach((data: any) => {
    const {
      geolocation,
      personal_message,
      street,
      city,
      image,
      categories,
      category_tags,
      ...transformed
    } = data;
    transformed.location = {
      type: "Point",
    }
    transformed.location.coordinates = [geolocation.lng, geolocation.lat];
    transformed.address = { street, city };
    transformed.category = [...categories, ...category_tags];
    if (!geolocation.lng || !geolocation.lat) return;
    try {
      const business = new Business(transformed);
      const res = business.save();
      console.log("res: ", res);
    } catch (e) {
      console.log(e);
    }
  });
};
