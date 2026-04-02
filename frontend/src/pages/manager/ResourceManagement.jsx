import React, { useState, useEffect } from "react";
import resourceService from "../../services/resourceService";
import ResourceFilters from "../../components/resources/ResourceFilters";
import ResourceForm from "../../components/resources/ResourceForm";

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async (filters = {}) => {
    setIsLoading(true);
    try {
      const data = await resourceService.getFilteredResources(filters);
      setResources(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await resourceService.createResource(formData);
      setIsFormOpen(false);
      setServerErrors({});
      fetchResources();
    } catch (err) {
      if (err.response?.data?.errors) {
        setServerErrors(err.response.data.errors);
      } else {
        setError("Failed to create resource.");
      }
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await resourceService.updateResource(editingResource.id, formData);
      setEditingResource(null);
      setServerErrors({});
      fetchResources();
    } catch (err) {
      if (err.response?.data?.errors) {
        setServerErrors(err.response.data.errors);
      } else {
        setError("Failed to update resource.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await resourceService.deleteResource(id);
        fetchResources();
      } catch (err) {
        setError("Failed to delete resource.");
      }
    }
  };

  const openAddForm = () => {
    setEditingResource(null);
    setServerErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (resource) => {
    setEditingResource(resource);
    setServerErrors({});
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resource Catalogue</h1>
          <p className="text-gray-500">Manage rooms, labs, and equipment for the campus.</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <span>+ Add Resource</span>
        </button>
      </div>

      <ResourceFilters onSearch={fetchResources} />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{resource.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.type === 'Lab' ? 'bg-purple-100 text-purple-800' :
                        resource.type === 'Room' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resource.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resource.capacity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {resource.available ? (
                        <span className="text-green-600 flex items-center font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Available
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center font-medium">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          Occupied
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditForm(resource)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    No resources found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <ResourceForm
          resource={editingResource}
          onSubmit={editingResource ? handleUpdate : handleCreate}
          onCancel={() => setIsFormOpen(false)}
          errors={serverErrors}
        />
      )}
    </div>
  );
};

export default ResourceManagement;
