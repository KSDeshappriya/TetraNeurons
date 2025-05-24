import axios from 'axios';

export async function sendEmergencyReport(formData: FormData) {
  const token = localStorage.getItem('access_token');
  const API_BASE_URL = 'http://localhost:8000';
  await axios.post(`${API_BASE_URL}/user/emergency/report`, formData, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
}