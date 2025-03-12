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
  
  // Get passed students based on class and section
  const { data: students = [], isLoading, error } = usePassedStudents({
    classId: selectedClass?.id,
    sectionId: selectedSection?.id,
    passed: "PASSED"
  });
  const createPromotion = useCreatePromotion();
  
  useEffect(() => {
    if (students.length > 0) {
      setSelectedStudents(students.map(student => ({
        ...student,
        selected: false,
        isAlumni: false
      })));
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
    
    // Check if all students are selected
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
    
    // Create promotion requests for each selected student
    const promotionPromises = studentsToPromote.map(student => {
      const promotionData = {
        schoolId: 1, // Replace with actual school ID
        previousClassId: selectedClass?.id,
        newClassId: selectedNewClass?.id,
        sectionId: selectedNewSection?.id,
        isPassed: true,
        promotionDate: new Date().toISOString().split('T')[0],
        remark: '',
        studentId: student.id
      };
      
      return createPromotion.mutateAsync(promotionData);
    });
    
    // Process all promotions
    Promise.all(promotionPromises)
      .then(() => {
        toast.success(`Successfully promoted ${studentsToPromote.length} students`);
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
        
        {/* Select ground section */}
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
                  const selectedClass = classes.find(c => c.id === classId);
                  setSelectedClass(selectedClass);
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
                  const selectedSection = sections.find(s => s.id === sectionId);
                  setSelectedSection(selectedSection);
                }}
              >
                <option value="">Select</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* <div className="px-6 pb-4 flex justify-end">
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                // Filter action would go here
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div> */}
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
                <li>Please double check and fill up all fields carefully, then click Promotion button.</li>
              </ol>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="carryForward" 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                    const selectedSession = sessions.find(s => s.id === sessionId);
                    setSelectedSession(selectedSession);
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
                    const selectedClass = classes.find(c => c.id === classId);
                    setSelectedNewClass(selectedClass);
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
                    const selectedSection = sections.find(s => s.id === sectionId);
                    setSelectedNewSection(selectedSection);
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
                      />
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Register No
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guardian Name
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mark Summary
                    </th>
                    {/* <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th> */}
                    {/* <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll
                    </th> */}
                    {/* <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Due Amount
                    </th> */}
                    {/* <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading students...
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
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.firstName + " " + student.lastName}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.registId}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.parentId}
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
                        {/* <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <input 
                              type="radio" 
                              id={`running-${student.id}`} 
                              name={`status-${student.id}`} 
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              checked={!student.promoted}
                              readOnly
                            />
                            <label htmlFor={`running-${student.id}`} className="ml-2 text-sm text-gray-700 mr-4">
                              Running
                            </label>
                            
                            <input 
                              type="radio" 
                              id={`promoted-${student.id}`} 
                              name={`status-${student.id}`} 
                              className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                              checked={student.promoted}
                              readOnly
                            />
                            <label htmlFor={`promoted-${student.id}`} className="ml-2 text-sm text-gray-700">
                              Promoted
                            </label>
                          </div>
                        </td> */}
                        {/* <td className="px-3 py-4 whitespace-nowrap">
                          <input 
                            type="text" 
                            className="w-16 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={student.roll || ''}
                            onChange={(e) => {
                              const newSelectedStudents = [...selectedStudents];
                              newSelectedStudents[index].roll = e.target.value;
                              setSelectedStudents(newSelectedStudents);
                            }}
                          />
                        </td> */}
                        {/* <td className="px-3 py-4 whitespace-nowrap">
                          <input 
                            type="text" 
                            className="w-24 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={student.dueAmount || '0'}
                            readOnly
                          />
                        </td> */}
                        {/* <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`alumni-${student.id}`} 
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={student.isAlumni}
                              onChange={() => handleAlumniChange(index)}
                            />
                            <label htmlFor={`alumni-${student.id}`} className="ml-2 text-sm text-gray-700">
                              Leave / Add Alumni
                            </label>
                          </div>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                        No students found. Please select a class and section.
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
              disabled={createPromotion.isLoading}
            >
              {createPromotion.isLoading ? 'Processing...' : 'Promotion'}
            </button>
          </div>
        </div>
      </div>
      
      {/* WhatsApp-like floating action button */}
      {/* <div className="fixed bottom-6 right-6">
        <button className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 text-white fill-current">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </button>
      </div> */}

    </div>
  );
}
