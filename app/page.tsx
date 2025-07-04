"use client"

import { useState } from "react"
import { InspectionForm } from "@/components/inspection-form"
import { InspectionHistory } from "@/components/inspection-history"
import { Button } from "@/components/ui/button"
import { ClipboardList, History } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"form" | "history">("form")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-xl font-bold text-center">LPG Safety Inspection</h1>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <Button
            variant={activeTab === "form" ? "default" : "ghost"}
            className={`flex-1 rounded-none py-4 ${
              activeTab === "form" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("form")}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            className={`flex-1 rounded-none py-4 ${
              activeTab === "history" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="p-4">{activeTab === "form" ? <InspectionForm /> : <InspectionHistory />}</main>
    </div>
  )
}
