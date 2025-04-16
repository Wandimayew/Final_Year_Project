// "use client";
// // pages/finance/assign-fee.js
// import { useState } from 'react';
// import { useAssignFeeToStudent, useSchoolFees } from '@/lib/api/financeService/fee';
// // import { financeApi } from '@/lib/api';

// export default function AssignFeeToStudentPage() {
//   const [formData, setFormData] = useState({
//     schoolId: '1',
//     studentId: '',
//     appliedAmount: '',
//     feeId: '',
//   });

//   // // Fetch students
//   // const { data: students, isLoading: studentsLoading } = useQuery({
//   //   queryKey: ['students'],
//   //   queryFn: async () => {
//   //     const response = await financeApi.get('/students');
//   //     return response.data;
//   //   }
//   // });

//   // Fetch fees
// //   const { data: fees, isLoading: feesLoading } = useQuery({
// //     queryKey: ['fees'],
// //     queryFn: async () => {
// //       const response = await financeApi.get('/fees');
// //       return response.data;
// //     }
// //   });

//   const {data: fees, isFetching: feesLoading } = useSchoolFees("1");
//   const assignFeeMutation = useAssignFeeToStudent();

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });

//     // Auto-fill amount when fee is selected
//     if (name === 'feeId' && value) {
//       const selectedFee = fees?.find(fee => fee.feeId.toString() === value);
//       if (selectedFee?.amount) {
//         setFormData(prev => ({
//           ...prev,
//           appliedAmount: selectedFee.amount
//         }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Submitting form data:", formData);
//     try {
//       await assignFeeMutation.mutateAsync({
//         ...formData,
//         appliedAmount: parseFloat(formData.appliedAmount),
//         feeId: parseInt(formData.feeId)
//       });

//       console.log("Fee assigned successfully:", formData);
//       // Reset form on success
//       setFormData({
//         schoolId: '',
//         studentId: '',
//         appliedAmount: '',
//         feeId: '',
//       });
//     } catch (error) {
//       console.error("Error assigning fee:", error);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-md p-8">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Assign Fee to Student</h1>

//         {/* Status Messages */}
//         {assignFeeMutation.isLoading && (
//           <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded">
//             Processing...
//           </div>
//         )}

//         {assignFeeMutation.isError && (
//           <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
//             Error: {assignFeeMutation.error?.message || 'Failed to assign fee'}
//           </div>
//         )}

//         {assignFeeMutation.isSuccess && (
//           <div className="mb-4 p-3 bg-green-50 text-green-600 rounded">
//             Fee successfully assigned to student!
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* School ID */}
//             {/* <div>
//               <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 mb-1">
//                 School ID*
//               </label>
//               <input
//                 type="text"
//                 id="schoolId"
//                 name="schoolId"
//                 value={formData.schoolId}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div> */}

//             {/* Student Selection */}
//             <div>
//               <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
//                 Student*
//               </label>
//               <select
//                 id="studentId"
//                 name="studentId"
//                 value={formData.studentId}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 // disabled={studentsLoading}
//               >
//                 <option value="">Select Student</option>
//                 <option value="STU-67899">John Doe (STU-67899)</option>
//                 <option value="STU-67890">Jane Doe (STU-67890)</option>

//                 {/* {students?.map(student => (
//                   <option key={student.id} value={student.id}>
//                     {student.firstName} {student.lastName} ({student.id})
//                   </option>
//                 ))} */}
//               </select>
//               {/* {studentsLoading && <p className="mt-1 text-sm text-gray-500">Loading students...</p>} */}
//             </div>

//             {/* Fee Selection */}
//             <div>
//               <label htmlFor="feeId" className="block text-sm font-medium text-gray-700 mb-1">
//                 Fee Type*
//               </label>
//               <select
//                 id="feeId"
//                 name="feeId"
//                 value={formData.feeId}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={feesLoading}
//               >
//                 <option value="">Select Fee</option>
//                 {fees?.map(fee => (
//                   <option key={fee.feeId} value={fee.feeId}>
//                     {fee.feeName} (${fee.amount})
//                   </option>
//                 ))}
//               </select>
//               {feesLoading && <p className="mt-1 text-sm text-gray-500">Loading fees...</p>}
//             </div>

