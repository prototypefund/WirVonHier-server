import Joi from 'joi';
import { imageService as is, ICreateImagePayload, UpdateImagePayload } from 'modules/services';
import { RequestHandler } from 'express';

export class ImagesController {
  public createImages: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token || !req.token.roles || !req.token.roles.includes('admin')) return res.status(401).end();
    const userId = req.token.id;
    const schema = Joi.array().items({
      publicId: Joi.string().required(),
      title: Joi.string().required(),
      businessId: Joi.string().required(),
      description: Joi.string(),
      imageType: Joi.valid('logo', 'profile', 'story'),
    });
    const { error, value } = Joi.validate<ICreateImagePayload[]>(req.body, schema);
    if (error) return res.status(406).end(error.details[0].message);
    const { status, message, images } = await is.createImages(userId, value);
    return res.status(status).json({ message, images }).end();
  };

  public updateImage: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token || !req.token.roles || !req.token.roles.includes('admin')) return res.status(401).end();
    const imageId = req.params.id;
    const schema = {
      _id: Joi.string(),
      title: Joi.string(),
      businessId: Joi.string(),
      description: Joi.string(),
      imageType: Joi.valid('logo', 'profile', 'story'),
      uploadVerified: Joi.bool(),
    };
    const { error, value } = Joi.validate<UpdateImagePayload>(req.body, schema);
    if (error) return res.status(406).end(error.details[0].message);
    const { status, message } = await is.updateImage(imageId, value);
    return res.status(status).json({ message }).end();
  };

  public deleteImage: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token || !req.token.roles || !req.token.roles.includes('admin')) return res.status(401).end();
    const imageId = req.params.id;
    const { status, message } = await is.deleteImage(imageId);
    return res.status(status).json({ message }).end();
  };
}

export const imagesController = new ImagesController();
