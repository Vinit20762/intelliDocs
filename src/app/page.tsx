import FileUplaod from "@/components/FileUplaod";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  let firstChat;
  if (userId) {
    firstChat = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt))
      .limit(1);
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center text-center">

          {/* Logo + name */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow flex items-center justify-center">
              <Image src="/Logo.svg" alt="intelliDocs" width={36} height={36} className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">intelliDocs</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton />
          </div>

          <div className="flex mt-2">
            {isAuth && firstChat && firstChat.length > 0 && (
              <Link href={`/chat/${firstChat[0].id}`}>
                <Button className="hover:cursor-pointer">Go to Chat</Button>
              </Link>
            )}
          </div>

          <p className="max-w-xl mt-2 text-base md:text-lg text-slate-600">
            Join millions of students, researchers and professionals to instantly
            answer questions and understand research with AI
          </p>

          <div className="w-full mt-4">
            {isAuth ? (
              <FileUplaod />
            ) : (
              <Link href="/sign-in">
                <Button className="w-full md:w-auto hover:cursor-pointer">Login to get Started!
                  <LogIn />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
