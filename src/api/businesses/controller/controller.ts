import { Request, Response, RequestHandler } from 'express-serve-static-core';
import { IBusinessesController } from './controller.types';
import { businessesService as bs } from '../service';

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
    if (req.token) {
      res.status(401);
      return;
    }
    const businesses = req.body.businesses; // TODO: Validate input
    const createdBusinesses = await bs.createBusinesses(businesses);
    res.status(200).json(createdBusinesses);
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
    if (req.token) {
      res.status(401);
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
    if (req.token) {
      res.status(401);
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
