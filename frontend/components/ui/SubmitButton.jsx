const SubmitButton = ({ label, isLoading }) => (
    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
      {isLoading ? "Processing..." : label}
    </button>
  );
  export default SubmitButton;
  