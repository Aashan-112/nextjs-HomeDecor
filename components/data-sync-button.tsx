"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { syncDataToDatabase } from "@/lib/data/data-sync"
import { toast } from "sonner"
import { Database, RefreshCw } from "lucide-react"

export function DataSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncDataToDatabase()
      setLastSync(new Date())
      toast.success("Data synchronized successfully!")
    } catch (error) {
      console.error("Sync failed:", error)
      toast.error("Failed to sync data. Check console for details.")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="bg-transparent">
        {isSyncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
        {isSyncing ? "Syncing..." : "Sync Data"}
      </Button>

      {lastSync && (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Last synced: {lastSync.toLocaleTimeString()}
        </Badge>
      )}
    </div>
  )
}
