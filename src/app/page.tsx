import FileUplaod from "@/components/FileUplaod";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { LogIn, Mail } from "lucide-react";
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
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100 flex flex-col">

      {/* Hero */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
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

      {/* Footer */}
      <footer className="w-full bg-white/60 backdrop-blur-sm border-t border-white/80 px-6 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Top row */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
                  <Image src="/Logo.svg" alt="intelliDocs" width={28} height={28} className="object-contain" />
                </div>
                <span className="font-bold text-gray-800 tracking-tight">intelliDocs</span>
              </div>
              <p className="text-xs text-gray-500 max-w-[200px] text-center md:text-left">
                AI-powered PDF chat. Ask questions, get answers instantly.
              </p>
            </div>

            {/* Legal links */}
            <div className="flex flex-col items-center md:items-start gap-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Legal</p>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
            </div>

            {/* Built by */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Built by</p>
              <p className="text-sm font-medium text-gray-800">Vinit Raj Singh</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/vinit-raj-singh-0312b5286/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/Vinit20762"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                  title="GitHub"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="mailto:vinitrajsingh5555@gmail.com"
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom row */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} intelliDocs. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
}
