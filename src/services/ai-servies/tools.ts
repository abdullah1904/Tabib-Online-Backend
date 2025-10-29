import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {CohereEmbeddings} from "@langchain/cohere";
import { config } from "../../utils/config";
import {QdrantVectorStore} from "@langchain/qdrant";
import { logger } from "../../utils/logger";
import { Document } from "langchain";

const embeddings = new CohereEmbeddings({
    model: config.COHERE_EMBEDDING_MODEL,
});

const vectorStore = new QdrantVectorStore(embeddings,{
    apiKey: config.QDRANT_API_KEY!,
    collectionName: config.QDRANT_COLLECTION_NAME!,
    url: config.QDRANT_URL!,
    contentPayloadKey: "page_content",  // Add this
    metadataPayloadKey: "metadata",
});

export const medicalKnowledgeSearchTool = tool(
    async ({ query }: { query: string }) => {
        const context = await vectorStore.similaritySearch(query, 5);
        const context_text = context.map((doc: Document) => doc.pageContent).join("\n\n");
        return context_text;
    },
    {
        name: "MedicalKnowledgeSearch",
        description: "Use this tool to search for medical knowledge and information about diseases, symptoms, treatments, and medications. Input should be a detailed query about the medical topic you want to learn more about.",
        schema: z.object({
            query: z.string().describe("A detailed medical query to search for relevant information.")
        })
    }
);

export const getDoctorInfoTool = tool(
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
        name: "get_doctor_info",
        description: "Retrieve and validate doctor information from PMDC database. Returns structured validation results with status (valid/invalid/not_found/error).",
        schema: z.object({
            registrationNo: z.string().describe("PMDC registration number of the doctor (e.g., 786546-01-M)")
        })
    }
);