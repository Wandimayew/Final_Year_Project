'use client';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

const QRCodeGenerator = () => {
  const [schoolId, setSchoolId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Correct Ethiopian time conversion
  const convertToEthiopianTime = (hours, minutes) => {
    let ethiopianHours = hours - 6;
    if (ethiopianHours < 0) {
      ethiopianHours += 12; // Adjust to Ethiopian time format
    }

    const period = ethiopianHours >= 6 ? 'Afternoon' : 'Morning';

    return `${ethiopianHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const generateQRCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!schoolId || schoolId <= 0) {
      setError('Please enter a valid School ID.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Please set both start and end times.');
      return;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    try {
      setLoading(true);

      const response = await axios.post('http://localhost:8085/api/qrcodes/generate', {
        schoolId: parseInt(schoolId),
        startTimeHour: startHours,
        startTimeMinute: startMinutes,
        endTimeHour: endHours,
        endTimeMinute: endMinutes,
        generatedBy: 'admin',
      });

      console.log(response.data);

      // Convert start and end times to Ethiopian format
      const ethiopianStartTime = convertToEthiopianTime(startHours, startMinutes);
      const ethiopianEndTime = convertToEthiopianTime(endHours, endMinutes);

      setQrCodeData({
        ...response.data,
        ethiopianStartTime,
        ethiopianEndTime,
      });

      // Reset input fields after generating the QR code
      setSchoolId('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      setError('Failed to generate QR code. Please try again.');
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-gray-100 p-8 rounded-xl shadow-lg">
      <div className="border border-gray-300 rounded-lg p-6 text-black">
        <form onSubmit={generateQRCode} className="space-y-6">
          <div>
            <label htmlFor="schoolId" className="block text-lg font-medium text-gray-800">
              School ID
            </label>
            <input
              type="number"
              id="schoolId"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="mt-2 block w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter School ID"
            />
          </div>

          <div>
            <label htmlFor="startTime" className="block text-lg font-medium text-gray-800">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-2 block w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-lg font-medium text-gray-800">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-2 block w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </form>
      </div>

      {qrCodeData && (
        <div className="mt-8 border border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="text-center">
            <p className="text-lg font-semibold text-black">Generated QR Code:</p>
            {qrCodeData.qrCodeImage ? (
<<<<<<< HEAD
               <img
               src={`data:image/png;base64,${qrCodeData.qrCodeImage}`}
=======
               <Image
               src={`http://localhost:8085${qrCodeData.qrCodeImage.replace('.', '')}`}
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7
               alt="QR Code"
               className="mx-auto w-64 h-64 mt-4"
             />
            ) : (
              <p className="text-red-500">Failed to load QR Code image</p>
            )}
            {/* <div className="mt-6 text-sm text-gray-600 space-y-2">
              <p>
                <strong>Valid Time Window:</strong>{' '}
                {qrCodeData.ethiopianStartTime} - {qrCodeData.ethiopianEndTime}
              </p>
              <p><strong>Session Token:</strong> {qrCodeData.sessionToken || 'N/A'}</p>
              <p><strong>Status:</strong> {qrCodeData.status || 'N/A'}</p>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
