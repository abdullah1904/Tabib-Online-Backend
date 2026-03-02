import prisma from "../../lib/prisma.js";
import { HTTPError } from "../../types/index.js";
import { deleteCloudinaryImage } from "../../utils/index.js";
import { HttpStatusCode, UserRole } from "../../utils/constants.js";
import { Prisma } from "../../../generated/prisma/client.js";

const {
    HTTP_NOT_FOUND
} = HttpStatusCode;
export class UsersService {
    async create(user: Prisma.UsersCreateInput) {
        const newUser = await prisma.users.create({
            data: user
        });
        if (user.role == UserRole.USER) {
            await prisma.medicalRecords.create({
                data: {
                    user: {
                        connect: { id: newUser.id }
                    },
                    emergencyContactName: "",
                    emergencyContactNumber: "",
                    bloodType: "",
                    height: 0,
                    weight: 0,
                    allergies: "",
                    currentMedications: "",
                    familyMedicalHistory: "",
                    pastMedicalHistory: ""
                }
            });
        }
        if (user.role == UserRole.DOCTOR) {
            await prisma.professionalInfos.create({
                data: {
                    user: {
                        connect: { id: newUser.id }
                    },
                    medicalDegree: 0,
                    postGraduateDegree: 0,
                    specialization: 0,
                    yearsOfExperience: 0,
                    PMDCRedgNo: "",
                    PMDCRedgDate: new Date(),
                    PMDCLicenseDocumentURL: "",
                }
            })
        }
        return newUser;
    }
    async findAll() {
        return await prisma.users.findMany();
    }
    async findByEmail(email: string) {
        const user = await prisma.users.findFirst({
            where: { email }
        });
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        return user;
    }
    async findById(id: string) {
        const user = await prisma.users.findUnique({
            where: { id }
        });
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        return user;
    }
    async update(id: string, data: Prisma.UsersUpdateInput) {
        const user = await prisma.users.findUnique({
            where: { id }
        });
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        return await prisma.users.update({
            where: { id },
            data
        });
    }

    async updateUserProfile(userId: string, data: Prisma.UsersUpdateInput) {
        if (data.imageURL) {
            const existingUser = await prisma.users.findUnique({
                where: { id: userId },
                select: { imageURL: true }
            });
            if (existingUser?.imageURL && existingUser.imageURL !== data.imageURL) {
                await deleteCloudinaryImage(existingUser.imageURL);
            }
        }
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data
        });
        return updatedUser;
    }

    async getMedicalRecord(userId: string) {
        return await prisma.medicalRecords.findUnique({
            where: { userId }
        });
    }

    async updateMedicalRecord(userId: string, data: Prisma.MedicalRecordsUpdateInput) {
        return await prisma.medicalRecords.update({
            where: { userId },
            data
        });
    }

    async getProfessionalInfo(userId: string) {
        return await prisma.professionalInfos.findUnique({
            where: { userId },
        });
    }

    async updateProfessionalInfo(userId: string, data: Prisma.ProfessionalInfosUpdateInput) {
        return await prisma.professionalInfos.update({
            where: { userId },
            data: {
                ...data,
                isActive: true
            }
        });
    }
}