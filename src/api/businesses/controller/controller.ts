import { Request, Response, RequestHandler } from 'express-serve-static-core';
import { IBusinessesController } from './controller.types';
import { businessesService as bs } from '../service';
import { User } from 'persistance/models';
import { dataImportService } from 'modules/services';

class BusinessesController implements IBusinessesController {
  [key: string]: import('express').RequestHandler<import('express-serve-static-core').ParamsDictionary>;

  /**
   * Returns all business, optional filtered by query parameters
   *
   * Pagination applies
   */
  public allBusinesses: RequestHandler = async function allBusinesses(req: Request, res: Response): Promise<void> {
    const { query } = req;
    const { businesses, error } = await bs.getFilteredBusinesses(query);
    if (error) {
      res.status(400).send(error.message);
    }
    res.status(200).json(businesses);
  };

  /**
   * Creates businesses, returns the created businesses
   */
  public createBusinesses: RequestHandler = async function createBusinesses(
    req: Request,
    res: Response,
  ): Promise<void> {
    if (!req.token) {
      res.status(401);
      return;
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      res.status(403);
      return;
    }
    const user = await User.findById(req.token.id);
    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return;
    }
    if (req.query && req.query['data-import']) {
      if (!user.roles.includes('admin')) {
        res.status(403);
        return;
      }
      try {
        const result = await dataImportService.businessImport(req.body);
        res.status(result.status).json(result);
      } catch (e) {
        res.status(400).json(e);
      }
    }
    const businesses = req.body.businesses; // TODO: Validate input
    const createdBusinesses = await bs.createBusinesses(user, businesses);
    res.status(201).json(createdBusinesses);
  };

  /**
   * Returns the business with passed id or nothing
   */
  public oneBusiness: RequestHandler = async function oneBusiness(req: Request, res: Response): Promise<void> {
    const businessId = req.params.id;
    const business = await bs.getOneBusinessById(businessId);
    res.status(200).json(business);
  };

  /**
   * Updates the business with passed id, returns nothing
   */
  public updateBusiness: RequestHandler = async function updateBusiness(req: Request, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401);
      return;
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      res.status(403);
      return;
    }
    const businessId = req.params.id;
    const updates = req.body.business; // TODO: Validate input
    const updatedBusiness = await bs.updateOneBusiness(businessId, updates);
    res.status(200).json(updatedBusiness);
  };

  /**
   * Deletes the business with passed id, returns nothing
   */
  public deleteBusiness: RequestHandler = async function deleteBusiness(req: Request, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401);
      return;
    }
    if (req.token.type && req.token.type === 'changeEmail') {
      res.status(403);
      return;
    }
    const businessId = req.params.id;
    try {
      await bs.deleteOneBusiness(businessId);
      res.status(204);
    } catch (error) {
      res.status(500).json(error);
    }
  };
}

export const businessesController = new BusinessesController();
