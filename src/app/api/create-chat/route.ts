import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response ) {
    const { userId } = await auth();    //it will give the user id of the logged in user
    if (!userId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { file_key, file_name } = body;
        console.log('Processing file:', file_key, file_name);
        
        // Load into Pinecone
        console.log('Starting PDF processing and Pinecone upload...');
        await loadS3IntoPinecone(file_key);
        console.log('Successfully loaded PDF into Pinecone');
        
        // Insert into DB
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
        return NextResponse.json({ 
            chat_id: chat_id[0].insertedId,
         },
        {
            status: 200
        });
    } catch (error: any) {
        console.error('Error in create-chat:', error);
        
        // Provide more specific error messages
        const errorMessage = error.message || "An unknown error occurred";
        return NextResponse.json({ 
            error: "Failed to process PDF",
            details: errorMessage
        }, { 
            status: 500 
        });
    }
}
