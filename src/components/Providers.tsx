"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

type Props = {
    children: React.ReactNode
}

const queryClient = new QueryClient()

const Providers = ({children}: Props) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default Providers

// these providers function handles the caching of user requestion in order to save the resources and smooth workflow, put mutation function in the fileUplaod 
// component which allows to hit the backend api