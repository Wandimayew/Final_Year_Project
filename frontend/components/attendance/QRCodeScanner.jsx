'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQRScanner from 'react-qr-scanner';
import { isMobile } from 'react-device-detect';
import { Smartphone, Laptop } from 'lucide-react';
import Image from 'next/image';

const QRCodeScanner = () => {
    const [schoolId, setSchoolId] = useState(null);
    const [staffId, setStaffId] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInTime, setIsInTime] = useState(true);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        // Fetch the schoolId from sessionStorage or localStorage
        const storedSchoolId = sessionStorage.getItem('schoolId');
        if (storedSchoolId) {
            setSchoolId(storedSchoolId);
        }
    }, []);

    useEffect(() => {
        // Fetch the saved QR code only if schoolId is set and is not a mobile device
        if (!isMobile && schoolId) {
            setIsLoading(true); // Start loading
            axios.get(`http://localhost:8085/api/qrcodes/active?schoolId=${schoolId}`, { responseType: 'blob' })
                .then(response => {
                    // Create a URL for the QR code image blob
                    const imageUrl = URL.createObjectURL(response.data);
                    setQrCodeUrl(imageUrl);
                    setIsLoading(false); // Stop loading after fetching QR code
                })
                .catch(err => {
                    setError('Failed to load QR code image.');
                    setIsLoading(false); // Stop loading on error
                });
        }
    }, [schoolId]);

    const markAttendance = async (sessionToken) => {
        try {
            setIsLoading(true);

            // Validate the QR code
            const validateResponse = await axios.get(
                `http://localhost:8085/api/qrcodes/validate/${schoolId}?sessionToken=${sessionToken}`
            );

            if (!validateResponse.data.isValid) {
                throw new Error('Invalid or expired QR Code.');
            }

            const attendanceData = {
                staffId: parseInt(staffId),
                schoolId: schoolId,
                sessionToken: sessionToken,
                date: new Date().toISOString().split('T')[0],
                recordedBy: staffId,
                status: isInTime ? 'PRESENT' : 'ABSENT',
                remark: 'Scanned via QR Code',
                isActive: true,
                inTime: isInTime ? new Date().toISOString() : null,
                outTime: !isInTime ? new Date().toISOString() : null,
            };

            const response = await axios.post('http://localhost:8085/api/attendance/record', attendanceData);

            if (response.status === 200) {
                setSuccess(isInTime ? 'In time marked successfully!' : 'Out time marked successfully!');
                setStaffId('');
            }
        } catch (error) {
            setError(error.message || 'Failed to mark attendance');
        } finally {
            setIsLoading(false);
            setIsScanning(false);
        }
    };

    const handleScan = (data) => {
        if (data) {
            setSuccess("QR Code Scanned Successfully!");
            markAttendance(data);
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError("QR Scanner Error.");
    };

    const handleManualEntry = async (event) => {
        event.preventDefault();
        if (!staffId) {
            setError('Please enter Staff ID.');
            return;
        }
        setIsScanning(true);
    };

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
};

export default QRCodeScanner;
