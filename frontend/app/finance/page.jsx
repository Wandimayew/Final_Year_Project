"use client";

import { useState } from "react";
import { useOutstandingFees } from '@/lib/api/financeService/fee';
import { useDashboardStats, useMonthlyReport } from "@/lib/api/financeService/financialReport";
export const dynamic = "force-dynamic";

export default function FinancialDashboard({ schoolId=1 }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  const { data: dashboardStats, isLoading: loadingStats } = useDashboardStats(schoolId);
  const { data: monthlyReport, isLoading: loadingMonthly } = useMonthlyReport(schoolId, year, month);
  const { data: outstandingFees, isLoading: loadingOutstanding } = useOutstandingFees(schoolId);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Financial Dashboard</h2>
      
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-blue-500 mb-1">Revenue (Monthly)</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-700">
              {loadingStats ? "Loading..." : `$${dashboardStats?.monthlyRevenue.toFixed(2)}`}
            </span>
            <span className="ml-2 text-xs text-blue-600">
              {loadingStats ? "" : dashboardStats?.revenueChange >= 0 ? 
                `+${dashboardStats?.revenueChange}%` : 
                `${dashboardStats?.revenueChange}%`
              }
            </span>
          </div>
          <div className="mt-1 text-sm text-blue-600">vs. last month</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-green-500 mb-1">Payments Collected</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-green-700">
              {loadingStats ? "Loading..." : `${dashboardStats?.paymentsCollected}`}
            </span>
            <span className="ml-2 text-xs text-green-600">
              {loadingStats ? "" : dashboardStats?.paymentsCollectedChange >= 0 ? 
                `+${dashboardStats?.paymentsCollectedChange}%` : 
                `${dashboardStats?.paymentsCollectedChange}%`
              }
            </span>
          </div>
          <div className="mt-1 text-sm text-green-600">vs. last month</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-red-500 mb-1">Outstanding Fees</h3>
          <div className="text-2xl font-bold text-red-700">
            {loadingStats ? "Loading..." : `$${dashboardStats?.outstandingAmount.toFixed(2)}`}
          </div>
          <div className="mt-1 text-sm text-red-600">
            {loadingStats ? "" : `${dashboardStats?.outstandingCount} students with unpaid fees`}
          </div>
        </div>
      </div>
      
      {/* Monthly Report */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Monthly Financial Report</h3>
          
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
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
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
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
        
        {loadingMonthly ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : !monthlyReport ? (
          <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
            No data available for the selected month
          </div>
        ) : (
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Revenue</h4>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    ${monthlyReport.totalRevenue.toFixed(2)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Expenses</h4>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    ${monthlyReport.totalExpenses.toFixed(2)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Net Income</h4>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    ${(monthlyReport.totalRevenue - monthlyReport.totalExpenses).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Revenue Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">By Fee Category</h5>
                  <div className="space-y-2">
                    {monthlyReport.revenueByCategory.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="text-sm text-gray-800">{item.category}</div>
                        <div className="text-sm font-medium text-gray-900">${item.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">By Payment Method</h5>
                  <div className="space-y-2">
                    {monthlyReport.revenueByPaymentMethod.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="text-sm text-gray-800">{item.method}</div>
                        <div className="text-sm font-medium text-gray-900">${item.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Expense Breakdown</h4>
              <div className="space-y-2">
                {monthlyReport.expenseBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="text-sm text-gray-800">{item.category}</div>
                    <div className="text-sm font-medium text-gray-900">${item.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Outstanding Fees */}
      <div>
        <h3 className="text-lg font-medium mb-4">Outstanding Fees</h3>
        
        {loadingOutstanding ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : !outstandingFees || outstandingFees.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
            No outstanding fees at the moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outstandingFees.map((fee) => (
                  <tr key={fee.studentFeeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{fee.studentName}</div>
                      <div className="text-xs text-gray-500">ID: {fee.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{fee.feeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                      {new Date(fee.dueDate) < new Date() && (
                        <div className="text-xs text-red-500">Overdue</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">${fee.amount.toFixed(2)}</div>
                      {fee.paidAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          Paid: ${fee.paidAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${fee.paidAmount === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {fee.paidAmount === 0 ? 'UNPAID' : 'PARTIALLY PAID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}