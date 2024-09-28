import 'reflect-metadata';
import MetadataKeys from './metadataKeys';

export const paramsValidator = (...parameters: string[]): MethodDecorator => {
  return (
    target: Object,
    key: string | symbol,
    desc: PropertyDescriptor
  ): void => {
    const params: string[] =
      Reflect.getMetadata(MetadataKeys.Params, target, key) || [];

    Reflect.defineMetadata(
      MetadataKeys.Params,
      [...params, ...parameters],
      target,
      key
    );
  };
};
