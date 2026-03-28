import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const FREE_PDF_LIMIT = 3;

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Enforce free plan PDF limit
    const countResult = await db.select({ value: count() }).from(chats).where(eq(chats.userId, userId));
    if (countResult[0].value >= FREE_PDF_LIMIT) {
        return NextResponse.json({ error: "pdf_limit_reached" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { file_key, file_name } = body;
        console.log('Processing file:', file_key, file_name);

        console.log('Starting PDF processing and Pinecone upload...');
        await loadS3IntoPinecone(file_key);
        console.log('Successfully loaded PDF into Pinecone');

        console.log('Creating chat record in database...');
        const chat_id = await db.insert(chats).values({
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: getS3Url(file_key),
            userId: userId
        }).returning({
            insertedId: chats.id,
        });

        console.log('Chat created successfully with ID:', chat_id[0].insertedId);
        return NextResponse.json({ chat_id: chat_id[0].insertedId }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error in create-chat:', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: "Failed to process PDF", details: errorMessage }, { status: 500 });
    }
}
