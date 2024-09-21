import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

const { NODE_ENV, PORT, DB } = process.env;

import './controllers/AuthController';
import { router } from './controllers/decorators';
import AppError from './utils/AppError';
import globalErrorMiddleware from './middlewares/globalErrorMiddleware';

class App {
  private app: express.Express = express();

  constructor() {
    this.connectDB();

    this.app.use(morgan('dev'));
    this.app.use(express.json());

    this.app.use('/api/v1', router);

    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      return next(new AppError(`${req.originalUrl} does not exist`, 404));
    })

    this.app.use(globalErrorMiddleware);

    this.app.listen(Number(PORT), 'localhost', () => {
      console.log(`Listening on the port ${PORT} in ${NODE_ENV}`);
    });
  }

  private async connectDB() {
    try {
      await mongoose.connect(DB!);
      mongoose.set({ debug: true });

      console.log('DB connected successfully');
    } catch (err) {
      console.log(err);
    }
  }
}

new App();
