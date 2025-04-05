"use client";

import { useState } from "react";
import { useProcessSalaryPayment, useStaffSalaryHistory, useMonthlySalaryReport } from "@/lib/api/financeService/salary";
export const dynamic = "force-dynamic";

export default function SalaryManagement({ schoolId=1 }) {
  const [salaryData, setSalaryData] = useState({
    staffId: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paymentMethod: "BANK_TRANSFER",
    bankDetails: "",
    description: ""
  });
  
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const processSalaryMutation = useProcessSalaryPayment();
  const { data: staffSalaryHistory, isLoading: loadingHistory } = useStaffSalaryHistory(selectedStaffId, schoolId);
  const { data: monthlySalaryReport, isLoading: loadingReport } = useMonthlySalaryReport(schoolId, selectedYear, selectedMonth);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleProcessSalary = (e) => {
    e.preventDefault();
    processSalaryMutation.mutate({
      ...salaryData,
      amount: parseFloat(salaryData.amount),
      schoolId
    }, {
      onSuccess: () => {
        setSelectedStaffId(salaryData.staffId);
        setSalaryData({
          staffId: "",
          amount: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          paymentMethod: "BANK_TRANSFER",
          bankDetails: "",
          description: ""
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Salary Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Salary Payment Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Process Salary Payment</h3>
          <form onSubmit={handleProcessSalary}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Staff ID</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={salaryData.staffId}
                  onChange={(e) => setSalaryData({...salaryData, staffId: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={salaryData.amount}
                  onChange={(e) => setSalaryData({...salaryData, amount: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={salaryData.month}
                    onChange={(e) => setSalaryData({...salaryData, month: parseInt(e.target.value)})}
                  >
                    {monthNames.map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={salaryData.year}
                    onChange={(e) => setSalaryData({...salaryData, year: parseInt(e.target.value)})}
                  >
                    {[...Array(5)].map((_, idx) => {
                      const yearOption = new Date().getFullYear() - idx;
                      return (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={salaryData.paymentMethod}
                  onChange={(e) => setSalaryData({...salaryData, paymentMethod: e.target.value})}
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Details</label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={salaryData.bankDetails}
                  onChange={(e) => setSalaryData({...salaryData, bankDetails: e.target.value})}
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={salaryData.description}
                  onChange={(e) => setSalaryData({...salaryData, description: e.target.value})}
                  rows="2"
                />
              </div>
              
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={processSalaryMutation.isPending}
              >
                {processSalaryMutation.isPending && (
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                )}
                Process Salary Payment
              </button>
            </div>
          </form>
        </div>
        
        {/* Staff Salary History */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                placeholder="Enter staff ID to view salary history"
              />
              <button
                type="button"
                onClick={() => setSelectedStaffId(selectedStaffId)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View
              </button>
            </div>
          </div>
          
          {selectedStaffId ? (
            loadingHistory ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : !staffSalaryHistory || staffSalaryHistory.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
                No salary records found for this staff member
              </div>
            ) : (
              <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium">Salary History for {staffSalaryHistory[0]?.staffName}</h4>
                  <p className="text-sm text-gray-500">ID: {selectedStaffId}</p>
                </div>
                <ul className="divide-y divide-gray-200">
                  {staffSalaryHistory.map((payment) => (
                    <li key={payment.salaryPaymentId} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            {monthNames[payment.month - 1]} {payment.year}
                          </div>
                          <div className="text-sm text-gray-500">
                            Paid on: {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Method: {payment.paymentMethod}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">${payment.amount.toFixed(2)}</div>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              PAID
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
              Enter a staff ID to view salary history
            </div>
          )}
        </div>
      </div>
      
      {/* Monthly Salary Report */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Monthly Salary Report</h3>
          
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[...Array(5)].map((_, idx) => {
                  const yearOption = new Date().getFullYear() - idx;
                  return (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loadingReport ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : !monthlySalaryReport ? (
          <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
            No salary data available for the selected month
          </div>
        ) : (
          <div className="bg-white overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Salaries Paid</h4>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    ${monthlySalaryReport.totalPaid.toFixed(2)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Staff Members Paid</h4>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {monthlySalaryReport.staffPaid}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Average Salary</h4>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    ${monthlySalaryReport.averageSalary.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlySalaryReport.salaryPayments.map((payment) => (
                    <tr key={payment.salaryPaymentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.staffName}</div>
                        <div className="text-xs text-gray-500">ID: {payment.staffId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.staffRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ${monthlySalaryReport.totalPaid.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}