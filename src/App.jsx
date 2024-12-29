/* global chrome */
import { useEffect, useState } from "react";
import { Clock, Globe } from 'lucide-react';

const App = () => {
  const [tabData, setTabData] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("tabData", (result) => {
      const data = result.tabData || {};
      const aggregatedData = Object.values(data).reduce((acc, tab) => {
        if (!acc[tab.domain]) {
          acc[tab.domain] = { domain: tab.domain, timeSpent: 0 };
        }
        acc[tab.domain].timeSpent += tab.timeSpent;
        return acc;
      }, {});
      setTabData(Object.values(aggregatedData).sort((a, b) => b.timeSpent - a.timeSpent));
    });
  }, []);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Screen Time Tracker
        </h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {tabData.map((tab, index) => (
            <div
              key={tab.domain}
              className={`flex items-center p-4 ${
                index !== tabData.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex-grow">
                <p className="font-medium text-gray-800">{tab.domain}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(tab.timeSpent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

