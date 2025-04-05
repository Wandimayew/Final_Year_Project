'use client';

import { useState, useEffect } from 'react';
import ProgressTrackerFilterForm from '@/components/assesment/ProgressTrackerFilterForm';
import ProgressTrackerTable from '@/components/assesment/ProgressTrackerTable';
import axios from 'axios';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function ProgressTrackerPage() {
  const [trackerData, setTrackerData] = useState([]);
  const [filteredTrackers, setFilteredTrackers] = useState([]);
  const [students, setStudents] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8084/api/students');
        setStudents(response.data.map(s => ({ value: s.id, label: `${s.name} (#${s.id})` })));
      } catch (error) {
        toast.error('Failed to fetch students');
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleFilter = async (filters) => {
    try {
      const response = await axios.get('http://localhost:8080/api/progress-trackers/filter', {
        params: {
          schoolId: filters.schoolId || null,
          studentId: filters.studentId || null,
          classId: filters.classId || null,
          subjectId: filters.subjectId || null,
        },
      });

      // Further filter trackers based on streamId and sectionId if needed
      let filteredData = response.data;
      if (filters.streamId || filters.sectionId) {
        const assessmentsResponse = await axios.get('http://localhost:8080/api/assessments/filter', {
          params: {
            streamId: filters.streamId || null,
            classId: filters.classId || null,
            sectionId: filters.sectionId || null,
            subjectId: filters.subjectId || null,
            studentId: filters.studentId || null,
          },
        });

        const assessmentIds = new Set(assessmentsResponse.data.map(a => a.assessmentId));
        filteredData = filteredData.filter(tracker => tracker.assessment && assessmentIds.has(tracker.assessment.assessmentId));
      }

      setFilteredTrackers(filteredData);
      setFiltersApplied(true);
    } catch (error) {
      toast.error('Failed to fetch progress trackers');
      console.error('Error fetching progress trackers:', error);
    }
  };

  const handleEdit = (tracker) => {
    // Placeholder for edit functionality
    toast.info('Edit functionality not implemented');
  };

  const handleDelete = async (trackerId) => {
    try {
      await axios.delete(`http://localhost:8080/api/progress-trackers/${trackerId}`);
      toast.success('Progress tracker deleted successfully');
      setFilteredTrackers(prev => prev.filter(t => t.progressTrackerId !== trackerId));
    } catch (error) {
      toast.error('Failed to delete progress tracker');
      console.error('Error deleting progress tracker:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ProgressTrackerFilterForm onFilter={handleFilter} />
      {filtersApplied && filteredTrackers.length > 0 && (
        <ProgressTrackerTable
          trackerData={filteredTrackers}
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}