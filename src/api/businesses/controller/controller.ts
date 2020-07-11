import { Request, Response, RequestHandler } from 'express-serve-static-core';
import Joi from '@hapi/joi';
import { IBusinessesController } from './controller.types';
import { businessesService as bs } from '../service';
import { User, Business } from 'persistance/models';

class BusinessesController implements IBusinessesController {
  [key: string]: import('express').RequestHandler<import('express-serve-static-core').ParamsDictionary>;

  /**
   * Returns all business, optional filtered by query parameters
   *
   * Pagination applies
   */
  public allBusinesses: RequestHandler = async function allBusinesses(req: Request, res: Response): Promise<void> {
    const { query } = req;
    const response = await bs.getFilteredBusinesses(query as { [key: string]: string });
    if (response instanceof Error) return res.status(400).end(response.message);
    return res.status(200).json(response).end();
  };

  /**
   * Creates businesses, returns the created businesses
   */
  public createBusinesses: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const businesses = req.body.businesses;
    const { status, message, createdBusinesses } = await bs.createBusinesses(req.token.id, businesses);
    return res.status(status).json({ message, createdBusinesses }).end();
  };

  /**
   * Returns the business with passed id or nothing
   */
  public oneBusiness: RequestHandler = async function oneBusiness(req: Request, res: Response): Promise<void> {
    const businessId = req.params.id;
    const { status, business } = await bs.getOneBusinessById(businessId);
    if (status >= 400) return res.status(status).end();
    return res.status(status).json(business).end();
  };

  /**
   * Updates the business with passed id, returns nothing
   */
  public updateBusiness: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const businessId = req.params.id;
    const userId = req.token.id;
    const updates = req.body; // TODO: Validate input
    const { status, message, updatedBusiness } = await bs.updateOneBusiness(businessId, userId, updates);
    return res.status(status).json({ message, updatedBusiness }).end();
  };

  /**
   * Deletes the business with passed id, returns nothing
   */
  public deleteBusiness: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) {
      return res.status(401).end();
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      return res.status(403).end();
    }
    const user = await User.findById(req.token.id);
    if (!user) {
      return res.status(401).end();
    }
    const business = await Business.findOne({ id: req.params.id });
    if (!business) {
      return res.status(400).end(`No business with ID: "${req.params.id}" was found.`);
    }
    try {
      await bs.deleteOneBusiness(business, user);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json(error).end();
    }
  };

  /**
   * IMAGES
   */
  public createBusinessImage: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const { businessId } = req.params;
    const userId = req.token.id;
    const schema = Joi.object({
      publicId: Joi.string().required(),
      title: Joi.string().required(),
      businessId: Joi.string().required(),
      description: Joi.string(),
      imageType: Joi.valid('logo', 'profile', 'story'),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(406).end(error.details[0].message);
    const { status, message, image } = await bs.createBusinessImage(businessId, userId, value);
    return res.status(status).json({ message, image }).end();
  };

  public updateBusinessImage: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const userId = req.token.id;
    const { businessId, imageId } = req.params;
    const schema = Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      uploadVerified: Joi.bool(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(406).end(error.details[0].message);
    const { status, message } = await bs.updateBusinessImage(businessId, userId, imageId, value);
    return res.status(status).json({ message }).end();
  };

  public deleteBusinessImage: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const userId = req.token.id;
    const { businessId, imageId } = req.params;
    const { status, message } = await bs.deleteBusinessImage(businessId, userId, imageId);
    return res.status(status).json({ message }).end();
  };

  /**
   * VIDEOS
   */
  public createBusinessVideo: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const { businessId } = req.params;
    const userId = req.token.id;
    const schema = Joi.object({
      size: Joi.number().greater(0).required(),
      title: Joi.string().required(),
      description: Joi.string().allow(''),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(406).end(error.details[0].message);
    }
    const result = await bs.createBusinessVideo({ ...value, businessId, userId });
    if ('error' in result) {
      return res.status(result.status).json(result.error).end();
    }
    res.status(result.status).json(result.data).end();
  };

  public updateBusinessVideo: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const userId = req.token.id;
    const { businessId, videoId } = req.params;
    const schema = Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      status: Joi.valid('uploaded'),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(406).end(error.details[0].message);
    const result = await bs.updateBusinessVideo({ businessId, userId, videoId, ...value });
    if ('error' in result) {
      return res.status(result.status).json(result.error).end();
    }
    res.status(result.status).end();
  };

  public deleteBusinessVideo: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const userId = req.token.id;
    const { businessId, videoId } = req.params;
    const result = await bs.deleteBusinessVideo(businessId, userId, videoId);
    if ('error' in result) {
      return res.status(result.status).json(result.error).end();
    }
    res.status(result.status).end();
  };
}

export const businessesController = new BusinessesController();
