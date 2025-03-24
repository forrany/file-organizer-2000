import {
  convertToCoreMessages,
  streamText,
  createDataStreamResponse,
  generateId,
} from "ai";
import { NextResponse, NextRequest } from "next/server";
import { incrementAndLogTokenUsage } from "@/lib/incrementAndLogTokenUsage";
import { handleAuthorizationV2 } from "@/lib/handleAuthorization";
import { openai } from "@ai-sdk/openai";
import { getModel } from "@/lib/models";
import { getChatSystemPrompt } from "@/lib/prompts/chat-prompt";
import { chatTools } from "./tools";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return createDataStreamResponse({
    execute: async (dataStream) => {
      try {
        const { userId } = await handleAuthorizationV2(req);
        const {
          messages,
          newUnifiedContext,
          enableScreenpipe,
          currentDatetime,
          unifiedContext: oldUnifiedContext,
          model: bodyModel,
          enableSearchGrounding = false,
          deepSearch = false,
        } = await req.json();

        let chosenModelName = "gpt-4o";

        const contextString =
          newUnifiedContext ||
          oldUnifiedContext
            ?.map((file) => {
              return `File: ${file.title}\n\nContent:\n${file.content}\nPath: ${file.path} Reference: ${file.reference}`;
            })
            .join("\n\n");

        dataStream.writeData("initialized call");

        if (enableSearchGrounding) {
          console.log("Enabling search grounding with Responses API");
          chosenModelName = "gpt-4o"; // Using standard gpt-4o with the Responses API

          const result = await streamText({
            model: openai.responses("gpt-4o"),
            system: getChatSystemPrompt(
              contextString,
              enableScreenpipe,
              currentDatetime
            ),
            maxSteps: 3,
            messages: messages,
            tools: {
              // ...chatTools,
              web_search_preview: openai.tools.webSearchPreview({
                searchContextSize: deepSearch ? "high" : "medium",
              }),
            },
            onFinish: async ({
              usage,
              sources,
            }) => {
              console.log("Token usage:", usage);
              console.log("Search sources:", sources);

              if (sources && sources.length > 0) {
                // Map the sources to our expected citation format
                const citations = sources.map((source) => ({
                  url: source.url,
                  title: source.title || source.url,
                  // Default to 0 for indices if not provided
                  startIndex: 0,
                  endIndex: 0,
                }));

                if (citations.length > 0) {
                  dataStream.writeMessageAnnotation({
                    type: "search-results",
                    citations,
                  });
                }
              }

              await incrementAndLogTokenUsage(userId, usage.totalTokens);
              dataStream.writeData("call completed");
            },
          });

          result.mergeIntoDataStream(dataStream);
        } else {
          console.log("Chat using standard model:", chosenModelName);
          const model = getModel(chosenModelName);

          const result = await streamText({
            model,
            system: getChatSystemPrompt(
              contextString,
              enableScreenpipe,
              currentDatetime
            ),
            maxSteps: 3,
            messages: messages,
            tools: chatTools,
            onFinish: async ({ usage, sources }) => {
              console.log("Token usage:", sources);
              const citations = sources?.map((source) => ({
                url: source.url,
                title: source.title || source.url,
                // Default to 0 for indices if not provided
                startIndex: 0,
                endIndex: 0,
              }));
              console.log("Sources:", citations);

              if (citations?.length > 0) {
                dataStream.writeMessageAnnotation({
                  type: "search-results",
                  citations,
                });
              }

              await incrementAndLogTokenUsage(userId, usage.totalTokens);
              dataStream.writeData("call completed");
            },
          });

          result.mergeIntoDataStream(dataStream);
        }
      } catch (error) {
        console.error("Error in POST request:", error);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Error in stream:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