//             {/* Applied Amount */}
//             <div>
//               <label htmlFor="appliedAmount" className="block text-sm font-medium text-gray-700 mb-1">
//                 Applied Amount*
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <span className="text-gray-500">$</span>
//                 </div>
//                 <input
//                   type="number"
//                   id="appliedAmount"
//                   name="appliedAmount"
//                   value={formData.appliedAmount}
//                   onChange={handleInputChange}
//                   required
//                   min="0.01"
//                   step="0.01"
//                   className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Active Status */}
//           {/* <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="isActive"
//               name="isActive"
//               checked={formData.isActive}
//               onChange={handleInputChange}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//             <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
//               Fee is active
//             </label>
//           </div> */}

//           {/* Fee Details (if selected) */}
//           {formData.feeId && fees && (
//             <div className="bg-gray-50 p-4 rounded-md">
//               <h3 className="font-medium text-gray-800 mb-2">Fee Details</h3>
//               {(() => {
//                 const selectedFee = fees.find(fee => fee.feeId.toString() === formData.feeId);
//                 return selectedFee ? (
//                   <div className="text-sm text-gray-600">
//                     <p><span className="font-medium">Name:</span> {selectedFee.feeName}</p>
//                     {selectedFee.description && (
//                       <p><span className="font-medium">Description:</span> {selectedFee.feeType}</p>
//                     )}
//                     <p><span className="font-medium">Default Amount:</span> ${selectedFee.amount}</p>
//                   </div>
//                 ) : null;
//               })()}
//             </div>
//           )}

//           {/* Submit Button */}
//           <div className="pt-4">
//             <button
//               type="submit"
//               disabled={assignFeeMutation.isLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
//             >
//               {assignFeeMutation.isLoading ? 'Assigning...' : 'Assign Fee to Student'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";
// pages/finance/assign-fee.js
import { useState, useEffect } from "react";
import {
  useAssignFeeToStudent,
  useSchoolFees,
} from "@/lib/api/financeService/fee";
import { useStudents } from "@/lib/api/studentService/students";
import InputField from "@/components/InputField";

