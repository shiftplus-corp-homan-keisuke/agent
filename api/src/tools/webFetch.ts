import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import TurndownService from "turndown";
import * as cheerio from 'cheerio';

export const webFetch = createTool({
    id: "Web Fetch",
    inputSchema: z.object({
        url: z.string().url(),
    }),
    description: `Fetches HTML content from a web page and converts it to Markdown`,
    execute: async ({ context: { url } }) => {

        try {
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();

            const $ = cheerio.load(html);

            $('script, style, noscript, iframe, embed, object, form, input, button, select, textarea, nav, header, footer, aside, .sidebar, .ad, .advertisement, .social-share, .comments, .breadcrumb, .pagination, #comments, #footer, #header, #sidebar, #navigation, .cookie-banner, .popup, .modal').remove();

            $('*').each((_, element) => {
                const attrs = $(element).attr();
                if (attrs) {
                    Object.keys(attrs).forEach(attr => {
                        if (attr.startsWith('data-') || attr.startsWith('aria-') || attr === 'class' || attr === 'id' || attr === 'style') {
                            $(element).removeAttr(attr);
                        }
                    });
                }
            });

            const cleanHtml = $.html();

            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
            });

            const markdown = turndownService.turndown(cleanHtml);

            return {
                status: response.status,
                url,
                markdown,
            };
        } catch (error: any) {
            return {
                error: error.message,
                url,
            };
        }
    },
});