import React, { useEffect, useState } from 'react'

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  const [ignoreClickOnce, setIgnoreClickOnce] = useState(false)

  useEffect(() => {
    if (isOpen && !ignoreClickOnce) {
      setIgnoreClickOnce(true)
      const timer = setTimeout(() => setIgnoreClickOnce(false), 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-rose-950/35 backdrop-blur-sm z-50 p-3 sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget && !ignoreClickOnce) onClose() }}>
      <div className={`w-full max-w-2xl max-h-[92vh] bg-white rounded-lg shadow-xl relative overflow-hidden border border-rose-100 flex flex-col ${className}`} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <button className="absolute right-2 top-2 border-0 bg-transparent text-2xl leading-none cursor-pointer text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={onClose} aria-label="Fechar">×</button>
        {title && (
          <header className="px-4 sm:px-6 py-4 pr-12 border-b border-rose-100 bg-rose-50/80 shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-rose-950 m-0 break-words">{title}</h3>
          </header>
        )}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
