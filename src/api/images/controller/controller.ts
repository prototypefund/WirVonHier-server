import { Request, Response } from 'express-serve-static-core';
import Joi from 'joi';
import { imageService as is } from 'modules/services';
import { Image } from 'persistance/models';

export class ImagesController {
  /**
   * Returns all user, optional filtered by query parameters
   *
   * Pagination applies
   */
  async confirmImageUpload(req: Request, res: Response): Promise<void> {
    if (!req.token) return res.status(401).end();
    const schema = {
      publicIds: Joi.array().items(Joi.string().required()),
    };
    const { error, value } = Joi.validate<{ publicIds: string[] }>(req.body, schema);
    if (error) {
      res.status(406).end(error.details[0].message);
    }
    const failed = [];
    for (const publicId of value.publicIds) {
      const image = await Image.findOne({ publicId });
      if (!image) {
        failed.push(publicId);
        continue;
      }
      is.cancelCleanupImage(image.id);
    }
    const status = failed.length === 0 ? 200 : 400;
    res.status(status).json({ failed });
  }
}

export const imagesController = new ImagesController();
