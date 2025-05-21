"use client"

import { Dashboard } from "@/components/dashboard"
import { Sidebar } from "@/components/sidebar"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 md:ml-64">
        <Dashboard />
      </main>
    </div>
  )
}
