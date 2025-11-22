import { ChatGroq } from "@langchain/groq";
import { config } from "../../utils/config";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { removeThinking } from "../../utils";
import { RunnableSequence } from "@langchain/core/runnables";
import { chatbotPrompt } from "./prompts";
import { medicalKnowledgeSearchTool } from "./tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { logger } from "../../utils/logger";

const tools = [
    medicalKnowledgeSearchTool,
];

const model = new ChatGroq({
    model: config.GROQ_SECONDARY_MODEL,
    temperature: 0.1,
    maxTokens: 2048
}).bindTools(tools);

const chatbotChain = RunnableSequence.from([
    chatbotPrompt,
    model
]);

const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
            if (Array.isArray(right)) {
                return left.concat(right);
            }
            return left.concat([right]);
        },
        default: () => [],
    }),
});

const chatNode = async (state: typeof StateAnnotation.State) => {
    const recentMessages = state.messages.slice(-5);
    const response = await chatbotChain.invoke({
        question: recentMessages,
    });
        
    return {
        messages: [response],
    };
};

const toolNode = new ToolNode(tools);

const shouldContinue = (state: typeof StateAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
        return "tools";
    }
    return END;
};

const checkpointer = new MemorySaver();

const graphBuilder = new StateGraph(StateAnnotation);

const graph = graphBuilder
    .addNode("chatNode", chatNode)
    .addNode("tools", toolNode)
    .addEdge(START, "chatNode")
    .addConditionalEdges("chatNode", shouldContinue)
    .addEdge("tools", "chatNode")
    .compile({ checkpointer });

export const chatServiceStream = async (message: string, thread_id: string) => {
    try {
        const trimmedMessage = message.trim();
        return graph.stream(
            {
                messages: [new HumanMessage(trimmedMessage)],
            },
            {
                configurable: { thread_id },
            }
        );
    } catch (error) {
        logger.error("Error in chatServiceStream:", error);
        throw error;
    }
};

export const chatHistoryService = async (thread_id: string) => {
    const config = {
        configurable: { thread_id }
    };
    
    try {
        const state = await graph.getState(config);
        const messages = [];
        
        for (const msg of state.values.messages || []) {
            if (msg instanceof HumanMessage) {
                messages.push({
                    id: msg.id,
                    role: 'HumanMessage',
                    content: typeof msg.content === 'string' 
                        ? msg.content 
                        : JSON.stringify(msg.content)
                });
            } else if (msg instanceof AIMessage) {
                const content = msg.content as string;
                if (content && content.trim()) {
                    messages.push({
                        role: 'AIMessage',
                        content: removeThinking(content)
                    });
                }
            }
        }
        
        return messages;
    } catch (error) {
        console.error("Error in chatHistoryService:", error);
        return [];
    }
};