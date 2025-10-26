import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../../utils/config";


export const medicalKnowledgeSearchTool = tool(
    async ({ query }: { query: string }) => {
        // const store = await getVectorStore();
        // const context = await (store as any).similaritySearch(query, 5);
        // const context_text = (context as any[]).map((doc: any) => doc.pageContent).join("\n\n");
        return "have not implemented yet";
    },
    {
        name: "MedicalKnowledgeSearch",
        description: "Use this tool to search for medical knowledge and information about diseases, symptoms, treatments, and medications. Input should be a detailed query about the medical topic you want to learn more about.",
        schema: z.object({
            query: z.string().describe("A detailed medical query to search for relevant information.")
        })
    }
);