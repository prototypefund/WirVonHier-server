/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import fs from 'fs';
import cloudinary from 'cloudinary';
import { config } from 'config';
import { Business, Image } from 'persistance/models';

const cloud = cloudinary.v2;
cloud.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

function uploadImage(path: string): void {
  cloud.uploader.upload(path, async (error: any, result: { [key: string]: string }) => {
    if (error) {
      console.log(error);
      return;
    }
    // create Image db Entry;
    const fileName = path.split('.')[0].split('/').pop() as string;
    const businessId = fileName.split('_')[1];
    const imageType = fileName.split('_')[2];
    const image = await Image.create({
      title: businessId,
      src: result.url,
      publicId: result.public_id,
    });
    const business = await Business.findOne({ id: businessId });
    if (!business) return;
    if (imageType.includes('Logo')) {
      business.media.logo = image._id;
      await business.save();
      console.log('saved as Logo');
    }
    if (imageType.includes('Hauptbild')) {
      business.media.profile = image._id;
      await business.save();
    }
    if (imageType.includes('Story')) {
      await image.save();
      business.media.stories.images.push(image._id);
      await business.save();
    }
  });
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function mediaUpload(base = '/home/marcroemmelt/Downloads/upload'): Promise<void> {
  fs.readdir(base, (_err, filenames) => {
    for (const filename of filenames) {
      const newPath = `${base}/${filename}`;
      const exists = fs.existsSync(newPath);
      if (!exists) continue;
      const isDir = fs.lstatSync(newPath).isDirectory();
      if (isDir) {
        mediaUpload(newPath);
        continue;
      }
      uploadImage(newPath);
    }
  });
}
