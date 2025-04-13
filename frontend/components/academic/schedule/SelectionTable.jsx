export const SelectionTable = ({
    title,
    items,
    selectedItems,
    onToggle,
    onSelectAll,
  }) => {
    const allSelected =
      items.length > 0 && items.every((item) => selectedItems.includes(item.id));
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