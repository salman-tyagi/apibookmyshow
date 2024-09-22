import 'reflect-metadata';
import express, { RequestHandler } from 'express';

import Methods from './methods';
import MetadataKeys from './metadataKeys';
import validateBody from '../../middlewares/validateBody';
import validateParams from '../../middlewares/validateParams';

export const router = express.Router();

export const controller = (prefix: string): ClassDecorator => {
  return (target: Function): void => {
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

      const bodyProps: string[] =
        Reflect.getMetadata(MetadataKeys.Validator, target.prototype, key) ||
        [];

      const paramProps: string[] =
        Reflect.getMetadata(MetadataKeys.Params, target.prototype, key) || [];

      const validateBodyProps = validateBody(bodyProps);
      const validateParamProps = validateParams(paramProps);
      middlewares = [validateParamProps, validateBodyProps, ...middlewares];

      // prefix === '/movies' &&
      //   console.log({
      //     method,
      //     prefix,
      //     path,
      //     bodyProps,
      //     paramProps,
      //     validateParamProps,
      //     validateBodyProps,
      //     middlewares
      //   });

      if (path) {
        router[method](`${prefix}${path}`, ...middlewares, handler);
      }
    }
  };
};
