import { ChatGroq } from "@langchain/groq";
import {RunnableSequence} from "@langchain/core/runnables";
import { config } from "../../utils/config";
import { reviewPrompt } from "./prompts";
import { reviewResponseSchema } from "./schema";

const model = new ChatGroq({
    model: config.GROQ_SECONDARY_MODEL,
    temperature: 0.3,
    maxTokens: 512
})

const reviewChain = RunnableSequence.from([
    reviewPrompt,
    model.withStructuredOutput(reviewResponseSchema)
]);

export const reviewRatings = async (review: string)=>{
    const response = await reviewChain.invoke({
        review: review
    });
    return response.ratings;
}