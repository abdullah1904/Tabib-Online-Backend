import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { cloudinary } from "..";
import { getCloudinaryFolderName, getCloudinaryFoldersNames } from "../utils";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|heic|heif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, HEIC, and HEIF images are allowed"));
    }
  },
});

export const uploadImageMiddleware =
  (uploadType: 'SIGN_UP' | 'PROFILE_UPDATE') =>
    (req: Request, res: Response, next: NextFunction) => {
      upload.single("image")(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
            return next(new Error("File size exceeds 5 MB"));
          }
          return next(err);
        }

        if (!req.file) {
          return next();
        }
        const folderName = getCloudinaryFolderName(uploadType);
        try {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folderName },
            (error, result) => {
              if (error || !result) {
                return next(new Error("Cloudinary upload failed"));
              }
              if (uploadType === 'SIGN_UP') {
                req.body.verificationDocumentURL = result.secure_url;
              }
              if (uploadType === 'PROFILE_UPDATE') {
                req.body.imageURL = result.secure_url;
              }

              (req as any).uploadedFilePublicId = result.public_id;

              // Hook cleanup on request end
              const cleanup = async (err?: any) => {
                if (err || res.statusCode >= 400) {
                  const publicId = (req as any).uploadedFilePublicId;
                  if (publicId) {
                    await cloudinary.uploader.destroy(publicId).catch(() => { });
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

export const uploadMultipleImagesMiddleware =
  (uploadType: 'DOCTOR_SIGNUP') =>
    (req: Request, res: Response, next: NextFunction) => {
      upload.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 }
      ])(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
            return next(new Error("File size exceeds 5 MB"));
          }
          return next(err);
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (!files || (!files.image1 && !files.image2)) {
          return next();
        }

        const folders = getCloudinaryFoldersNames(uploadType);

        try {
          const uploadedPublicIds: string[] = [];
          const uploadPromises: Promise<void>[] = [];

          // Upload image1
          if (files.image1 && files.image1[0]) {
            const promise = new Promise<void>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: folders[0] },
                (error, result) => {
                  if (error || !result) {
                    reject(new Error("Cloudinary upload failed for image1"));
                  } else {
                    // Set field names based on uploadType
                    if (uploadType === 'DOCTOR_SIGNUP') {
                      req.body.pmdcLicenseDocumentURL = result.secure_url;
                    }
                    uploadedPublicIds.push(result.public_id);
                    resolve();
                  }
                }
              );
              uploadStream.end(files.image1[0].buffer);
            });
            uploadPromises.push(promise);
          }

          // Upload image2
          if (files.image2 && files.image2[0]) {
            const promise = new Promise<void>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: folders[1] },
                (error, result) => {
                  if (error || !result) {
                    reject(new Error("Cloudinary upload failed for image2"));
                  } else {
                    // Set field names based on uploadType
                    if (uploadType === 'DOCTOR_SIGNUP') {
                      req.body.verificationDocumentURL = result.secure_url;
                    }
                    uploadedPublicIds.push(result.public_id);
                    resolve();
                  }
                }
              );
              uploadStream.end(files.image2[0].buffer);
            });
            uploadPromises.push(promise);
          }

          // Wait for all uploads to complete
          await Promise.all(uploadPromises);

          (req as any).uploadedFilePublicIds = uploadedPublicIds;

          // Hook cleanup on request end
          const cleanup = async (err?: any) => {
            if (err || res.statusCode >= 400) {
              const publicIds = (req as any).uploadedFilePublicIds as string[];
              if (publicIds && publicIds.length > 0) {
                await Promise.all(
                  publicIds.map(id => cloudinary.uploader.destroy(id).catch(() => { }))
                );
              }
            }
          };

          res.on("finish", () => cleanup());
          res.on("error", (err) => cleanup(err));

          next();
        } catch (error) {
          // Clean up any uploaded files if there's an error
          const publicIds = (req as any).uploadedFilePublicIds as string[];
          if (publicIds && publicIds.length > 0) {
            await Promise.all(
              publicIds.map(id => cloudinary.uploader.destroy(id).catch(() => { }))
            );
          }
          return next(new Error("Failed to upload images"));
        }
      });
    };