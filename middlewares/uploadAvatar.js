import multer from "multer";
import path from 'path';

const tmpDir = path.resolve('tmp');

const multiConfig = multer.diskStorage({
    destination: tmpDir,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const uploadAvatar = multer({
    storage: multiConfig,
});

export default uploadAvatar;