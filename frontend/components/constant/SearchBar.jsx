const SearchBar = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Search...",
  width = "w-[300px]",
  additionalStyles = "",
  icon = true,
}) => {
  return (
    <div className={`relative ${additionalStyles}`}>
      <input
        type="text"
        placeholder={placeholder}
        className={`pl-10 pr-4 py-2 border rounded-md ${width} bg-white shadow`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {icon && (
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
    </div>
  );
};

export default SearchBar;
