import axios from 'axios';

const API_BASE_URL = 'http://localhost:8086';

const assessmentApi = {
  // Get assessments with different filters
  getAssessmentsByStudent: async (studentId) => {
    const response = await axios.get(`${API_BASE_URL}/api/assessment/student/${studentId}`);
    return response.data;
  },
  
  getAssessmentsByClass: async (classId) => {
    const response = await axios.get(`${API_BASE_URL}/api/assessment/class/${classId}`);
    return response.data;
  },
  
  getAssessmentsBySubject: async (subjectId) => {
    const response = await axios.get(`${API_BASE_URL}/api/assessment/subject/${subjectId}`);
    return response.data;
  },
  
  // Create assessment
  createAssessment: async (assessmentData) => {
    const response = await axios.post(`${API_BASE_URL}/api/assessment`, assessmentData);
    return response.data;
  },
  
  // Update assessment
  updateAssessment: async (assessmentId, assessmentData) => {
    const response = await axios.put(`${API_BASE_URL}/api/assessment/${assessmentId}`, assessmentData);
    return response.data;
  },
  
  // Delete assessment
  deleteAssessment: async (assessmentId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/assessment/${assessmentId}`);
    return response.data;
  },
  
  // Get assessment by ID
  getAssessmentById: async (assessmentId) => {
    const response = await axios.get(`${API_BASE_URL}/api/assessment/${assessmentId}`);
    return response.data;
  }
};

export default assessmentApi;