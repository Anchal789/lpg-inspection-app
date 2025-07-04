"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { CameraCapture } from "@/components/camera-capture"
import { ProductsSection } from "@/components/products-section"
import { Save, Camera } from "lucide-react"

const inspectionQuestions = [
  "Is the cylinder in good condition without any dents or rust?",
  "Is the cylinder valve working properly?",
  "Are there any gas leaks detected?",
  "Is the rubber tube in good condition?",
  "Is the regulator functioning correctly?",
  "Is the stove burner clean and working?",
  "Are all connections tight and secure?",
  "Is the kitchen well-ventilated?",
  "Is the cylinder stored in an upright position?",
  "Are there any combustible materials near the gas equipment?",
  "Is the safety valve accessible?",
  "Has the consumer been educated about safety measures?",
]

export function InspectionForm() {
  const [formData, setFormData] = useState({
    consumerName: "",
    mobileNumber: "",
    address: "",
    consumerNumber: "",
    answers: {} as Record<number, string>,
    kitchenImages: [] as string[],
    products: [] as Array<{ id: string; name: string; price: number; quantity: number }>,
  })

  const [showCamera, setShowCamera] = useState(false)

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: value,
      },
    }))
  }

  const handleImageCapture = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      kitchenImages: [...prev.kitchenImages, imageUrl],
    }))
    setShowCamera(false)
  }

  const handleProductsUpdate = (products: Array<{ id: string; name: string; price: number; quantity: number }>) => {
    setFormData((prev) => ({
      ...prev,
      products,
    }))
  }

  const handleSubmit = () => {
    // Form submission logic would go here
    console.log("Form submitted:", formData)
    alert("Inspection form submitted successfully!")
  }

  return (
    <div className="space-y-6">
      {/* Consumer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consumer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="consumerName">Name of Consumer</Label>
            <Input
              id="consumerName"
              value={formData.consumerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, consumerName: e.target.value }))}
              placeholder="Enter consumer name"
            />
          </div>

          <div>
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, mobileNumber: e.target.value }))}
              placeholder="Enter mobile number"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Enter complete address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="consumerNumber">Consumer Number</Label>
            <Input
              id="consumerNumber"
              value={formData.consumerNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, consumerNumber: e.target.value }))}
              placeholder="Enter consumer number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety Inspection Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Safety Inspection Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {inspectionQuestions.map((question, index) => (
            <div key={index} className="space-y-2">
              <Label className="text-sm font-medium leading-relaxed">
                {index + 1}. {question}
              </Label>
              <RadioGroup
                value={formData.answers[index] || ""}
                onValueChange={(value) => handleAnswerChange(index, value)}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`q${index}-yes`} />
                  <Label htmlFor={`q${index}-yes`} className="text-green-600 font-medium">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`q${index}-no`} />
                  <Label htmlFor={`q${index}-no`} className="text-red-600 font-medium">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Kitchen Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kitchen Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setShowCamera(true)} className="w-full" variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Capture Kitchen Image
          </Button>

          {formData.kitchenImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {formData.kitchenImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Kitchen ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        kitchenImages: prev.kitchenImages.filter((_, i) => i !== index),
                      }))
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Section */}
      <ProductsSection products={formData.products} onProductsUpdate={handleProductsUpdate} />

      {/* Submit Button */}
      <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
        <Save className="w-4 h-4 mr-2" />
        Submit Inspection Report
      </Button>

      {/* Camera Modal */}
      {showCamera && <CameraCapture onCapture={handleImageCapture} onClose={() => setShowCamera(false)} />}
    </div>
  )
}
