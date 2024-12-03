import { useState } from "react";

const AddressPopup = ({ show, onClose, onSave }) => {
  const [addressData, setAddressData] = useState({
    address_line: "",
    city: "",
    country: "",
    zone: "",
    region: "",
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(addressData);
    onClose(); // Close the popup after saving
  };

  return (
    show && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Enter Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line
              </label>
              <input
                type="text"
                name="address_line"
                value={addressData.address_line}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={addressData.city}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={addressData.country}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone
              </label>
              <input
                type="text"
                name="zone"
                value={addressData.zone}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <input
                type="text"
                name="region"
                value={addressData.region}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AddressPopup;
