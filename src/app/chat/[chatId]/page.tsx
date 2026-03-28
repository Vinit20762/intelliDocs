import ChatLayout from '@/components/ChatLayout';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  params: Promise<{ chatId: string }>;
};

const ChatPage = async (props: Props) => {
    const { params } = props;
    const { chatId } = await params;

    const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.createdAt));
  if(!_chats){
    return redirect('/');
  }

  if (!_chats.find(chat => chat.id === parseInt(chatId))) {
    return redirect('/');
  }

  const currentChat = _chats.find(chat => chat.id === parseInt(chatId))

  return (
    <ChatLayout
      chats={_chats}
      chatId={parseInt(chatId)}
      pdfUrl={currentChat?.pdfUrl || ''}
    />
  );
};

export default ChatPage;
