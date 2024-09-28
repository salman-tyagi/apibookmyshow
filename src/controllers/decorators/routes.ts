import 'reflect-metadata';

import MetadataKeys from './metadataKeys';
import Methods from './methods';

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

export const post = routerBinder(Methods.Post);
export const get = routerBinder(Methods.Get);
export const patch = routerBinder(Methods.Patch);
export const put = routerBinder(Methods.Put);
export const del = routerBinder(Methods.Delete);
