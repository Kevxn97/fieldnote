import { promises as fs } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { ReasoningEffort } from "./types.js";

dotenv.config();

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function requireOpenAIConfigured(): void {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY is missing. Copy .env.example to .env and set your API key.");
  }
}

export function createOpenAIClient(): OpenAI {
  requireOpenAIConfigured();
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function runTextResponse(args: {
  model: string;
  instructions: string;
  input: string;
  reasoningEffort: ReasoningEffort;
  imagePaths?: string[];
}): Promise<string> {
  const client = createOpenAIClient();
  const input =
    args.imagePaths && args.imagePaths.length > 0
      ? await buildRichInput(args.input, args.imagePaths)
      : args.input;
  const response = await client.responses.create({
    model: args.model,
    instructions: args.instructions,
    input: input as never,
    reasoning: {
      // Docs-confirmed values can outpace the installed SDK union for new models.
      effort: args.reasoningEffort as never
    }
  } as never);

  const output = extractResponseText(response as unknown as Record<string, unknown>);
  if (!output) {
    throw new Error("The model returned no text output.");
  }
  return output.trim();
}

async function buildRichInput(
  input: string,
  imagePaths: string[]
): Promise<Array<{ role: "user"; content: Array<{ type: "input_text"; text: string } | { type: "input_image"; image_url: string }> }>> {
  const content: Array<{ type: "input_text"; text: string } | { type: "input_image"; image_url: string }> = [
    { type: "input_text", text: input }
  ];
  for (const imagePath of imagePaths.slice(0, 4)) {
    const dataUrl = await filePathToDataUrl(imagePath);
    if (!dataUrl) {
      continue;
    }
    content.push({
      type: "input_image",
      image_url: dataUrl
    });
  }
  return [{ role: "user", content }];
}

async function filePathToDataUrl(filePath: string): Promise<string | null> {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[ext];
  if (!mimeType) {
    return null;
  }
  const bytes = await fs.readFile(filePath);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

function extractResponseText(response: Record<string, unknown>): string {
  const output = Array.isArray(response.output) ? response.output : [];
  const chunks: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const content = Array.isArray((item as { content?: unknown }).content)
      ? ((item as { content?: unknown }).content as unknown[])
      : [];
    for (const part of content) {
      if (!part || typeof part !== "object") {
        continue;
      }
      const typedPart = part as { type?: string; text?: string };
      if (typedPart.type === "output_text" && typeof typedPart.text === "string") {
        chunks.push(typedPart.text);
      }
    }
  }

  return chunks.join("\n").trim();
}
