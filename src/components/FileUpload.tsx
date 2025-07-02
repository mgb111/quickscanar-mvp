import React, { useCallback, useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  label: string
  accept: string
  maxSize: number
  file: File | null
  onFileSelect: (file: File | null) => void
  error?: string
}

export function FileUpload({ label, accept, maxSize, file, onFileSelect, error }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFile = files.find(f => 
      accept.split(',').some(type => f.type.includes(type.trim().replace('*', '')))
    )
    
    if (validFile && validFile.size <= maxSize) {
      onFileSelect(validFile)
    }
  }, [accept, maxSize, onFileSelect])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.size <= maxSize) {
      onFileSelect(selectedFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : file
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          {file ? (
            <div className="space-y-2">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              <div className="text-sm font-medium text-gray-900">{file.name}</div>
              <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFileSelect(null)
                }}
                className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className={`w-8 h-8 mx-auto ${error ? 'text-red-400' : 'text-gray-400'}`} />
              <div className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                Max size: {formatFileSize(maxSize)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  )
}