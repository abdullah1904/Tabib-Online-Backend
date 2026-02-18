import { ChatGroq } from '@langchain/groq';
import { RunnableSequence } from '@langchain/core/runnables';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, END, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { config } from '../../utils/config';
import { logger } from '../../utils/logger';
import { removeThinking } from '../../utils';
import { medicalKnowledgeSearchTool } from './tabib-bot.tools';
import { tabibbotPrompt } from './tabib-bot.prompts';

export class TabibBotService {

    private readonly tools = [medicalKnowledgeSearchTool];

    private readonly model = new ChatGroq({
        model: config.GROQ_SECONDARY_MODEL,
        temperature: 0.1,
        maxTokens: 2048,
    }).bindTools(this.tools);

    private readonly chatbotChain = RunnableSequence.from([tabibbotPrompt, this.model]);

    private readonly StateAnnotation = Annotation.Root({
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

    private readonly checkpointer = new MemorySaver();

    private readonly graph = (() => {
        const chatNode = async (state: typeof this.StateAnnotation.State) => {
            const recentMessages = state.messages.slice(-5);
            const response = await this.chatbotChain.invoke({
                question: recentMessages,
            });

            return {
                messages: [response],
            };
        };

        const toolNode = new ToolNode(this.tools);

        const shouldContinue = (state: typeof this.StateAnnotation.State) => {
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
                return 'tools';
            }
            return END;
        };

        return new StateGraph(this.StateAnnotation)
            .addNode('chatNode', chatNode)
            .addNode('tools', toolNode)
            .addEdge(START, 'chatNode')
            .addConditionalEdges('chatNode', shouldContinue)
            .addEdge('tools', 'chatNode')
            .compile({ checkpointer: this.checkpointer });
    })();

    async chatServiceStream(message: string, thread_id: string) {
        try {
            const trimmedMessage = message.trim();
            return this.graph.stream(
                {
                    messages: [new HumanMessage(trimmedMessage)],
                },
                {
                    configurable: { thread_id },
                },
            );
        } catch (error) {
            logger.error('Error in chatServiceStream:', error);
            throw error;
        }
    }

    async chatHistoryService(thread_id: string) {
        const graphConfig = {
            configurable: { thread_id },
        };

        try {
            const state = await this.graph.getState(graphConfig);
            const messages = [];

            for (const msg of state.values.messages || []) {
                if (msg instanceof HumanMessage) {
                    messages.push({
                        id: msg.id,
                        role: 'HumanMessage',
                        content:
                            typeof msg.content === 'string'
                                ? msg.content
                                : JSON.stringify(msg.content),
                    });
                } else if (msg instanceof AIMessage) {
                    const content = msg.content as string;
                    if (content && content.trim()) {
                        messages.push({
                            role: 'AIMessage',
                            content: removeThinking(content),
                        });
                    }
                }
            }

            return messages;
        } catch (error) {
            logger.error('Error in chatHistoryService:', error);
            return [];
        }
    }
}