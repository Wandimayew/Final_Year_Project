"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaThumbsUp } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TimeTableList from "./TimeTableList";
import Breadcrumb from "@/components/constant/Breadcrumb";
import { TeacherSelectionTable } from "./TeacherSelectionTable";
import { SubjectSettings } from "./SubjectSettings";
import { SelectionTable } from "./SelectionTable";
import { StreamConfigurator } from "./StreamConfigurator";

// Mock teacher data (unchanged)
const mockTeachers = [
  /* Your mockTeachers data here, unchanged */
];

// Utility to normalize data for SelectionTable
const normalizeItems = (items) =>
  (items || []).map((item) => ({
    id: String(item.classId || item.sectionId || item.subjectId),
    name: item.className || item.sectionName || item.subjectName,
  }));

// Reusable Selection Table Component
// const SelectionTable = ({
//   title,
//   items,
//   selectedItems,
//   onToggle,
//   onSelectAll,
// }) => {
//   const allSelected =
//     items.length > 0 && items.every((item) => selectedItems.includes(item.id));
//   return (
//     <div className="mb-4">
//       <h4 className="font-semibold text-blue-700 mb-2">{title}</h4>
//       <table className="min-w-full border border-gray-300 rounded">
//         <thead>
//           <tr className="bg-blue-100">
//             <th className="p-2">
//               <input
//                 type="checkbox"
//                 checked={allSelected}
//                 onChange={(e) => onSelectAll(e.target.checked)}
//               />
//             </th>
//             <th className="p-2 text-left text-blue-700">Name</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((item) => (
//             <tr key={item.id} className="hover:bg-blue-50">
//               <td className="p-2 text-center">
//                 <input
//                   type="checkbox"
//                   checked={selectedItems.includes(item.id)}
//                   onChange={() => onToggle(item.id)}
//                 />
//               </td>
//               <td className="p-2">{item.name}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// // Teacher Selection Table Component
// const TeacherSelectionTable = ({
//   teachers,
//   selectedIds,
//   onToggle,
//   onSelectAll,
//   allSubjects,
//   onTeacherChange,
// }) => {
//   const allSelected =
//     teachers.length > 0 &&
//     teachers.every((t) => selectedIds.includes(t.teacherId));
//   const getSubjectNames = (subjectIds) =>
//     subjectIds
//       .map(
//         (id) =>
//           allSubjects.find((s) => s.subjectId === id)?.subjectName ||
//           `Unknown (${id})`
//       )
//       .join(", ");

