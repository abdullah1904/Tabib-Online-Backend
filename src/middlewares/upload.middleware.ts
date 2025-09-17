// middlewares/uploadImageMiddleware.ts
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { cloudinary } from "..";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2.5 * 1024 * 1024 }, // 2.5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG images are allowed"));
    }
  },
}).single("image");

export const uploadImageMiddleware =
  (uploadType: 'SIGN_UP') =>
  (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return next(new Error("File size exceeds 2.5 MB"));
        }
        return next(err);
      }

      if (!req.file) {
        return next(new Error("No file uploaded"));
      }

      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "tabib-online" },
          (error, result) => {
            if (error || !result) {
              return next(new Error("Cloudinary upload failed"));
            }
            if (uploadType === 'SIGN_UP'){
                req.body.verificationDocumentURL = result.secure_url;
            }

            // Save for cleanup if request fails
            (req as any).uploadedFilePublicId = result.public_id;

            // Hook cleanup on request end
            const cleanup = async (err?: any) => {
              if (err || res.statusCode >= 400) {
                const publicId = (req as any).uploadedFilePublicId;
                if (publicId) {
                  await cloudinary.uploader.destroy(publicId).catch(() => {});
                }
              }
            };

            res.on("finish", () => cleanup());
            res.on("error", (err) => cleanup(err));

            next();
          }
        );

        uploadStream.end(req.file.buffer);
      } catch (error) {
        return next(new Error("Failed to upload image"));
      }
    });
  };
