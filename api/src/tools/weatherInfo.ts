import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const weatherInfo = createTool({
    id: "Get Weather Information",
    inputSchema: z.object({
        city: z.string(),
    }),
    description: `Fetches the current weather information for a given city`,
    execute: async ({ context: { city } }) => {
        return { city, temperature: 20, conditions: "Sunny" }; // Example return
    },
});