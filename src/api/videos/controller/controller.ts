import { Request, Response } from 'express-serve-static-core';
import { videoService } from 'modules/services';
import Joi from 'joi';
import { ICreateVideoBody, IDeleteVideoParams, IGetVideoUrl } from './controller.types';

export class VideosController {
  async uploadVideo(req: Request, res: Response): Promise<void> {
    const userId = req.token && (req.token.id as string);
    if (!userId) {
      return res.status(401).end('Not authenticated.');
    }
    const schema = Joi.object({
      size: Joi.number().greater(0).required(),
      title: Joi.string().required(),
      description: Joi.string().allow(''),
    });
    const { error, value } = schema.validate<ICreateVideoBody>(req.body);
    if (error) {
      return res.status(406).end(error.message);
    }
    const { businessId } = req.params;
    if (!businessId || typeof businessId !== 'string') {
      return res.status(406).end('No valid business-id specified.');
    }
    const result = await videoService.createVideo({ ...value, businessId, userId });
    if ('error' in result) {
      return res.status(result.status).json(result.error).end();
    }
    res.status(result.status).json(result.data);
  }

  async deleteVideo(req: Request, res: Response): Promise<void> {
    const userId = req.token && (req.token.id as string);
    if (!userId) {
      return res.status(401).end('Not authenticated.');
    }
    const schema = Joi.object({
      businessId: Joi.string().required(),
      videoId: Joi.string().required(),
    });
    const { error, value } = schema.validate<IDeleteVideoParams>((req.params as unknown) as IDeleteVideoParams);
    if (error) {
      return res.status(406).end(error.message);
    }
    const result = await videoService.deleteVideo({ ...value, userId });
    if ('error' in result) {
      return res.status(result.status).json(result.error).end();
    }
    res.status(result.status).json(result.data);
  }

  async getVideoUrl(req: Request, res: Response): Promise<void> {
    // eslint-disable-next-line no-console
    if (!req.query.videoId) {
      return res.status(406).end('No valid videoId specified');
    }
    const schema = Joi.object({
      videoId: Joi.string().required(),
    });
    const { error, value } = schema.validate<IGetVideoUrl>((req.query as unknown) as IDeleteVideoParams);
    if (error) {
      return res.status(406).end(error.message);
    }
    const result = await videoService.getVideoUrl(value.videoId);
    if ('error' in result) {
      return res.status(result.status).json(result.error).end();
    }
    res.status(result.status).json(result.data);
  }
}

export const videosController = new VideosController();
