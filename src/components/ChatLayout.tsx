"use client"

import React, { useState } from 'react'
import ChatSideBar from './ChatSideBar'
import PDFViewer from './PDFViewer'
import ChatComponent from './ChatComponent'
import { DrizzleChat } from '@/lib/db/schema'
import { FileText, PanelLeftOpen } from 'lucide-react'

type Props = {
  chats: DrizzleChat[]
  chatId: number
  pdfUrl: string
}

const ChatLayout = ({ chats, chatId, pdfUrl }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className='flex h-screen overflow-hidden'>

      {/* Sidebar — slides in/out */}
      <div
        className={`shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className='w-64 h-full'>
          <ChatSideBar chats={chats} chatId={chatId} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main content area */}
      <div className='flex flex-1 h-full overflow-hidden'>

        {/* PDF column */}
        <div className='flex-[5] h-full overflow-hidden bg-gray-50 border-r border-gray-200 relative'>
          {/* Toggle button — visible when sidebar is closed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className='absolute top-3 left-3 z-10 flex items-center gap-2 bg-gray-950 text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md'
            >
              <div className='w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center'>
                <FileText className='w-3 h-3 text-white' />
              </div>
              IntelliDocs
              <PanelLeftOpen className='w-4 h-4 text-gray-400' />
            </button>
          )}
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
