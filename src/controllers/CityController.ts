import { NextFunction, Request, Response } from 'express';

import City from '../models/cityModal';

import { bodyValidator, controller, del, get, patch, post, use } from './decorators';

import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';

import AppError from '../utils/AppError';
import ApiFeatures from '../utils/ApiFeatures';
import { ICityReqBody, IReqParamsWithId, IResBody, ResStatus } from '../types';

@controller('/cities')
class CityController {
  @get('/')
  async getAllCities(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const apiFeatures = new ApiFeatures(City.find(), req.query)
        .filter()
        .sort()
        .projection()
        .pagination();

      const cities = await apiFeatures.query;

      return res.status(200).json({
        status: ResStatus.Success,
        result: cities.length,
        data: cities
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/')
  @bodyValidator('city')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async createCity(
    req: Request<{}, {}, ICityReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { city: cityName } = req.body;

      const city = await City.create<ICityReqBody>({ city: cityName });

      return res.status(201).json({
        status: ResStatus.Success,
        data: city
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  async getCity(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide city id', 400));

      const city = await City.findOne({ _id: id });
      if (!city) return next(new AppError('No city found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: city
      });
    } catch (err) {
      next(err);
    }
  }

  @patch('/:id')
  @bodyValidator('city')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async updateCity(
    req: Request<IReqParamsWithId, {}, ICityReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide city id', 400));

      const { city: CityName } = req.body;

      const city = await City.findOneAndUpdate(
        { _id: id },
        { $set: { city: CityName } },
        { new: true, runValidators: true }
      );

      if (!city) return next(new AppError('No city found', 404));

      return res.status(201).json({
        status: ResStatus.Success,
        data: city
      });
    } catch (err) {
      next(err);
    }
  }

  @del('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async deleteCity(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide city id', 400));

      const city = await City.findOneAndDelete({ _id: id });
      if (!city) return next(new AppError('No city found', 404));

      return res.status(204).json({
        status: ResStatus.Success
      });
    } catch (err) {
      next(err);
    }
  }
}

export default CityController;
