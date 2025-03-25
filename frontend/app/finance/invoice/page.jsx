"use client";

import { useState } from "react";
import { useGenerateInvoice, useStudentInvoices, useUpdateInvoiceStatus, useDeleteInvoice } from "@/lib/api/financeService/invoice";

export default function InvoiceManagement({ schoolId=1 }) {
  const [invoiceData, setInvoiceData] = useState({
    studentId: "",
    dueDate: "",
    items: [{ description: "", amount: "" }]
  });
  
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  const generateInvoiceMutation = useGenerateInvoice();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();
  const deleteInvoiceMutation = useDeleteInvoice();
  const { data: invoices, isLoading, isError } = useStudentInvoices(selectedStudentId, schoolId);

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData, 
      items: [...invoiceData.items, { description: "", amount: "" }]
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    setInvoiceData({...invoiceData, items: updatedItems});
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = value;
    setInvoiceData({...invoiceData, items: updatedItems});
  };

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    
    const formattedInvoiceData = {
      ...invoiceData,
      schoolId,
      items: invoiceData.items.map(item => ({
        ...item,
        amount: parseFloat(item.amount)
      }))
    };
    
    generateInvoiceMutation.mutate(formattedInvoiceData, {
      onSuccess: () => {
        setInvoiceData({
          studentId: "",
          dueDate: "",
          items: [{ description: "", amount: "" }]
        });
        setSelectedStudentId(formattedInvoiceData.studentId);
      }
    });
  };

  const handleUpdateStatus = (invoiceId, newStatus) => {
    updateInvoiceStatusMutation.mutate({ invoiceId, status: newStatus });
  };

  const handleDeleteInvoice = (invoiceId) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(invoiceId);
    }
  };

  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const calculateInvoiceTotal = () => {
    return invoiceData.items.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      OVERDUE: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      PARTIALLY_PAID: "bg-blue-100 text-blue-800"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Invoice Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Invoice Generation Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Generate New Invoice</h3>
          <form onSubmit={handleGenerateInvoice}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={invoiceData.studentId}
                  onChange={(e) => setInvoiceData({...invoiceData, studentId: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Invoice Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center text-xs px-2 py-1 border border-transparent text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Item
                  </button>
                </div>
                
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 mb-2 p-2 border border-gray-200 rounded-md bg-white">
                    <div className="flex-grow">
                      <input
                        type="text"
                        placeholder="Item description"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md mb-1"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                        required
                      />
                    </div>
                    {invoiceData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-end text-sm mt-2">
                  <div className="font-medium">Total: ${calculateInvoiceTotal().toFixed(2)}</div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={generateInvoiceMutation.isPending}
              >
                {generateInvoiceMutation.isPending && (
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                )}
                Generate Invoice
              </button>
            </div>
          </form>
        </div>
        
        {/* Invoice List */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                placeholder="Enter student ID to view invoices"
              />
              <button
                type="button"
                onClick={() => setSelectedStudentId(selectedStudentId)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View
              </button>
            </div>
          </div>
          
          {selectedStudentId ? (
            isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : isError ? (
              <div className="p-4 bg-red-100 text-red-700 rounded-md">Error loading invoices</div>
            ) : invoices?.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
                No invoices found for this student
              </div>
            ) : (
              <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {invoices?.map((invoice) => (
                    <li key={invoice.invoiceId} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">Invoice #{invoice.invoiceNumber}</h4>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span>Amount: ${invoice.totalAmount.toFixed(2)}</span>
                            <span className="mx-2">•</span>
                            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <button 
                            onClick={() => viewInvoiceDetails(invoice)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
              Enter a student ID to view their invoices
            </div>
          )}
        </div>
      </div>
      
      {/* Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setShowInvoiceDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Student</div>
                <div className="font-medium">{selectedInvoice.studentName}</div>
                <div className="text-sm text-gray-500">ID: {selectedInvoice.studentId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Invoice Info</div>
                <div className="font-medium">
                  Status: {getStatusBadge(selectedInvoice.status)}
                </div>
                <div className="text-sm">
                  Date: {new Date(selectedInvoice.createdDate).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    ${selectedInvoice.totalAmount.toFixed(2)}
                  </td>
                </tr>
                {selectedInvoice.paidAmount > 0 && (
                  <>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Paid Amount
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${selectedInvoice.paidAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Balance
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            
            <div className="flex justify-between mt-6">
              <div className="space-x-2">
                <button
                  onClick={() => handleUpdateStatus(selectedInvoice.invoiceId, "PAID")}
                  className={`px-3 py-1 text-sm rounded-md border ${selectedInvoice.status === 'PAID' ? 'bg-green-100 border-green-400 text-green-800' : 'border-gray-300 hover:bg-gray-50'}`}
                  disabled={updateInvoiceStatusMutation.isPending}
                >
                  Mark Paid
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInvoice.invoiceId, "CANCELLED")}
                  className={`px-3 py-1 text-sm rounded-md border ${selectedInvoice.status === 'CANCELLED' ? 'bg-gray-100 border-gray-400 text-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                  disabled={updateInvoiceStatusMutation.isPending}
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={() => window.open(`/invoices/print/${selectedInvoice.invoiceId}`, '_blank')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}