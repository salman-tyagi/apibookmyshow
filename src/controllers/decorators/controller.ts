import 'reflect-metadata';
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';

import Methods from './methods';
import MetadataKeys from './metadataKeys';
import AppError from '../../utils/AppError';

export const router = express.Router();

const validateBody = (fields: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body) {
      return next(new AppError('Invalid request', 400));
    }

    for (const field of fields) {
      if (!req.body[field]) {
        return next(new AppError(`${field} is required`, 400));
      }
    }

    return next();
  };
};

export const controller = (prefix: string): ClassDecorator => {
  return function (target: Function): void {
    for (const key in target.prototype) {
      const path: string = Reflect.getMetadata(
        MetadataKeys.Path,
        target.prototype,
        key
      );

      const handler: RequestHandler = target.prototype[key];

      const method: Methods = Reflect.getMetadata(
        MetadataKeys.Method,
        target.prototype,
        key
      );

      let middlewares: RequestHandler[] =
        Reflect.getMetadata(MetadataKeys.Middleware, target.prototype, key) ||
        [];

      const validator: string[] = Reflect.getMetadata(
        MetadataKeys.Validator,
        target.prototype,
        key
      );

      const validateProps = validateBody(validator);
      middlewares = [validateProps, ...middlewares];

      // console.log({
      //   method,
      //   prefix,
      //   path,
      //   validator,
      //   validateProps,
      //   middlewares
      // });

      if (path) {
        router[method](`${prefix}${path}`, ...middlewares, handler);
      }
    }
  };
};
