import multer from "multer";
import path from "path";


const tempDestination = path.resolve("tmp");

const multerConfig = multer.diskStorage({
  destination: tempDestination,
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: multerConfig
});

export default upload;
