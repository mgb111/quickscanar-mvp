import React from 'react'
import { ExternalLink, Copy, Download } from 'lucide-react'

interface CampaignResultProps {
  campaign: {
    id: string
    video_url: string
    marker_url: string
    hosted_url: string
    created_at: string
  }
  qrCodeUrl: string
}

export function CampaignResult({ campaign, qrCodeUrl }: CampaignResultProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `ar-campaign-${campaign.id}.png`
    link.click()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg">Campaign Created Successfully!</h3>
        <p className="text-green-100 text-sm">ID: {campaign.id}</p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Campaign Details</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  AR Experience URL
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={campaign.hosted_url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(campaign.hosted_url)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={campaign.hosted_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {new Date(campaign.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">QR Code</h4>
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="mt-3 inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Share the QR code or URL to let users experience your AR campaign. 
            Point your device camera at the marker image to see the AR content!
          </p>
        </div>
      </div>
    </div>
  )
}