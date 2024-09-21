import 'reflect-metadata';

import MetadataKeys from './metadataKeys';

type Callback = (path: string) => MethodDecorator;

const routerBinder = (method: string): Callback => {
  return (path: string): MethodDecorator => {
    return (
      target: Object,
      key: string | symbol,
      desc: PropertyDescriptor
    ): void => {
      Reflect.defineMetadata(MetadataKeys.Path, path, target, key);
      Reflect.defineMetadata(MetadataKeys.Method, method, target, key);
    };
  };
};

export const post = routerBinder('post');
