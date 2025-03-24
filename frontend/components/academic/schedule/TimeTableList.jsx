"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Breadcrumb from "@/components/constant/Breadcrumb";

const TimeTableList = ({
  timetable = {},
  editable = false,
  onConfirm,
  onCancel,
}) => {
  const timetableData = useMemo(
    () => timetable.timetable || {},
    [timetable.timetable]
  ); // Memoize timetableData
  const initialTimetableRef = useRef(timetableData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTimetable, setEditedTimetable] = useState(timetableData);

  useEffect(() => {
    if (initialTimetableRef.current !== timetableData) {
      initialTimetableRef.current = timetableData;
      setEditedTimetable(timetableData);
    }
  }, [timetableData]);

  if (!timetableData || Object.keys(timetableData).length === 0) {
    return (
      <div className="text-center relative top-20 mt-10 text-gray-600">
        No timetable data available.
      </div>
    );
  }

  const handleFieldChange = (yearLevel, section, index, field, value) => {
    setEditedTimetable((prev) => {
      const updated = { ...prev };
      updated[yearLevel] = { ...updated[yearLevel] };
      updated[yearLevel][section] = updated[yearLevel][section].map(
        (item, idx) => (idx === index ? { ...item, [field]: value } : item)
      );
      return updated;
    });
  };

  const handleScheduleChange = (yearLevel, section, index, day, value) => {
    setEditedTimetable((prev) => {
      const updated = { ...prev };
      updated[yearLevel] = { ...updated[yearLevel] };
      updated[yearLevel][section] = updated[yearLevel][section].map(
        (item, idx) =>
          idx === index
            ? { ...item, schedule: { ...item.schedule, [day]: value } }
            : item
      );
      return updated;
    });
  };

  const handleConfirm = () => {
    setIsEditing(false);
    if (onConfirm) onConfirm(editedTimetable);
  };

  const handleCancel = () => {
    setEditedTimetable(timetableData);
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  return (
    <div className="relative top-20 px-4 py-8">
      <Breadcrumb />
      {editable && !isEditing && (
        <div className="mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </div>
      )}
      {Object.keys(editedTimetable).map((yearLevel) => (
        <div key={yearLevel} className="mb-10">
          <h2 className="text-3xl font-bold mb-4">Class: {yearLevel}</h2>
          {Object.keys(editedTimetable[yearLevel] || {}).map((section) => {
            const aggregatedSchedules = Array.isArray(
              editedTimetable[yearLevel][section]
            )
              ? editedTimetable[yearLevel][section]
              : [];
            return (
              <div key={section} className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">
                  Section: {section}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 shadow-md">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-4 py-2 border-b">No.</th>
                        <th className="px-4 py-2 border-b">Subject Title</th>
                        <th className="px-4 py-2 border-b">Monday</th>
                        <th className="px-4 py-2 border-b">Tuesday</th>
                        <th className="px-4 py-2 border-b">Wednesday</th>
                        <th className="px-4 py-2 border-b">Thursday</th>
                        <th className="px-4 py-2 border-b">Friday</th>
                        <th className="px-4 py-2 border-b">Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aggregatedSchedules.length > 0 ? (
                        aggregatedSchedules.map((agg, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-100 text-center"
                          >
                            <td className="px-4 py-2 border-b">
                              {agg.orderNo}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={agg.subjectTitle}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      yearLevel,
                                      section,
                                      index,
                                      "subjectTitle",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300"
                                />
                              ) : (
                                agg.subjectTitle
                              )}
                            </td>
                            {[
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                            ].map((day) => (
                              <td key={day} className="px-4 py-2 border-b">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={agg.schedule[day] || ""}
                                    onChange={(e) =>
                                      handleScheduleChange(
                                        yearLevel,
                                        section,
                                        index,
                                        day,
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300"
                                  />
                                ) : (
                                  agg.schedule[day] || "-"
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-2 border-b">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={agg.teacher}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      yearLevel,
                                      section,
                                      index,
                                      "teacher",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300"
                                />
                              ) : (
                                agg.teacher
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-4 py-2 border-b text-gray-500"
                          >
                            No subjects scheduled for this section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {isEditing && (
        <div className="mt-4 flex gap-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleConfirm}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeTableList;
