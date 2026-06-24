import multer from "multer";

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, "./public/temp");
  },
  filename: (_req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

export { upload };
