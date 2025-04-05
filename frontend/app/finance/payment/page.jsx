// "use client";

// import { useState } from "react";
// import { useProcessPayment, usePaymentsByDateRange, useCancelPayment } from "@/lib/api/financeService/payment";

// export default function PaymentProcessing({ schoolId=1 }) {
//   const [paymentData, setPaymentData] = useState({
//     studentId: "",
//     amount: "",
//     paymentMethod: "CASH",
//     reference: "",
//     description: ""
//   });
  
//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });
  
//   const [cancelInfo, setCancelInfo] = useState({ paymentId: null, reason: "" });
//   const [showCancelModal, setShowCancelModal] = useState(false);

//   const processPaymentMutation = useProcessPayment();
//   const cancelPaymentMutation = useCancelPayment();
//   const { data: payments, isLoading, isError } = usePaymentsByDateRange(
//     schoolId, 
//     dateRange.startDate, 
//     dateRange.endDate
//   );

//   const handleProcessPayment = (e) => {
//     e.preventDefault();
//     processPaymentMutation.mutate({
//       ...paymentData,
//       amount: parseFloat(paymentData.amount),
//     }, {
//       onSuccess: () => {
//         setPaymentData({
//           studentId: "",
//           amount: "",
//           paymentMethod: "CASH",
//           reference: "",
//           description: ""
//         });
//       }
//     });
//   };

//   const openCancelModal = (paymentId) => {
//     setCancelInfo({ paymentId, reason: "" });
//     setShowCancelModal(true);
//   };

//   const handleCancelPayment = () => {
//     cancelPaymentMutation.mutate(cancelInfo, {
//       onSuccess: () => {
//         setShowCancelModal(false);
//         setCancelInfo({ paymentId: null, reason: "" });
//       }
//     });
//   };

//   const getStatusBadge = (status) => {
//     const styles = {
//       COMPLETED: "bg-green-100 text-green-800",
//       PENDING: "bg-yellow-100 text-yellow-800",
//       CANCELLED: "bg-red-100 text-red-800",
//       FAILED: "bg-gray-100 text-gray-800"
//     };
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
//         {status}
//       </span>
//     );
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-2xl font-bold mb-6">Payment Processing</h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {/* Payment Form */}
//         <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4">Process New Payment</h3>
//           <form onSubmit={handleProcessPayment}>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Student ID</label>
//                 <input
//                   type="text"
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={paymentData.studentId}
//                   onChange={(e) => setPaymentData({...paymentData, studentId: e.target.value})}
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={paymentData.amount}
//                   onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Payment Method</label>
//                 <select
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={paymentData.paymentMethod}
//                   onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
//                 >
//                   <option value="CASH">Cash</option>
//                   <option value="BANK_TRANSFER">Bank Transfer</option>
//                   <option value="CREDIT_CARD">Credit Card</option>
//                   <option value="MOBILE_MONEY">Mobile Money</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Reference</label>
//                 <input
//                   type="text"
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={paymentData.reference}
//                   onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Description</label>
//                 <textarea
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={paymentData.description}
//                   onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
//                   rows="2"
//                 />
//               </div>
              
//               <button
//                 type="submit"
//                 className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 disabled={processPaymentMutation.isPending}
//               >
//                 {processPaymentMutation.isPending && (
//                   <span className="inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
//                 )}
//                 Process Payment
//               </button>
//             </div>
//           </form>
//         </div>
        
//         {/* Payment History */}
//         <div className="md:col-span-2">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Recent Payments</h3>
            
//             <div className="flex items-center space-x-2">
//               <input
//                 type="date"
//                 className="px-2 py-1 border border-gray-300 rounded-md text-sm"
//                 value={dateRange.startDate}
//                 onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
//               />
//               <span className="text-gray-500">to</span>
//               <input
//                 type="date"
//                 className="px-2 py-1 border border-gray-300 rounded-md text-sm"
//                 value={dateRange.endDate}
//                 onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
//               />
//             </div>
//           </div>
          
