import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
});

export const fetchImages = async (status) => API.get(`/photos?status=${status}`);
export const updateImageStatus = async (id, status) => API.put(`/photos/${id}?status=${status}`);

export default API;
