import { tool } from "langchain";

export const currentDateTool = tool(
    async () => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const dayOfWeek = currentDate.toLocaleDateString("en-US", {
            weekday: "long",
        });
        return `Today is ${formattedDate}, ${dayOfWeek}.`;
    },
    {
        name: "CurrentDate",
        description: "Use this tool to get the current date and day. This can be helpful for providing timely advice or scheduling recommendations based on the current date.",
    }
);