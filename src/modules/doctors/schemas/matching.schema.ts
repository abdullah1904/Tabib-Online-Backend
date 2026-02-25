import z from "zod";

export const matchingResponseSchema = z.object({
  primary: z.number().describe("Primary doctor specialization ID based on medical history"),
  secondary: z.number().describe("Secondary doctor specialization ID for additional care"),
  reasoning: z.string().describe("Summarized reasoning for the recommended doctor specializations based on the patient's medical history and conditions. Don't include numeric IDs here and percentages. "),
});