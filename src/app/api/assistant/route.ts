import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;
const VALID_ROLES = new Set(["user", "assistant"]);

const SYSTEM_PROMPT = `You are a cheatsheet assistant. Help users create and organize their technical cheatsheets.
When asked to create commands or snippets, respond conversationally AND include structured data like:
[ACTION:create_snippet]{"categoryName":"AWS","title":"S3 Commands","commands":[{"label":"List buckets","content":"aws s3 ls","language":"bash"}]}[/ACTION]
The application will parse this and offer to add it automatically.

Guidelines:
- Be concise and practical
- Focus on commonly used commands and their options
- Include helpful labels that explain what each command does
- Use appropriate language tags (bash, python, yaml, json, sql, etc.)
- When creating a full cheatsheet, organize commands logically
- You can create multiple snippets in a single response by using multiple ACTION blocks`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // SEC-6: Rate limit — 20 requests per user per minute
  if (!rateLimit(`assistant:${session.user.id}`, 20, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    return NextResponse.json(
      {
        error:
          "The AI assistant is not configured. Please set a valid ANTHROPIC_API_KEY in your .env.local file.",
      },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Messages array is required" },
      { status: 400 }
    );
  }

  // BUG-8: Validate each message role
  for (const m of messages) {
    if (!VALID_ROLES.has(m.role)) {
      return NextResponse.json(
        { error: `Invalid message role: ${m.role}` },
        { status: 400 }
      );
    }
    // BUG-7: Validate content is a string within size limit
    if (typeof m.content !== "string" || m.content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        {
          error: `Each message content must be a string of at most ${MAX_CONTENT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }
  }

  // BUG-7: Limit to last N messages
  const trimmedMessages = messages.slice(-MAX_MESSAGES);

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: trimmedMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const content = textBlock ? textBlock.text : "No response generated.";

    return NextResponse.json({ content });
  } catch (error: unknown) {
    // WARN-6: Return proper error status instead of 200
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Assistant API error:", message);
    return NextResponse.json(
      { error: `Error communicating with AI: ${message}` },
      { status: 500 }
    );
  }
}
