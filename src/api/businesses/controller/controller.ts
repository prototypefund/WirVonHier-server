import { Request, Response, RequestHandler } from 'express-serve-static-core';
import Joi from 'joi';
import { IBusinessesController } from './controller.types';
import { businessesService as bs } from '../service';
import { User, Business } from 'persistance/models';
import { ICreateBusinessImagePayload, IUpdateBusinessImagePayload } from '../service/service.types';

class BusinessesController implements IBusinessesController {
  [key: string]: import('express').RequestHandler<import('express-serve-static-core').ParamsDictionary>;

  /**
   * Returns all business, optional filtered by query parameters
   *
   * Pagination applies
   */
  public allBusinesses: RequestHandler = async function allBusinesses(req: Request, res: Response): Promise<void> {
    const { query } = req;
    const response = await bs.getFilteredBusinesses(query);
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

  public createBusinessImage: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const { businessId } = req.params;
    const userId = req.token.id;
    const schema = {
      publicId: Joi.string().required(),
      title: Joi.string().required(),
      businessId: Joi.string().required(),
      description: Joi.string(),
      imageType: Joi.valid('logo', 'profile', 'story'),
    };
    const { error, value } = Joi.validate<ICreateBusinessImagePayload>(req.body, schema);
    if (error) return res.status(406).end(error.details[0].message);
    const { status, message, image } = await bs.createBusinessImage(businessId, userId, value);
    return res.status(status).json({ message, image }).end();
  };

  public updateBusinessImage: RequestHandler = async (req, res): Promise<void> => {
    if (!req.token) return res.status(401).end();
    const userId = req.token.id;
    const { businessId, imageId } = req.params;
    const schema = {
      title: Joi.string(),
      description: Joi.string(),
      uploadVerified: Joi.bool(),
    };
    const { error, value } = Joi.validate<IUpdateBusinessImagePayload>(req.body, schema);
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
}

export const businessesController = new BusinessesController();
