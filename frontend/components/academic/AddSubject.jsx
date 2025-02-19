"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const AddSubject = ({ setSubjectListClicked, setAssign }) => {
  const [formData, setFormData] = useState({
    subjectName: "",
    creditHours: 0,
    subjectCode: "",
  });

//   const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [schoolId, setSchoolId] = useState("");

  // Fetch class options
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:8084/academic/api/new/getAllClassesBySchool`
//         );
//         console.log("Class data: {", response.data, "}.");
//         setClasses(response.data);
//       } catch (error) {
//         console.error("Failed to fetch classes:", error);
//       }
//     };

//     fetchClasses();
//   }, [schoolId]);

  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setSchoolId(parsedData.user.schoolId);
        console.log("parsed :", parsedData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8084/academic/api/new/addNewSubject`,
        formData
      );
      console.log("Response data: {", response, "}.");

      if (response.status === 200) {
        setSuccessMessage("Subject added successfully!");
        setFormData({
          subjectName: "",
          creditHours: 0,
          subjectCode: "",
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setSubjectListClicked(true);
        setAssign(false);
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      setError("Failed to add subject. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md relative top-20">
      <h2 className="text-2xl font-bold mb-4">Add Subject</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="subjectName"
          >
            Subject Name
          </label>
          <input
            type="text"
            id="subjectName"
            name="subjectName"
            value={formData.subjectName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="creditHours"
          >
            Credit Hours
          </label>
          <input
            type="number"
            id="creditHours"
            name="creditHours"
            value={formData.creditHours}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="subjectCode"
          >
            Subject Code
          </label>
          <input
            type="text"
            id="subjectCode"
            name="subjectCode"
            value={formData.subjectCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>
        {/* <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="classId"
          >
            Class
          </label>
          <select
            id="classId"
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="">Select a Class</option>
            {classes.map((cls) => (
              <option key={cls.classId} value={cls.classId}>
                {cls.className}
              </option>
            ))}
          </select>
        </div> */}
        <div className="flex w-full justify-between ">
          <button
            type="button"
            onClick={() => setSubjectList(true)}
            className=" bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className=" bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Add Subject
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubject;
