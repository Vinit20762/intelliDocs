"use client"
import React from 'react'
import { Input } from './ui/input'
import { Message, useChat } from 'ai/react'
import { Button } from './ui/button'
import { Lock, Send } from 'lucide-react'
import MessageList from './MessageList'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import UpgradeModal from './UpgradeModal'

const FREE_MESSAGE_LIMIT = 5

type Props = { chatId: number }

const ChatComponent = ({ chatId }: Props) => {
  const [modalOpen, setModalOpen] = React.useState(false)

  const { data, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId })
      return response.data
    }
  })

  const { input, handleInputChange, handleSubmit, messages, setMessages, isLoading: isAiThinking } = useChat({
    api: '/api/chat',
    body: { chatId },
    onError: () => {
      setModalOpen(true)
    }
  })

  React.useEffect(() => {
    if (data) setMessages(data)
  }, [data, setMessages])

  React.useEffect(() => {
    const messageContainer = document.getElementById('message-container')
    messageContainer?.scrollTo({ top: messageContainer.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Use DB data for initial count (avoids false-enabled state before data loads)
  const dbCount  = (data  ?? []).filter(m => m.role === 'user').length
  const liveCount = messages.filter(m => m.role === 'user').length
  const userMessageCount = Math.max(dbCount, liveCount)
  const isAtLimit = !isLoadingMessages && userMessageCount >= FREE_MESSAGE_LIMIT

  return (
    <>
      <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} reason="message_limit" />

      <div className='relative h-screen overflow-hidden flex flex-col bg-white'>

        {/* Header */}
        <div className='shrink-0 px-4 py-3 border-b border-gray-100 bg-white'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <h3 className='text-sm font-semibold text-gray-800'>intelliDoc Agent</h3>
            </div>
            {/* Message counter */}
            <div className='flex items-center gap-1.5'>
              <div className='w-16 h-1 bg-gray-100 rounded-full overflow-hidden'>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? 'bg-red-400' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((userMessageCount / FREE_MESSAGE_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-[11px] font-medium tabular-nums ${isAtLimit ? 'text-red-500' : 'text-gray-400'}`}>
                {userMessageCount}/{FREE_MESSAGE_LIMIT}
              </span>
            </div>
          </div>
          <p className='text-xs text-gray-400 mt-0.5'>Ask anything about your document</p>
        </div>

        {/* Messages */}
        <div id='message-container' className='flex-1 overflow-y-auto py-4'>
          <MessageList messages={messages} isLoading={isLoadingMessages} isAiThinking={isAiThinking} />
        </div>

        {/* Input */}
        <div className='shrink-0 px-3 py-3 border-t border-gray-100 bg-white'>
          {isAtLimit ? (
            <button
              onClick={() => setModalOpen(true)}
              className='w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity relative overflow-hidden'
            >
              <span className='absolute inset-y-0 left-0 w-1/4 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent' />
              <Lock className='w-4 h-4' />
              Message limit reached — Upgrade to Pro
            </button>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className='flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all'>
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder='Ask about your document...'
                  className='flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-gray-400 p-0 h-auto'
                />
                <Button
                  type='submit'
                  size='icon'
                  disabled={!input.trim() || isLoadingMessages}
                  className='w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 shrink-0'
                >
                  <Send className='h-3.5 w-3.5' />
                </Button>
              </div>
            </form>
          )}
        </div>

      </div>
    </>
  )
}

export default ChatComponent
