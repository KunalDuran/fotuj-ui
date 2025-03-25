import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
});

export const fetchImages = async (status, projectId) => API.get(`/photos?status=${status}&project_id=${projectId}`);

export const updateImageStatus = async (id, status, projectId) => {
  const updatedBy = localStorage.getItem('updated_by');
  if (!updatedBy) {
    throw new Error('User identity not set. Please set your identity first.');
  }
  
  return API.put(`/photos/${id}?project_id=${projectId}`, {
    status,
    updated_by: updatedBy,
    comment: "none",
  });
};

export default API;
