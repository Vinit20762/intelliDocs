"use client"

import React, { useState } from 'react'
import ChatSideBar from './ChatSideBar'
import PDFViewer from './PDFViewer'
import ChatComponent from './ChatComponent'
import { DrizzleChat } from '@/lib/db/schema'
import { FileText, Menu, X } from 'lucide-react'
import Image from 'next/image'

type Props = {
  chats: DrizzleChat[]
  chatId: number
  pdfUrl: string
}

const ChatLayout = ({ chats, chatId, pdfUrl }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // Mobile-specific states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'chat' | 'pdf'>('chat')

  return (
    <div className='flex h-screen overflow-hidden'>

      {/* ── DESKTOP sidebar (md and above) ── */}
      <div className={`hidden md:block shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-14'}`}>
        <ChatSideBar
          chats={chats}
          chatId={chatId}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
        />
      </div>

      {/* ── MOBILE sidebar overlay ── */}
      {mobileSidebarOpen && (
        <div className='md:hidden fixed inset-0 z-50 flex'>
          {/* Sidebar panel */}
          <div className='w-72 h-full'>
            <ChatSideBar
              chats={chats}
              chatId={chatId}
              isOpen={true}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
          {/* Backdrop */}
          <div
            className='flex-1 bg-black/50'
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* ── Main content ── */}
      <div className='flex flex-1 h-full overflow-hidden flex-col md:flex-row'>

        {/* Mobile top bar */}
        <div className='md:hidden flex items-center justify-between px-3 py-3 bg-gray-950 border-b border-gray-800 shrink-0'>

          {/* Left: hamburger + logo + name */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className='flex items-center gap-2.5 cursor-pointer'
          >
            <Menu className='w-5 h-5 text-gray-400' />
            <div className='w-7 h-7 rounded-lg overflow-hidden bg-white flex items-center justify-center'>
              <Image src='/Logo.svg' alt='intelliDocs' width={24} height={24} className='object-contain' />
            </div>
            <span className='text-sm font-bold text-white tracking-tight'>intelliDocs</span>
          </button>

          {/* Right: PDF / Chat toggle */}
          <button
            onClick={() => setMobileView(v => v === 'chat' ? 'pdf' : 'chat')}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium'
          >
            <FileText className='w-3.5 h-3.5' />
            {mobileView === 'chat' ? 'View PDF' : 'View Chat'}
          </button>

        </div>

        {/* PDF column — hidden on mobile unless mobileView=pdf */}
        <div className={`
          flex-[5] h-full overflow-hidden bg-gray-50 border-r border-gray-200
          ${mobileView === 'pdf' ? 'flex' : 'hidden'} md:flex flex-col
        `}>
          {/* Mobile close PDF bar */}
          <div className='md:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 shrink-0'>
            <span className='text-xs text-gray-500 truncate flex-1'>PDF Viewer</span>
            <button
              onClick={() => setMobileView('chat')}
              className='p-1 rounded text-gray-400 hover:text-gray-600'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <div className='flex-1 overflow-hidden'>
            <PDFViewer key={pdfUrl} pdf_url={pdfUrl} />
          </div>
        </div>

        {/* Chat column — hidden on mobile unless mobileView=chat */}
        <div className={`
          flex-[3] h-full overflow-hidden
          ${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex flex-col
        `}>
          <ChatComponent chatId={chatId} />
        </div>

      </div>
    </div>
  )
}

export default ChatLayout
