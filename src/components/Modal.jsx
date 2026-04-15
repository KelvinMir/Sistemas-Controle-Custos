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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-5" onMouseDown={(e) => { if (e.target === e.currentTarget && !ignoreClickOnce) onClose() }}>
      <div className={`w-full max-w-2xl bg-white rounded-xl shadow-2xl relative overflow-hidden border border-blue-100 ${className}`} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <button className="absolute right-2 top-2 border-0 bg-transparent text-2xl leading-none cursor-pointer text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={onClose} aria-label="Fechar">×</button>
        {title && (
          <header className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 m-0">{title}</h3>
          </header>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
