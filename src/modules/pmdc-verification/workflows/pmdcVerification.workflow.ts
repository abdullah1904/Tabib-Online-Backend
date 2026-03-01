import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { config } from "../../../utils/config";
import { pmdcVerificationResponseSchema, pmdcVerificationStateSchema } from "../schemas/pmdcVerification.schema";
import { pmdcDoctorSearchTool } from "../tools/pmdcDoctorSearch.tool";

const model = new ChatGroq({
    model: config.GROQ_SECONDARY_MODEL,
    temperature: 0.1,
    maxTokens: 2056,
});

export const pmdcVerificationAgent = createAgent({
    model: model,
    tools: [pmdcDoctorSearchTool],
    description: `You are a medical verification agent that MUST use the get_doctor_info tool to verify doctor credentials.
                CRITICAL: You MUST ALWAYS call the get_doctor_info tool first before providing any verification response.

                Your verification process:
                1. ALWAYS call get_doctor_info with the provided registration number
                2. Compare the returned data with the provided doctor information
                3. Return a structured verification result

                Never attempt to verify credentials without calling the tool first.`,
    stateSchema: pmdcVerificationStateSchema,
    responseFormat: pmdcVerificationResponseSchema,
});