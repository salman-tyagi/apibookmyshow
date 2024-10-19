import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

import AppError from '../utils/AppError';

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

const acceptImages = ['png', 'jpg', 'jpeg', 'webp'];

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const fileExt = file.mimetype.split('/').at(-1);
  const message = `Only ${acceptImages.join(', ')} image allowed!`;

  if (fileExt && !acceptImages.includes(fileExt)) {
    cb(new AppError(message, 400));
  } else cb(null, true);
}

const upload = multer({ storage, fileFilter });

export default upload;
