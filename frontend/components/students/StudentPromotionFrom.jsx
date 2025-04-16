"use client";
import { useState, useEffect } from 'react';
import { useCreatePromotion, usePassedStudents } from '@/lib/api/studentService/promotion';
import { toast } from 'react-hot-toast';

export default function StudentPromotionForm() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedNewClass, setSelectedNewClass] = useState(null);
  const [selectedNewSection, setSelectedNewSection] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [carryForwardDue, setCarryForwardDue] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Mock data for classes, sections, and sessions
  const classes = [
    { id: 1, name: 'One' },
    { id: 2, name: 'Two' },
    { id: 3, name: 'Three' }
  ];
  
  const sections = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 3, name: 'C' }
  ];
  
  const sessions = [
    { id: 1, name: '2024-2025' },
    { id: 2, name: '2025-2026' }
  ];

  // Fetch students based on selected class and section
  const { data: students = [], isLoading, error, refetch } = usePassedStudents({
    classId: selectedClass?.id,
    sectionId: selectedSection?.id,
    passed: "PASSED"
  });

  const createPromotion = useCreatePromotion();

  // Update selectedStudents when students data changes
  useEffect(() => {
    if (students.length > 0) {
      setSelectedStudents(students.map(student => ({
        ...student,
        selected: false,
        isAlumni: false
      })));
      setSelectAll(false); // Reset select all when student list changes
    } else {
      setSelectedStudents([]);
      setSelectAll(false);
    }
  }, [students]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedStudents(
      selectedStudents.map(student => ({
        ...student,
        selected: newSelectAll
      }))
    );
  };

  const handleSelectStudent = (index) => {
    const newSelectedStudents = [...selectedStudents];
    newSelectedStudents[index].selected = !newSelectedStudents[index].selected;
    setSelectedStudents(newSelectedStudents);
    setSelectAll(newSelectedStudents.every(student => student.selected));
  };

  const handleAlumniChange = (index) => {
    const newSelectedStudents = [...selectedStudents];
    newSelectedStudents[index].isAlumni = !newSelectedStudents[index].isAlumni;
    setSelectedStudents(newSelectedStudents);
  };

  const handlePromote = () => {
    const studentsToPromote = selectedStudents.filter(student => student.selected);
    
    if (studentsToPromote.length === 0) {
      toast.error('Please select at least one student to promote');
      return;
    }
    
    if (!selectedNewClass || !selectedNewSection || !selectedSession) {
      toast.error('Please select promotion details (class, section and session)');
      return;
    }
    
    const promotionPromises = studentsToPromote.map(student => {
      const promotionData = {
        schoolId: 1,
        previousClassId: selectedClass?.id,
        newClassId: selectedNewClass?.id,
        sectionId: selectedNewSection?.id,
        isPassed: true,
        promotionDate: new Date().toISOString().split('T')[0],
        remark: '',
        studentId: student.studentId,
        registNo: student.registNo,
      };
      
      return createPromotion.mutateAsync(promotionData);
    });
    
    Promise.all(promotionPromises)
      .then(() => {
        toast.success(`Successfully promoted ${studentsToPromote.length} students`);
        // Reset selections after successful promotion
        refetch(); 
        setSelectedStudents(selectedStudents.map(student => ({
          ...student,
          selected: false
        })));
        setSelectAll(false);
      })
      .catch(error => {
        toast.error('Failed to promote students: ' + error.message);
      });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-600 text-white rounded mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Student Promotion</h1>
        </div>
        
        {/* Select source section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Select Source</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const classId = parseInt(e.target.value);
                  const selected = classes.find(c => c.id === classId);
                  setSelectedClass(selected || null);
                  if (!selected) {
                    setSelectedSection(null);
                    setSelectedStudents([]);
                  }
                }}
              >
                <option value="">Select</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedSection?.id || ''}
                onChange={(e) => {
                  const sectionId = parseInt(e.target.value);
                  const selected = sections.find(s => s.id === sectionId);
                  setSelectedSection(selected || null);
                }}
                disabled={!selectedClass}
              >
                <option value="">Select</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Promotion details section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Promotion Details</h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
              <ol className="list-decimal pl-5 text-sm text-blue-800 space-y-1">
                <li>Select class and section to view students</li>
                <li>Choose students to promote using checkboxes</li>
                <li>Fill promotion details and click Promotion button</li>
              </ol>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="carryForward" 
                  className="h- W-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={carryForwardDue}
                  onChange={() => setCarryForwardDue(!carryForwardDue)}
                />
                <label htmlFor="carryForward" className="ml-2 text-sm text-gray-700">
                  Carry Forward Due in Next Session
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promote To Session <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSession?.id || ''}
                  onChange={(e) => {
                    const sessionId = parseInt(e.target.value);
                    const selected = sessions.find(s => s.id === sessionId);
                    setSelectedSession(selected || null);
                  }}
                >
                  <option value="">Select</option>
                  {sessions.map(session => (
                    <option key={session.id} value={session.id}>{session.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promote To Class <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedNewClass?.id || ''}
                  onChange={(e) => {
                    const classId = parseInt(e.target.value);
                    const selected = classes.find(c => c.id === classId);
                    setSelectedNewClass(selected || null);
                  }}
                >
                  <option value="">Select</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promote To Section <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedNewSection?.id || ''}
                  onChange={(e) => {
                    const sectionId = parseInt(e.target.value);
                    const selected = sections.find(s => s.id === sectionId);
                    setSelectedNewSection(selected || null);
                  }}
                >
                  <option value="">Select</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Student List Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        disabled={selectedStudents.length === 0}
                      />
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Name</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mark Summary</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading students...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-red-500">
                        Error loading students: {error.message}
                      </td>
                    </tr>
                  ) : selectedStudents.length > 0 ? (
                    selectedStudents.map((student, index) => (
                      <tr key={student.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={student.selected}
                            onChange={() => handleSelectStudent(index)}
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{student.registId}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.parentId ? 'Assigned' : 'Not Assigned'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {selectedClass && selectedSection 
                          ? "No students found for this class and section"
                          : "Please select a class and section to view students"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="px-6 pb-6 flex justify-end">
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
              onClick={handlePromote}
              disabled={createPromotion.isLoading || selectedStudents.length === 0}
            >
              {createPromotion.isLoading ? 'Processing...' : 'Promote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}