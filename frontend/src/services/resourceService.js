import api from "./api";

const resourceService = {
  getAllResources: async () => {
    const response = await api.get("/resources");
    return response.data;
  },

  getFilteredResources: async (filters) => {
    const response = await api.get("/resources/search", { params: filters });
    return response.data;
  },

  getResourceById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  createResource: async (resourceData) => {
    const response = await api.post("/resources", resourceData);
    return response.data;
  },

  updateResource: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  deleteResource: async (id) => {
    await api.delete(`/resources/${id}`);
  },
};

export default resourceService;
