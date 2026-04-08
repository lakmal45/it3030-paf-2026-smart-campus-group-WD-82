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

  getById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  create: async (resourceData) => {
    const response = await api.post("/resources", resourceData);
    return response.data;
  },

  update: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/resources/${id}`);
  },

  updateResourceStatus: async (id, status) => {
    const response = await api.patch(`/resources/${id}/status`, null, { params: { status } });
    return response.data;
  },
};

export default resourceService;
