import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { HTTPError } from "../../types";
import { HttpStatusCode, UserRole } from "../../utils/constants";
import pmdcVerificationQueue from "./queues/pmdcVerification.queue";

const {
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

export class PMDCVerificationService {
    createVerificationApplication = async (data: Prisma.PMDCVerificationApplicationCreateInput) => {
        if(!data.doctor || !data.doctor.connect || !data.doctor.connect.id){
            throw new HTTPError("Doctor ID is required to create a verification application.", HTTP_BAD_REQUEST.code);
        }
        const doctor = await prisma.users.findUnique({
            where: { id: data.doctor.connect.id, role: UserRole.DOCTOR },
        });

        if(!doctor){
            throw new HTTPError("Doctor not found with the provided ID.", HTTP_NOT_FOUND.code);
        }
        
        const [alreadyApplicationCount, professionalInfo] = await Promise.all([
            prisma.pMDCVerificationApplication.count({
                where: { doctorId: data.doctor.connect.id }
            }),
            prisma.professionalInfos.findUnique({
                where: { userId: data.doctor.connect.id }
                })
        ]);
        if (alreadyApplicationCount >= 3) {
            throw new HTTPError("Maximum number of verification applications reached for this doctor.", HTTP_BAD_REQUEST.code);
        }
        if(professionalInfo?.PMDCVerifiedAt){
            throw new HTTPError("Doctor is already verified by PMDC.", HTTP_BAD_REQUEST.code);
        }
        const application = await prisma.pMDCVerificationApplication.create({
            data: {
                doctor: { connect: { id: data.doctor.connect.id } },
                PMDCRedgNo: data.PMDCRedgNo,
                PMDCRedgDate: data.PMDCRedgDate,
                PMDCLicenseDocumentURL: data.PMDCLicenseDocumentURL,
            }
        });
        await pmdcVerificationQueue.add("process-verification", {
            applicationId: application.id,
            doctorId: data.doctor.connect.id
        });
        return application;
    }
    listVerificationApplications = async (doctorId: string) => {
        return await prisma.pMDCVerificationApplication.findMany({
            where: { doctorId },
            orderBy: { createdAt: 'desc' },
            include: {
                doctor: true,
            }
        });
    }
}