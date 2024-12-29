'use client'

import { useEffect, useState } from "react"
import { Clock, Globe } from 'lucide-react'

export default function App() {
  const [tabData, setTabData] = useState([])

  useEffect(() => {
    chrome.storage.local.get("tabData", (result) => {
      const data = result.tabData || {}
      const aggregatedData = Object.values(data).reduce((acc, tab) => {
        if (!acc[tab.domain]) {
          acc[tab.domain] = { domain: tab.domain, timeSpent: 0 }
        }
        acc[tab.domain].timeSpent += tab.timeSpent
        return acc
      }, {})
      setTabData(Object.values(aggregatedData).sort((a, b) => b.timeSpent - a.timeSpent))
    })
  }, [])

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getTotalTime = () => {
    return tabData.reduce((acc, tab) => acc + tab.timeSpent, 0)
  }

  return (
    <div className="w-[400px] h-[600px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="p-6 space-y-1 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold">Screen Time</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total time: {formatTime(getTotalTime())}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6">
        {tabData.map((tab) => (
          <div
            key={tab.domain}
            className="flex items-center py-4 group hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0 mr-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-500 dark:text-blue-300" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-medium text-sm truncate">{tab.domain}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(tab.timeSpent)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