//           {isLoading ? (
//             <div className="flex justify-center p-8">
//               <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
//             </div>
//           ) : isError ? (
//             <div className="p-4 bg-red-100 text-red-700 rounded-md">Error loading payments</div>
//           ) : payments?.length === 0 ? (
//             <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
//               No payments found for the selected date range
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       ID/Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Student
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Amount
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Method/Ref
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {payments?.map((payment) => (
//                     <tr key={payment.paymentId} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">#{payment.paymentId}</div>
//                         <div className="text-xs text-gray-500">
//                           {new Date(payment.paymentDate).toLocaleDateString()}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{payment.studentName}</div>
//                         <div className="text-xs text-gray-500">ID: {payment.studentId}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-semibold">${payment.amount.toFixed(2)}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
//                         {payment.reference && (
//                           <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {getStatusBadge(payment.status)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <div className="flex justify-end space-x-2">
//                           <a 
//                             href={`/receipt/${payment.paymentId}`}
//                             target="_blank"
//                             className="text-blue-600 hover:text-blue-900"
//                           >
//                             Receipt
//                           </a>
//                           {payment.status === 'COMPLETED' && (
//                             <button
//                               onClick={() => openCancelModal(payment.paymentId)}
//                               className="text-red-600 hover:text-red-900"
//                             >
//                               Cancel
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
      
//       {/* Cancel Payment Modal */}
//       {showCancelModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <h3 className="text-lg font-medium mb-4">Cancel Payment</h3>
//             <p className="text-sm text-gray-500 mb-4">
//               Are you sure you want to cancel this payment? This action cannot be undone.
//             </p>
            
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Reason for cancellation
//               </label>
//               <textarea
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 value={cancelInfo.reason}
//                 onChange={(e) => setCancelInfo({...cancelInfo, reason: e.target.value})}
//                 rows="3"
//                 required
//               ></textarea>
//             </div>
            
//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={() => setShowCancelModal(false)}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleCancelPayment}
//                 disabled={!cancelInfo.reason || cancelPaymentMutation.isPending}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
//               >
//                 {cancelPaymentMutation.isPending ? "Processing..." : "Confirm Cancellation"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useProcessPayment, usePaymentsByDateRange, useCancelPayment } from "@/lib/api/financeService/payment";
import { useStudentFees } from "@/lib/api/financeService/fee";
import FeeSelection from "@/components/finance/FeeSelection";
// import { useStudents } from "@/lib/api/studentService";
// import StudentSearch from "@/components/StudentSearch";
// import FeeSelection from "@/components/FeeSelection";

export const dynamic = "force-dynamic";

export default function PaymentProcessing({ schoolId = "SCH-12345" }) {
    const [paymentData, setPaymentData] = useState({
        schoolId,
        studentId: "",
        amount: 0,
        studentFeeIds: [],
        paymentMethod: "CASH",
        remarks: "",
        createdBy: "admin_user",
        email: "",
        firstName: "",
        lastName: ""
    });

    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const [cancelInfo, setCancelInfo] = useState({ paymentId: null, reason: "" });
    const [showCancelModal, setShowCancelModal] = useState(false);

    const processPaymentMutation = useProcessPayment();
    const cancelPaymentMutation = useCancelPayment();
    
    const { data: payments, isLoading, isError } = usePaymentsByDateRange(
        schoolId,
        dateRange.startDate,
        dateRange.endDate
    );

    // const { data: studentFee, isLoading: studentFeeLoading, isError: studentFeeError } = useStudentFees(
    //     schoolId,
    //     paymentData.studentId
    // );

    const handleStudentSelect = (student) => {
        setPaymentData({
            ...paymentData,
            studentId: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email
        });
    };

    const handleFeeSelection = (selectedFees) => {
        const totalAmount = selectedFees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
        setPaymentData({
            ...paymentData,
            studentFeeIds: selectedFees.map(fee => fee.studentFeeId),
            amount: totalAmount
        });
    };

    const handleProcessPayment = (e) => {
        e.preventDefault();
        const response = processPaymentMutation.mutate(paymentData);
        
    };

    const openCancelModal = (paymentId) => {
        setCancelInfo({ paymentId, reason: "" });
        setShowCancelModal(true);
    };

    const handleCancelPayment = () => {
        cancelPaymentMutation.mutate(cancelInfo, {
            onSuccess: () => {
                setShowCancelModal(false);
                setCancelInfo({ paymentId: null, reason: "" });
            }
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            COMPLETED: "bg-green-100 text-green-800",
            PENDING: "bg-yellow-100 text-yellow-800",
            CANCELLED: "bg-red-100 text-red-800",
            FAILED: "bg-gray-100 text-gray-800"
        };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Processing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Payment Form */}
                <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Process New Payment</h3>
                    
                    {/* <StudentSearch 
                        schoolId={schoolId}
                        onSelect={handleStudentSelect}
                    /> */}
                    
                    {paymentData.studentId && (
                        <FeeSelection 
                            studentId={paymentData.studentId}
                            onSelect={handleFeeSelection}
                            schoolId={schoolId}
                        />
                    )}

                     {/* Student Selection */}
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                        Student*
                      </label>
                      <select
                        id="studentId"
                        name="studentId"
                        value={paymentData.studentId}
                        onChange={(e) => setPaymentData({...paymentData, studentId: e.target.value})}
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
                    {/* <div>
                      <label htmlFor="feeId" className="block text-sm font-medium text-gray-700 mb-1">
                        StudentFee*
                      </label>
                      <select
                        id="studentFeeId"
                        name="studentFeeId"
                        value={formData.studentFeeId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={studentFeeLoading}
                      >
                        <option value="">Select Fee</option>
                        {studentFee?.map(fee => (
                          <option key={fee.studentFeeId} value={fee.studentFeeId}>
                            {fee.status} - Remaining Amount (${fee.remainingAmount})
                          </option>
                        ))}
                      </select>
                      {studentFeeLoading && <p className="mt-1 text-sm text-gray-500">Loading fees...</p>}
                    </div> */}
                    
                    <form onSubmit={handleProcessPayment} className="mt-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                                    required
                                    disabled={paymentData.studentFeeIds.length > 0}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">FirstName</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={paymentData.firstName}
                                    onChange={(e) => setPaymentData({...paymentData, firstName: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">LastName</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={paymentData.lastName}
                                    onChange={(e) => setPaymentData({...paymentData, lastName: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={paymentData.email}
                                    onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                <select
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={paymentData.paymentMethod}
                                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CREDIT_CARD">Credit Card</option>
                                    <option value="MOBILE_MONEY">Mobile Money</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                <textarea
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={paymentData.remarks}
                                    onChange={(e) => setPaymentData({...paymentData, remarks: e.target.value})}
                                    rows="2"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={processPaymentMutation.isPending || !paymentData.studentId}
                            >
                                {processPaymentMutation.isPending && (
                                    <span className="inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                                )}
                                {paymentData.paymentMethod === 'CASH' ? 'Process Payment' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Payment History */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Recent Payments</h3>
                        
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : isError ? (
                        <div className="p-4 bg-red-100 text-red-700 rounded-md">Error loading payments</div>
                    ) : payments?.length === 0 ? (
                        <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
                            No payments found for the selected date range
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID/Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Method/Ref
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments?.map((payment) => (
                                        <tr key={payment.paymentId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">#{payment.id}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{payment.firstName} {payment.lastName}</div>
                                                <div className="text-xs text-gray-500">ID: {payment.studentId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold">ETB {payment.amount.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                                                {payment.reference && (
                                                    <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <a 
                                                        href={`/receipt/${payment.id}`}
                                                        target="_blank"
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Receipt
                                                    </a>
                                                    {payment.status === 'COMPLETED' && (
                                                        <button
                                                            onClick={() => openCancelModal(payment.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Cancel Payment Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium mb-4">Cancel Payment</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Are you sure you want to cancel this payment? This action cannot be undone.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for cancellation
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={cancelInfo.reason}
                                onChange={(e) => setCancelInfo({...cancelInfo, reason: e.target.value})}
                                rows="3"
                                required
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelPayment}
                                disabled={!cancelInfo.reason || cancelPaymentMutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {cancelPaymentMutation.isPending ? "Processing..." : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}