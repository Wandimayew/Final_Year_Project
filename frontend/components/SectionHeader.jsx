// components/SectionHeader.jsx
const SectionHeader = ({ icon, title }) => {
  return (
    <h2 className="mb-4 flex items-center text-xl font-semibold text-blue-500">
      {icon} {title}
    </h2>
  );
};

export default SectionHeader;
