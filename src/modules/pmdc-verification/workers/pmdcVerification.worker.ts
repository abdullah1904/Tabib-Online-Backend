import { Job, Worker } from "bullmq";
import { logger } from "../../../utils/logger.js";
import { pmdcVerificationAgent } from "../workflows/pmdcVerification.workflow.js";
import { config } from "../../../utils/config.js";
import prisma from "../../../lib/prisma.js";
import {
  PMDCApplicationStatus,
  PMDCVerifierType,
  UserRole,
} from "../../../utils/constants.js";
import {
  getMedicalDegreeText,
  getPostGraduateDegreeText,
  getSpecializationText,
  sendEmail,
} from "../../../utils/index.js";

const pmdcVerificationWorker = new Worker(
  "doctor-verification",
  async ({ name, data }: Job) => {
    logger.info(
      `Processing doctor verification job: ${name} with data: ${JSON.stringify(data)}`,
    );
    if (name === "process-verification") {
      const { applicationId, doctorId } = data;
      try {
        const [doctor, updatedApplication] = await Promise.all([
          prisma.users.findUnique({
            where: { id: doctorId, role: UserRole.DOCTOR },
            include: { professionalInfo: true },
          }),
          prisma.pMDCVerificationApplication.update({
            where: { id: applicationId },
            data: {
              status: PMDCApplicationStatus.IN_PROGRESS,
            },
          }),
        ]);

        if (!doctor) {
          logger.error(`Doctor with ID ${doctorId} not found for verification application ${applicationId}`);
          return;
        }

        if (doctor.professionalInfo?.medicalDegree == null || doctor.professionalInfo?.specialization == null || doctor.professionalInfo?.postGraduateDegree == null) {
          logger.error(`Doctor with ID ${doctorId} has incomplete professional information for verification application ${applicationId}`);
          await prisma.pMDCVerificationApplication.update({
            where: { id: applicationId },
            data: {
              status: PMDCApplicationStatus.ERROR,
              results: "Incomplete professional information for verification",
            },
          });
          sendEmail(
            doctor.email,
            "Doctor Verification Failed",
            `Dear ${doctor.fullName},\n\nWe regret to inform you that your verification process has failed. Reason: Incomplete professional information. Please complete all required fields (medical degree, specialization, and post-graduate degree) and try again.\n\nBest regards,\nTabib Online Support Team`,
          );
          return;
        }

        const response = await pmdcVerificationAgent.invoke({
          registrationNumber: updatedApplication.PMDCRedgNo,
          doctorName: doctor.fullName,
          registrationDate: updatedApplication.PMDCRedgDate.toISOString(),
          specialization: getSpecializationText(
            doctor.professionalInfo.specialization,
          )!,
          medicalDegree: getMedicalDegreeText(
            doctor.professionalInfo.medicalDegree,
          )!,
          postGraduateDegree: getPostGraduateDegreeText(
            doctor.professionalInfo.postGraduateDegree,
          )!,
          messages: [
            {
              role: "user",
              content: `Verify the following doctor credentials by calling the pmdc_doctor_search tool:
                                - Registration Number: ${updatedApplication.PMDCRedgNo}
                                - Name: ${doctor.fullName}
                                - Registration Date: ${updatedApplication.PMDCRedgDate.toISOString()}
                                - Specialization: ${getSpecializationText(doctor.professionalInfo.specialization)}
                                - Medical Degree: ${getMedicalDegreeText(doctor.professionalInfo.medicalDegree)}
                                - Post Graduate Degree: ${getPostGraduateDegreeText(doctor.professionalInfo.postGraduateDegree)}
                                                    
                                Use the pmdc_doctor_search tool to fetch data from PMDC and compare it with the information above.`,
            },
          ],
        });
        await prisma.pMDCVerificationApplication.update({
          where: { id: applicationId },
          data: {
            status: PMDCApplicationStatus.COMPLETED,
            reviewedAt: new Date(),
            results: response.structuredResponse.status,
            reviewedBy: PMDCVerifierType.AGENT,
          },
        });
        if (response.structuredResponse.status === "VALID_INFORMATION") {
          await prisma.professionalInfos.update({
            where: { userId: doctorId },
            data: {
              PMDCVerifiedAt: new Date(),
              PMDCLicenseDocumentURL: updatedApplication.PMDCLicenseDocumentURL,
              PMDCRedgDate: updatedApplication.PMDCRedgDate,
              PMDCRedgNo: updatedApplication.PMDCRedgNo,
            },
          });
        } else {
          sendEmail(
            doctor.email,
            "Doctor Verification Failed",
            `Dear ${doctor.fullName},\n\nWe regret to inform you that your verification process has failed. Reason: ${response.structuredResponse.status} - ${response.structuredResponse.reason} Please review your submitted credentials and try again.\n\nBest regards,\nTabib Online Support Team`,
          );
        }
      } catch (error: any) {
        logger.error(`Error verifying doctor ${doctorId}: ${error.message}`);
        await prisma.pMDCVerificationApplication.update({
          where: { id: applicationId },
          data: {
            status: PMDCApplicationStatus.ERROR,
            reviewedAt: new Date(),
            reviewedBy: PMDCVerifierType.AGENT,
            results: `Error during verification: ${error.message}`,
          },
        });
        throw error;
      }
    }
  },
  { connection: { url: config.REDIS_URL! } },
);

pmdcVerificationWorker.on("completed", (job: Job, returnvalue: string) => {
  logger.info(`Doctor verification job ${job.id} completed successfully.`);
});

pmdcVerificationWorker.on("failed", (job: Job | undefined, err: Error) => {
  logger.error(
    `Doctor verification job ${job?.id} failed with error: ${err.message}`,
  );
});

pmdcVerificationWorker.on("error", (error) => {
  logger.error(`Doctor verification worker error: ${error.message}`);
});
