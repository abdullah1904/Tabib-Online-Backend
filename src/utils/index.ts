import jwt from "jsonwebtoken"
import { config } from "./config"
import { createTransport } from "nodemailer";
import { logger } from "./logger";
import { cloudinary } from "..";

const generateJWT = (id: number, type: "ACCESS" | "REFRESH") => {
    if (type === "ACCESS") {
        return jwt.sign({ id }, config.ACCESS_TOKEN_SECRET!, { expiresIn: config.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions)
    }
    else if (type === "REFRESH") {
        return jwt.sign({ id }, config.REFRESH_TOKEN_SECRET!, { expiresIn: config.REFRESH_TOKEN_EXPIRY } as jwt.SignOptions)
    }
}

const deleteCloudinaryImage = async (imageURL: string) => {
    try {
        const parts = imageURL.split("/upload/");
        if (parts.length < 2) {
            throw new Error("Invalid Cloudinary URL");
        }

        const pathAfterUpload = parts[1]
            .split("/")
            .filter((p) => !p.startsWith("v"))
            .join("/")
            .split(".")[0];

        const publicId = pathAfterUpload;
        await cloudinary.uploader.destroy(publicId);
        logger.info("Cloudinary image deleted: " + publicId);
    } catch (error) {
        logger.error("Error deleting Cloudinary image: " + error);
        throw error;
    }
}

const sendEmail = async (to: string, subject: string, content: string) => {
    try {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: config.MAIL_USER,
                pass: config.MAIL_PASS
            }
        });

        const mailOptions = {
            from: {
                name: "Tabib Online",
                address: config.MAIL_USER
            },
            to: to,
            subject: subject,
            html: content
        };
        transporter.sendMail(mailOptions);
        logger.info("Email sent to " + to);
    }
    catch (err) {
        logger.error("Error sending email: " + err);
        throw err;
    }
}

const removeThinking = (text: string) => {
  if (!text) return "";
  // Removes <think>...</think> blocks (including newlines)
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

export {
    generateJWT,
    deleteCloudinaryImage,
    sendEmail,
    removeThinking
}