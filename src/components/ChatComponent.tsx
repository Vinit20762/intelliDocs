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
  const { data, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId })
      console.log("Fetched Messages:", response.data);
      return response.data
    }
  })

  const { input, handleInputChange, handleSubmit, messages, setMessages } = useChat({
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
    <div className='relative max-h-screen overflow-hidden flex flex-col'>
      <div className='sticky top-0 inset-x-0 bg-white p-2 h-fit'>
        <h3 className='text-xl font-bold'>Chat</h3>
      </div>

      <div id='message-container' className='flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4'>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <form onSubmit={handleSubmit} className='sticky bottom-0 inset-x-0 px-2 py-4 bg-white'>
        <div className='flex'>
          <Input 
            value={input}
            onChange={handleInputChange}
            placeholder='Ask your queries...'
            className='w-full'
          />
          <Button className='bg-blue-600 ml-2'>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatComponent
