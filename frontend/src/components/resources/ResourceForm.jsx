import React, { useState, useEffect } from "react";

const ResourceForm = ({ resource, onSubmit, onCancel, errors: serverErrors }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Room",
    location: "",
    capacity: 1,
    available: true,
    status: "Active",
    description: "",
  });

  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (resource) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: resource.name || "",
        type: resource.type || "Room",
        location: resource.location || "",
        capacity: resource.capacity || 1,
        available: resource.available ?? true,
        status: resource.status || "Active",
        description: resource.description || "",
      });
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for the field when user starts typing
    if (localErrors[name]) {
      setLocalErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (formData.capacity < 1) errors.capacity = "Capacity must be at least 1";
    if (!formData.status.trim()) errors.status = "Status is required";
    
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const allErrors = { ...localErrors, ...serverErrors };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {resource ? "Edit Resource" : "Add New Resource"}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                allErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              placeholder="e.g. Lab 304"
            />
            {allErrors.name && <p className="text-red-500 text-xs mt-1">{allErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Room">Room</option>
                <option value="Lab">Lab</option>
                <option value="Equipment">Equipment</option>
                <option value="Lecture Hall">Lecture Hall</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  allErrors.capacity ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {allErrors.capacity && <p className="text-red-500 text-xs mt-1">{allErrors.capacity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                allErrors.location ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              placeholder="e.g. Science Building, 3rd Floor"
            />
            {allErrors.location && <p className="text-red-500 text-xs mt-1">{allErrors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium">Is Available?</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Optional details about this resource..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition font-semibold"
            >
              {resource ? "Save Changes" : "Create Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;
