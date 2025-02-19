"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const AssignSubjects = ({ setSubjectListClicked, setAssign }) => {
  const [streams, setStreams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all streams
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8084/academic/api/new/getAllStreamBySchool`
        );
        console.log("assigning the the selected stream {: ", response);

        setStreams(response.data);
      } catch (error) {
        console.error("Failed to fetch streams:", error);
        setErrorMessage("Failed to load streams. Please try again.");
      }
    };

    fetchStreams();
  }, []);
  // Fetch all streams
  useEffect(() => {
    console.log("streamsssssssss", streams);
  }, [streams]);

  // Fetch classes based on the selected stream
  useEffect(() => {
    if (selectedStream) {
      const fetchClasses = async () => {
        console.log("stream selected  ;", selectedStream);

        try {
          const response = await axios.get(
            `http://localhost:8084/academic/api/new/getAllClassByStream/${selectedStream}`
          );
          console.log("stream response {", response, "}.");

          setClasses(response.data);
        } catch (error) {
          console.error("Failed to fetch classes:", error);
          setErrorMessage("Failed to load classes. Please try again.");
        }
      };

      fetchClasses();
    } else {
      setClasses([]);
    }
  }, [selectedStream]);

  // Fetch all available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8084/academic/api/new/getAllSubjectBySchool`
        );
        console.log("subject data: {", response.data, "}.");
        setSubjects(response.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setErrorMessage("Failed to load subjects. Please try again.");
      }
    };

    fetchSubjects();
  }, []);

  // Handle subject selection
  const handleSubjectSelection = (e, subjectId) => {
    
    setSelectedSubjects((prevSelected) => {
      if (prevSelected.includes(subjectId)) {
        // If the subject is already selected, remove it
        return prevSelected.filter((id) => id !== subjectId);
      } else {
        // Otherwise, add it to the selection
        return [...prevSelected, subjectId];
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("selected subjects : ", selectedSubjects);

      const response = await axios.post(
        `http://localhost:8084/academic/api/new/assign-subjects/${selectedClass}`,
        selectedSubjects
      );

      if (response.status === 200) {
        setSuccessMessage("Subjects assigned successfully!");
        setErrorMessage("");
        setSelectedSubjects([]);
      }
    } catch (error) {
      console.error("Error assigning subjects:", error);
      setErrorMessage("Failed to assign subjects. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Assign Subjects to Class</h2>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        {/* Stream Selection */}
        <div className="mb-4">
          <label
            htmlFor="stream"
            className="block text-gray-700 font-medium mb-2"
          >
            Select Stream
          </label>
          <select
            id="stream"
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="">-- Select a Stream --</option>
            {streams.length > 0 ? (
              streams.map((stream) => (
                <option key={stream.streamId} value={stream.streamId}>
                  {stream.streamName}
                </option>
              ))
            ) : (
              <option disabled>No streams available</option>
            )}
          </select>
        </div>

        {/* Class Selection */}
        {classes.length > 0 && (
          <div className="mb-4">
            <label
              htmlFor="class"
              className="block text-gray-700 font-medium mb-2"
            >
              Select Class
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            >
              <option value="">-- Select a Class --</option>
              {classes.map((classItem) => (
                <option key={classItem.classId} value={classItem.classId}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subject Selection */}
        <div className="mb-4">
          <h3 className="text-gray-700 font-medium mb-2">Available Subjects</h3>
          <div className="grid grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <div key={subject.subjectId} className="flex items-center">
                <input
                  type="checkbox"
                  id={`subject-${subject.subjectId}`}
                  value={subject.subjectId}
                  checked={selectedSubjects.includes(subject.subjectId)}
                  onChange={(e) => handleSubjectSelection(e, subject.subjectId)}
                  className="mr-2"
                />
                <label
                  htmlFor={`subject-${subject.subjectId}`}
                  className="text-gray-700"
                >
                  {subject.subjectName}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Assign Subjects
        </button>
      </form>
    </div>
  );
};

export default AssignSubjects;
