import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export async function sendRequest(formData: FormData) {
  const token = localStorage.getItem('access_token');
  const result = await axios.post(`${API_BASE_URL}/user/emergency/request`, formData, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
  return result
}