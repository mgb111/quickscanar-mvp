import React from 'react'

interface ProgressBarProps {
  progress: number
  label?: string
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500">{Math.round(progress)}%</div>
    </div>
  )
}