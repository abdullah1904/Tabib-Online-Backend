import { VerificationsService } from "../../common/services/verification.service";
import { Prisma } from "../../generated/prisma/client";
import { HTTPError } from "../../types";
import { AccountStatus, HttpStatusCode, OTPType, UserRole,  } from "../../utils/constants";
import { UsersService } from "../users/users.service";
import bcrypt from "bcrypt";

const {
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

export class AuthService {
    private usersService: UsersService;
    private verificationsService: VerificationsService;
    constructor() {
        this.usersService = new UsersService();
        this.verificationsService = new VerificationsService();
    }
    register = async (user: Prisma.UsersCreateInput) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const createdUser = await this.usersService.create({
            ...user,
            password: hashedPassword
        });
        await this.verificationsService.create({
            userId: createdUser.id,
            type: OTPType.EMAIL_VERIFICATION
        });
        return createdUser;
    }
    login = async (email: string, password: string) => {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HTTPError("Invalid password", HTTP_BAD_REQUEST.code);
        }
        if (user.status == AccountStatus.BANNED) {
            throw new HTTPError("Account is banned", HTTP_BAD_REQUEST.code);
        }
        if (user.status == AccountStatus.SUSPENDED) {
            throw new HTTPError("Account is suspended", HTTP_BAD_REQUEST.code);
        }
        return user;
    }
    sendOTP = async (email: string, type: OTPType) => {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        if (user.verifiedAt !== null && type == OTPType.EMAIL_VERIFICATION) {
            throw new HTTPError("Email is already verified", HTTP_BAD_REQUEST.code);
        }
        await this.verificationsService.deleteUserVerificationByType(user.id, type);
        await this.verificationsService.create({
            userId: user.id,
            type
        });
        return;
    }
    verifyEmail = async (email: string, otp: string) => {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        const verification = await this.verificationsService.findUserVerificationByType(user.id, OTPType.EMAIL_VERIFICATION);
        if (!verification) {
            throw new HTTPError("Verification request not found", HTTP_NOT_FOUND.code);
        }
        if (verification.otp !== otp) {
            throw new HTTPError("Invalid OTP", HTTP_BAD_REQUEST.code);
        }
        const now = new Date();
        const otpAge = (now.getTime() - verification.createdAt.getTime()) / 1000;
        if (otpAge > 300) {
            throw new HTTPError("OTP has expired", HTTP_BAD_REQUEST.code);
        }
        await Promise.all([
            this.usersService.update(user.id, { status: AccountStatus.ACTIVE, verifiedAt: new Date() }),
            this.verificationsService.deleteUserVerificationByType(user.id, OTPType.EMAIL_VERIFICATION)
        ]);
        return;
    }
    resetPassword = async (email: string, otp: string, newPassword: string) => {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        const verification = await this.verificationsService.findUserVerificationByType(user.id, OTPType.PASSWORD_RESET);
        if (!verification) {
            throw new HTTPError("Verification request not found", HTTP_NOT_FOUND.code);
        }
        if (verification.otp !== otp) {
            throw new HTTPError("Invalid OTP", HTTP_BAD_REQUEST.code);
        }
        const now = new Date();
        const otpAge = (now.getTime() - verification.createdAt.getTime()) / 1000;
        if (otpAge > 300) { // OTP is valid for 5 minutes
            throw new HTTPError("OTP has expired", HTTP_BAD_REQUEST.code);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Promise.all([
            this.usersService.update(user.id, { password: hashedPassword }),
            this.verificationsService.deleteUserVerificationByType(user.id, OTPType.PASSWORD_RESET)
        ]);
        return;
    }
    changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new HTTPError("Invalid current password", HTTP_BAD_REQUEST.code);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(user.id, { password: hashedPassword });
        return;
    }
}