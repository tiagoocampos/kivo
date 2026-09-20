import multer from "multer";
import { InvalidImageTypeError } from "../errors/upload/UploadErrors.js";

export default ({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new InvalidImageTypeError());
        }
    }

})
