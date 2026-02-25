import { ChatGroq } from "@langchain/groq";
import {RunnableSequence} from "@langchain/core/runnables";
import { config } from "../../../utils/config";
import { matchingPrompt } from "../prompts/matchingSystem.prompt";
import { matchingResponseSchema } from "../schemas/matching.schema";

const model = new ChatGroq({
    model: config.GROQ_SECONDARY_MODEL,
    temperature: 0.3,
    maxTokens: 512
})

const recommendMatchesChain = RunnableSequence.from([
    matchingPrompt,
    model.withStructuredOutput(matchingResponseSchema)
]);

export const matchDoctor = async ({ pastMedicalHistory, allergies, currentMedications, familyMedicalHistory }: { pastMedicalHistory: string, allergies: string, currentMedications: string, familyMedicalHistory: string }) => {
    return await recommendMatchesChain.invoke({
        pastMedicalHistory,
        allergies,
        currentMedications,
        familyMedicalHistory
    });
}