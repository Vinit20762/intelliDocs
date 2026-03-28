"use client"

import { DrizzleChat } from '@/lib/db/schema'
import React from 'react'
import Link from 'next/link'
import { MessageCircle, PlusCircle, Home, FileText, PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  chats: DrizzleChat[],
  chatId: number,
  onClose?: () => void,
}

const ChatSideBar = ({ chats, chatId, onClose }: Props) => {
  return (
    <div className='w-full h-screen flex flex-col bg-gray-950 text-gray-200'>

      {/* Branding */}
      <div className='px-4 py-4 border-b border-gray-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center'>
              <FileText className='w-4 h-4 text-white' />
            </div>
            <span className='font-bold text-white text-base tracking-tight'>IntelliDocs</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-800'
              title='Collapse sidebar'
            >
              <PanelLeftClose className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className='px-3 pt-4 pb-2'>
        <Link href='/'>
          <button className='w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:border-gray-400 hover:bg-gray-800 transition-all duration-150'>
            <PlusCircle className='w-4 h-4' />
            New Chat
          </button>
        </Link>
      </div>

      {/* Chat List */}
      <div className='px-2 mt-1 flex-1 overflow-y-auto space-y-0.5 sidebar-scroll'>
        <p className='px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider'>Recent</p>
        {chats.map(chat => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150',
                chat.id === chatId
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              )}
            >
              <MessageCircle className={cn('w-4 h-4 shrink-0', chat.id === chatId ? 'text-white' : 'text-gray-500 group-hover:text-gray-300')} />
              <p className='text-sm truncate flex-1'>{chat.pdfName}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className='px-4 py-3 border-t border-gray-800'>
        <div className='flex items-center gap-3 text-xs text-gray-500'>
          <Link href='/' className='flex items-center gap-1.5 hover:text-gray-300 transition-colors'>
            <Home className='w-3.5 h-3.5' />
            Home
          </Link>
        </div>
      </div>

    </div>
  )
}

export default ChatSideBar
