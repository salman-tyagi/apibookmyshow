import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, destination: string) => void
  ) => {
    cb(null, 'public/images/');
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, filename: string) => void
  ) => {
    const { fieldname, originalname } = file;
    const [img, ext] = originalname.split('.');

    cb(null, `${fieldname}-${img}-${Date.now()}.${ext}`);
  }
});

const upload = multer({ storage });

export default upload;
