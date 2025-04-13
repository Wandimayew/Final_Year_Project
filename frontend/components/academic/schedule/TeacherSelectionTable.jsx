// Teacher Selection Table Component
export const TeacherSelectionTable = ({
    teachers,
    selectedIds,
    onToggle,
    onSelectAll,
    allSubjects,
    onTeacherChange,
  }) => {
    const allSelected =
      teachers.length > 0 &&
      teachers.every((t) => selectedIds.includes(t.teacherId));
    const getSubjectNames = (subjectIds) =>
      subjectIds
        .map(
          (id) =>
            allSubjects.find((s) => s.subjectId === id)?.subjectName ||
            `Unknown (${id})`
        )
        .join(", ");
  
    return (
      <div className="mb-6">
        <h3 className="font-semibold mb-4 text-blue-700">
          Teacher Configuration
        </h3>
        <table className="min-w-full border border-gray-300 rounded shadow-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="p-3 text-left text-blue-700 font-semibold">
                Teacher Name
              </th>
              <th className="p-3 text-left text-blue-700 font-semibold">
                Subjects
              </th>
              <th className="p-3 text-left text-blue-700 font-semibold">
                Max Classes/Day
              </th>
              <th className="p-3 text-left text-blue-700 font-semibold">
                Max Classes/Week
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.teacherId} className="border-t hover:bg-blue-50">
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(teacher.teacherId)}
                    onChange={() => onToggle(teacher.teacherId)}
                  />
                </td>
                <td className="p-3">{teacher.teacherName}</td>
                <td className="p-3">{getSubjectNames(teacher.subjectIds)}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min="1"
                    value={teacher.maxClassesPerDay}
                    onChange={(e) =>
                      onTeacherChange(
                        teacher.teacherId,
                        "maxClassesPerDay",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Number: Max classes this teacher can handle per day
                  </p>
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min="1"
                    value={teacher.maxClassesPerWeek}
                    onChange={(e) =>
                      onTeacherChange(
                        teacher.teacherId,
                        "maxClassesPerWeek",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Number: Max classes this teacher can handle per week
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  