
'use client';

import { useState, useEffect } from 'react';
import MarkEntryForm from '@/components/assesment/MarkEntryForm';
import MarkEntryTable from '@/components/assesment/MarkEntryTable';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AssessmentPage() {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
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
      const response = await axios.get('http://localhost:8080/api/assessments/filter', {
        params: {
          streamId: filters.streamId || null,
          classId: filters.classId || null,
          sectionId: filters.sectionId || null,
          subjectId: filters.subjectId || null,
        },
      });
      setFilteredAssessments(response.data);
      setFiltersApplied(true);
    } catch (error) {
      toast.error('Failed to fetch assessments');
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/assessments/filter', {
        params: {
          streamId: filteredAssessments.length > 0 ? filteredAssessments[0].streamId : null,
          classId: filteredAssessments.length > 0 ? filteredAssessments[0].classId : null,
          sectionId: filteredAssessments.length > 0 ? filteredAssessments[0].sectionId : null,
          subjectId: filteredAssessments.length > 0 ? filteredAssessments[0].subjectId : null,
        },
      });
      setFilteredAssessments(response.data);
    } catch (error) {
      toast.error('Failed to refresh assessments');
      console.error('Error refreshing assessments:', error);
    }
  };

  const handleSave = async () => {
    try {
      await fetchAssessments();
      setFiltersApplied(true); // Keep the table visible after saving
      toast.success('Marks updated successfully');
    } catch (error) {
      toast.error('Failed to refresh assessments');
      console.error('Error refreshing assessments:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <MarkEntryForm onFilter={handleFilter} />
      {filtersApplied && filteredAssessments.length > 0 ? (
        <MarkEntryTable
          assessments={filteredAssessments}
          students={students}
          onSave={handleSave}
        />
      ) : filtersApplied ? (
        <p className="text-center text-gray-500 mt-4">No assessments found for the selected filters.</p>
      ) : null}
    </div>
  );
}