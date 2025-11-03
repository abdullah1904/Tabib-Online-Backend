import { Queue, Job, Worker } from "bullmq";
import { config } from "../utils/config";
import { logger } from "../utils/logger";
import { db } from "..";
import { DoctorTable, DoctorVerificationApplications } from "../models/doctor.model";
import { eq } from "drizzle-orm";
import { verificationAgent } from "./ai-servies/verification.service";
import { getMedicalDegreeText, getPostGraduateDegreeText, getSpecializationText } from "../utils";
import { DoctorApplicationStatus, VerificationHandlerType } from "../utils/constants";

const DoctorVerificationQueue = new Queue("doctor-verification", {
    connection: { url: config.REDIS_URL! },
    defaultJobOptions: {
        removeOnComplete: true,
        attempts: 2,
    }
});

const DoctorVerificationWorker = new Worker("doctor-verification", async ({ name, data }: Job) => {
    if (name === "process-verification") {
        const { applicationId, doctorId } = data;
        try {
            await db.update(DoctorTable)
                .set({ status: DoctorApplicationStatus.IN_PROGRESS })
                .where(eq(DoctorTable.id, doctorId));

            const doctor = await db.select().from(DoctorTable).where(eq(DoctorTable.id, doctorId)).limit(1);
            
            if (doctor.length === 0) {
                logger.error(`Doctor with ID ${doctorId} not found for verification application ID ${applicationId}.`);
                return;
            }

            const response = await verificationAgent.invoke({
                registrationNumber: doctor[0].pmdcRedgNo,
                doctorName: doctor[0].fullName,
                registrationDate: doctor[0].pmdcRedgDate.toString(),
                specialization: getSpecializationText(doctor[0].specialization)!,
                medicalDegree: getMedicalDegreeText(doctor[0].medicalDegree)!,
                postGraduateDegree: getPostGraduateDegreeText(doctor[0].postGraduateDegree)!,
                messages: [
                    {
                        role: "user",
                        content: `Verify the following doctor credentials by calling the get_doctor_info tool:
                                - Registration Number: ${doctor[0].pmdcRedgNo}
                                - Name: ${doctor[0].fullName}
                                - Registration Date: ${doctor[0].pmdcRedgDate}
                                - Specialization: ${getSpecializationText(doctor[0].specialization)}
                                - Medical Degree: ${getMedicalDegreeText(doctor[0].medicalDegree)}
                                - Post Graduate Degree: ${getPostGraduateDegreeText(doctor[0].postGraduateDegree)}
                                                    
                                Use the get_doctor_info tool to fetch data from PMDC and compare it with the information above.`
                    }
                ]
            });
            if (response.structuredResponse.status === "VALID_INFORMATION") {
                await db.update(DoctorTable)
                    .set({ pmdcVerifiedAt: new Date() })
                    .where(eq(DoctorTable.id, doctorId));
            }
            await db.update(DoctorVerificationApplications)
                .set({ 
                    status: DoctorApplicationStatus.COMPLETED, 
                    reviewedAt: new Date(), 
                    results: response.structuredResponse.status,
                    reviewedBy:  VerificationHandlerType.AGENT
                })
                .where(eq(DoctorVerificationApplications.id, applicationId));

        } catch (error: any) {
            logger.error(`Error verifying doctor ${doctorId}: ${error.message}`);
            await db.update(DoctorVerificationApplications)
                .set({ status: DoctorApplicationStatus.ERROR, reviewedAt: new Date(), reviewedBy: VerificationHandlerType.AGENT })
                .where(eq(DoctorVerificationApplications.id, applicationId));
            throw error;
        }
    }
}, { connection: { url: config.REDIS_URL! } });

DoctorVerificationWorker.on("completed", (job: Job, returnvalue: string) => {
    logger.info(`Doctor verification job ${job.id} completed successfully.`);
});

DoctorVerificationWorker.on("failed", (job: Job | undefined, err: Error) => {
    logger.error(`Doctor verification job ${job?.id} failed with error: ${err.message}`);
});

export { DoctorVerificationQueue };