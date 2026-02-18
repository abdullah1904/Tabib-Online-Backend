import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CohereEmbeddings } from "@langchain/cohere";
import { config } from "../../utils/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { logger } from "../../utils/logger";
import { Document } from "langchain";

const embeddings = new CohereEmbeddings({
    model: config.COHERE_EMBEDDING_MODEL,
});

const vectorStore = new QdrantVectorStore(embeddings, {
    apiKey: config.QDRANT_API_KEY!,
    collectionName: config.QDRANT_COLLECTION_NAME!,
    url: config.QDRANT_URL!,
    contentPayloadKey: "page_content",
    metadataPayloadKey: "metadata",
});

export const medicalKnowledgeSearchTool = tool(
    async ({ query }: { query: string }) => {
        const context = await vectorStore.similaritySearch(query, 5);
        const context_text = context.map((doc: Document, index: number) => {
            const source = doc.metadata?.source || doc.metadata?.title || 'Unknown Source';
            const page = doc.metadata?.page ? ` (Page ${doc.metadata.page})` : '';
            const url = doc.metadata?.url ? `\nURL: ${doc.metadata.url}` : '';

            return `[Source ${index + 1}: ${source}${page}]${url}\n${doc.pageContent}`;
        }).join("\n\n---\n\n");
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