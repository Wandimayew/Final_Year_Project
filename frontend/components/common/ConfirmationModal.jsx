// components/common/ConfirmationModal.jsx
import React from "react";
import ActionButton from "./ActionButton";

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  confirmColor = "red",
  showReason = false,
  reason,
  setReason,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        {showReason && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full p-2 border rounded mb-4 resize-none"
          />
        )}
        <div className="flex gap-4">
          <ActionButton
            label={confirmLabel}
            onClick={onConfirm}
            color={confirmColor}
            className="w-full"
          />
          <ActionButton
            label={cancelLabel}
            onClick={onCancel}
            color="blue"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;