// ...existing code...
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Message } from "ai/react";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    // 1. Get chat
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      return new Response(JSON.stringify({ error: "Chat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    // 2. Get context from Pinecone
    const context = await getContext(lastMessage.content, fileKey);

    const systemPrompt: Message = {
      id: crypto.randomUUID(),
      role: "system",
      content: `You are an intelligent assistant analyzing a PDF document. Use the following context from the PDF to answer questions accurately and comprehensively.
                
                CONTEXT FROM PDF:
                ${context}
                
                INSTRUCTIONS:
                1. Always base your answers on the context provided above
                2. If the answer is found in the context, provide it with relevant details
                3. If you're unsure or the information is not in the context, say "I apologize, but I don't find this specific information in the PDF document."
                4. Keep answers focused on the PDF content
                5. You can refer to specific sections or pages if that information is available in the context
                
                Answer the user's questions about the PDF content in a helpful and informative way.`,
    };

    // 3. Save user message before streaming
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    // 4. Stream OpenAI response
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        systemPrompt,
        ...messages
      ],
      stream: true,
    });

    // cast response to any to satisfy OpenAIStream typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = OpenAIStream(response as any, {
      async onCompletion(completion) {
        // Save AI completion after streaming
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "assistant",
        });
      },
    });

    // 5. Return streaming response
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("API Chat Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
// ...existing code...