export default function AssignFeeToStudentPage() {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classId, setClassId] = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const [formData, setFormData] = useState({
    schoolId: "1",
    studentId: "",
    appliedAmount: "",
    feeId: "",
  });

  const [filters, setFilters] = useState({
    class: null,
    section: null,
  });

  const {
    data: studentsArray,
    isLoading,
    refetch,
  } = useStudents({ classId, sectionId });
  const students = Array.isArray(studentsArray) ? studentsArray : [];
  // Mock student data based on the image
  // const students = [
  //   { id: 1, name: 'Danielle Solomon', registerNo: 'RSM-00001', roll: 1, gender: 'Male', mobile: '+17575352201', email: 'student@ramom.com', guardian: 'Binoya Naik' },
  //   { id: 2, name: 'Angelina Jolie', registerNo: 'RSM-00002', roll: 2, gender: 'Female', mobile: '+7142979749', email: 'angelina@ramom.com', guardian: 'Summer Dixon' },
  //   { id: 3, name: 'Mollie Flores', registerNo: 'RSM-00003', roll: 3, gender: 'Female', mobile: '+13234281802', email: 'mollie@ramom.com', guardian: 'Summer Dixon' },
  //   { id: 4, name: 'Gajendra Brahmbhatt', registerNo: 'RSM-00009', roll: 4, gender: 'Male', mobile: '+91 25 62062220', email: 'gajendra@goyal.com', guardian: 'Binoya Naik' },
  //   { id: 5, name: 'Benjamin White', registerNo: 'RSM-00010', roll: 6, gender: 'Male', mobile: '0350254886', email: 'benjamin@yahoo.com.au', guardian: 'Summer Dixon' },
  //   { id: 6, name: 'Jacob Wood', registerNo: 'RSM-00011', roll: 8, gender: 'Male', mobile: '+025611 0822', email: 'jacob@gmail.com', guardian: 'Umesh Karnik' },
  // ];
  console.log("Students:", students);

  const { data: fees, isFetching: feesLoading } = useSchoolFees("1");
  const assignFeeMutation = useAssignFeeToStudent();

  // const handleFilterChange = (e) => {
  //   const { name, value } = e.target;
  //   setFilters({
  //     ...filters,
  //     [name]: value
  //   });
  // };

  const handleStudentSelect = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map((student) => student.studentId));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Auto-fill amount when fee is selected
    if (name === "feeId" && value) {
      const selectedFee = fees?.find((fee) => fee.feeId.toString() === value);
      if (selectedFee?.amount) {
        setFormData((prev) => ({
          ...prev,
          appliedAmount: selectedFee.amount,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    try {
      // Assign fee to each selected student
      for (const studentId of selectedStudents) {
        const student = students.find((s) => s.studentId === studentId);

        await assignFeeMutation.mutateAsync({
          ...formData,
          studentId: student.studentId,
          appliedAmount: parseFloat(formData.appliedAmount),
          feeId: parseInt(formData.feeId),
        });
      }

      console.log("Fee assigned successfully to selected students");
      // Reset selections
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error assigning fee:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Select Ground Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Select Ground
        </h2>
        <div className="border-t border-blue-400 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Class Selection */}
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
            {/* <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-medium mb-4">Select Ground</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                    </div>
                  </div> */}
            {/* <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                id="class"
                name="class"
                value={filters.class}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500"
              >
                <option value="All Classes">All Classes</option>
                <option value={1}>One</option>
                <option value={2}>Two</option>
                <option value={3}>Three</option>
              </select>
            </div> */}

            {/* Section Selection */}
            {/* <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                id="section"
                name="section"
                value={filters.section}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500"
              >
                <option value="All Sections">All Sections</option>
                <option value={1}>Section A</option>
                <option value={2}>Section B</option>
              </select>
            </div> */}

            {/* Fee Group Selection */}
            {/* <div>
              <label htmlFor="feeGroup" className="block text-sm font-medium text-gray-700 mb-1">
                Fee Group <span className="text-red-500">*</span>
              </label>
              <select
                id="feeGroup"
                name="feeGroup"
                value={filters.feeGroup}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500"
              >
                <option value="Class One Half Yearly">Class One Half Yearly</option>
                <option value="Full Year">Full Year</option>
                <option value="Quarter">Quarter</option>
              </select>
            </div> */}
          </div>
        </div>

        {/* <div className="flex justify-end mt-4">
          <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
          </button>
        </div> */}
      </div>

      {/* Student List Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          <h2 className="text-lg font-medium text-gray-800">Student List</h2>
        </div>

        <div className="border-t border-blue-400">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedStudents.length === students.length &&
                        students.length > 0
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sl
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Register No
                  </th>
                  {/* <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll
                  </th> */}
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gender
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mobile No
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Guardian Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.studentId)}
                        onChange={() => handleStudentSelect(student.studentId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.studentId}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.registId}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.roll}
                    </td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.gender}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.contactInfo}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email || "student@gmail.com"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.parentId || "Parent Name"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fee Assignment Section */}
      {selectedStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Assign Fee to Selected Students
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fee Selection */}
              <div>
                <label
                  htmlFor="feeId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fee Type*
                </label>
                <select
                  id="feeId"
                  name="feeId"
                  value={formData.feeId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={feesLoading}
                >
                  <option value="">Select Fee</option>
                  {fees?.map((fee) => (
                    <option key={fee.feeId} value={fee.feeId}>
                      {fee.feeName} (${fee.amount})
                    </option>
                  ))}
                </select>
                {feesLoading && (
                  <p className="mt-1 text-sm text-gray-500">Loading fees...</p>
                )}
              </div>

              {/* Applied Amount */}
              <div>
                <label
                  htmlFor="appliedAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Applied Amount*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="appliedAmount"
                    name="appliedAmount"
                    value={formData.appliedAmount}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Fee Details (if selected) */}
            {formData.feeId && fees && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">Fee Details</h3>
                {(() => {
                  const selectedFee = fees.find(
                    (fee) => fee.feeId.toString() === formData.feeId
                  );
                  return selectedFee ? (
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedFee.feeName}
                      </p>
                      {selectedFee.description && (
                        <p>
                          <span className="font-medium">Description:</span>{" "}
                          {selectedFee.feeType}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Default Amount:</span> $
                        {selectedFee.amount}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={assignFeeMutation.isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {assignFeeMutation.isLoading ? "Assigning..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Messages */}
      {assignFeeMutation.isLoading && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-600 rounded">
          Processing...
        </div>
      )}

      {assignFeeMutation.isError && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
          Error: {assignFeeMutation.error?.message || "Failed to assign fee"}
        </div>
      )}

      {assignFeeMutation.isSuccess && (
        <div className="mt-4 p-3 bg-green-50 text-green-600 rounded">
          Fee successfully assigned to selected students!
        </div>
      )}
    </div>
  );
}
