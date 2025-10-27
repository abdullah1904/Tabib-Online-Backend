import { ChatGroq } from "@langchain/groq";
import { config } from "../../utils/config";
import { createAgent } from "langchain";
import { getDoctorInfoTool } from "./tools";
import { verificationResponseSchema } from "./schema";

const model = new ChatGroq({
    model: config.GROQ_PRIMARY_MODEL,
    temperature: 0.3,
    maxTokens: 1024
});

export const verificationAgent = createAgent({
    model: model,
    tools: [getDoctorInfoTool],
});


