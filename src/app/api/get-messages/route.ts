import { db } from "@/lib/db"
import { chats, messages } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chatId } = await req.json()
    if (!chatId) {
        return NextResponse.json({ error: "chatId is required" }, { status: 400 })
    }

    // Verify this chat belongs to the requesting user
    const chat = await db.select().from(chats).where(eq(chats.id, chatId))
    if (!chat.length || chat[0].userId !== userId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const _messages = await db.select().from(messages).where(eq(messages.chatId, chatId))
    return NextResponse.json(_messages)
}
