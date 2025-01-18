import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import sanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit, { Options } from 'express-rate-limit';

import './controllers/AuthController';
import './controllers/UserController';
import './controllers/MovieController';
import './controllers/TheatreController';
import './controllers/ReleaseController';
import './controllers/BookingController';
import './controllers/ReviewController';
import './controllers/CityController';

import { router } from './controllers/decorators';

import AppError from './utils/AppError';
import globalErrorMiddleware from './middlewares/globalErrorMiddleware';

class App {
  private app: express.Express = express();

  private corsOptions: CorsOptions = {
    origin:
      process.env.NODE_ENV === 'development'
        ? ['http://localhost:5173', 'http://salman.io']
        : 'https://build-bookmyshow.onrender.com'
  };

  private limiterOptions: Partial<Options> = {
    windowMs: 24 * 60 * 60 * 1000,
    limit: 1000,
    message: 'Too many requests, allowed 1000 requests per day.'
  };

  constructor() {
    this.connectDB();

    this.app.use(helmet());
    this.app.use(morgan('dev'));
    this.app.use(rateLimit(this.limiterOptions));
    this.app.use(express.json({ limit: '5kb' }));
    this.app.use(hpp());
    this.app.use(sanitize());
    this.app.use(cors(this.corsOptions));

    this.app.get(
      '/',
      async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
          return res.send(
            `<h2 style='text-align: center;'>${new Date(
              '2024-09-19T23:45'
            )}</h2>`
          );
        } catch (err) {
          next(err);
        }
      }
    );

    this.app.use('/api/v1', router);

    this.app.all(
      '*',
      (req: Request, res: Response, next: NextFunction): void => {
        return next(new AppError(`${req.originalUrl} does not exist`, 404));
      }
    );

    this.app.use(globalErrorMiddleware);

    this.app.listen(Number(process.env.PORT!), '0.0.0.0', () => {
      console.log(
        `Listening on the port ${process.env.PORT!} in ${process.env.NODE_ENV}`
      );
    });
  }

  private async connectDB() {
    try {
      const DB =
        process.env.NODE_ENV === 'development'
          ? process.env.DB!
          : process.env.DB!;

      await mongoose.connect(DB);
      if (process.env.NODE_ENV === 'development') mongoose.set({ debug: true });

      console.log('DB connected successfully');
    } catch (err) {
      console.log(err);
    }
  }
}

new App();
