import axios from 'axios';

const API = axios.create({
  baseURL: 'https://fotuj.duranz.in',
});

export const fetchImages = async (status) => {
  const projectId = localStorage.getItem('project_id');
  if (!projectId) {
    throw new Error('Project ID not set. Please set your project ID first.');
  }
  return API.get(`/photos?status=${status}&project_id=${projectId}`);
};

export const updateImageStatus = async (id, status) => {
  const projectId = localStorage.getItem('project_id');
  if (!projectId) {
    throw new Error('Project ID not set. Please set your project ID first.');
  }
  const updatedBy = localStorage.getItem('updated_by');
  if (!updatedBy) {
    throw new Error('User identity not set. Please set your identity first.');
  }
  
  return API.put(`/photos/${id}?project_id=${projectId}`, {
    status,
    updated_by: updatedBy,
    comment: `${new Date().toLocaleString()} - ${status} by ${updatedBy}`,
  });
};

export default API;
