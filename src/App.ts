import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

const { NODE_ENV, PORT, DB } = process.env;

class App {
  private app: express.Express = express();

  constructor() {
    this.connectDB();

    this.app.use(morgan('dev'));
    this.app.use(express.json());

    this.app.get('/', (req, res) => console.log('hello world'));

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
