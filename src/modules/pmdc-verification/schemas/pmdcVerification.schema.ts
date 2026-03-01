import z from "zod";

export const pmdcVerificationStateSchema = z.object({
  doctorName: z.string().describe("Full name of the doctor as per PMDC records."),
  registrationNumber: z.string().describe("PMDC registration number of the doctor."),
  registrationDate: z.string().describe("Date when the doctor was registered with PMDC in YYYY-MM-DD format."),
  specialization: z.string().describe("Medical specialization of the doctor."),
  medicalDegree: z.string().describe("Medical degree obtained by the doctor."),
  postGraduateDegree: z.string().describe("Postgraduate degree obtained by the doctor."),
});

export const pmdcVerificationResponseSchema = z.object({
  status: z.enum([
    "VALID_INFORMATION",
    "INVALID_INFORMATION",
    "INCOMPLETE_INFORMATION",
    "NOT_FOUND",
    "ERROR"
  ]).describe("Verification status of the doctor"),
  reason: z.string().describe("Detailed reason for the verification status assigned to the doctor."),
});