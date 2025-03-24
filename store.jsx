// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// const TimetableConfigurator = () => {
//   // All streams fetched from the server
//   const [streams, setStreams] = useState([]);
//   // Store the IDs of streams selected by the user
//   const [selectedStreamIds, setSelectedStreamIds] = useState([]);
//   // For each stream, store selected classes and for each class store selected sections and subjects
//   // Structure: { [streamId]: { classes: [classId, ...], classConfigs: { [classId]: { sections: [sectionId,...], subjects: [subjectId,...] } } } }
//   const [streamConfigs, setStreamConfigs] = useState({});

//   // Cache the classes for each stream: { [streamId]: classes[] }
//   const [classesByStream, setClassesByStream] = useState({});
//   // Cache the details for each class: { [classId]: { sections: [...], subjects: [...] } }
//   const [classDetails, setClassDetails] = useState({});

//   // Teacher configuration
//   const [teachers, setTeachers] = useState([]);
//   const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

//   // Fetch streams on mount
//   // useEffect(() => {
//   //   axios
//   //     .get("/api/streams")
//   //     .then((res) => setStreams(res.data))
//   //     .catch((err) => console.error("Error fetching streams:", err));
//   // }, []);

//   useEffect(() => {
//     axios
//       .get("http://localhost:8084/academic/api/new/getAllStreamBySchool")
//       .then((response) => {
//         console.log("stream {: ", response, ":}");
//         setStreams(response.data);
//       })
//       .catch((error) => {
//         console.error("Failed to fetch streams:", error);
//         // You can also set an error message state here if needed
//       });
//   }, []);

//   // When a stream is selected, add it if not already selected and fetch its classes
//   const handleSelectStream = (e) => {
//     const streamId = e.target.value;
//     if (!streamId) return;
//     if (!selectedStreamIds.includes(streamId)) {
//       setSelectedStreamIds((prev) => [...prev, streamId]);
//       setStreamConfigs((prev) => ({
//         ...prev,
//         [streamId]: { classes: [], classConfigs: {} },
//       }));
//       // Fetch classes for this stream
//       axios
//         .get(
//           `http://localhost:8084/academic/api/new/getAllClassByStream/${streamId}`
//         )
//         .then((res) =>
//           setClassesByStream((prev) => ({ ...prev, [streamId]: res.data }))
//         )
//         .catch((err) =>
//           console.error("Error fetching classes for stream:", streamId, err)
//         );
//     }
//   };

//   // Helper: if "all" is selected, return all option values (excluding "all")
//   const processMultiSelect = (selectedValues, allOptions) => {
//     if (selectedValues.includes("all") && allOptions) {
//       console.log("id for line 135 " + selectedValues, " and ", allOptions);
//       return allOptions.map((item) => item.classId.toString());
//     }
//     return selectedValues;
//   };

//   // Helper: if "all" is selected, return all option values dynamically based on the key provided
//   const processMultiSelects = (selectedValues, allOptions, key) => {
//     if (selectedValues.includes("all") && allOptions) {
//       console.log("Selected:", selectedValues, "All Options:", allOptions);
//       return allOptions.map((item) => item[key]?.toString());
//     }
//     return selectedValues;
//   };

//   // Handle class selection for a stream
//   const handleSelectClasses = (streamId, selectedOptions) => {
//     if (selectedOptions.includes("all")) {
//       // If "Select All" is selected, check if all are already selected
//       const allClasses = classesByStream[streamId].map((cls) => cls.classId);
//       if (allClasses.every((clsId) => selectedOptions.includes(clsId))) {
//         // If all are selected, unselect all
//         setStreamConfigs((prev) => ({
//           ...prev,
//           [streamId]: { ...prev[streamId], classes: [] },
//         }));
//       } else {
//         // Otherwise, select all
//         setStreamConfigs((prev) => ({
//           ...prev,
//           [streamId]: { ...prev[streamId], classes: allClasses },
//         }));
//       }
//     } else {
//       // Update selected classes
//       setStreamConfigs((prev) => ({
//         ...prev,
//         [streamId]: { ...prev[streamId], classes: selectedOptions },
//       }));
//     }
//   };
//     // For each selected class, fetch details if not already fetched
//     selectedClasses.forEach((classId) => {
//       if (!classDetails[classId]) {
//         axios
//           .get(
//             `http://localhost:8084/academic/api/new/getAllSectionByClass/${classId}`
//           )
//           .then((res) =>
//             setClassDetails((prev) => ({
//               ...prev,
//               [classId]: { ...(prev[classId] || {}), sections: res.data },
//             }))
//           )
//           .catch((err) =>
//             console.error("Error fetching sections for class:", classId, err)
//           );
//         axios
//           .get(
//             `http://localhost:8084/academic/api/new/getAllSubjectByClass/${classId}`
//           )
//           .then((res) =>
//             setClassDetails((prev) => ({
//               ...prev,
//               [classId]: { ...(prev[classId] || {}), subjects: res.data },
//             }))
//           )
//           .catch((err) =>
//             console.error("Error fetching subjects for class:", classId, err)
//           );
//       }
//     });
//   ;

