'use client';

import { useState, useEffect } from 'react';
import CreateAnalytics from '@/components/assesment/CreateAnalytics';
import AnalyticsTable from '@/components/assesment/AnalyticsTable';
import axios from 'axios';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState([]);
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
      const response = await axios.get('http://localhost:8080/api/analytics/filter', {
        params: {
          schoolId: filters.schoolId || null,
          studentId: filters.studentId || null,
        },
      });

      // Further filter analytics based on streamId, classId, sectionId, subjectId if needed
      let filteredData = response.data;
      if (filters.streamId || filters.classId || filters.sectionId || filters.subjectId) {
        const assessmentsResponse = await axios.get('http://localhost:8080/api/assessments/filter', {
          params: {
            streamId: filters.streamId || null,
            classId: filters.classId || null,
            sectionId: filters.sectionId || null,
            subjectId: filters.subjectId || null,
            studentId: filters.studentId || null,
          },
        });

        const assessmentAnalyticsIds = new Set(assessmentsResponse.data.map(a => a.analyticsId));
        filteredData = filteredData.filter(analytics => assessmentAnalyticsIds.has(analytics.assessmentAnalyticsId));
      }

      setFilteredAnalytics(filteredData);
      setFiltersApplied(true);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error('Error fetching analytics:', error);
    }
  };

  const handleEdit = (analytics) => {
    // Placeholder for edit functionality
    toast.info('Edit functionality not implemented');
  };

  const handleDelete = async (analyticsId) => {
    try {
      await axios.delete(`http://localhost:8080/api/analytics/${analyticsId}`);
      toast.success('Analytics deleted successfully');
      setFilteredAnalytics(prev => prev.filter(a => a.assessmentAnalyticsId !== analyticsId));
    } catch (error) {
      toast.error('Failed to delete analytics');
      console.error('Error deleting analytics:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <CreateAnalytics onFilter={handleFilter} />
      {filtersApplied && filteredAnalytics.length > 0 && (
        <AnalyticsTable
          analyticsData={filteredAnalytics}
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}