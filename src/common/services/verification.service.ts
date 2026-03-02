import { generate } from "otp-generator";
import { OTPType } from "../../utils/constants.js";
import prisma from "../../lib/prisma.js";
import { sendEmail } from "../../utils/index.js";


export class VerificationsService {
    async create(data: { userId: string, type: OTPType }) {
        const otp = generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
        const verification = await prisma.verifications.create({
            data: {
                userId: data.userId,
                type: data.type,
                otp
            },
            include: { user: true }
        });
        sendEmail(
            verification.user.email,
            "Your OTP Code",
            `Your OTP code is ${otp}. It will expire in 5 minutes.`
        );
        return verification;
    }

    async findUserVerifications(userId: string) {
        return await prisma.verifications.findMany({
            where: { userId }
        });
    }

    async findUserVerificationByType(userId: string, type: OTPType) {
        return await prisma.verifications.findFirst({
            where: { userId, type }
        });
    }

    async deleteUserVerifications(userId: string) {
        return await prisma.verifications.deleteMany({
            where: { userId }
        });
    }

    async deleteUserVerificationByType(userId: string, type: OTPType) {
        return await prisma.verifications.deleteMany({
            where: { userId, type }
        });
    }
}