import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';

import './controllers/AuthController';
import './controllers/UserController';
import './controllers/MovieController';
import './controllers/TheatreController';
import './controllers/ReleaseController';
import './controllers/BookingController';
import './controllers/ReviewController';

import { router } from './controllers/decorators';

import AppError from './utils/AppError';
import globalErrorMiddleware from './middlewares/globalErrorMiddleware';

class App {
  private app: express.Express = express();

  constructor() {
    this.connectDB();

    this.app.use(helmet());
    this.app.use(morgan('dev'));
    this.app.use(express.json());

    this.app.use('/api/v1', router);

    this.app.all('*', (req: Request, res: Response, next: NextFunction): void => {
      return next(new AppError(`${req.originalUrl} does not exist`, 404));
    });

    this.app.use(globalErrorMiddleware);

    this.app.listen(Number(process.env.PORT), 'localhost', () => {
      console.log(
        `Listening on the port ${process.env.PORT} in ${process.env.NODE_ENV}`
      );
    });
  }

  private async connectDB() {
    try {
      await mongoose.connect(process.env.DB!);
      mongoose.set({ debug: true });

      console.log('DB connected successfully');
    } catch (err) {
      console.log(err);
    }
  }
}

new App();
