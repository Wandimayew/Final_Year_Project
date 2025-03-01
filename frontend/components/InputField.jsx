import { User, Phone, Mail } from "lucide-react";

const InputField = ({
  label,
  type = "text",
  icon: Icon,
  required = false,
  children,
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
        )}
        {type === "textarea" ? (
          <textarea
            className={`w-full rounded-md border border-gray-300 p-2 ${
              Icon ? "pl-9" : ""
            }`}
            {...props}
          />
        ) : type === "select" ? (
          <select
            className={`w-full rounded-md border border-gray-300 p-2 ${
              Icon ? "pl-9" : ""
            }`}
            {...props}
          >
            {children}
          </select>
        ) : (
          <input
            type={type}
            className={`w-full rounded-md border border-gray-300 p-2 ${
              Icon ? "pl-9" : ""
            }`}
            {...props}
          />
        )}
      </div>
    </div>
  );
};

export default InputField;
