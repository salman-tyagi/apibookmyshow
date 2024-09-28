import { IMovieSchema, IUserSchema, ICinemaSchema } from './interfaces';

export enum ResStatus {
  Success = 'success',
  Fail = 'fail',
  Error = 'error'
}

export type ResData =
  | Partial<IUserSchema>
  | IUserSchema[]
  | Partial<IMovieSchema>
  | IMovieSchema[]
  | ICinemaSchema
  | ICinemaSchema[];
