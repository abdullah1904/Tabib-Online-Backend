import { ChatGroq } from '@langchain/groq';
import { RunnableSequence } from '@langchain/core/runnables';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation, END, START, StateGraph, MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { config } from '../../utils/config.js';
import { removeThinking } from '../../utils/index.js';
import { medicalKnowledgeSearchTool } from './tools/medicalKnoweldgeSearch.tool.js';
import { tabibbotPrompt } from './prompts/tabibBotSystem.prompt.js';
import { userMedicalInfoTool } from './tools/userMedicalInfo.tool.js';
import { recommendDoctorTool } from './tools/recommendDoctor.tool.js';
import { doctorConsultationsTool } from './tools/doctorConsultations.tool.js';
import { bookAppointmentTool } from './tools/bookAppointment.tool.js';


const checkpointer = new MemorySaver();
export class TabibBotService {

    private readonly tools = [
        medicalKnowledgeSearchTool, 
        userMedicalInfoTool, 
        recommendDoctorTool,
        doctorConsultationsTool,
        bookAppointmentTool,
    ];

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


    private readonly graph = (() => {
        const chatNode = async (state: typeof this.StateAnnotation.State) => {
            const recentMessages = state.messages.slice(-10);
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
            .compile({ checkpointer: checkpointer });
    })();

    async chatResponse(message: string, thread_id: string, userId: string) {
        return this.graph.stream(
            {
                messages: [new HumanMessage(message.trim())],
            },
            {
                configurable: {
                    thread_id,
                    userId,
                },
            },
        );
    }

    async chatHistory(thread_id: string) {
        const config = {
            configurable: { thread_id },
        }
        const state = await this.graph.getState(config);
        const messages: {
            id: string | undefined;
            role: 'HumanMessage' | 'AIMessage';
            content: string;
        }[] = [];
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
            }
            else if (msg instanceof AIMessage) {
                const content = msg.content as string;
                if (content && content.trim()) {
                    messages.push({
                        id: msg.id,
                        role: 'AIMessage',
                        content: removeThinking(content),
                    });
                }
            }
        }
        return messages ?? [];
    }
}