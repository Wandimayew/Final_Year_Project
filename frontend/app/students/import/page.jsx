"use client";
export const dynamic = "force-dynamic";

export default function StudentImportPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Multiple Import</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Download the first sample file.</li>
              <li>
                Open the downloaded &quot;csv&quot; file and carefully fill the
                details of the student.
              </li>
              <li>
                The date you are trying to enter the &quot;Birthday&quot; and
                &quot;AdmissionDate&quot; column make sure the date format is
                Y-m-d (2025-01-12).
              </li>
              <li>
                Do not import the duplicate &quot;Roll Number&quot; and
                &quot;Register No&quot;.
              </li>
              <li>For student &quot;Gender&quot; use Male, Female value.</li>
              <li>
                If enable Automatically Generate login details, leave the
                &quot;username&quot; and &quot;password&quot; columns blank.
              </li>
              <li>
                The Category name comes from another table, so for the
                &quot;Category&quot;, enter Category ID (can be found on the
                Category page).
              </li>
              <li>
                If a parent is existing / if you want to use the same parent
                information for multiple students only enter the
                &quot;GuardianUsername&quot; and leave other columns blank.
              </li>
            </ol>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Class*
              </label>
              <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                <option>Select</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Section*
              </label>
              <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                <option>Select Class First</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select csv File*
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
