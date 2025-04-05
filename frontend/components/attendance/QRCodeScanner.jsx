'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQRScanner from 'react-qr-scanner';
import { isMobile } from 'react-device-detect';
import { Smartphone, Laptop } from 'lucide-react';
import Image from 'next/image';
import { Scan } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';

const QRCodeScanner = () => {
  const [schoolId, setSchoolId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [staffId, setStaffId] = useState("");
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInTime, setIsInTime] = useState(true);

  // Fetch user ID and school ID from localStorage
  useEffect(() => {
    try {
      const authData = localStorage.getItem("auth-store");
  
      if (authData) {
        const parsedData = JSON.parse(authData);
  
        if (parsedData?.user) {
          const { userId, schoolId } = parsedData.user;
  
          if (userId && schoolId) {
            setUserId(userId);
            setSchoolId(schoolId);
          } else {
            setError("User or school information missing. Please login again.");
          }
        } else {
          setError("Invalid authentication data. Please login again.");
        }
      } else {
        setError("Authentication data not found. Please login again.");
      }
    } catch (err) {
      console.error("Error parsing auth data:", err);
      setError("Error retrieving authentication data. Please login again.");
    }
  }, []);
  

  // Fetch teacher's staff details when userId is available
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      axios
        .get(`http://localhost:8083/api/staff/by-user/${userId}`)
        .then((response) => {
          setTeacherDetails(response.data);
          setStaffId(response.data.staffId.toString());
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch teacher details:", err);
          setError("Failed to fetch your details. Please try again later.");
          setIsLoading(false);
        });
    }
  }, [userId]);

  const markAttendance = async (sessionToken) => {
    try {
      setIsLoading(true);

      const validateResponse = await axios.get(
        `http://localhost:8083/api/qrcodes/validate/${schoolId}?sessionToken=${sessionToken}`
      );

      if (!validateResponse.data.isValid) {
        throw new Error("Invalid or expired QR Code.");
      }

      const staffIdToUse = teacherDetails?.staffId || staffId;
      const attendanceData = {
        staffId: parseInt(staffIdToUse),
        schoolId: schoolId,
        sessionToken: sessionToken,
        date: new Date().toISOString().split("T")[0],
        recordedBy: staffIdToUse,
        status: isInTime ? "PRESENT" : "ABSENT",
        remark: "Scanned via QR Code",
        isActive: true,
        inTime: isInTime ? new Date().toISOString() : null,
        outTime: !isInTime ? new Date().toISOString() : null,
      };

      const response = await axios.post("http://localhost:8083/api/attendance/record", attendanceData);

      if (response.status === 200) {
        setSuccess(isInTime ? "In time marked successfully!" : "Out time marked successfully!");
        toast.success(isInTime ? "In time recorded!" : "Out time recorded!");
      }
    } catch (error) {
      console.error("Attendance marking error:", error);
      setError(error.message || "Failed to mark attendance");
      toast.error(error.message || "Failed to mark attendance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanButtonClick = () => {
    if (!isMobile) {
      setError("Please use a mobile device to scan and mark your attendance.");
      return;
    }

    if (!staffId && !teacherDetails) {
      setError("Teacher information is not available. Please reload or login again.");
      return;
    }

    setError("");
    setSuccess("");

    // Attempt to open the native QR scanner app using a QR code scanning URL scheme
    // Note: This relies on the device having a QR scanner app that supports URL schemes
    const qrScannerUrl = "zxing://scan"; // Example for ZXing app; adjust based on your target app
    window.location.href = qrScannerUrl;

    // Fallback: Listen for the scanned result (if the app redirects back or uses a custom scheme)
    window.addEventListener("message", (event) => {
      if (event.data && typeof event.data === "string") {
        markAttendance(event.data);
      }
    });

    // Alternative fallback: Prompt user to manually enter the session token if needed
    setTimeout(() => {
      if (!success && !error) {
        const manualToken = prompt("If the scanner didn’t work, please enter the session token manually:");
        if (manualToken) markAttendance(manualToken);
      }
    }, 5000); // 5-second timeout for scanner to respond
  };

  if (isLoading && !teacherDetails) {
    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-12 text-black">
            <h1 className="text-2xl font-bold text-center mb-6">
                {isMobile ? "Scan Printed QR Code" : "Attendance QR Code"}
            </h1>

            <div className="mb-4 space-x-4 flex justify-center">
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        checked={isInTime}
                        onChange={() => setIsInTime(true)}
                        className="form-radio text-blue-500"
                    />
                    <span className="ml-2">In Time</span>
                </label>
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        checked={!isInTime}
                        onChange={() => setIsInTime(false)}
                        className="form-radio text-blue-500"
                    />
                    <span className="ml-2">Out Time</span>
                </label>
            </div>

            {!isMobile && (
                <div className="text-center">
                    <Laptop className="mx-auto mb-4" size={48} />
                    <p className="text-gray-600 mb-4">Scan the QR code below to record attendance.</p>

                    {isLoading ? (
                        <div>Loading QR code...</div>
                    ) : (
                        qrCodeUrl && (
                            <div className="mb-6">
                                <Image src={qrCodeUrl} alt="QR Code" className="mx-auto w-48 h-48" />
                                <p className="text-sm text-gray-600 mt-2">
                                    Scan this QR code using your mobile device.
                                </p>
                            </div>
                        )
                    )}
                </div>
            )}

            {isMobile && (
                <div className="text-center">
                    <Smartphone className="mx-auto" size={48} />
                    <p className="mt-2 text-gray-600">
                        Enter your Staff ID to scan the printed QR code.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Staff ID
                        </label>
                        <input
                            type="number"
                            value={staffId}
                            onChange={(e) => setStaffId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter your Staff ID"
                        />
                    </div>

                    <button
                        onClick={handleManualEntry}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {isScanning ? 'Scanning...' : 'Open Scanner'}
                    </button>

                    {isScanning && (
                        <div className="mt-4">
                            <ReactQRScanner 
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                style={{ width: "100%" }}
                            />
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    {success}
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center flex items-center justify-center gap-2">
          <Scan className="h-6 w-6" />
          QR Code Attendance
        </h1>

        {teacherDetails && (
          <div className="mb-6 text-center">
            <p className="font-semibold text-gray-800">
              Welcome, {teacherDetails.firstName || "Teacher"}
            </p>
            <p className="text-sm text-gray-600">Staff ID: {teacherDetails.staffId}</p>
          </div>
        )}

        <div className="mb-6 flex justify-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={isInTime}
              onChange={() => setIsInTime(true)}
              className="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">In Time</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!isInTime}
              onChange={() => setIsInTime(false)}
              className="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">Out Time</span>
          </label>
        </div>

        <div className="text-center">
          {isMobile ? (
            <>
              <Smartphone className="mx-auto text-indigo-600" size={48} />
              <p className="mt-2 text-gray-600 mb-6">
                Click below to open your phone’s QR scanner and mark your attendance.
              </p>
              <button
                onClick={handleScanButtonClick}
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-300 ${
                  isLoading
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Scan className="h-5 w-5" />
                )}
                {isLoading ? "Processing..." : "Scan QR Code"}
              </button>
            </>
          ) : (
            <>
              <AlertTriangle className="mx-auto text-yellow-500" size={48} />
              <p className="mt-2 text-gray-600 mb-6">
                Please use a mobile device to scan the printed QR code and mark your attendance.
              </p>
              <button
                onClick={handleScanButtonClick}
                className="w-full py-3 px-4 bg-gray-400 text-white font-semibold rounded-lg shadow-md cursor-not-allowed flex items-center justify-center gap-2"
                disabled
              >
                <Scan className="h-5 w-5" />
                Use Mobile Phone
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;