//   // Handle section selection for a class in a stream
//   const handleSelectSections = (streamId, classId, selectedOptions) => {
//     if (selectedOptions.includes("all")) {
//       const allSections = classDetails[classId].sections.map((sec) => sec.sectionId);
//       if (allSections.every((secId) => selectedOptions.includes(secId))) {
//         setStreamConfigs((prev) => ({
//           ...prev,
//           [streamId]: {
//             ...prev[streamId],
//             classConfigs: {
//               ...prev[streamId].classConfigs,
//               [classId]: { ...prev[streamId].classConfigs[classId], sections: [] },
//             },
//           },
//         }));
//       } else {
//         setStreamConfigs((prev) => ({
//           ...prev,
//           [streamId]: {
//             ...prev[streamId],
//             classConfigs: {
//               ...prev[streamId].classConfigs,
//               [classId]: { ...prev[streamId].classConfigs[classId], sections: allSections },
//             },
//           },
//         }));
//       }
//     } else {
//       setStreamConfigs((prev) => ({
//         ...prev,
//         [streamId]: {
//           ...prev[streamId],
//           classConfigs: {
//             ...prev[streamId].classConfigs,
//             [classId]: { ...prev[streamId].classConfigs[classId], sections: selectedOptions },
//           },
//         },
//       }));
//     }
//   };
  
//   const handleSelectSubjects = (streamId, classId, selectedOptions) => {
//     if (selectedOptions.includes("all")) {
//       const allSubjects = classDetails[classId].subjects.map((sub) => sub.subjectId);
//       if (allSubjects.every((subId) => selectedOptions.includes(subId))) {
//         setStreamConfigs((prev) => ({
//           ...prev,
//           [streamId]: {
//             ...prev[streamId],
//             classConfigs: {
//               ...prev[streamId].classConfigs,
//               [classId]: { ...prev[streamId].classConfigs[classId], subjects: [] },
//             },
//           },
//         }));
//       } else {
//         setStreamConfigs((prev) => ({
//           ...prev,
//           [streamId]: {
//             ...prev[streamId],
//             classConfigs: {
//               ...prev[streamId].classConfigs,
//               [classId]: { ...prev[streamId].classConfigs[classId], subjects: allSubjects },
//             },
//           },
//         }));
//       }
//     } else {
//       setStreamConfigs((prev) => ({
//         ...prev,
//         [streamId]: {
//           ...prev[streamId],
//           classConfigs: {
//             ...prev[streamId].classConfigs,
//             [classId]: { ...prev[streamId].classConfigs[classId], subjects: selectedOptions },
//           },
//         },
//       }));
//     }
//   };
  
//   // Fetch teachers on mount
//   useEffect(() => {
//     axios
//       .get("http://localhost:8084/academic/api/new/getAllStreamBySchool")
//       .then((res) => setTeachers(res.data))
//       .catch((err) => console.error("Error fetching teachers:", err));
//   }, []);

//   // Handle teacher selection (multiple select)
//   const handleSelectTeachers = (e) => {
//     const options = e.target.options;
//     let selected = [];
//     for (let i = 0; i < options.length; i++) {
//       if (options[i].selected) {
//         selected.push(options[i].value);
//       }
//     }
//     setSelectedTeacherIds(selected);
//   };

//   // Submit the complete configuration
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("hi there");

//     const requestData = {
//       streams: selectedStreamIds.map((streamId) => ({
//         streamId,
//         config: streamConfigs[streamId],
//       })),
//       teachers: selectedTeacherIds,
//     };
//     console.log("Submitting configuration:", requestData);
//     // For example:
//     // axios.post('/api/timetable', requestData)
//     //   .then(res => console.log("Timetable configured", res.data))
//     //   .catch(err => console.error("Submission error", err));
//   };

