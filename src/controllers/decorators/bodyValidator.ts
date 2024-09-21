import 'reflect-metadata';

import MetadataKeys from './metadataKeys';

export const bodyValidator = (...props: string[]): MethodDecorator => {
  return (
    target: Object,
    key: string | symbol,
    desc: PropertyDescriptor
  ): void => {
    Reflect.defineMetadata(MetadataKeys.Validator, props, target, key);
  };
};
