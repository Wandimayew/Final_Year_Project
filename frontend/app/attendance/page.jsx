'use client';
import { useState } from 'react';
import QRCodeGenerator from '@/components/attendance/QRCodeGenerator';
import QRCodeScanner from '@/components/attendance/QRCodeScanner';
import AttendanceList from '@/components/attendance/AttendanceList';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'scan', 'list'

  return (
    <div className="bg-gray-100 min-h-screen p-6"> {/* Gray background for the whole page */}
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg"> {/* Box with padding, rounded corners, and shadow */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800">QR Code Attendance</h1> {/* Ensuring text color is dark enough */}

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('generate')}
                className={`${
                  activeTab === 'generate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Generate QR Code
              </button>
              <button
                onClick={() => setActiveTab('scan')}
                className={`${
                  activeTab === 'scan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Scan QR Code
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Attendance List
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'generate' && <QRCodeGenerator />}
          {activeTab === 'scan' && <QRCodeScanner />}
          {activeTab === 'list' && <AttendanceList />}
        </div>
      </div>
    </div>
  );
}
