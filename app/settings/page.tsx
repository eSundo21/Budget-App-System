"use client"

import { Sidebar } from "@/components/sidebar"
import { Settings } from "@/components/settings"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 md:ml-64">
        <Settings />
      </main>
    </div>
  )
}
