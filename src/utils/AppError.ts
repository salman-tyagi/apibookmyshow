import { ResponseStatus } from '../types';

class AppError extends Error {
  status: string;
  isOperational: boolean;

  constructor(public message: string, public statusCode: number) {
    super(message);

    this.status = `${statusCode}`.startsWith('4')
      ? ResponseStatus.Fail
      : ResponseStatus.Error;
    this.isOperational = true;
  }
}

export default AppError;
