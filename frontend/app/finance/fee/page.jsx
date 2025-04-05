"use client";

import { useState } from "react";
import {
  useSchoolFees,
  useCreateFee,
  useUpdateFee,
  useDeleteFee,
} from "@/lib/api/financeService/fee";

// Force dynamic rendering to avoid prerendering at build time
export const dynamic = "force-dynamic";

export default function FeeManagement({ schoolId = "1" }) {
  const [newFee, setNewFee] = useState({
    feeCode: "",
    feeName: "",
    amount: "",
    feeType: "",
    frequency: "",
    dueDate: "",
    isActive: true,
  });
  const [selectedFee, setSelectedFee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: fees = [], isLoading, isError } = useSchoolFees(schoolId); // Default to empty array
  const createFeeMutation = useCreateFee();
  const updateFeeMutation = useUpdateFee();
  const deleteFeeMutation = useDeleteFee();

  const handleCreateFee = (e) => {
    e.preventDefault();
    createFeeMutation.mutate(
      {
        ...newFee,
        schoolId,
        amount: parseFloat(newFee.amount),
      },
      {
        onSuccess: () => {
          setNewFee({
            feeCode: "",
            feeName: "",
            amount: "",
            feeType: "",
            frequency: "",
            dueDate: "",
            isActive: true,
          });
        },
      }
    );
  };

  const handleUpdateFee = (e) => {
    e.preventDefault();
    updateFeeMutation.mutate(
      {
        ...selectedFee,
        amount: parseFloat(selectedFee.amount),
        schoolId,
      },
      {
        onSuccess: () => {
          setSelectedFee(null);
          setIsEditMode(false);
        },
      }
    );
  };

  const handleDeleteFee = (feeId) => {
    if (confirm("Are you sure you want to delete this fee?")) {
      deleteFeeMutation.mutate(feeId);
    }
  };

  const selectFeeForEdit = (fee) => {
    setSelectedFee(fee);
    setIsEditMode(true);
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  if (isError)
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Error loading fees
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Fee Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fee Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {isEditMode ? "Update Fee" : "Create New Fee"}
          </h3>
          <form onSubmit={isEditMode ? handleUpdateFee : handleCreateFee}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fee Code
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={
                    isEditMode ? selectedFee?.feeCode || "" : newFee.feeCode
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedFee({
                          ...selectedFee,
                          feeCode: e.target.value,
                        })
                      : setNewFee({ ...newFee, feeCode: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fee Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={
                    isEditMode ? selectedFee?.feeName || "" : newFee.feeName
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedFee({
                          ...selectedFee,
                          feeName: e.target.value,
                        })
                      : setNewFee({ ...newFee, feeName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={isEditMode ? selectedFee?.amount || "" : newFee.amount}
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedFee({
                          ...selectedFee,
                          amount: e.target.value,
                        })
                      : setNewFee({ ...newFee, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fee Type
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={
                    isEditMode ? selectedFee?.feeType || "" : newFee.feeType
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedFee({
                          ...selectedFee,
                          feeType: e.target.value,
                        })
                      : setNewFee({ ...newFee, feeType: e.target.value })
                  }
                  required
                >
                  <option value="">Select Fee Type</option>
                  <option value="TUITION">Tuition</option>
                  <option value="REGISTRATION">Registration</option>
                  <option value="ACTIVITY">Activity</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={
                    isEditMode ? selectedFee?.frequency || "" : newFee.frequency
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedFee({
                          ...selectedFee,
                          frequency: e.target.value,
                        })
                      : setNewFee({ ...newFee, frequency: e.target.value })
                  }
                  required
                >
                  <option value="">Select Frequency</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                  <option value="ONE_TIME">One-Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={
                    isEditMode
                      ? selectedFee?.dueDate?.split("T")[0] || ""
                      : newFee.dueDate
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedFee({
                          ...selectedFee,
                          dueDate: e.target.value,
                        })
                      : setNewFee({ ...newFee, dueDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={
                    isEditMode
                      ? selectedFee?.isActive
                        ? "active"
                        : "inActive"
                      : newFee.isActive
                      ? "active"
                      : "inActive"
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedFee({
                          ...selectedFee,
                          isActive: e.target.value === "active",
                        })
                      : setNewFee({
                          ...newFee,
                          isActive: e.target.value === "active",
                        })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inActive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={
                    createFeeMutation.isPending || updateFeeMutation.isPending
                  }
                >
                  {(createFeeMutation.isPending ||
                    updateFeeMutation.isPending) && (
                    <span className="inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                  )}
                  {isEditMode ? "Update Fee" : "Create Fee"}
                </button>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFee(null);
                      setIsEditMode(false);
                    }}
                    className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Fee List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Fee List</h3>
          {fees.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
              No fees have been created yet
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <ul className="divide-y divide-gray-200">
                {fees.map((fee) => (
                  <li key={fee.feeId} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">
                          {fee.feeName} ({fee.feeCode})
                        </h4>
                        <p className="text-sm text-gray-500">
                          {fee.feeType} - {fee.frequency}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            ${fee.amount.toFixed(2)}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Due: {new Date(fee.dueDate).toLocaleDateString()}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              fee.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {fee.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <button
                          onClick={() => selectFeeForEdit(fee)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteFee(fee.feeId)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import { useSchoolFees, useCreateFee, useUpdateFee, useDeleteFee } from "@/lib/api/financeService/fee";

// export default function FeeManagement({ schoolId = "1" }) {
//   const [newFee, setNewFee] = useState({
//     feeCode: "",
//     feeName: "",
//     amount: "",
//     feeType: "",
//     frequency: "",
//     dueDate: "",
//     isActive: "active"
//   });
//   const [selectedFee, setSelectedFee] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const { data: fees, isLoading, isError } = useSchoolFees(schoolId);
//   const createFeeMutation = useCreateFee();
//   const updateFeeMutation = useUpdateFee();
//   const deleteFeeMutation = useDeleteFee();

//   const handleCreateFee = (e) => {
//     e.preventDefault();
//     createFeeMutation.mutate({
//       ...newFee,
//       schoolId,
//       amount: parseFloat(newFee.amount),
//     }, {
//       onSuccess: () => {
//         setNewFee({
//           feeCode: "",
//           feeName: "",
//           amount: "",
//           feeType: "",
//           frequency: "",
//           dueDate: "",
//           isActive: "active"
//         });
//       }
//     });
//   };

//   const handleUpdateFee = (e) => {
//     e.preventDefault();
//     updateFeeMutation.mutate({
//       ...selectedFee,
//       amount: parseFloat(selectedFee.amount),
//       schoolId
//     }, {
//       onSuccess: () => {
//         setSelectedFee(null);
//         setIsEditMode(false);
//       }
//     });
//   };

//   const handleDeleteFee = (feeId) => {
//     if (confirm("Are you sure you want to delete this fee?")) {
//       deleteFeeMutation.mutate(feeId);
//     }
//   };

//   const selectFeeForEdit = (fee) => {
//     setSelectedFee(fee);
//     setIsEditMode(true);
//   };

//   if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
//   if (isError) return <div className="p-4 bg-red-100 text-red-700 rounded-md">Error loading fees</div>;

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-2xl font-bold mb-6">Fee Management</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Fee Form */}
//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4">{isEditMode ? "Update Fee" : "Create New Fee"}</h3>
//           <form onSubmit={isEditMode ? handleUpdateFee : handleCreateFee}>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Fee Code</label>
//                 <input
//                   type="text"
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={isEditMode ? selectedFee?.feeCode : newFee.feeCode}
//                   onChange={(e) => isEditMode
//                     ? setSelectedFee({...selectedFee, feeCode: e.target.value})
//                     : setNewFee({...newFee, feeCode: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Fee Name</label>
//                 <input
//                   type="text"
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={isEditMode ? selectedFee?.feeName : newFee.feeName}
//                   onChange={(e) => isEditMode
//                     ? setSelectedFee({...selectedFee, feeName: e.target.value})
//                     : setNewFee({...newFee, feeName: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={isEditMode ? selectedFee?.amount : newFee.amount}
//                   onChange={(e) => isEditMode
//                     ? setSelectedFee({...selectedFee, amount: e.target.value})
//                     : setNewFee({...newFee, amount: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Fee Type</label>
//                 <select
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={isEditMode ? selectedFee?.feeType : newFee.feeType}
//                   onChange={(e) => isEditMode
//                     ? setSelectedFee({...selectedFee, feeType: e.target.value})
//                     : setNewFee({...newFee, feeType: e.target.value})}
//                   required
//                 >
//                   <option value="">Select Fee Type</option>
//                   <option value="TUITION">Tuition</option>
//                   <option value="REGISTRATION">Registration</option>
//                   <option value="ACTIVITY">Activity</option>
//                   <option value="OTHER">Other</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Frequency</label>
//                 <select
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={isEditMode ? selectedFee?.frequency : newFee.frequency}
//                   onChange={(e) => isEditMode
//                     ? setSelectedFee({...selectedFee, frequency: e.target.value})
//                     : setNewFee({...newFee, frequency: e.target.value})}
//                   required
//                 >
//                   <option value="">Select Frequency</option>
//                   <option value="MONTHLY">Monthly</option>
//                   <option value="QUARTERLY">Quarterly</option>
//                   <option value="ANNUALLY">Annually</option>
//                   <option value="ONE_TIME">One-Time</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Due Date</label>
//                 <input
//                   type="date"
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={isEditMode ? selectedFee?.dueDate?.split('T')[0] : newFee.dueDate}
//                   onChange={(e) => isEditMode
//                     ? setSelectedFee({...selectedFee, dueDate: e.target.value})
//                     : setNewFee({...newFee, dueDate: e.target.value})}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Status</label>
//                 <select
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={isEditMode ? selectedFee?.isActive : newFee.isActive}
//                   onChange={(e) => isEditMode
//                     ? setSelectedFee({...selectedFee, isActive: e.target.value})
//                     : setNewFee({...newFee, isActive: e.target.value})}
//                 >
//                   <option value="active">Active</option>
//                   <option value="inActive">Inactive</option>
//                 </select>
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   type="submit"
//                   className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   disabled={createFeeMutation.isPending || updateFeeMutation.isPending}
//                 >
//                   {(createFeeMutation.isPending || updateFeeMutation.isPending) && (
//                     <span className="inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
//                   )}
//                   {isEditMode ? "Update Fee" : "Create Fee"}
//                 </button>

//                 {isEditMode && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setSelectedFee(null);
//                       setIsEditMode(false);
//                     }}
//                     className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                   >
//                     Cancel
//                   </button>
//                 )}
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Fee List */}
//         <div>
//           <h3 className="text-lg font-semibold mb-4">Fee List</h3>
//           {fees?.length === 0 ? (
//             <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
//               No fees have been created yet
//             </div>
//           ) : (
//             <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
//               <ul className="divide-y divide-gray-200">
//                 {fees?.map((fee) => (
//                   <li key={fee.feeId} className="p-4 hover:bg-gray-50">
//                     <div className="flex justify-between">
//                       <div>
//                         <h4 className="font-medium">{fee.feeName} ({fee.feeCode})</h4>
//                         <p className="text-sm text-gray-500">
//                           {fee.feeType} - {fee.frequency}
//                         </p>
//                         <div className="mt-1 flex items-center gap-2">
//                           <span className="text-lg font-semibold">${fee.amount.toFixed(2)}</span>
//                           <span className="text-xs bg-gray-100 px-2 py-1 rounded">
//                             Due: {new Date(fee.dueDate).toLocaleDateString()}
//                           </span>
//                           <span className={`text-xs px-2 py-1 rounded ${fee.isActive === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                             {fee.isActive === 'active' ? 'Active' : 'Inactive'}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="flex items-start space-x-2">
//                         <button
//                           onClick={() => selectFeeForEdit(fee)}
//                           className="p-1 text-blue-600 hover:text-blue-800"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                             <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => handleDeleteFee(fee.feeId)}
//                           className="p-1 text-red-600 hover:text-red-800"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
