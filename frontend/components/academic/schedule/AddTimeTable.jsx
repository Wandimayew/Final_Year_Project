"use client";

import { FaThumbsUp } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TimeTableList from "./TimeTableList";
import Breadcrumb from "@/components/constant/Breadcrumb";

// Updated mock teacher data with sufficient capacities
const mockTeachers = [
  {
    teacherName: "John Doe",
    teacherId: "T1",
    subjectIds: [1],
    classNames: ["nine", "ten"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "David Wilson",
    teacherId: "T2",
    subjectIds: [1],
    classNames: ["12", "10"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Nina Patel",
    teacherId: "T23",
    subjectIds: [1],
    classNames: ["nine", "wandi"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Michael Brown",
    teacherId: "T3",
    subjectIds: [2],
    classNames: ["nine", "wandi"],
    maxClassesPerWeek: 30,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Sarah Davis",
    teacherId: "T4",
    subjectIds: [2],
    classNames: ["12", "nine"],
    maxClassesPerWeek: 30,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Liam Rodriguez",
    teacherId: "T5",
    subjectIds: [2],
    classNames: ["ten", "10"],
    maxClassesPerWeek: 30,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Anna Taylor",
    teacherId: "T6",
    subjectIds: [2],
    classNames: ["nine", "12"],
    maxClassesPerWeek: 30,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Mark Lee",
    teacherId: "T7",
    subjectIds: [2],
    classNames: ["ten", "wandi"],
    maxClassesPerWeek: 30,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Jane Smith",
    teacherId: "T8",
    subjectIds: [3],
    classNames: ["nine", "ten"],
    maxClassesPerWeek: 40,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Emily Johnson",
    teacherId: "T9",
    subjectIds: [3],
    classNames: ["ten", "wandi"],
    maxClassesPerWeek: 40,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Olivia Taylor",
    teacherId: "T10",
    subjectIds: [3],
    classNames: ["wandi", "12"],
    maxClassesPerWeek: 40,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "James Martinez",
    teacherId: "T11",
    subjectIds: [3],
    classNames: ["ten", "12"],
    maxClassesPerWeek: 40,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Lisa White",
    teacherId: "T12",
    subjectIds: [3],
    classNames: ["nine", "10"],
    maxClassesPerWeek: 40,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Sam Carter",
    teacherId: "T24",
    subjectIds: [3],
    classNames: ["12", "10"],
    maxClassesPerWeek: 40,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Robert Green",
    teacherId: "T13",
    subjectIds: [4],
    classNames: ["nine", "ten"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Susan Black",
    teacherId: "T14",
    subjectIds: [4],
    classNames: ["wandi", "12"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Tom Harris",
    teacherId: "T15",
    subjectIds: [4],
    classNames: ["10", "nine"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Zoe King",
    teacherId: "T25",
    subjectIds: [4],
    classNames: ["ten", "nine"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Sophia Garcia",
    teacherId: "T16",
    subjectIds: [52],
    classNames: ["ten", "nine"],
    maxClassesPerWeek: 10,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Peter Clark",
    teacherId: "T17",
    subjectIds: [52],
    classNames: ["12", "10"],
    maxClassesPerWeek: 10,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Emma Turner",
    teacherId: "T18",
    subjectIds: [53],
    classNames: ["wandi", "12"],
    maxClassesPerWeek: 10,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Laura Evans",
    teacherId: "T19",
    subjectIds: [53],
    classNames: ["ten", "nine"],
    maxClassesPerWeek: 10,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Chris Adams",
    teacherId: "T20",
    subjectIds: [102],
    classNames: ["10", "nine"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Kelly Moore",
    teacherId: "T21",
    subjectIds: [102],
    classNames: ["nine", "ten"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
  {
    teacherName: "Brian Scott",
    teacherId: "T22",
    subjectIds: [102],
    classNames: ["12", "wandi"],
    maxClassesPerWeek: 20,
    maxClassesPerDay: 6,
  },
];

const SelectionTable = ({
  title,
  items,
  selectedItems,
  onToggle,
  onSelectAll,
}) => {
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  return (
    <div className="mb-4">
      <h4 className="font-semibold text-blue-700 mb-2">{title}</h4>
      <table className="min-w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-blue-100">
            <th className="p-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="p-2 text-left text-blue-700">Name</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-blue-50">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => onToggle(item.id)}
                />
              </td>
              <td className="p-2">{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TeacherSelectionTable = ({
  title,
  teachers,
  selectedTeacherIds,
  onToggleTeacher,
  onSelectAllTeachers,
  allSubjects,
}) => {
  const allSelected =
    teachers.length > 0 && selectedTeacherIds.length === teachers.length;
  const getSubjectNames = (subjectIds) => {
    return subjectIds
      .map((id) => {
        const subject = allSubjects.find((sub) => sub.subjectId === id);
        return subject ? subject.subjectName : `Unknown (${id})`;
      })
      .join(", ");
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-4 text-blue-700">{title}</h3>
      <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAllTeachers(e.target.checked)}
                  className="cursor-pointer"
                />
              </th>
              <th className="p-3 text-left text-blue-700 font-semibold">
                Teacher Name
              </th>
              <th className="p-3 text-left text-blue-700 font-semibold">
                Subjects
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr
                key={teacher.teacherId}
                className="border-t hover:bg-blue-50 transition-colors"
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTeacherIds.includes(teacher.teacherId)}
                    onChange={() => onToggleTeacher(teacher.teacherId)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-3">{teacher.teacherName}</td>
                <td className="p-3">{getSubjectNames(teacher.subjectIds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const normalizeClasses = (classes = []) =>
  classes.map((cls) => ({ id: cls.classId.toString(), name: cls.className }));
const normalizeSections = (sections = []) =>
  sections.map((section) => ({
    id: section.sectionId.toString(),
    name: section.sectionName,
  }));
const normalizeSubjects = (subjects = []) =>
  subjects.map((subject) => ({
    id: subject.subjectId.toString(),
    name: subject.subjectName,
  }));

const TimetableConfigurator = () => {
  const [schoolName, setSchoolName] = useState("wandi");
  const [schoolId, setSchoolId] = useState("new");
  const [academicYear, setAcademicYear] = useState("2017");
  const [streams, setStreams] = useState([]);
  const [selectedStreamIds, setSelectedStreamIds] = useState([]);
  const [streamConfigs, setStreamConfigs] = useState({});
  const [classesByStream, setClassesByStream] = useState({});
  const [classDetails, setClassDetails] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [maxSubjectsPerDay, setMaxSubjectsPerDay] = useState("6");
  const [breakDurationInMinutes, setBreakDurationInMinutes] = useState("10");
  const [schoolStartTime, setSchoolStartTime] = useState("02:00");
  const [schoolEndTime, setSchoolEndTime] = useState("07:00");
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectConstraints, setSubjectConstraints] = useState({});
  const [timeTableData, setTimeTableData] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8084/academic/api/new/getAllStreamBySchool")
      .then((response) => setStreams(response.data))
      .catch((error) => console.error("Failed to fetch streams:", error));
  }, []);

  useEffect(() => {
    setTeachers(mockTeachers);
    setSelectedTeacherIds(mockTeachers.map((t) => t.teacherId));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8084/academic/api/new/getAllSubjectBySchool")
      .then((res) => {
        setAllSubjects(res.data);
        const initialConstraints = {};
        res.data.forEach((subject) => {
          initialConstraints[subject.subjectId] = {
            subjectName: subject.subjectName,
            subjectId: subject.subjectId,
            subjectDurationInMinutes: "40",
            subjectFrequencyPerWeek:
              subject.subjectId === 2 || subject.subjectId === 3
                ? "5"
                : subject.subjectId === 52 || subject.subjectId === 53
                ? "1"
                : "3",
          };
        });
        setSubjectConstraints(initialConstraints);
      })
      .catch((err) => console.error("Error fetching all subjects:", err));
  }, []);

  const handleSelectStream = (e) => {
    const streamId = e.target.value;
    if (!streamId) return;
    if (!selectedStreamIds.includes(streamId)) {
      setSelectedStreamIds((prev) => [...prev, streamId]);
      setStreamConfigs((prev) => ({
        ...prev,
        [streamId]: { classes: [], classConfigs: {} },
      }));
      axios
        .get(
          `http://localhost:8084/academic/api/new/getAllClassByStream/${streamId}`
        )
        .then((res) =>
          setClassesByStream((prev) => ({ ...prev, [streamId]: res.data }))
        )
        .catch((err) =>
          console.error("Error fetching classes for stream:", err)
        );
    }
  };

  const toggleClassSelection = (streamId, classId) => {
    setStreamConfigs((prev) => {
      const current = prev[streamId]?.classes || [];
      const newSelected = current.includes(classId)
        ? current.filter((id) => id !== classId)
        : [...current, classId];
      return {
        ...prev,
        [streamId]: { ...prev[streamId], classes: newSelected },
      };
    });
    if (!classDetails[classId]) {
      axios
        .get(
          `http://localhost:8084/academic/api/new/getAllSectionByClass/${classId}`
        )
        .then((res) =>
          setClassDetails((prev) => ({
            ...prev,
            [classId]: { ...(prev[classId] || {}), sections: res.data },
          }))
        )
        .catch((err) =>
          console.error("Error fetching sections for class:", err)
        );
      axios
        .get(
          `http://localhost:8084/academic/api/new/getAllSubjectByClass/${classId}`
        )
        .then((res) =>
          setClassDetails((prev) => ({
            ...prev,
            [classId]: { ...(prev[classId] || {}), subjects: res.data },
          }))
        )
        .catch((err) =>
          console.error("Error fetching subjects for class:", err)
        );
    }
  };

  const toggleSelectAllClasses = (streamId, checked) => {
    const classes = classesByStream[streamId] || [];
    const selected = checked
      ? classes.map((cls) => cls.classId.toString())
      : [];
    setStreamConfigs((prev) => ({
      ...prev,
      [streamId]: { ...prev[streamId], classes: selected },
    }));
    if (checked) {
      selected.forEach((classId) => {
        if (!classDetails[classId]) {
          axios
            .get(
              `http://localhost:8084/academic/api/new/getAllSectionByClass/${classId}`
            )
            .then((res) =>
              setClassDetails((prev) => ({
                ...prev,
                [classId]: { ...(prev[classId] || {}), sections: res.data },
              }))
            )
            .catch((err) =>
              console.error("Error fetching sections for class:", err)
            );
          axios
            .get(
              `http://localhost:8084/academic/api/new/getAllSubjectByClass/${classId}`
            )
            .then((res) =>
              setClassDetails((prev) => ({
                ...prev,
                [classId]: { ...(prev[classId] || {}), subjects: res.data },
              }))
            )
            .catch((err) =>
              console.error("Error fetching subjects for class:", err)
            );
        }
      });
    }
  };

  const toggleSectionSelection = (streamId, classId, sectionId) => {
    setStreamConfigs((prev) => {
      const current = prev[streamId]?.classConfigs[classId]?.sections || [];
      const newSelected = current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId];
      return {
        ...prev,
        [streamId]: {
          ...prev[streamId],
          classConfigs: {
            ...prev[streamId].classConfigs,
            [classId]: {
              ...prev[streamId].classConfigs[classId],
              sections: newSelected,
            },
          },
        },
      };
    });
  };

  const toggleSelectAllSections = (streamId, classId, checked) => {
    const sections = classDetails[classId]?.sections || [];
    const selected = checked ? sections.map((s) => s.sectionId.toString()) : [];
    setStreamConfigs((prev) => ({
      ...prev,
      [streamId]: {
        ...prev[streamId],
        classConfigs: {
          ...prev[streamId].classConfigs,
          [classId]: {
            ...prev[streamId].classConfigs[classId],
            sections: selected,
          },
        },
      },
    }));
  };

  const toggleSubjectSelection = (streamId, classId, subjectId) => {
    setStreamConfigs((prev) => {
      const current = prev[streamId]?.classConfigs[classId]?.subjects || [];
      const newSelected = current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId];
      return {
        ...prev,
        [streamId]: {
          ...prev[streamId],
          classConfigs: {
            ...prev[streamId].classConfigs,
            [classId]: {
              ...prev[streamId].classConfigs[classId],
              subjects: newSelected,
            },
          },
        },
      };
    });
  };

  const toggleSelectAllSubjects = (streamId, classId, checked) => {
    const subjects = classDetails[classId]?.subjects || [];
    const selected = checked ? subjects.map((s) => s.subjectId.toString()) : [];
    setStreamConfigs((prev) => ({
      ...prev,
      [streamId]: {
        ...prev[streamId],
        classConfigs: {
          ...prev[streamId].classConfigs,
          [classId]: {
            ...prev[streamId].classConfigs[classId],
            subjects: selected,
          },
        },
      },
    }));
  };

  const handleToggleTeacher = (teacherId) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAllTeachers = (checked) => {
    setSelectedTeacherIds(checked ? teachers.map((t) => t.teacherId) : []);
  };

  const handleSubjectConstraintChange = (subjectId, field, value) => {
    setSubjectConstraints((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], [field]: value },
    }));
  };

  const saveJsonToFile = (jsonData, filename = "timetable.json") => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const classConfigs = [];
    selectedStreamIds.forEach((streamId) => {
      const streamClassIds = streamConfigs[streamId]?.classes || [];
      streamClassIds.forEach((classId) => {
        const classData = classesByStream[streamId]?.find(
          (cls) => cls.classId.toString() === classId
        );
        const sections = (
          streamConfigs[streamId]?.classConfigs[classId]?.sections || []
        ).map((sectionId) => {
          const sectionData = classDetails[classId]?.sections.find(
            (s) => s.sectionId.toString() === sectionId
          );
          return {
            sectionId: Number(sectionId),
            sectionName: sectionData
              ? sectionData.sectionName
              : `Section-${sectionId}`,
            streamId: Number(streamId),
          };
        });
        const subjectIds = (
          streamConfigs[streamId]?.classConfigs[classId]?.subjects || []
        ).map((id) => Number(id));
        if (sections.length > 0 && subjectIds.length > 0) {
          classConfigs.push({
            classId: Number(classId),
            className: classData ? classData.className : `Class-${classId}`,
            sections,
            subjectIds,
          });
        }
      });
    });

    const streamConfigsList = selectedStreamIds.map((streamId) => {
      const streamData = streams.find(
        (s) => s.streamId.toString() === streamId
      );
      const classIds = streamConfigs[streamId]?.classes || [];
      const classNames = classIds.map((classId) => {
        const classData = classesByStream[streamId]?.find(
          (cls) => cls.classId.toString() === classId
        );
        return classData ? classData.className : `Class-${classId}`;
      });
      return {
        streamName: streamData ? streamData.streamName : `Stream-${streamId}`,
        classNames,
      };
    });

    const subjectConfigs = Object.values(subjectConstraints).map((sub) => ({
      subjectName: sub.subjectName,
      subjectId: Number(sub.subjectId),
      subjectDurationInMinutes: Number(sub.subjectDurationInMinutes) || 0,
      subjectFrequencyPerWeek: Number(sub.subjectFrequencyPerWeek) || 0,
    }));

    const timetableConstraints = {
      maxSubjectsPerDay: Number(maxSubjectsPerDay) || 0,
      breakDurationInMinutes: Number(breakDurationInMinutes) || 0,
      schoolStartTime,
      schoolEndTime,
    };

    const teacherConfigs = teachers
      .filter((teacher) => selectedTeacherIds.includes(teacher.teacherId))
      .map((teacher) => ({
        teacherName: teacher.teacherName,
        teacherId: teacher.teacherId,
        subjectIds: teacher.subjectIds.map((id) => Number(id)),
        classNames: teacher.classNames,
        maxClassesPerWeek: teacher.maxClassesPerWeek,
        maxClassesPerDay: teacher.maxClassesPerDay,
      }));

    const requestData = {
      schoolName,
      schoolId,
      academicYear,
      classConfigs,
      teacherConfigs,
      subjectConfigs,
      streamConfigs: streamConfigsList,
      timetableConstraints,
    };

    console.log("Submitting configuration:", requestData);

    try {
      const response = await axios.post(
        "http://localhost:8084/academic/api/new/addNewTimeTable",
        requestData
      );
      console.log("Generated response is:", response.data);
      saveJsonToFile(response.data);
      setTimeTableData(response.data);
    } catch (error) {
      console.error("Error submitting timetable:", error);
    }
  };

  const handleConfirm = (updatedTimetable) => {
    console.log("Confirmed timetable:", updatedTimetable);
  };

  const handleCancel = () => {
    console.log("Edit cancelled");
  };

  if (timeTableData) {
    return (
      <TimeTableList
        timetable={timeTableData}
        editable={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto relative top-20 p-6">
      <Breadcrumb />
      <Card className="shadow-lg p-6 bg-white rounded-lg">
        <CardContent>
          <h2 className="text-3xl font-semibold mb-6 text-center text-blue-800">
            Timetable Configuration
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                School Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    School ID
                  </label>
                  <input
                    type="text"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    placeholder="e.g., SCH001"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                Select Stream
              </h3>
              <select
                onChange={handleSelectStream}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="">-- Select a Stream --</option>
                {streams.map((stream) => (
                  <option key={stream.streamId} value={stream.streamId}>
                    {stream.streamName}
                  </option>
                ))}
              </select>
              {selectedStreamIds.map((streamId) => (
                <div
                  key={streamId}
                  className="mt-4 border rounded-lg shadow-sm bg-gray-50 p-4"
                >
                  <h4 className="font-semibold mb-2 text-blue-800">
                    Stream:{" "}
                    {streams.find((s) => s.streamId.toString() === streamId)
                      ?.streamName || streamId}
                    <span className="ml-2 text-blue-500">
                      <FaThumbsUp />
                    </span>
                  </h4>
                  <SelectionTable
                    title="Select Classes"
                    items={normalizeClasses(classesByStream[streamId])}
                    selectedItems={streamConfigs[streamId]?.classes || []}
                    onToggle={(id) => toggleClassSelection(streamId, id)}
                    onSelectAll={(checked) =>
                      toggleSelectAllClasses(streamId, checked)
                    }
                  />
                  {(streamConfigs[streamId]?.classes || []).map((classId) => (
                    <div
                      key={classId}
                      className="ml-4 mt-2 border p-4 rounded-lg shadow-sm bg-gray-100"
                    >
                      <h5 className="font-semibold mb-2 text-blue-700">
                        Class:{" "}
                        {classesByStream[streamId]?.find(
                          (c) => c.classId.toString() === classId
                        )?.className || classId}
                        <span className="ml-2 text-blue-500">
                          <FaThumbsUp />
                        </span>
                      </h5>
                      <SelectionTable
                        title="Select Sections"
                        items={normalizeSections(
                          classDetails[classId]?.sections
                        )}
                        selectedItems={
                          streamConfigs[streamId]?.classConfigs[classId]
                            ?.sections || []
                        }
                        onToggle={(id) =>
                          toggleSectionSelection(streamId, classId, id)
                        }
                        onSelectAll={(checked) =>
                          toggleSelectAllSections(streamId, classId, checked)
                        }
                      />
                      <SelectionTable
                        title="Select Subjects"
                        items={normalizeSubjects(
                          classDetails[classId]?.subjects
                        )}
                        selectedItems={
                          streamConfigs[streamId]?.classConfigs[classId]
                            ?.subjects || []
                        }
                        onToggle={(id) =>
                          toggleSubjectSelection(streamId, classId, id)
                        }
                        onSelectAll={(checked) =>
                          toggleSelectAllSubjects(streamId, classId, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <TeacherSelectionTable
              title="Teacher Configuration"
              teachers={teachers}
              selectedTeacherIds={selectedTeacherIds}
              onToggleTeacher={handleToggleTeacher}
              onSelectAllTeachers={handleSelectAllTeachers}
              allSubjects={allSubjects}
            />
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                Timetable Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    Max Subjects Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxSubjectsPerDay}
                    onChange={(e) => setMaxSubjectsPerDay(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    Break Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={breakDurationInMinutes}
                    onChange={(e) => setBreakDurationInMinutes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    School Start Time
                  </label>
                  <input
                    type="time"
                    value={schoolStartTime}
                    onChange={(e) => setSchoolStartTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    School End Time
                  </label>
                  <input
                    type="time"
                    value={schoolEndTime}
                    onChange={(e) => setSchoolEndTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                Subject Settings
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 text-left text-blue-700">
                        Subject Name
                      </th>
                      <th className="p-2 text-left text-blue-700">
                        Duration (Minutes)
                      </th>
                      <th className="p-2 text-left text-blue-700">
                        Frequency per Week
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSubjects.map((subject) => (
                      <tr key={subject.subjectId} className="hover:bg-blue-50">
                        <td className="p-2">{subject.subjectName}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={
                              subjectConstraints[subject.subjectId]
                                ?.subjectDurationInMinutes || ""
                            }
                            onChange={(e) =>
                              handleSubjectConstraintChange(
                                subject.subjectId,
                                "subjectDurationInMinutes",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={
                              subjectConstraints[subject.subjectId]
                                ?.subjectFrequencyPerWeek || ""
                            }
                            onChange={(e) =>
                              handleSubjectConstraintChange(
                                subject.subjectId,
                                "subjectFrequencyPerWeek",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-4"
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