//   return (
//     <div className="max-w-6xl mx-auto relative top-20 p-6">
//       <Card className="shadow-lg">
//         <CardContent>
//           <h2 className="text-2xl font-semibold mb-4">
//             Timetable Configuration
//           </h2>
//           <form onSubmit={handleSubmit}>
//             {/* Streams Section */}
//             <div className="mb-6">
//               <h3 className="font-semibold mb-2">Select Stream</h3>
//               <select
//                 onChange={handleSelectStream}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="">-- Select a Stream --</option>
//                 {streams.map((stream) => (
//                   <option key={stream.streamId} value={stream.streamId}>
//                     {stream.streamName}
//                   </option>
//                 ))}
//               </select>
//               {/* Display configuration for each selected stream */}
//               {selectedStreamIds.map((streamId) => (
//                 <div key={streamId} className="mt-4 border p-4 rounded">
//                   <h4 className="font-semibold mb-2">
//                     Stream:{" "}
//                     {streams.find((s) => s.streamId === streamId)?.streamName ||
//                       streamId}
//                   </h4>
//                   {/* Classes Selection */}
//                   <div className="mb-2">
//                     <label className="font-semibold block">
//                       Select Classes:
//                     </label>
//                     <select
//   multiple
//   className="w-full p-2 border rounded"
//   value={streamConfigs[streamId]?.classes || []}
//   onChange={(e) => {
//     let selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
//     handleSelectClasses(streamId, selectedOptions);
//   }}
// >
//   <option value="all">Select All</option>
//   {classesByStream[streamId]?.map((cls) => (
//     <option key={cls.classId} value={cls.classId}>
//       {cls.className}
//     </option>
//   ))}
// </select>

//                   </div>
//                   {/* For each selected class, allow section and subject selection */}
//                   {streamConfigs[streamId]?.classes.map((classId) => (
//                     <div key={classId} className="ml-4 mt-2 border p-2 rounded">
//                       <h5 className="font-semibold mb-1">
//                         Class:{" "}
//                         {classesByStream[streamId]?.find(
//                           (c) => c.classId === classId
//                         )?.className || classId}
//                       </h5>
//                       <div className="mb-2">
//                         <label className="font-semibold block">
//                           Select Sections:
//                         </label>
//                         <select
//   multiple
//   className="w-full p-2 border rounded"
//   value={streamConfigs[streamId]?.classConfigs[classId]?.sections || []}
//   onChange={(e) => {
//     let selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
//     handleSelectSections(streamId, classId, selectedOptions);
//   }}
// >
//   <option value="all">Select All</option>
//   {classDetails[classId]?.sections?.map((section) => (
//     <option key={section.sectionId} value={section.sectionId}>
//       {section.sectionName}
//     </option>
//   ))}
// </select>

//                       </div>
//                       <div>
//                         <label className="font-semibold block">
//                           Select Subjects:
//                         </label>
//                         <select
//   multiple
//   className="w-full p-2 border rounded"
//   value={streamConfigs[streamId]?.classConfigs[classId]?.subjects || []}
//   onChange={(e) => {
//     let selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
//     handleSelectSubjects(streamId, classId, selectedOptions);
//   }}
// >
//   <option value="all">Select All</option>
//   {classDetails[classId]?.subjects?.map((subject) => (
//     <option key={subject.subjectId} value={subject.subjectId}>
//       {subject.subjectName}
//     </option>
//   ))}
// </select>

//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//             {/* Teacher Configuration Section */}
//             <div className="mb-6">
//               <h3 className="font-semibold mb-2">Teacher Configuration</h3>
//               <select
//                 multiple
//                 onChange={handleSelectTeachers}
//                 className="w-full p-2 border rounded"
//               >
//                 {teachers.length > 0 ? (
//                   teachers.map((teacher) => (
//                     <option key={teacher.streamId} value={teacher.streamId}>
//                       {teacher.streamName}
//                     </option>
//                   ))
//                 ) : (
//                   <option>Loading teachers...</option>
//                 )}
//               </select>
//             </div>
//             <Button
//               type="submit"
//               className="w-full bg-blue-500 text-white py-2 rounded-lg"
//             >
//               Submit Timetable Configuration
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default TimetableConfigurator;


"use client";

