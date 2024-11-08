import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

const getBaseUrl = () => {
  return process.env.OPENAI_API_BASE || "https://api.openai.com/v1"; // 默认 URL
};

const openai = createOpenAI({ baseURL: getBaseUrl() });

const models = {
  "gpt-4o": openai("gpt-4o"),
  "gpt-4o-mini": openai("gpt-4o-mini"),
  "grok-beta": openai("grok-beta"),
  "claude-3-5-sonnet-20240620": anthropic("claude-3-5-sonnet-20240620"),
};

export const getModel = (name: string) => {
  if (!models[name]) {
    console.log(`Model ${name} not found`);
    console.log(`Defaulting to gpt-4o`);
    return models["gpt-4o"];
  }
  console.log(`Using model ${name}`);
  return models[name];
};