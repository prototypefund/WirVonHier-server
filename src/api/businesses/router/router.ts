import { Router } from 'express';
import { businessesController as bc } from '../controller';

export const businessesRouter = Router();

businessesRouter.get(`/businesses`, bc.allBusinesses.bind(bc));
businessesRouter.post(`/businesses`, bc.createBusinesses.bind(bc));
businessesRouter.get(`/businesses/:id`, bc.oneBusiness.bind(bc));
businessesRouter.patch(`/businesses/:id`, bc.updateBusiness.bind(bc));
businessesRouter.delete(`/businesses/:id`, bc.deleteBusiness.bind(bc));

businessesRouter.post(`/businesses/:businessId/images`, bc.createBusinessImage.bind(bc));
businessesRouter.patch(`/businesses/:businessId/images/:imageId`, bc.updateBusinessImage.bind(bc));
businessesRouter.delete(`/businesses/:businessId/images/:imageId`, bc.deleteBusinessImage.bind(bc));

businessesRouter.post(`/businesses/:businessId/videos`, bc.createBusinessVideo.bind(bc));
businessesRouter.patch(`/businesses/:businessId/videos/:videoId`, bc.updateBusinessVideo.bind(bc));
businessesRouter.delete(`/businesses/:businessId/videos/:videoId`, bc.deleteBusinessVideo.bind(bc));
