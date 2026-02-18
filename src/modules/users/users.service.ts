import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { DoctorApplicationStatus, UserRole } from "../../utils/constants";

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
        if(user.role == UserRole.DOCTOR) {
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
                    PMDCRedgDate: '',
                    PMDCLicenseDocumentURL: "",
                    PMDCVerficationStatus: undefined,
                }
            })
        }
        return newUser;
    }
    async findAll() {
        return await prisma.users.findMany();
    }
    async findByEmail(email: string) {
        return await prisma.users.findFirst({
            where: { email }
        });
    }
    async findById(id: string) {
        return await prisma.users.findUnique({
            where: { id }
        });
    }
    async update(id: string, data: Prisma.UsersUpdateInput) {
        return await prisma.users.update({
            where: { id },
            data
        });
    }
    async delete(id: string) {
        return await prisma.users.delete({
            where: { id }
        });
    }

    async getUserProfile(userId: string) {
        return await prisma.users.findUnique({
            where: { id: userId },
        });
    }

    async updateUserProfile(userId: string, data: Prisma.UsersUpdateInput) {
        return await prisma.users.update({
            where: { id: userId },
            data
        });
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
            where: { userId }
        });
    }

    async updateProfessionalInfo(userId: string, data: Prisma.ProfessionalInfosUpdateInput) {
        return await prisma.professionalInfos.update({
            where: { userId },
            data
        });
    }
}