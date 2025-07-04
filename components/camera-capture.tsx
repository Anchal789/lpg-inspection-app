"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X, RotateCcw } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setCapturedImage(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Capture Kitchen Image</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!capturedImage ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Take a photo of the kitchen area</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured kitchen"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleRetake} className="flex-1 bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={handleCapture} className="flex-1 bg-green-600 hover:bg-green-700">
                  Use Photo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
