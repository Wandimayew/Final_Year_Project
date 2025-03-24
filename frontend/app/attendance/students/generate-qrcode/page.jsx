"use client";

import InputField from "@/components/InputField";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GenerateQRCode from "@/components/students/GenerateQRCode";
import QRCodeDetails from "@/components/students/QRCodeDetails";
import { useQRCodes, useDeleteQRCode } from "@/lib/api/studentService/qrCode";
import { useEffect, useState } from "react";
import {
  FaEye,
  FaFilter,
  FaQrcode,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

const QRCodesList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [qrcodeId, setQRCodeId] = useState(null);
  const [onClose, setOnClose] = useState(false);
  const [onCloseGenQr, setOnCloseGenQr] = useState(false);
  const [classId, setClassId] = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrCodeToDelete, setQrCodeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  //   const [filter, setFilter] = useState(false);
  const {
    data: qrcodes,
    isLoading,
    isError,
    refetch,
  } = useQRCodes({ classId, sectionId });
  const { mutateAsync: deleteQRCode } = useDeleteQRCode();

  const handleDelete = async (id) => {
    setQrCodeToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteQRCode(qrCodeToDelete);
      refetch();
      setDeleteModalOpen(false);
      toast.success("QR code deleted successfully!");
    } catch (error) {
      console.error("Error deleting QR code:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching QR codes</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <FaQrcode className="mr-2" /> QR Codes
          </h1>
          <button
            className="bg-blue-600 text-white px-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setOnCloseGenQr(true)}
          >
            Generate QRCode
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">Select Ground</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mt-4">
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
            </div>
            <div className="mt-4">
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
            </div>
            {/* <button onClick={(e) => setFilter(true)}><FaFilter/></button> */}
          </div>
        </div>

        {onClose && qrcodeId && (
          <QRCodeDetails
            id={qrcodeId}
            onClose={onClose}
            setOnClose={setOnClose}
          />
        )}
        {onCloseGenQr && (
          <GenerateQRCode
            onCloseGenQr={onCloseGenQr}
            setOnCloseGenQr={setOnCloseGenQr}
          />
        )}
        {/* QR Code Grid */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qrcodes.map((qrcode) => (
                <tr
                  key={qrcode.qrCodeId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {qrcode.classId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {qrcode.sectionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {qrcode.expiryTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        qrcode.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {qrcode.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={(e) => {
                        setOnClose(true);
                        setQRCodeId(qrcode.qrCodeId);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(qrcode.qrCodeId)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaTrash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!qrcodes.hasNextPage}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Next
          </button>
        </div> */}
        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Delete QR Code</h2>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this QR code? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodesList;
