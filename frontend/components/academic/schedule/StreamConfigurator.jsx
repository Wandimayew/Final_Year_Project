import { SelectionTable } from "./SelectionTable";
import { FaThumbsUp } from "react-icons/fa";


// Utility to normalize data for SelectionTable
const normalizeItems = (items) =>
    (items || []).map((item) => ({
      id: String(item.classId || item.sectionId || item.subjectId),
      name: item.className || item.sectionName || item.subjectName,
    }));
    
export const StreamConfigurator = ({
    streams,
    config,
    classesByStream,
    classDetails,
    onChange,
    onFetchClasses,
    onFetchClassDetails,
  }) => {
    const handleSelectStream = (e) => {
      const streamId = e.target.value;
      if (streamId && !config.selectedStreamIds.includes(streamId)) {
        onChange({
          selectedStreamIds: [...config.selectedStreamIds, streamId],
          streamConfigs: {
            ...config.streamConfigs,
            [streamId]: { classes: [], classConfigs: {} },
          },
        });
        onFetchClasses(streamId);
      }
    };
  
    const toggleItem = (streamId, classId, type, itemId) => {
      const streamConfig = config.streamConfigs[streamId] || {
        classes: [],
        classConfigs: {},
      };
      if (type === "classes") {
        const newClasses = streamConfig.classes.includes(classId)
          ? streamConfig.classes.filter((id) => id !== classId)
          : [...streamConfig.classes, classId];
        onChange({
          streamConfigs: {
            ...config.streamConfigs,
            [streamId]: { ...streamConfig, classes: newClasses },
          },
        });
        if (!streamConfig.classConfigs[classId])
          onFetchClassDetails(streamId, classId);
      } else {
        const current = streamConfig.classConfigs[classId]?.[type] || [];
        const newItems = itemId
          ? current.includes(itemId)
            ? current.filter((id) => id !== itemId)
            : [...current, itemId]
          : [];
        onChange({
          streamConfigs: {
            ...config.streamConfigs,
            [streamId]: {
              ...streamConfig,
              classConfigs: {
                ...streamConfig.classConfigs,
                [classId]: {
                  ...streamConfig.classConfigs[classId],
                  [type]: newItems,
                },
              },
            },
          },
        });
      }
    };
  
    const toggleSelectAll = (streamId, classId, type, checked) => {
      const items =
        type === "classes"
          ? classesByStream[streamId]
          : classDetails[classId]?.[type] || [];
      const newItems = checked
        ? normalizeItems(items).map((item) => item.id)
        : [];
      if (type === "classes") {
        onChange({
          streamConfigs: {
            ...config.streamConfigs,
            [streamId]: { ...streamConfig, classes: newItems },
          },
        });
        newItems.forEach(
          (classId) =>
            !config.streamConfigs[streamId].classConfigs[classId] &&
            onFetchClassDetails(streamId, classId)
        );
      } else {
        onChange({
          streamConfigs: {
            ...config.streamConfigs,
            [streamId]: {
              ...streamConfig,
              classConfigs: {
                ...streamConfig.classConfigs,
                [classId]: {
                  ...streamConfig.classConfigs[classId],
                  [type]: newItems,
                },
              },
            },
          },
        });
      }
    };
  
    return (
      <div className="mb-6">
        <h3 className="font-semibold mb-4 text-blue-700">Select Stream</h3>
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
        {config.selectedStreamIds.map((streamId) => {
          const streamConfig = config.streamConfigs[streamId] || {
            classes: [],
            classConfigs: {},
          };
          return (
            <div
              key={streamId}
              className="mt-4 border rounded-lg shadow-sm bg-gray-50 p-4"
            >
              <h4 className="font-semibold mb-2 text-blue-800">
                Stream:{" "}
                {streams.find((s) => s.streamId.toString() === streamId)
                  ?.streamName || streamId}{" "}
                <FaThumbsUp className="inline ml-2 text-blue-500" />
              </h4>
              <SelectionTable
                title="Select Classes"
                items={normalizeItems(classesByStream[streamId])}
                selectedItems={streamConfig.classes}
                onToggle={(id) => toggleItem(streamId, id, "classes")}
                onSelectAll={(checked) =>
                  toggleSelectAll(streamId, null, "classes", checked)
                }
              />
              {streamConfig.classes.map((classId) => (
                <div
                  key={classId}
                  className="ml-4 mt-2 border p-4 rounded-lg shadow-sm bg-gray-100"
                >
                  <h5 className="font-semibold mb-2 text-blue-700">
                    Class:{" "}
                    {classesByStream[streamId]?.find(
                      (c) => c.classId.toString() === classId
                    )?.className || classId}{" "}
                    <FaThumbsUp className="inline ml-2 text-blue-500" />
                  </h5>
                  <SelectionTable
                    title="Select Sections"
                    items={normalizeItems(classDetails[classId]?.sections)}
                    selectedItems={
                      streamConfig.classConfigs[classId]?.sections || []
                    }
                    onToggle={(id) =>
                      toggleItem(streamId, classId, "sections", id)
                    }
                    onSelectAll={(checked) =>
                      toggleSelectAll(streamId, classId, "sections", checked)
                    }
                  />
                  <SelectionTable
                    title="Select Subjects"
                    items={normalizeItems(classDetails[classId]?.subjects)}
                    selectedItems={
                      streamConfig.classConfigs[classId]?.subjects || []
                    }
                    onToggle={(id) =>
                      toggleItem(streamId, classId, "subjects", id)
                    }
                    onSelectAll={(checked) =>
                      toggleSelectAll(streamId, classId, "subjects", checked)
                    }
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };
  