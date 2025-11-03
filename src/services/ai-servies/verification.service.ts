import { ChatGroq } from "@langchain/groq";
import { config } from "../../utils/config";
import { createAgent } from "langchain";
import { getDoctorInfoTool } from "./tools";
import { verificationResponseSchema, verificationStateSchema } from "./schema";
import { getMedicalDegreeText, getPostGraduateDegreeText, getSpecializationText } from "../../utils";

const model = new ChatGroq({
    model: config.GROQ_SECONDARY_MODEL,
    temperature: 0.1,
    maxTokens: 2056,
});

export const verificationAgent = createAgent({
    model: model,
    tools: [getDoctorInfoTool],
    description: `You are a medical verification agent that MUST use the get_doctor_info tool to verify doctor credentials.
                CRITICAL: You MUST ALWAYS call the get_doctor_info tool first before providing any verification response.

                Your verification process:
                1. ALWAYS call get_doctor_info with the provided registration number
                2. Compare the returned data with the provided doctor information
                3. Return a structured verification result

                Never attempt to verify credentials without calling the tool first.`,
    stateSchema: verificationStateSchema,
    responseFormat: verificationResponseSchema,
});