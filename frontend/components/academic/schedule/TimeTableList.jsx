"use client";

import React from "react";

const TimeTableList = ({ timetable = {} }) => {
  // Expected structure: { timetable: { [yearLevel]: { [section]: AggregatedSchedule[] } } }
  const timetableData = timetable.timetable || {};

  if (!timetableData || Object.keys(timetableData).length === 0) {
    return (
      <div className="text-center relative top-20 mt-10 text-gray-600">
        No timetable data available.
      </div>
    );
  }

  return (
    <div className="relative top-20 px-4 py-8">
      {Object.keys(timetableData).map((yearLevel) => (
        <div key={yearLevel} className="mb-10">
          <h2 className="text-3xl font-bold mb-4">Year: {yearLevel}</h2>
          {Object.keys(timetableData[yearLevel] || {}).map((section) => {
            const aggregatedSchedules = Array.isArray(timetableData[yearLevel][section])
              ? timetableData[yearLevel][section]
              : [];
            return (
              <div key={section} className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">Section: {section}</h3>
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
                          <tr key={index} className="hover:bg-gray-100 text-center">
                            <td className="px-4 py-2 border-b">{agg.orderNo}</td>
                            <td className="px-4 py-2 border-b">{agg.subjectTitle}</td>
                            <td className="px-4 py-2 border-b">{agg.schedule.Monday || "-"}</td>
                            <td className="px-4 py-2 border-b">{agg.schedule.Tuesday || "-"}</td>
                            <td className="px-4 py-2 border-b">{agg.schedule.Wednesday || "-"}</td>
                            <td className="px-4 py-2 border-b">{agg.schedule.Thursday || "-"}</td>
                            <td className="px-4 py-2 border-b">{agg.schedule.Friday || "-"}</td>
                            <td className="px-4 py-2 border-b">{agg.teacher}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-2 border-b text-gray-500">
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
    </div>
  );
};

export default TimeTableList;
