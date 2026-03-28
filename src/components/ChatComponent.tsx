"use client"
import React from 'react'
import { Input } from './ui/input'
import { Message, useChat } from 'ai/react'
import { Button } from './ui/button'
import { Send } from 'lucide-react'
import MessageList from './MessageList'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type Props = { chatId: number }

const ChatComponent = ({ chatId }: Props) => {
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
  });

  React.useEffect(() => {
    if (data) setMessages(data)
  }, [data, setMessages])

  React.useEffect(() => {
    const messageContainer = document.getElementById('message-container')
    messageContainer?.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  return (
    <div className='relative h-screen overflow-hidden flex flex-col bg-white'>

      {/* Header */}
      <div className='shrink-0 px-4 py-3 border-b border-gray-100 bg-white'>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-green-500'></div>
          <h3 className='text-sm font-semibold text-gray-800'>intelliDoc Agent</h3>
        </div>
        <p className='text-xs text-gray-400 mt-0.5'>Ask anything about your document</p>
      </div>

      {/* Messages */}
      <div id='message-container' className='flex-1 overflow-y-auto py-4'>
        <MessageList messages={messages} isLoading={isLoadingMessages} isAiThinking={isAiThinking} />
      </div>

      {/* Input */}
      <div className='shrink-0 px-3 py-3 border-t border-gray-100 bg-white'>
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
              disabled={!input.trim()}
              className='w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 shrink-0'
            >
              <Send className='h-3.5 w-3.5' />
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default ChatComponent
