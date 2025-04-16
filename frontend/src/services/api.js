import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const api = {
  // Get all jobs with optional filters and pagination
  getJobs: async (filters = {}, page = 1, perPage = 10) => {
    const params = new URLSearchParams();
    if (filters.location) params.append("location", filters.location);
    if (filters.company) params.append("company", filters.company);
    if (filters.job_type) params.append("job_type", filters.job_type);

    // Add pagination parameters
    params.append("page", page);
    params.append("per_page", perPage);

    const response = await axios.get(`${API_URL}/jobs`, { params });
    return response.data;
  },

  // Create a new job
  createJob: async (job) => {
    const response = await axios.post(`${API_URL}/jobs`, job);
    return response.data;
  },

  // Delete a job
  deleteJob: async (id) => {
    await axios.delete(`${API_URL}/jobs/${id}`);
  },
};
