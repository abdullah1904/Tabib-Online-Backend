import jwt from "jsonwebtoken"
import { config } from "./config"
import {createTransport} from "nodemailer";
import { logger } from "./logger";

const generateJWT = (id: number, type: "ACCESS" | "REFRESH") => {
    if (type === "ACCESS") {
        return jwt.sign({ id }, config.ACCESS_TOKEN_SECRET!, { expiresIn: config.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions)
    }
    else if (type === "REFRESH") {
        return jwt.sign({ id }, config.REFRESH_TOKEN_SECRET!, { expiresIn: config.REFRESH_TOKEN_EXPIRY } as jwt.SignOptions)
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

export {
    generateJWT,
    sendEmail
}