"use client";
import { useState } from "react";
import AdmissionForm from "@/components/students/AdmissionForm";
import * as XLSX from "xlsx";
import { useCreateStudent } from "@/lib/api/studentService/students";
import {
  useCreateParentGuardian,
  useParentGuardians
} from "@/lib/api/studentService/parentGuardian";
import { useCreateUser } from "@/lib/api/users";

export default function StudentManagementPage() {
  const [activeTab, setActiveTab] = useState("form");
  const [fileData, setFileData] = useState(null);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const createUserMutation = useCreateUser();
  const createParentGuardianMutation = useCreateParentGuardian();
  const { data: parentData } = useParentGuardians();
  const { mutateAsync: createStudent } = useCreateStudent();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setFileData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };


  const handleImport = async () => {
    if (!fileData || !classId || !sectionId) {
      alert("Please select a file, class, and section");
      return;
    }

    setIsImporting(true);
    try {
      for (const student of fileData) {
        // Create user for each student
        const userData = {
          schoolId: 1,
          username: `${student.firstName.toLowerCase()}${student.lastName.charAt(0).toLowerCase()}`,
          email: `${student.firstName.toLowerCase()}@student.com`,
          password: `${student.firstName.toLowerCase()}${student.registerNo}`,
          roles: ["STUDENT"],
        };

        const userResponse = await createUserMutation.mutateAsync(userData);

        // Handle guardian
        let guardianId;
        if (student.GuardianUsername) {
          // Find existing guardian
          guardianId = parentData?.find(p => p.username === student.GuardianUsername)?.parentId;
        } else if (student.fatherName || student.motherName) {
          // Create new guardian if guardian info provided
          const parentGuardianData = {
            schoolId: 1,
            fatherName: student.fatherName || "",
            motherName: student.motherName || "",
            otherFamilyMemberName: student.guardianName || "",
            relation: student.guardianRelation || "",
            occupation: student.guardianOccupation || "",
            education: student.guardianEducation || "",
            phoneNumber: student.guardianMobile || "",
            email: student.guardianEmail || "",
            address: {
              city: student.guardianCity || "",
              state: student.guardianState || "",
            },
          };
          const parentResponse = await createParentGuardianMutation.mutateAsync(parentGuardianData);
          guardianId = parentResponse.parentId;
        }

        // Create student
        await createStudent({
          schoolId: 1,
          userId: userResponse.userId,
          registId: student.registerNo,
          roll: student.roll,
          admissionDate: student.admissionDate,
          classId: classId,
          sectionId: sectionId,
          category: student.category,
          firstName: student.firstName,
          lastName: student.lastName || student.firstName,
          nationalId: student.registerNo,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          contactInfo: student.contactInfo || "+251987654321",
          address: { 
            city: student.city || "Addis Ababa", 
            state: student.state || "Addis Ababa" 
          },
          username: userData.username,
          isActive: "ACTIVE",
          isPassed: "PASSED",
          parentId: guardianId,
        });
      }
      alert(`Successfully imported ${fileData.length} students`);
      setFileData(null);
      document.getElementById("file-upload").value = "";
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing students: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 my-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold my-6 px-6 pt-6">Student Management</h1>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 ${activeTab === "form" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("form")}
          >
            Create Student
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "import" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("import")}
          >
            Import Students
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "form" && <AdmissionForm />}

        {activeTab === "import" && (
          <div className="space-y-6 mx-auto max-w-6xl bg-gray-50 rounded-lg p-6 shadow-lg ">
            <div>
              <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Upload a CSV/Excel file containing multiple student records</li>
                <li>Supported formats: CSV, Excel (.xlsx, .xls)</li>
                <li>Required columns: firstName, lastName, roll, registerNo, dateOfBirth, gender</li>
                <li>Optional columns: admissionDate, category, GuardianUsername, fatherName, motherName, guardianName, guardianRelation, guardianOccupation, guardianEducation, guardianMobile, guardianEmail, guardianCity, guardianState</li>
                <li>Date format: YYYY-MM-DD (e.g., 2025-01-12)</li>
                <li>Gender: "Male" or "Female"</li>
                <li>Category: Use Category ID from Category page</li>
                <li>For existing guardians: include only GuardianUsername</li>
                <li>For new guardians: include guardian-related columns</li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class*
                </label>
                <select
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                >
                  <option value="">Select Class</option>
                  <option value="1">Class One</option>
                  <option value="2">Class Two</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Section*
                </label>
                <select
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="1">A</option>
                  <option value="2">B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select File* (CSV or Excel)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      CSV or Excel files with multiple student records
                    </p>
                  </div>
                </div>
              </div>

              {fileData && (
                <div className="text-sm text-gray-600">
                  <p>Students to import: {fileData.length}</p>
                  <p>First student sample: {JSON.stringify(fileData[0])}</p>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={isImporting}
                className={`w-full py-2 px-4 rounded-md text-white ${
                  isImporting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isImporting ? "Importing..." : "Import Students"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}