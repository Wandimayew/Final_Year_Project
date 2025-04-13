import React from "react";

const StreamList = ({ streams }) => {
  if (!streams || streams.length === 0) {
    return (
      <div
        className={`
          text -center py-4
          text-[var(--secondary)]
          dark:text-[var(--secondary)]
          night:text-[var(--secondary)]
        `}
      >
        No streams available. Add a stream to get started!
      </div>
    );
  }

  return (
    <div
      className={`
        shadow-lg rounded-lg p-6 transition-all duration-300 hover:shadow-xl
        bg-[var(--surface)]
        dark:bg-[var(--surface)]
        night:bg-[var(--surface)]
      `}
    >
      <h2
        className={`
          text-xl font-semibold mb-4
          text-[var(--text)]
          dark:text-[var(--text)]
          night:text-[var(--text)]
        `}
      >
        Stream List
      </h2>
      <div className="overflow-x-auto">
        <table
          className={`
            min-w-full border-collapse
            border-[var(--secondary)]
            dark:border-[var(--secondary)]
            night:border-[var(--secondary)]
          `}
        >
          <thead>
            <tr
              className={`
                bg-[var(--background)]
                dark:bg-[var(--background)]
                night:bg-[var(--background)]
              `}
            >
              <th
                className={`
                  p-3 text-left text-sm font-semibold
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                Stream Name
              </th>
              <th
                className={`
                  p-3 text-left text-sm font-semibold
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                Stream Code
              </th>
            </tr>
          </thead>
          <tbody>
            {streams.map((stream, index) => (
              <tr
                key={index}
                className={`
                  border-b hover:bg-[var(--background)]
                  border-[var(--secondary)]
                  dark:border-[var(--secondary)] dark:hover:bg-[var(--background)]
                  night:border-[var(--secondary)] night:hover:bg-[var(--background)]
                `}
              >
                <td
                  className={`
                    p-3
                    text-[var(--text)]
                    dark:text-[var(--text)]
                    night:text-[var(--text)]
                  `}
                >
                  {stream.streamName}
                </td>
                <td
                  className={`
                    p-3
                    text-[var(--text)]
                    dark:text-[var(--text)]
                    night:text-[var(--text)]
                  `}
                >
                  {stream.streamCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StreamList;