//   return (
//     <div className="mb-6">
//       <h3 className="font-semibold mb-4 text-blue-700">
//         Teacher Configuration
//       </h3>
//       <table className="min-w-full border border-gray-300 rounded shadow-sm">
//         <thead>
//           <tr className="bg-blue-100">
//             <th className="p-3">
//               <input
//                 type="checkbox"
//                 checked={allSelected}
//                 onChange={(e) => onSelectAll(e.target.checked)}
//               />
//             </th>
//             <th className="p-3 text-left text-blue-700 font-semibold">
//               Teacher Name
//             </th>
//             <th className="p-3 text-left text-blue-700 font-semibold">
//               Subjects
//             </th>
//             <th className="p-3 text-left text-blue-700 font-semibold">
//               Max Classes/Day
//             </th>
//             <th className="p-3 text-left text-blue-700 font-semibold">
//               Max Classes/Week
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {teachers.map((teacher) => (
//             <tr key={teacher.teacherId} className="border-t hover:bg-blue-50">
//               <td className="p-3 text-center">
//                 <input
//                   type="checkbox"
//                   checked={selectedIds.includes(teacher.teacherId)}
//                   onChange={() => onToggle(teacher.teacherId)}
//                 />
//               </td>
//               <td className="p-3">{teacher.teacherName}</td>
//               <td className="p-3">{getSubjectNames(teacher.subjectIds)}</td>
//               <td className="p-3">
//                 <input
//                   type="number"
//                   min="1"
//                   value={teacher.maxClassesPerDay}
//                   onChange={(e) =>
//                     onTeacherChange(
//                       teacher.teacherId,
//                       "maxClassesPerDay",
//                       e.target.value
//                     )
//                   }
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
//                 />
//                 <p className="text-sm text-gray-500">
//                   Number: Max classes this teacher can handle per day
//                 </p>
//               </td>
//               <td className="p-3">
//                 <input
//                   type="number"
//                   min="1"
//                   value={teacher.maxClassesPerWeek}
//                   onChange={(e) =>
//                     onTeacherChange(
//                       teacher.teacherId,
//                       "maxClassesPerWeek",
//                       e.target.value
//                     )
//                   }
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
//                 />
//                 <p className="text-sm text-gray-500">
//                   Number: Max classes this teacher can handle per week
//                 </p>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// Subject Settings Component
// const SubjectSettings = ({ subjects, constraints, onChange }) => (
//   <div className="mb-6">
//     <h3 className="font-semibold mb-4 text-blue-700">Subject Settings</h3>
//     <div className="overflow-x-auto">
//       <table className="min-w-full border border-gray-300 rounded">
//         <thead>
//           <tr className="bg-blue-100">
//             <th className="p-2 text-left text-blue-700">Subject Name</th>
//             <th className="p-2 text-left text-blue-700">Duration (Minutes)</th>
//             <th className="p-2 text-left text-blue-700">Frequency per Week</th>
//           </tr>
//         </thead>
//         <tbody>
//           {subjects.map((subject) => (
//             <tr key={subject.subjectId} className="hover:bg-blue-50">
//               <td className="p-2">{subject.subjectName}</td>
//               <td className="p-2">
//                 <input
//                   type="number"
//                   min="1"
//                   value={
//                     constraints[subject.subjectId]?.subjectDurationInMinutes ||
//                     ""
//                   }
//                   onChange={(e) =>
//                     onChange(
//                       subject.subjectId,
//                       "subjectDurationInMinutes",
//                       e.target.value
//                     )
//                   }
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
//                 />
//                 <p className="text-sm text-gray-500">
//                   Number: Duration of each subject session
//                 </p>
//               </td>
//               <td className="p-2">
//                 <input
//                   type="number"
//                   min="1"
//                   value={
//                     constraints[subject.subjectId]?.subjectFrequencyPerWeek ||
//                     ""
//                   }
//                   onChange={(e) =>
//                     onChange(
//                       subject.subjectId,
//                       "subjectFrequencyPerWeek",
//                       e.target.value
//                     )
//                   }
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
//                 />
//                 <p className="text-sm text-gray-500">
//                   Number: Times per week this subject occurs
//                 </p>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// Stream Configurator Component
// const StreamConfigurator = ({
//   streams,
//   config,
//   classesByStream,
//   classDetails,
//   onChange,
//   onFetchClasses,
//   onFetchClassDetails,
// }) => {
//   const handleSelectStream = (e) => {
//     const streamId = e.target.value;
//     if (streamId && !config.selectedStreamIds.includes(streamId)) {
//       onChange({
//         selectedStreamIds: [...config.selectedStreamIds, streamId],
//         streamConfigs: {
//           ...config.streamConfigs,
//           [streamId]: { classes: [], classConfigs: {} },
//         },
//       });
//       onFetchClasses(streamId);
//     }
//   };

//   const toggleItem = (streamId, classId, type, itemId) => {
//     const streamConfig = config.streamConfigs[streamId] || {
//       classes: [],
//       classConfigs: {},
//     };
//     if (type === "classes") {
//       const newClasses = streamConfig.classes.includes(classId)
//         ? streamConfig.classes.filter((id) => id !== classId)
//         : [...streamConfig.classes, classId];
//       onChange({
//         streamConfigs: {
//           ...config.streamConfigs,
//           [streamId]: { ...streamConfig, classes: newClasses },
//         },
//       });
//       if (!streamConfig.classConfigs[classId])
//         onFetchClassDetails(streamId, classId);
//     } else {
//       const current = streamConfig.classConfigs[classId]?.[type] || [];
//       const newItems = itemId
//         ? current.includes(itemId)
//           ? current.filter((id) => id !== itemId)
//           : [...current, itemId]
//         : [];
//       onChange({
//         streamConfigs: {
//           ...config.streamConfigs,
//           [streamId]: {
//             ...streamConfig,
//             classConfigs: {
//               ...streamConfig.classConfigs,
//               [classId]: {
//                 ...streamConfig.classConfigs[classId],
//                 [type]: newItems,
//               },
//             },
//           },
//         },
//       });
//     }
//   };

//   const toggleSelectAll = (streamId, classId, type, checked) => {
//     const items =
//       type === "classes"
//         ? classesByStream[streamId]
//         : classDetails[classId]?.[type] || [];
//     const newItems = checked
//       ? normalizeItems(items).map((item) => item.id)
//       : [];
//     if (type === "classes") {
//       onChange({
//         streamConfigs: {
//           ...config.streamConfigs,
//           [streamId]: { ...streamConfig, classes: newItems },
//         },
//       });
//       newItems.forEach(
//         (classId) =>
//           !config.streamConfigs[streamId].classConfigs[classId] &&
//           onFetchClassDetails(streamId, classId)
//       );
//     } else {
//       onChange({
//         streamConfigs: {
//           ...config.streamConfigs,
//           [streamId]: {
//             ...streamConfig,
//             classConfigs: {
//               ...streamConfig.classConfigs,
//               [classId]: {
//                 ...streamConfig.classConfigs[classId],
//                 [type]: newItems,
//               },
//             },
//           },
//         },
//       });
//     }
//   };

//   return (
//     <div className="mb-6">
//       <h3 className="font-semibold mb-4 text-blue-700">Select Stream</h3>
//       <select
//         onChange={handleSelectStream}
//         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
//       >
//         <option value="">-- Select a Stream --</option>
//         {streams.map((stream) => (
//           <option key={stream.streamId} value={stream.streamId}>
//             {stream.streamName}
//           </option>
//         ))}
//       </select>
//       {config.selectedStreamIds.map((streamId) => {
//         const streamConfig = config.streamConfigs[streamId] || {
//           classes: [],
//           classConfigs: {},
//         };
//         return (
//           <div
//             key={streamId}
//             className="mt-4 border rounded-lg shadow-sm bg-gray-50 p-4"
//           >
//             <h4 className="font-semibold mb-2 text-blue-800">
//               Stream:{" "}
//               {streams.find((s) => s.streamId.toString() === streamId)
//                 ?.streamName || streamId}{" "}
//               <FaThumbsUp className="inline ml-2 text-blue-500" />
//             </h4>
//             <SelectionTable
//               title="Select Classes"
//               items={normalizeItems(classesByStream[streamId])}
//               selectedItems={streamConfig.classes}
//               onToggle={(id) => toggleItem(streamId, id, "classes")}
//               onSelectAll={(checked) =>
//                 toggleSelectAll(streamId, null, "classes", checked)
//               }
//             />
//             {streamConfig.classes.map((classId) => (
//               <div
//                 key={classId}
//                 className="ml-4 mt-2 border p-4 rounded-lg shadow-sm bg-gray-100"
//               >
//                 <h5 className="font-semibold mb-2 text-blue-700">
//                   Class:{" "}
//                   {classesByStream[streamId]?.find(
//                     (c) => c.classId.toString() === classId
//                   )?.className || classId}{" "}
//                   <FaThumbsUp className="inline ml-2 text-blue-500" />
//                 </h5>
//                 <SelectionTable
//                   title="Select Sections"
//                   items={normalizeItems(classDetails[classId]?.sections)}
//                   selectedItems={
//                     streamConfig.classConfigs[classId]?.sections || []
//                   }
//                   onToggle={(id) =>
//                     toggleItem(streamId, classId, "sections", id)
//                   }
//                   onSelectAll={(checked) =>
//                     toggleSelectAll(streamId, classId, "sections", checked)
//                   }
//                 />
//                 <SelectionTable
//                   title="Select Subjects"
//                   items={normalizeItems(classDetails[classId]?.subjects)}
//                   selectedItems={
//                     streamConfig.classConfigs[classId]?.subjects || []
//                   }
//                   onToggle={(id) =>
//                     toggleItem(streamId, classId, "subjects", id)
//                   }
//                   onSelectAll={(checked) =>
//                     toggleSelectAll(streamId, classId, "subjects", checked)
//                   }
//                 />
//               </div>
//             ))}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// Main Component
const TimetableConfigurator = () => {
  const gregorianYear = new Date().getFullYear(); // e.g., 2025 (as of April 11, 2025)
  const defaultGregorian = `${gregorianYear - 1}-${gregorianYear}`; // "2024-2025"
  const defaultEthiopian = (gregorianYear - 8).toString(); // "2017"

  const [config, setConfig] = useState({
    schoolName: "Wandi School",
    schoolId: "new",
    academicYear: defaultGregorian, // Start with Gregorian
    selectedStreamIds: [],
    streamConfigs: {},
    teachers: mockTeachers,
    selectedTeacherIds: mockTeachers.map((t) => t.teacherId),
    timetableConstraints: {
      maxSubjectsPerDay: "6",
      breakDurationInMinutes: "10",
      schoolStartTime: "08:00",
      schoolEndTime: "15:00",
    },
    subjectConstraints: {},
  });
  const [isEthiopian, setIsEthiopian] = useState(false); // Toggle state
  const [streams, setStreams] = useState([]);
  const [classesByStream, setClassesByStream] = useState({});
  const [classDetails, setClassDetails] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [timeTableData, setTimeTableData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8086/academic/api/new/getAllStreamBySchool")
      .then((res) => setStreams(res.data))
      .catch((err) => {
        console.error("Failed to fetch streams:", err);
        setError("Failed to load streams");
      });

    axios
      .get("http://localhost:8086/academic/api/new/getAllSubjectBySchool")
      .then((res) => {
        setAllSubjects(res.data);
        setConfig((prev) => ({
          ...prev,
          subjectConstraints: res.data.reduce(
            (acc, sub) => ({
              ...acc,
              [sub.subjectId]: {
                subjectId: sub.subjectId,
                subjectName: sub.subjectName,
                subjectDurationInMinutes: "40",
                subjectFrequencyPerWeek:
                  sub.subjectId === 2 || sub.subjectId === 3
                    ? "5"
                    : sub.subjectId === 52 || sub.subjectId === 53
                    ? "1"
                    : "3",
              },
            }),
            {}
          ),
        }));
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects");
      });
  }, []);

  const handleConfigChange = (updates) =>
    setConfig((prev) => ({ ...prev, ...updates }));

  const handleTeacherChange = (teacherId, field, value) => {
    setConfig((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) =>
        t.teacherId === teacherId ? { ...t, [field]: value } : t
      ),
    }));
  };

  const toggleCalendar = () => {
    const newIsEthiopian = !isEthiopian;
    setIsEthiopian(newIsEthiopian);
    if (newIsEthiopian) {
      // Convert Gregorian "2024-2025" to Ethiopian "2017"
      const [startYear] = config.academicYear.split("-").map(Number);
      const ethiopianYear = startYear - 8; // e.g., 2024 - 8 = 2016 (adjust for September start)
      handleConfigChange({ academicYear: ethiopianYear.toString() });
    } else {
      // Convert Ethiopian "2017" to Gregorian "2024-2025"
      const ethiopianYear = Number(config.academicYear);
      const gregorianStart = ethiopianYear + 8; // e.g., 2017 + 8 = 2025 (adjust for September)
      handleConfigChange({
        academicYear: `${gregorianStart - 1}-${gregorianStart}`,
      });
    }
  };

  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    if (isEthiopian) {
      // Ethiopian: Accept single year (e.g., "2017")
      if (/^\d{4}$/.test(value) || value === "") {
        handleConfigChange({ academicYear: value });
      }
    } else {
      // Gregorian: Accept "YYYY-YYYY" format (e.g., "2024-2025")
      if (
        /^\d{4}-\d{4}$/.test(value) ||
        value === "" ||
        /^\d{4}$/.test(value)
      ) {
        handleConfigChange({ academicYear: value });
      }
    }
  };

  const fetchClasses = (streamId) => {
    axios
      .get(
        `http://localhost:8086/academic/api/new/getAllClassByStream/${streamId}`
      )
      .then((res) =>
        setClassesByStream((prev) => ({ ...prev, [streamId]: res.data }))
      )
      .catch((err) =>
        console.error(`Error fetching classes for stream ${streamId}:`, err)
      );
  };

  const fetchClassDetails = (streamId, classId) => {
    Promise.all([
      axios.get(
        `http://localhost:8086/academic/api/new/getAllSectionByClass/${classId}`
      ),
      axios.get(
        `http://localhost:8086/academic/api/new/getAllSubjectByClass/${classId}`
      ),
    ])
      .then(([sectionsRes, subjectsRes]) =>
        setClassDetails((prev) => ({
          ...prev,
          [classId]: { sections: sectionsRes.data, subjects: subjectsRes.data },
        }))
      )
      .catch((err) =>
        console.error(`Error fetching details for class ${classId}:`, err)
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      schoolName: config.schoolName,
      schoolId: config.schoolId,
      academicYear: config.academicYear, // Send as-is (server can interpret)
      classConfigs: config.selectedStreamIds.flatMap((streamId) =>
        (config.streamConfigs[streamId]?.classes || [])
          .map((classId) => ({
            classId: Number(classId),
            className:
              classesByStream[streamId]?.find(
                (c) => c.classId.toString() === classId
              )?.className || `Class-${classId}`,
            sections: (
              config.streamConfigs[streamId]?.classConfigs[classId]?.sections ||
              []
            ).map((sectionId) => ({
              sectionId: Number(sectionId),
              sectionName:
                classDetails[classId]?.sections?.find(
                  (s) => s.sectionId.toString() === sectionId
                )?.sectionName || `Section-${sectionId}`,
              streamId: Number(streamId),
            })),
            subjectIds: (
              config.streamConfigs[streamId]?.classConfigs[classId]?.subjects ||
              []
            ).map(Number),
          }))
          .filter((c) => c.sections.length > 0 && c.subjectIds.length > 0)
      ),
      teacherConfigs: config.teachers
        .filter((t) => config.selectedTeacherIds.includes(t.teacherId))
        .map((t) => ({
          teacherName: t.teacherName,
          teacherId: t.teacherId,
          subjectIds: t.subjectIds.map(Number),
          classNames: t.classNames,
          maxClassesPerDay: Number(t.maxClassesPerDay),
          maxClassesPerWeek: Number(t.maxClassesPerWeek),
        })),
      subjectConfigs: Object.values(config.subjectConstraints).map((sub) => ({
        subjectName: sub.subjectName,
        subjectId: Number(sub.subjectId),
        subjectDurationInMinutes: Number(sub.subjectDurationInMinutes) || 0,
        subjectFrequencyPerWeek: Number(sub.subjectFrequencyPerWeek) || 0,
      })),
      streamConfigs: config.selectedStreamIds.map((streamId) => ({
        streamName:
          streams.find((s) => s.streamId.toString() === streamId)?.streamName ||
          `Stream-${streamId}`,
        classNames: (config.streamConfigs[streamId]?.classes || []).map(
          (classId) =>
            classesByStream[streamId]?.find(
              (c) => c.classId.toString() === classId
            )?.className || `Class-${classId}`
        ),
      })),
      timetableConstraints: {
        maxSubjectsPerDay:
          Number(config.timetableConstraints.maxSubjectsPerDay) || 0,
        breakDurationInMinutes:
          Number(config.timetableConstraints.breakDurationInMinutes) || 0,
        schoolStartTime: config.timetableConstraints.schoolStartTime,
        schoolEndTime: config.timetableConstraints.schoolEndTime,
      },
    };

    try {
      const response = await axios.post(
        "http://localhost:8086/academic/api/new/addNewTimeTable",
        requestData
      );
      setTimeTableData(response.data);
      saveJsonToFile(response.data);
    } catch (err) {
      console.error("Error submitting timetable:", err);
      setError("Failed to generate timetable");
    }
  };

  const saveJsonToFile = (data, filename = "timetable.json") => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (timeTableData) {
    return (
      <TimeTableList
        timetable={timeTableData}
        editable
        onConfirm={(data) => setTimeTableData(data)}
        onCancel={() => setTimeTableData(null)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto relative top-20 p-6">
      <Breadcrumb />
      <Card className="shadow-lg p-6 bg-white rounded-lg">
        <CardContent>
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-blue-800">
              {config.schoolName} Timetable
            </h2>
            <p className="text-gray-600 mt-2">
              Configure your school's timetable by selecting streams, classes,
              teachers, and subjects. Set the academic year and daily schedule,
              then submit to generate the timetable.
            </p>
          </div>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                Academic Year
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={config.academicYear}
                    onChange={handleAcademicYearChange}
                    placeholder={isEthiopian ? "e.g., 2017" : "e.g., 2024-2025"}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <Button
                    type="button"
                    onClick={toggleCalendar}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                  >
                    {isEthiopian ? "To Gregorian" : "To Ethiopian"}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {isEthiopian
                    ? "Text: Ethiopian year (e.g., 2017)"
                    : "Text: Gregorian academic year (e.g., 2024-2025)"}
                </p>
              </div>
            </div>
            <StreamConfigurator
              streams={streams}
              config={{
                selectedStreamIds: config.selectedStreamIds,
                streamConfigs: config.streamConfigs,
              }}
              classesByStream={classesByStream}
              classDetails={classDetails}
              onChange={handleConfigChange}
              onFetchClasses={fetchClasses}
              onFetchClassDetails={fetchClassDetails}
            />
            <TeacherSelectionTable
              teachers={config.teachers}
              selectedIds={config.selectedTeacherIds}
              onToggle={(id) =>
                handleConfigChange({
                  selectedTeacherIds: config.selectedTeacherIds.includes(id)
                    ? config.selectedTeacherIds.filter((t) => t !== id)
                    : [...config.selectedTeacherIds, id],
                })
              }
              onSelectAll={(checked) =>
                handleConfigChange({
                  selectedTeacherIds: checked
                    ? config.teachers.map((t) => t.teacherId)
                    : [],
                })
              }
              allSubjects={allSubjects}
              onTeacherChange={handleTeacherChange}
            />
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                Timetable Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    min="1"
                    value={config.timetableConstraints.maxSubjectsPerDay}
                    onChange={(e) =>
                      handleConfigChange({
                        timetableConstraints: {
                          ...config.timetableConstraints,
                          maxSubjectsPerDay: e.target.value,
                        },
                      })
                    }
                    placeholder="Max Subjects Per Day"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Number: Maximum subjects allowed in a day
                  </p>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={config.timetableConstraints.breakDurationInMinutes}
                    onChange={(e) =>
                      handleConfigChange({
                        timetableConstraints: {
                          ...config.timetableConstraints,
                          breakDurationInMinutes: e.target.value,
                        },
                      })
                    }
                    placeholder="Break Duration (Minutes)"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Number: Duration of breaks between classes
                  </p>
                </div>
                <div>
                  <input
                    type="time"
                    value={config.timetableConstraints.schoolStartTime}
                    onChange={(e) =>
                      handleConfigChange({
                        timetableConstraints: {
                          ...config.timetableConstraints,
                          schoolStartTime: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Time: When the school day begins
                  </p>
                </div>
                <div>
                  <input
                    type="time"
                    value={config.timetableConstraints.schoolEndTime}
                    onChange={(e) =>
                      handleConfigChange({
                        timetableConstraints: {
                          ...config.timetableConstraints,
                          schoolEndTime: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Time: When the school day ends
                  </p>
                </div>
              </div>
            </div>
            <SubjectSettings
              subjects={allSubjects}
              constraints={config.subjectConstraints}
              onChange={(id, field, value) =>
                handleConfigChange({
                  subjectConstraints: {
                    ...config.subjectConstraints,
                    [id]: { ...config.subjectConstraints[id], [field]: value },
                  },
                })
              }
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-4"
            >
              Generate Timetable
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableConfigurator;
