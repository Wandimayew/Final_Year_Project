// "use client";

// import { useState, useEffect } from "react";
// import { useStudentFees } from "@/lib/api/financeService/fee";

// export default function FeeSelection({ studentId, onSelect, schoolId }) {
//   const { data: studentFees, isLoading, isError } = useStudentFees(studentId, schoolId);
//   const [selectedFees, setSelectedFees] = useState([]);

//   useEffect(() => {
//     if (studentId) {
//       setSelectedFees([]);
//     }
//   }, [studentId]);

//   const toggleFeeSelection = (fee) => {
//     setSelectedFees(prev => {
//       const isSelected = prev.some(f => f.studentFeeId === fee.studentFeeId);
//       const newSelection = isSelected 
//         ? prev.filter(f => f.studentFeeId !== fee.studentFeeId) 
//         : [...prev, fee];
//       onSelect(newSelection);
//       return newSelection;
//     });
//   };

//   if (!studentId) return null;

//   return (
//     <div className="mb-4">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Select Fees to Pay
//       </label>
      
//       {isLoading ? (
//         <div className="p-2 text-center text-gray-500">Loading fees...</div>
//       ) : isError ? (
//         <div className="p-2 text-center text-red-500">Error loading fees</div>
//       ) : studentFees?.length === 0 ? (
//         <div className="p-2 text-center text-gray-500">No outstanding fees found</div>
//       ) : (
//         <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
//           {studentFees?.map((fee) => (
//             <div 
//               key={fee.studentFeeId} 
//               className={`p-3 flex justify-between items-center cursor-pointer ${selectedFees.some(f => f.studentFeeId === fee.studentFeeId) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
//               onClick={() => toggleFeeSelection(fee)}
//             >
//               <div>
//                 <div className="font-medium">{fee.feeName}</div>
//                 <div className="text-sm text-gray-500">
//                   Due: {new Date(fee.dueDate).toLocaleDateString()}
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold mr-3">ETB {fee.remainingAmount.toFixed(2)}</span>
//                 <input
//                   type="checkbox"
//                   checked={selectedFees.some(f => f.studentFeeId === fee.studentFeeId)}
//                   onChange={() => toggleFeeSelection(fee)}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   onClick={(e) => e.stopPropagation()}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedFees.length > 0 && (
//         <div className="mt-2 p-2 bg-blue-50 rounded-md">
//           <div className="font-medium">Selected Fees:</div>
//           <ul className="list-disc list-inside text-sm">
//             {selectedFees.map(fee => (
//               <li key={fee.studentFeeId}>
//                 {fee.feeName} - ETB {fee.remainingAmount.toFixed(2)}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { useStudentFees } from "@/lib/api/financeService/fee";

export default function FeeSelection({ studentId, onSelect, schoolId }) {
  const { data: studentFees, isLoading, isError } = useStudentFees(studentId, schoolId);
  const [selectedFees, setSelectedFees] = useState([]);

  useEffect(() => {
    if (studentId) {
      setSelectedFees([]);
    }
  }, [studentId]);

  // Add this useEffect to handle the onSelect callback
  useEffect(() => {
    onSelect(selectedFees);
  }, [selectedFees]); // Only re-run when selectedFees changes

  const toggleFeeSelection = (fee) => {
    setSelectedFees(prev => {
      const isSelected = prev.some(f => f.studentFeeId === fee.studentFeeId);
      return isSelected 
        ? prev.filter(f => f.studentFeeId !== fee.studentFeeId) 
        : [...prev, fee];
    });
  };

  if (!studentId) return null;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Fees to Pay
      </label>
      
      {isLoading ? (
        <div className="p-2 text-center text-gray-500">Loading fees...</div>
      ) : isError ? (
        <div className="p-2 text-center text-red-500">Error loading fees</div>
      ) : studentFees?.length === 0 ? (
        <div className="p-2 text-center text-gray-500">No outstanding fees found</div>
      ) : (
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
          {studentFees?.map((fee) => (
            <div 
              key={fee.studentFeeId} 
              className={`p-3 flex justify-between items-center cursor-pointer ${selectedFees.some(f => f.studentFeeId === fee.studentFeeId) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={() => toggleFeeSelection(fee)}
            >
              <div>
                <div className="font-medium">{fee.feeName}</div>
                <div className="text-sm text-gray-500">
                  Due: {new Date(fee.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-3">ETB {fee.remainingAmount.toFixed(2)}</span>
                <input
                  type="checkbox"
                  checked={selectedFees.some(f => f.studentFeeId === fee.studentFeeId)}
                  onChange={() => toggleFeeSelection(fee)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFees.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md">
          <div className="font-medium">Selected Fees:</div>
          <ul className="list-disc list-inside text-sm">
            {selectedFees.map(fee => (
              <li key={fee.studentFeeId}>
                {fee.feeName} - ETB {fee.remainingAmount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}