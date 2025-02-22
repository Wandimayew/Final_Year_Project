"use client";

import { FaThumbsUp } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * A reusable table component for selecting items.
 * It renders a header checkbox for "select all" and a row per item.
 */
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

// Utility functions to normalize data into { id, name } format
const normalizeClasses = (classes = []) =>
  classes.map((cls) => ({
    id: cls.classId.toString(),
    name: cls.className,
  }));

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
  // School details
  const [schoolName, setSchoolName] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  // Streams configuration
  const [streams, setStreams] = useState([]);
  const [selectedStreamIds, setSelectedStreamIds] = useState([]);
  const [streamConfigs, setStreamConfigs] = useState({});
  const [classesByStream, setClassesByStream] = useState({});
  const [classDetails, setClassDetails] = useState({});

  // Teacher configuration (for now, we leave this as is)
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  // Timetable settings state
  const [maxSubjectsPerDay, setMaxSubjectsPerDay] = useState("");
  const [breakDurationInMinutes, setBreakDurationInMinutes] = useState("");
  const [breakAfterSubjects, setBreakAfterSubjects] = useState("");
  const [schoolStartTime, setSchoolStartTime] = useState("");
  const [schoolEndTime, setSchoolEndTime] = useState("");

  // Subject settings: fetch all subjects in the school from DB
  const [allSubjects, setAllSubjects] = useState([]);
  // This object will store the updated constraints per subject, keyed by subjectId.
  const [subjectConstraints, setSubjectConstraints] = useState({});

  // Fetch streams on mount
  useEffect(() => {
    axios
      .get("http://localhost:8084/academic/api/new/getAllStreamBySchool")
      .then((response) => setStreams(response.data))
      .catch((error) => console.error("Failed to fetch streams:", error));
  }, []);

  // Fetch teachers on mount (if needed)
  useEffect(() => {
    // For now, we leave the teacher configuration as is.
    // axios.get("...").then(...);
  }, []);

  // Fetch all subjects for subject settings
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
            subjectDurationInMinutes: subject.subjectDurationInMinutes || "",
            subjectFrequencyPerWeek: subject.subjectFrequencyPerWeek || "",
          };
        });
        setSubjectConstraints(initialConstraints);
      })
      .catch((err) => console.error("Error fetching all subjects:", err));
  }, []);

  // When a stream is selected
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

  // === Classes Selection Functions ===

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

  // === Sections Selection Functions ===

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

  // === Subjects Selection Functions ===

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

  // Handle teacher selection (left as is)
  const handleSelectTeachers = (e) => {
    const options = e.target.options;
    let selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setSelectedTeacherIds(selected);
  };

  // Handler to update constraint values for a subject
  const handleSubjectConstraintChange = (subjectId, field, value) => {
    setSubjectConstraints((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value,
      },
    }));
  };

  // Build payload matching the server's expected structure
  const handleSubmit = (e) => {
    e.preventDefault();

    // Build classConfigs: For each selected stream and its selected classes,
    // derive a ClassConfig with className, sections, and subjectIds.
    const classConfigs = [];
    selectedStreamIds.forEach((streamId) => {
      const streamClassIds = streamConfigs[streamId]?.classes || [];
      streamClassIds.forEach((classId) => {
        // Get class name from classesByStream
        const classData = classesByStream[streamId]?.find(
          (cls) => cls.classId.toString() === classId
        );
        const className = classData ? classData.className : classId;
        // Build sections: for each selected section id, lookup sectionName.
        const sectionIds =
          streamConfigs[streamId]?.classConfigs[classId]?.sections || [];
        const sections = [];
        if (classDetails[classId]?.sections) {
          sectionIds.forEach((secId) => {
            const secData = classDetails[classId]?.sections.find(
              (sec) => sec.sectionId.toString() === secId
            );
            if (secData) {
              sections.push({
                sectionName: secData.sectionName,
                streamId: parseInt(streamId), // use parent's streamId
              });
            }
          });
        }
        // Build subjectIds for the class
        const subjectIds =
          streamConfigs[streamId]?.classConfigs[classId]?.subjects || [];
        const parsedSubjectIds = subjectIds.map((id) => parseInt(id));
        classConfigs.push({
          className,
          sections,
          subjectIds: parsedSubjectIds,
        });
      });
    });

    // Build streamConfigs (as expected by the server): for each stream,
    // include the streamName and a list of classNames selected in that stream.
    const streamConfigList = [];
    selectedStreamIds.forEach((streamId) => {
      const streamData = streams.find((s) => s.streamId === streamId);
      const streamName = streamData ? streamData.streamName : streamId;
      const classIds = streamConfigs[streamId]?.classes || [];
      const classNames = [];
      classIds.forEach((classId) => {
        const classData = classesByStream[streamId]?.find(
          (cls) => cls.classId.toString() === classId
        );
        if (classData) {
          classNames.push(classData.className);
        }
      });
      streamConfigList.push({
        streamName,
        classNames,
      });
    });

    // Build subjectConfigs from subjectConstraints (for all school subjects)
    const subjectConfigs = Object.values(subjectConstraints).map((sub) => ({
      subjectName: sub.subjectName,
      subjectId: parseInt(sub.subjectId),
      subjectDurationInMinutes: parseInt(sub.subjectDurationInMinutes),
      subjectFrequencyPerWeek: parseInt(sub.subjectFrequencyPerWeek),
    }));

    // Build timetableConstraints
    const timetableConstraints = {
      maxSubjectsPerDay: parseInt(maxSubjectsPerDay),
      breakDurationInMinutes: parseInt(breakDurationInMinutes),
      breakAfterSubjects: parseInt(breakAfterSubjects),
      schoolStartTime,
      schoolEndTime,
    };

    // Build final payload matching TimeTableRequest structure.
    const requestData = {
      schoolName,
      academicYear,
      classConfigs, // List<ClassConfig>
      teacherConfigs: [], // For now, empty as requested
      subjectConfigs, // List<SubjectConfig>
      streamConfigs: streamConfigList, // List<StreamConfig>
      timetableConstraints, // TimetableConstraints
    };

    console.log("Submitting configuration:", requestData);
    // Send requestData to your server here.
  };

  return (
    <div className="max-w-6xl mx-auto relative top-20 p-6">
      <Card className="shadow-lg p-6 bg-white rounded-lg">
        <CardContent>
          <h2 className="text-3xl font-semibold mb-6 text-center text-blue-800">
            Timetable Configuration
          </h2>
          <form onSubmit={handleSubmit}>
            {/* School Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                School Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {/* Streams Section */}
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
                    {streams.find((s) => s.streamId == streamId)?.streamName ||
                      streamId}
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
            {/* Teacher Configuration Section (left as is) */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                Teacher Configuration
              </h3>
              <select
                multiple
                onChange={handleSelectTeachers}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
            {/* Timetable Settings Section */}
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
                    Break After Subjects
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={breakAfterSubjects}
                    onChange={(e) => setBreakAfterSubjects(e.target.value)}
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
            {/* Subject Settings Section */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-blue-700">
                Subject Settings (All School Subjects)
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
