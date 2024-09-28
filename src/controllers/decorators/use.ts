import { RequestHandler } from 'express';
import 'reflect-metadata';

import MetadataKeys from './metadataKeys';

export const use = (middleware: RequestHandler): MethodDecorator => {
  return (
    target: Object,
    key: string | symbol,
    desc: PropertyDescriptor
  ): void => {
    const middlewares =
      Reflect.getMetadata(MetadataKeys.Middleware, target, key) || [];

    Reflect.defineMetadata(
      MetadataKeys.Middleware,
      [middleware, ...middlewares],
      target,
      key
    );
  };
};
