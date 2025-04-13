// Subject Settings Component
export const SubjectSettings = ({ subjects, constraints, onChange }) => (
    <div className="mb-6">
      <h3 className="font-semibold mb-4 text-blue-700">Subject Settings</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2 text-left text-blue-700">Subject Name</th>
              <th className="p-2 text-left text-blue-700">Duration (Minutes)</th>
              <th className="p-2 text-left text-blue-700">Frequency per Week</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.subjectId} className="hover:bg-blue-50">
                <td className="p-2">{subject.subjectName}</td>
                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    value={
                      constraints[subject.subjectId]?.subjectDurationInMinutes ||
                      ""
                    }
                    onChange={(e) =>
                      onChange(
                        subject.subjectId,
                        "subjectDurationInMinutes",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Number: Duration of each subject session
                  </p>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    value={
                      constraints[subject.subjectId]?.subjectFrequencyPerWeek ||
                      ""
                    }
                    onChange={(e) =>
                      onChange(
                        subject.subjectId,
                        "subjectFrequencyPerWeek",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Number: Times per week this subject occurs
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );