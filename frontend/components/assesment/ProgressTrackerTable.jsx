'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ProgressTrackerTable({ trackerData, students, onEdit, onDelete }) {
  const [remarks, setRemarks] = useState(
    trackerData.map(data => ({
      progressTrackerId: data.progressTrackerId,
      remarks: data.remarks || '',
    }))
  );

  const handleRemarkChange = (trackerId, value) => {
    setRemarks(prev =>
      prev.map(item =>
        item.progressTrackerId === trackerId ? { ...item, remarks: value } : item
      )
    );
  };

  const handleSave = async (trackerId) => {
    const remarkEntry = remarks.find(r => r.progressTrackerId === trackerId);
    try {
      await axios.put(`http://localhost:8080/api/progress-trackers/${trackerId}`, {
        schoolId: trackerData.find(t => t.progressTrackerId === trackerId).schoolId,
        studentId: trackerData.find(t => t.progressTrackerId === trackerId).studentId,
        remarks: remarkEntry.remarks,
      });
      toast.success('Remarks updated successfully');
    } catch (error) {
      toast.error('Failed to update remarks');
      console.error('Error updating remarks:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Sl</th>
              <th className="py-2 px-4 border-b text-left">Student Name</th>
              <th className="py-2 px-4 border-b text-left">Class</th>
              <th className="py-2 px-4 border-b text-left">Subject</th>
              <th className="py-2 px-4 border-b text-left">Assessment</th>
              <th className="py-2 px-4 border-b text-left">Average Marks</th>
              <th className="py-2 px-4 border-b text-left">Progress Status</th>
              <th className="py-2 px-4 border-b text-left">Remarks</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trackerData.map((tracker, index) => {
              const student = students.find(s => s.value === tracker.studentId);
              const assessment = tracker.assessment;
              const remarkEntry = remarks.find(r => r.progressTrackerId === tracker.progressTrackerId);
              return (
                <tr key={tracker.progressTrackerId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">
                    {student ? student.label.split(' (#')[0] : 'Unknown'}
                  </td>
                  <td className="py-2 px-4 border-b">{tracker.classId}</td>
                  <td className="py-2 px-4 border-b">{tracker.subjectId}</td>
                  <td className="py-2 px-4 border-b">
                    {assessment ? `${assessment.assessmentId}: ${assessment.assessmentName}` : 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b">{tracker.averageMarks?.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{tracker.progressStatus || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="text"
                      value={remarkEntry.remarks}
                      onChange={e => handleRemarkChange(tracker.progressTrackerId, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter remarks"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleSave(tracker.progressTrackerId)}
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => onEdit(tracker)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(tracker.progressTrackerId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}