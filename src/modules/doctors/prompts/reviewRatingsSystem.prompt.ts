import { PromptTemplate } from "@langchain/core/prompts";

export const reviewPrompt = PromptTemplate.fromTemplate(`You are a medical review analyzer. Given a patient's review of a doctor, extract the rating they provided on a scale from 1 to 5.

Guidelines:
- The rating must be an integer between 1 and 5
- If the review does not contain a clear rating, infer the most appropriate rating based on the sentiment of the review
- Respond ONLY with the numeric rating, without any additional text or explanation

Patient Review:
{review}

Rating:`);