import { FaThumbsUp } from "react-icons/fa"; // Import the thumbs-up icon
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TimetableConfigurator = () => {
  // All streams fetched from the server
  const [streams, setStreams] = useState([]);
  // Store the IDs of streams selected by the user
  const [selectedStreamIds, setSelectedStreamIds] = useState([]);
  // For each stream, store selected classes and for each class store selected sections and subjects
  const [streamConfigs, setStreamConfigs] = useState({});

  // Cache the classes for each stream: { [streamId]: classes[] }
  const [classesByStream, setClassesByStream] = useState({});
  // Cache the details for each class: { [classId]: { sections: [...], subjects: [...] } }
  const [classDetails, setClassDetails] = useState({});

  // Teacher configuration
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  // Fetch streams on mount
  useEffect(() => {
    axios
      .get("http://localhost:8084/academic/api/new/getAllStreamBySchool")
      .then((response) => {
        console.log("Streams fetched:", response.data);
        setStreams(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch streams:", error);
      });
  }, []);

  // When a stream is selected, add it if not already selected and fetch its classes
  const handleSelectStream = (e) => {
    const streamId = e.target.value;
    if (!streamId) return;
    if (!selectedStreamIds.includes(streamId)) {
      setSelectedStreamIds((prev) => [...prev, streamId]);
      setStreamConfigs((prev) => ({
        ...prev,
        [streamId]: { classes: [], classConfigs: {} },
      }));
      // Fetch classes for this stream
      axios
        .get(`http://localhost:8084/academic/api/new/getAllClassByStream/${streamId}`)
        .then((res) =>
          setClassesByStream((prev) => ({ ...prev, [streamId]: res.data }))
        )
        .catch((err) =>
          console.error("Error fetching classes for stream:", streamId, err)
        );
    }
  };

  // Handle class selection for a stream
  const handleSelectClasses = (streamId, selectedValues) => {
    const allClasses = classesByStream[streamId] || [];
    const selectedClasses = selectedValues.includes("all")
      ? allClasses.map((cls) => cls.classId.toString())
      : selectedValues;
    setStreamConfigs((prev) => ({
      ...prev,
      [streamId]: {
        ...prev[streamId],
        classes: selectedClasses,
      },
    }));
    // Fetch class details (sections and subjects) for each selected class
    selectedClasses.forEach((classId) => {
      if (!classDetails[classId]) {
        axios
          .get(`http://localhost:8084/academic/api/new/getAllSectionByClass/${classId}`)
          .then((res) =>
            setClassDetails((prev) => ({
              ...prev,
              [classId]: { ...(prev[classId] || {}), sections: res.data },
            }))
          )
          .catch((err) =>
            console.error("Error fetching sections for class:", classId, err)
          );
        axios
          .get(`http://localhost:8084/academic/api/new/getAllSubjectByClass/${classId}`)
          .then((res) =>
            setClassDetails((prev) => ({
              ...prev,
              [classId]: { ...(prev[classId] || {}), subjects: res.data },
            }))
          )
          .catch((err) =>
            console.error("Error fetching subjects for class:", classId, err)
          );
      }
    });
  };

  const handleSelectSections = (streamId, classId, selectedValues) => {
    const allSections =
      classDetails[classId] && classDetails[classId].sections
        ? classDetails[classId].sections
        : [];
    
    let selectedSections;
    if (selectedValues.includes("all")) {
      // Select all sections if "Select All" is chosen
      selectedSections = allSections.map((section) => section.sectionId.toString());
    } else {
      // Otherwise, use the selected sections
      selectedSections = selectedValues;
    }
  
    setStreamConfigs((prev) => ({
      ...prev,
      [streamId]: {
        ...prev[streamId],
        classConfigs: {
          ...prev[streamId].classConfigs,
          [classId]: {
            ...prev[streamId].classConfigs[classId],
            sections: selectedSections,
            subjects: prev[streamId].classConfigs[classId]?.subjects || [],
          },
        },
      },
    }));
  };
  
  const handleSelectSubjects = (streamId, classId, selectedValues) => {
    const allSubjects =
      classDetails[classId] && classDetails[classId].subjects
        ? classDetails[classId].subjects
        : [];
    
    let selectedSubjects;
    if (selectedValues.includes("all")) {
      // Select all subjects if "Select All" is chosen
      selectedSubjects = allSubjects.map((subject) => subject.subjectId.toString());
    } else {
      // Otherwise, use the selected subjects
      selectedSubjects = selectedValues;
    }
  
    setStreamConfigs((prev) => ({
      ...prev,
      [streamId]: {
        ...prev[streamId],
        classConfigs: {
          ...prev[streamId].classConfigs,
          [classId]: {
            ...prev[streamId].classConfigs[classId],
            subjects: selectedSubjects,
            sections: prev[streamId].classConfigs[classId]?.sections || [],
          },
        },
      },
    }));
  };
  

  // Fetch teachers on mount
  useEffect(() => {
    axios
      .get("http://localhost:8084/academic/api/new/getAllTeachers")
      .then((res) => setTeachers(res.data))
      .catch((err) => console.error("Error fetching teachers:", err));
  }, []);

  // Handle teacher selection (multiple select)
  const handleSelectTeachers = (e) => {
    const options = e.target.options;
    let selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedTeacherIds(selected);
  };

  // Submit the complete configuration
  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = {
      streams: selectedStreamIds.map((streamId) => ({
        streamId,
        config: streamConfigs[streamId],
      })),
      teachers: selectedTeacherIds,
    };
    console.log("Submitting configuration:", requestData);
    // Send to server or further handling
  };

  return (
    <div className="max-w-6xl mx-auto relative top-20 p-6">
      <Card className="shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">
            Timetable Configuration
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Streams Section */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Select Stream</h3>
              <select
                onChange={handleSelectStream}
                className="w-full p-2 py-4 border rounded"
              >
                <option value="">-- Select a Stream --</option>
                {streams.map((stream) => (
                  <option key={stream.streamId} value={stream.streamId}>
                    {stream.streamName}
                    {/* Display thumbs up if selected */}
                    {selectedStreamIds.includes(stream.streamId) && (
                      <span className="ml-2 text-green-500 inline-flex items-center justify-end w-full">
                        <FaThumbsUp />
                      </span>
                    )}
                  </option>
                ))}
              </select>
              {/* Display configuration for each selected stream */}
              {selectedStreamIds.map((streamId) => (
                <div key={streamId} className="mt-4 border p-4 rounded">
                  <h4 className="font-semibold mb-2">
                    Stream:{" "}
                    {streams.find((s) => s.streamId === streamId)?.streamName ||
                      streamId}
                    <span className="ml-2 text-green-500">
                      <FaThumbsUp />
                    </span>
                  </h4>
                  {/* Classes Selection */}
                  <div className="mb-2">
                    <label className="font-semibold block">Select Classes:</label>
                    <select
                      multiple
                      className="w-full flex justify-between p-2 border rounded"
                      value={streamConfigs[streamId]?.classes || []}
                      onChange={(e) => {
                        let selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleSelectClasses(streamId, selectedOptions);
                      }}
                    >
                      {classesByStream[streamId] ? (
                        <>
                          <option value="all">Select All</option>
                          {classesByStream[streamId].map((cls) => (
                            <option key={cls.classId} value={cls.classId}>
                              {cls.className}
                              {/* Display thumbs up if class is selected */}
                              {streamConfigs[streamId]?.classes.includes(
                                cls.classId.toString()
                              ) && (
                                <span className="ml-2 text-green-500">
                                  <FaThumbsUp />
                                </span>
                              )}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option>Loading classes...</option>
                      )}
                    </select>
                  </div>
                  {/* For each selected class, allow section and subject selection */}
                  {streamConfigs[streamId]?.classes.map((classId) => (
                    <div key={classId} className="ml-4 mt-2 border p-2 rounded">
                      <h5 className="font-semibold mb-1">
                        Class:{" "}
                        {classesByStream[streamId]?.find(
                          (c) => c.classId === classId
                        )?.className || classId}
                        <span className="ml-2 text-green-500">
                          <FaThumbsUp />
                        </span>
                      </h5>
                      <div className="mb-2">
                        <label className="font-semibold block">Select Sections:</label>
                        <select
                          multiple
                          className="w-full p-2 border rounded"
                          onChange={(e) => {
                            let selectedOptions = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            handleSelectSections(
                              streamId,
                              classId,
                              selectedOptions
                            );
                          }}
                        >
                          {classDetails[classId]?.sections ? (
                            <>
                              <option value="all">Select All</option>
                              {classDetails[classId].sections.map((section) => (
                                <option
                                  key={section.sectionId}
                                  value={section.sectionId}
                                >
                                  {section.sectionName}
                                </option>
                              ))}
                            </>
                          ) : (
                            <option>Loading sections...</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold block">Select Subjects:</label>
                        <select
                          multiple
                          className="w-full p-2 border rounded"
                          onChange={(e) => {
                            let selectedOptions = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            handleSelectSubjects(
                              streamId,
                              classId,
                              selectedOptions
                            );
                          }}
                        >
                          {classDetails[classId]?.subjects ? (
                            <>
                              <option value="all">Select All</option>
                              {classDetails[classId].subjects.map((subject) => (
                                <option
                                  key={subject.subjectId}
                                  value={subject.subjectId}
                                >
                                  {subject.subjectName}
                                </option>
                              ))}
                            </>
                          ) : (
                            <option>Loading subjects...</option>
                          )}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Teacher Configuration Section */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Teacher Configuration</h3>
              <select
                multiple
                onChange={handleSelectTeachers}
                className="w-full p-2 border rounded"
              >
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <option key={teacher.streamId} value={teacher.streamId}>
                      {teacher.streamName}
                    </option>
                  ))
                ) : (
                  <option>Loading teachers...</option>
                )}
              </select>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg"
            >
              Submit Timetable Configuration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableConfigurator;
