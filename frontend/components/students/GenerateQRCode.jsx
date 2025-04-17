"use client";

import { useGenerateQRCode } from "@/lib/api/studentService/qrCode";
import { useState } from "react";
import InputField from "../InputField";
import { FaTimes } from "react-icons/fa";

const GenerateQRCode = ({ onCloseGenQr, setOnCloseGenQr }) => {
  const [classId, setClassId] = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const [status, setStatus] = useState("");

  const { mutateAsync: generateQRCode, isLoading } = useGenerateQRCode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qrcodeGenData = {
      classId: e.target.classId.value,
      sectionId: e.target.sectionId.value,
      expiryTime: e.target.expiryTime.value,
      status: e.target.status.value,
    };
    await generateQRCode(qrcodeGenData);
  };

  return (
    <div className="fixed top-28 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Generate QR Code</h2>
          <button
            onClick={() => setOnCloseGenQr(!onCloseGenQr)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <InputField
            label="Select Class"
            name="classId"
            type="select"
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select a class</option>
            <option value={1}>One</option>
            <option value={2}>Two</option>
          </InputField>
          <InputField
            label="Select Section"
            name="sectionId"
            type="select"
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="">Select a section</option>
            <option value={1}>A</option>
            <option value={2}>B</option>
          </InputField>

          <InputField
            label="Expiry Time"
            name="expiryTime"
            type="datetime-local"
          />
          <InputField
            label="Status"
            name="status"
            type="select"
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Select status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
          </InputField>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {isLoading ? "Generating..." : "Generate QR Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateQRCode;
