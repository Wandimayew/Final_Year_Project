"use client";
// pages/finance/assign-fee.js
import { useState } from 'react';
import { useAssignFeeToStudent, useSchoolFees } from '@/lib/api/financeService/fee';
// import { financeApi } from '@/lib/api';
export const dynamic = "force-dynamic";

export default function AssignFeeToStudentPage() {
  const [formData, setFormData] = useState({
    schoolId: 'SCH-12345',
    studentId: '',
    appliedAmount: '',
    feeId: '',
  });

  // // Fetch students
  // const { data: students, isLoading: studentsLoading } = useQuery({
  //   queryKey: ['students'],
  //   queryFn: async () => {
  //     const response = await financeApi.get('/students');
  //     return response.data;
  //   }
  // });

  // Fetch fees
//   const { data: fees, isLoading: feesLoading } = useQuery({
//     queryKey: ['fees'],
//     queryFn: async () => {
//       const response = await financeApi.get('/fees');
//       return response.data;
//     }
//   });

  const {data: fees, isFetching: feesLoading } = useSchoolFees("SCH-12345");
  const assignFeeMutation = useAssignFeeToStudent();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Auto-fill amount when fee is selected
    if (name === 'feeId' && value) {
      const selectedFee = fees?.find(fee => fee.feeId.toString() === value);
      if (selectedFee?.amount) {
        setFormData(prev => ({
          ...prev,
          appliedAmount: selectedFee.amount
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await assignFeeMutation.mutateAsync({
        ...formData,
        appliedAmount: parseFloat(formData.appliedAmount),
        feeId: parseInt(formData.feeId)
      });

      // Reset form on success
      setFormData({
        schoolId: '',
        studentId: '',
        appliedAmount: '',
        feeId: '',
      });
    } catch (error) {
      console.error("Error assigning fee:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Assign Fee to Student</h1>
        
        {/* Status Messages */}
        {assignFeeMutation.isLoading && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded">
            Processing...
          </div>
        )}
        
        {assignFeeMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            Error: {assignFeeMutation.error?.message || 'Failed to assign fee'}
          </div>
        )}
        
        {assignFeeMutation.isSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded">
            Fee successfully assigned to student!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School ID */}
            {/* <div>
              <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 mb-1">
                School ID*
              </label>
              <input
                type="text"
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div> */}

            {/* Student Selection */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                Student*
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                // disabled={studentsLoading}
              >
                <option value="">Select Student</option>
                <option value="STU-67899">John Doe (STU-67899)</option>
                <option value="STU-67890">Jane Doe (STU-67890)</option>

                {/* {students?.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.id})
                  </option>
                ))} */}
              </select>
              {/* {studentsLoading && <p className="mt-1 text-sm text-gray-500">Loading students...</p>} */}
            </div>

            {/* Fee Selection */}
            <div>
              <label htmlFor="feeId" className="block text-sm font-medium text-gray-700 mb-1">
                Fee Type*
              </label>
              <select
                id="feeId"
                name="feeId"
                value={formData.feeId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={feesLoading}
              >
                <option value="">Select Fee</option>
                {fees?.map(fee => (
                  <option key={fee.feeId} value={fee.feeId}>
                    {fee.feeName} (${fee.amount})
                  </option>
                ))}
              </select>
              {feesLoading && <p className="mt-1 text-sm text-gray-500">Loading fees...</p>}
            </div>

            {/* Applied Amount */}
            <div>
              <label htmlFor="appliedAmount" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Fee is active
            </label>
          </div>

          {/* Fee Details (if selected) */}
          {formData.feeId && fees && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2">Fee Details</h3>
              {(() => {
                const selectedFee = fees.find(fee => fee.feeId.toString() === formData.feeId);
                return selectedFee ? (
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {selectedFee.feeName}</p>
                    {selectedFee.description && (
                      <p><span className="font-medium">Description:</span> {selectedFee.feeType}</p>
                    )}
                    <p><span className="font-medium">Default Amount:</span> ${selectedFee.amount}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={assignFeeMutation.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {assignFeeMutation.isLoading ? 'Assigning...' : 'Assign Fee to Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}