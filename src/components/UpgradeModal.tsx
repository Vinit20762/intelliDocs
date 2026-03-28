"use client"

import { X, Sparkles, Check, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

type Props = {
  isOpen: boolean
  onClose: () => void
  reason: 'pdf_limit' | 'message_limit'
}

const FREE_FEATURES = ['3 PDF uploads', '5 messages per PDF', 'GPT-4 powered AI', 'PDF viewer']
const PRO_FEATURES  = ['Unlimited PDFs', 'Unlimited messages', 'GPT-4 powered AI', 'Priority responses', 'Early access to features']

export default function UpgradeModal({ isOpen, onClose, reason }: Props) {
  if (!isOpen) return null

  const limitText = reason === 'pdf_limit'
    ? "You've reached the 3 PDF limit on the free plan."
    : "You've used all 5 messages for this document."

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in-up">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">

          {/* Banner */}
          <div className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 px-6 py-7 text-white text-center overflow-hidden">
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-float border border-white/20">
                <Sparkles className="w-7 h-7 text-yellow-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Upgrade to Pro</h2>
              <p className="text-sm text-violet-200 mt-1.5 max-w-xs mx-auto">{limitText}</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">

            {/* Plan comparison */}
            <div className="grid grid-cols-2 gap-3 mb-5">

              {/* Free */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Free</p>
                <ul className="space-y-2">
                  {FREE_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-200 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2 py-0.5 rounded-full">PRO</span>
                </div>
                <p className="text-[11px] font-bold text-violet-500 uppercase tracking-widest mb-3">Pro</p>
                <ul className="space-y-2">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-700">
                      <Check className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* CTA button */}
            <button
              disabled
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 relative overflow-hidden cursor-not-allowed opacity-85"
            >
              <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <Zap className="w-4 h-4" />
              Upgrade to Pro — Coming Soon
            </button>

            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Payments launching soon.{' '}
              <Link href="/pricing" onClick={onClose} className="text-violet-600 hover:underline ml-1">
                View pricing
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
