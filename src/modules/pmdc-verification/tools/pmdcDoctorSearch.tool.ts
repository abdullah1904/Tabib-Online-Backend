import { tool } from "langchain";
import z from "zod";

export const pmdcDoctorSearchTool = tool(
    async ({ registrationNo }) => {
        try {
            if (!registrationNo || registrationNo.trim() === '') {
                throw new Error("Invalid registration number provided.");
            }

            const response = await fetch('https://hospitals-inspections.pmdc.pk/api/DRC/GetQualifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    RegistrationNo: registrationNo
                }).toString()
            }).then((res) => res.json());


            const doctorData = response.data;
            if (!doctorData) {
                return {
                    status: "not_found",
                }
            }

            return {
                status: "valid",
                doctorData: doctorData
            }
        } catch (error: any) {
            return {
                status: "error",
                message: error.message || "An error occurred while fetching qualifications."
            }
        }
    },
    {
        name: "pmdc_doctor_search",
        description: "Retrieve and validate doctor information from PMDC database. Returns structured validation results with status (valid/invalid/not_found/error).",
        schema: z.object({
            registrationNo: z.string().describe("PMDC registration number of the doctor (e.g., 786546-01-M)")
        })
    }
);