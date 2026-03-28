import { cn } from '@/lib/utils'
import { Message } from 'ai/react'
import { Loader2, Bot, User } from 'lucide-react'
import React from 'react'

type Props = {
    messages: Message[],
    isLoading: boolean,
    isAiThinking?: boolean
}

const MessageList = ({ messages, isLoading, isAiThinking }: Props) => {
    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-full'>
                <div className='flex flex-col items-center gap-2 text-gray-400'>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <span className='text-xs'>Loading messages...</span>
                </div>
            </div>
        )
    }

    if (!messages || messages.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center h-full gap-3 text-center px-6'>
                <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
                    <Bot className='w-5 h-5 text-blue-500' />
                </div>
                <div>
                    <p className='text-sm font-medium text-gray-700'>Ask me anything</p>
                    <p className='text-xs text-gray-400 mt-0.5'>I&apos;ll answer based on your PDF document</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-4 px-4'>
            {messages.map(message => (
                <div key={message.id} className={cn('flex items-end gap-2', {
                    'justify-end': message.role === 'user',
                    'justify-start': message.role === 'assistant'
                })}>

                    {/* Bot avatar */}
                    {message.role === 'assistant' && (
                        <div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mb-0.5'>
                            <Bot className='w-3.5 h-3.5 text-blue-600' />
                        </div>
                    )}

                    {/* Bubble */}
                    <div className={cn(
                        'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    )}>
                        <p className='whitespace-pre-wrap break-words'>{message.content}</p>
                    </div>

                    {/* User avatar */}
                    {message.role === 'user' && (
                        <div className='w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mb-0.5'>
                            <User className='w-3.5 h-3.5 text-white' />
                        </div>
                    )}

                </div>
            ))}

            {/* AI thinking indicator */}
            {isAiThinking && (
                <div className='flex items-end gap-2 justify-start'>
                    <div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mb-0.5'>
                        <Bot className='w-3.5 h-3.5 text-blue-600' />
                    </div>
                    <div className='bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1'>
                        <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]' />
                        <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]' />
                        <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]' />
                    </div>
                </div>
            )}
        </div>
    )
}

export default MessageList
