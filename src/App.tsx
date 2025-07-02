import React, { useState } from 'react'
import { Camera, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { supabase, type Campaign } from './lib/supabase'
import { FileUpload } from './components/FileUpload'
import { ProgressBar } from './components/ProgressBar'
import { CampaignResult } from './components/CampaignResult'
import { generateMindARHTML } from './templates/mindar-template'
import { generateQRCode } from './utils/qrcode'

interface UploadProgress {
  marker: number
  video: number
}

function App() {
  const [markerFile, setMarkerFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ marker: 0, video: 0 })
  const [errors, setErrors] = useState<{ marker?: string; video?: string; general?: string }>({})
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  const validateFiles = (): boolean => {
    const newErrors: typeof errors = {}

    if (!markerFile) {
      newErrors.marker = 'Please select a marker image'
    } else if (!['image/jpeg', 'image/jpg', 'image/png'].includes(markerFile.type)) {
      newErrors.marker = 'Marker must be a JPG or PNG image'
    }

    if (!videoFile) {
      newErrors.video = 'Please select a video file'
    } else if (videoFile.type !== 'video/mp4') {
      newErrors.video = 'Video must be in MP4 format'
    } else if (videoFile.size > 100 * 1024 * 1024) {
      newErrors.video = 'Video must be less than 100MB'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFileWithProgress = async (
    file: File,
    path: string,
    progressKey: keyof UploadProgress
  ): Promise<string> => {
    try {
      // Reset progress
      setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }))

      // Simulate progress updates (since Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[progressKey]
          if (currentProgress < 90) {
            return { ...prev, [progressKey]: Math.min(90, currentProgress + 15) }
          }
          return prev
        })
      }, 300)

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('campaigns')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)

      if (error) {
        console.error('Storage upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Set progress to 100%
      setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }))

      // Get public URL with download option set to false
      const { data: urlData } = supabase.storage
        .from('campaigns')
        .getPublicUrl(path, {
          download: false
        })

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file')
      }

      // Construct the public URL manually if needed
      const publicUrl = urlData.publicUrl || 
        `${supabase.storage.url}/object/public/campaigns/${path}`
      
      return publicUrl
    } catch (error) {
      console.error(`Error uploading ${progressKey}:`, error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateFiles() || !markerFile || !videoFile) return

    setIsUploading(true)
    setErrors({})
    setUploadProgress({ marker: 0, video: 0 })

    try {
      const campaignId = uuidv4()
      
      console.log('Starting campaign creation with ID:', campaignId)
      
      // Upload files to Supabase Storage with unique paths
      const timestamp = Date.now()
      const markerExtension = markerFile.name.split('.').pop() || 'jpg'
      const markerPath = `${campaignId}/marker_${timestamp}.${markerExtension}`
      const videoPath = `${campaignId}/video_${timestamp}.mp4`

      console.log('Uploading files...')
      
      const [markerUrl, videoUrl] = await Promise.all([
        uploadFileWithProgress(markerFile, markerPath, 'marker'),
        uploadFileWithProgress(videoFile, videoPath, 'video')
      ])

      console.log('Files uploaded successfully:', { markerUrl, videoUrl })

      // Generate MindAR HTML
      const htmlContent = generateMindARHTML(videoUrl, markerUrl)
      
      // Create hosted URL (in a real implementation, you'd deploy this HTML)
      const hostedUrl = `https://ar-experience.netlify.app/campaigns/${campaignId}`

      console.log('Saving campaign to database...')

      // Save campaign to database
      const { data: campaignData, error: dbError } = await supabase
        .from('campaigns')
        .insert({
          id: campaignId,
          video_url: videoUrl,
          marker_url: markerUrl,
          hosted_url: hostedUrl
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Database error: ${dbError.message}`)
      }

      console.log('Campaign saved successfully:', campaignData)

      // Generate QR code
      const qrCode = await generateQRCode(hostedUrl)
      
      setCampaign(campaignData)
      setQrCodeUrl(qrCode)

    } catch (error) {
      console.error('Error creating campaign:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create campaign. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('row-level security policy') || error.message.includes('Unauthorized')) {
          errorMessage = 'Permission denied. Please check your Supabase configuration and ensure anonymous access is enabled.'
        } else if (error.message.includes('Upload failed') || error.message.includes('storage')) {
          errorMessage = 'File upload failed. Please check your internet connection and file sizes, then try again.'
        } else if (error.message.includes('Database error')) {
          errorMessage = 'Database error. Please try again later.'
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Campaign ID conflict. Please try again.'
        }
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setMarkerFile(null)
    setVideoFile(null)
    setCampaign(null)
    setQrCodeUrl('')
    setErrors({})
    setUploadProgress({ marker: 0, video: 0 })
  }

  if (campaign && qrCodeUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <button
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Create Another Campaign
              </button>
            </div>
            
            <CampaignResult campaign={campaign} qrCodeUrl={qrCodeUrl} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AR Campaign Generator</h1>
            <p className="text-gray-600">Create immersive AR experiences with MindAR technology</p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <h2 className="text-white font-semibold text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Upload Your Content
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-red-700 text-sm">{errors.general}</div>
                </div>
              )}

              <div className="grid gap-6">
                <FileUpload
                  label="Marker Image"
                  accept=".jpg,.jpeg,.png"
                  maxSize={10 * 1024 * 1024} // 10MB
                  file={markerFile}
                  onFileSelect={setMarkerFile}
                  error={errors.marker}
                />

                <FileUpload
                  label="AR Video Content"
                  accept=".mp4"
                  maxSize={100 * 1024 * 1024} // 100MB
                  file={videoFile}
                  onFileSelect={setVideoFile}
                  error={errors.video}
                />
              </div>

              {isUploading && (
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 text-center">
                    Creating your AR campaign...
                  </div>
                  <ProgressBar progress={uploadProgress.marker} label="Uploading marker image" />
                  <ProgressBar progress={uploadProgress.video} label="Uploading video content" />
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !markerFile || !videoFile}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate AR Campaign
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Upload a clear marker image (JPG/PNG) that will trigger the AR experience</li>
              <li>• Upload your video content (MP4, max 100MB) that will appear in AR</li>
              <li>• Get a QR code and shareable link for your AR campaign</li>
              <li>• Users scan the marker with their device camera to see your content in AR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App