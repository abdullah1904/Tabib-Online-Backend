import { ChatGroq, ChatGroqCallOptions } from "@langchain/groq";
import { config } from "../../utils/config";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { removeThinking } from "../../utils";

const model = new ChatGroq({
    model: config.GROQ_PRIMARY_MODEL,
    temperature: 0.3,
    maxTokens: 512,
});

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

const graphBuilder = new StateGraph(StateAnnotation);

const chatNode = async (state: typeof StateAnnotation.State) => {
    const response = await model.invoke(state.messages, {
        reasoning_format: 'hidden',
    });
    return {
        messages: [response],
    };
};

const checkpointer = new MemorySaver();

const graph = graphBuilder
    .addNode("chatNode", chatNode)
    .addEdge(START, "chatNode")
    .addEdge("chatNode", END)
    .compile({ checkpointer });

export const chatServiceStream = async (message: string, thread_id: string) => {
    const config = {
        'configurable': { 'thread_id': thread_id }
    }
    return graph.stream({
        messages: [new HumanMessage(message)]
    }, config);
}

export const chatHistoryService = async (thread_id: string) => {
    const config = {
        'configurable': { 'thread_id': thread_id }
    }
    const state = await graph.getState(config);
    const messages = [];
    for (const msg of state.values.messages || []) {
        if (msg instanceof HumanMessage) {
            messages.push({
                id: msg.id,
                role: 'HumanMessage',
                content: msg.content
            });
        }
        else if (msg instanceof AIMessage) {
            messages.push({
                role: 'AIMessage',
                content: removeThinking(msg.content as string)
            });
        }
    }
    return messages;
}