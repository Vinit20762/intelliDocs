"use client"

import React, { useState } from 'react'
import ChatSideBar from './ChatSideBar'
import PDFViewer from './PDFViewer'
import ChatComponent from './ChatComponent'
import { DrizzleChat } from '@/lib/db/schema'

type Props = {
  chats: DrizzleChat[]
  chatId: number
  pdfUrl: string
}

const ChatLayout = ({ chats, chatId, pdfUrl }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className='flex h-screen overflow-hidden'>

      {/* Sidebar — full or icon-strip */}
      <div className={`shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-14'}`}>
        <ChatSideBar
          chats={chats}
          chatId={chatId}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
        />
      </div>

      {/* Main content */}
      <div className='flex flex-1 h-full overflow-hidden'>

        {/* PDF column */}
        <div className='flex-[5] h-full overflow-hidden bg-gray-50 border-r border-gray-200'>
          <PDFViewer key={pdfUrl} pdf_url={pdfUrl} />
        </div>

        {/* Chat column */}
        <div className='flex-[3] h-full overflow-hidden'>
          <ChatComponent chatId={chatId} />
        </div>

      </div>
    </div>
  )
}

export default ChatLayout
