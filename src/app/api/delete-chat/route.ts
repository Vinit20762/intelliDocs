import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import AWS from "aws-sdk";

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    // Verify this chat belongs to the user
    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId));

    if (!chat.length || chat[0].userId !== userId) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = chat[0].fileKey;

    // 1. Delete messages first (foreign key constraint)
    await db.delete(messages).where(eq(messages.chatId, chatId));

    // 2. Delete chat from DB
    await db.delete(chats).where(eq(chats.id, chatId));

    // 3. Delete file from S3
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    });

    const s3 = new AWS.S3({
      params: { Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME },
      region: "eu-north-1",
    });

    await s3
      .deleteObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: fileKey,
      })
      .promise();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
