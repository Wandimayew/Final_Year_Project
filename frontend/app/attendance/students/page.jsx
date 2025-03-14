"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useValidateQRCodeAndMarkAttendance } from "@/lib/api/studentService/attendances";

const QRCodeScannerPage = () => {
  const videoRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const { mutate: validateQRCodeAndMarkAttendance, isLoading } = useValidateQRCodeAndMarkAttendance();

  // Start QR code scanning
  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);

      const codeReader = new BrowserQRCodeReader();

      // Get available video input devices (cameras)
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        setError("No camera found. Please ensure your device has a camera.");
        setIsScanning(false);
        return;
      }

      // Use the first available camera
      const selectedDeviceId = videoInputDevices[0].deviceId;

      // Start decoding from the selected camera
      await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
        if (result) {
          setScanResult(result.getText());
          stopScanning();
        }
      });

      console.log("Scanning started...");
    } catch (err) {
      setError("Failed to start scanning. Please ensure camera access is allowed.");
      console.error(err);
      setIsScanning(false);
    }
  };

  // Stop QR code scanning
  const stopScanning = () => {
    setIsScanning(false);
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
  };

  // Handle QR code scan result
  useEffect(() => {
    if (scanResult) {
      const parseQRCodeData = (qrCodeText) => {
        const data = {};
        qrCodeText.split(",").forEach((pair) => {
          const [key, value] = pair.split(":");
          data[key] = value;
        });
        return data;
      };

      const qrCodeData = parseQRCodeData(scanResult);
      const { SchoolID, ClassID, SectionID, Token } = qrCodeData;

      // Mark attendance
      validateQRCodeAndMarkAttendance({
        schoolId: Number(SchoolID),
        classId: Number(ClassID),
        studentId: 1, // Replace with the actual student ID (e.g., from user context)
        qrCodeId: 1, // Replace with the actual QR code ID (if available)
        recordedBy: "User", // Replace with the actual user name or ID
      });
    }
  }, [scanResult, validateQRCodeAndMarkAttendance]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">QR Code Scanner</h1>

      {/* Video Stream for QR Code Scanning */}
      <div className="relative w-full max-w-md bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-auto" />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <button
              onClick={startScanning}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Scanning
            </button>
          </div>
        )}
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">Scanned QR Code: {scanResult}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800">Marking attendance...</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeScannerPage;