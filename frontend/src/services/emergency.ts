import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export async function sendEmergencyReport(formData: FormData) {
  const token = localStorage.getItem('access_token');
  await axios.post(`${API_BASE_URL}/user/emergency/report`, formData, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
}


export async function acceptEmergencyRequest(disasterId: string) {
  const token = localStorage.getItem('access_token');
  await axios.post(`${API_BASE_URL}/gov/emergency/accept`, { disaster_id: disasterId }, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
}

export async function rejectEmergencyRequest(disasterId: string) {
  const token = localStorage.getItem('access_token');
  await axios.post(`${API_BASE_URL}/gov/emergency/reject`, { disaster_id: disasterId }, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
}

export async function addResource(disasterId: string, resourceData: FormData) {
  const token = localStorage.getItem('access_token');

  await axios.post(`${API_BASE_URL}/gov/resource/add`, {
    disasterId,
    data: resourceData
  }, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
}
